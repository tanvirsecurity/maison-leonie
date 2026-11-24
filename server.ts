import crypto from 'crypto';
import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import nodemailer from 'nodemailer';
import path from 'path';
import QRCode from 'qrcode';
import Stripe from 'stripe';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const TOTP_CIPHER_KEY = process.env.TOTP_ENCRYPTION_KEY
  ? crypto.createHash('sha256').update(process.env.TOTP_ENCRYPTION_KEY).digest()
  : crypto.randomBytes(32);

interface FirebaseAppletConfig {
  projectId: string;
}

let firebaseProjectId = '';
try {
  const cfgPath = path.resolve(__dirname, 'firebase-applet-config.json');
  if (fs.existsSync(cfgPath)) {
    const parsed = JSON.parse(fs.readFileSync(cfgPath, 'utf8')) as FirebaseAppletConfig;
    firebaseProjectId = parsed.projectId || '';
  }
} catch {
  firebaseProjectId = '';
}

interface AuthenticatedUser {
  uid: string;
  email: string;
  emailVerified: boolean;
}

interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

// Authoritative server-side catalog pricing & promo definitions
const CATALOG_PRICES: Record<string, { name: string; price: number }> = {
  'voie-dor': { name: "Voie d'Or", price: 340 },
  'ember-noir': { name: 'Ember Noir', price: 285 },
  'lumiere-cherie': { name: 'Lumière Chérie', price: 245 },
  'aurore-luminaire': { name: 'Aurore Luminaire', price: 260 },
  'nocturne-ambre': { name: 'Nocturne Ambre', price: 295 },
  'sandalwood-amber': { name: 'Sandalwood Amber', price: 230 },
  'leclat-celeste': { name: "L'Éclat", price: 215 },
  'coffret-decouverte': { name: 'Le Coffret Découverte', price: 165 },
};

const PROMO_CODES: Record<string, { type: 'percent' | 'fixed'; value: number; minSubtotal: number; label: string }> = {
  LEONIE15: { type: 'percent', value: 15, minSubtotal: 0, label: '15% Atelier Privilege' },
  ATELIER25: { type: 'fixed', value: 25, minSubtotal: 250, label: '$25 Atelier Credit' },
  FIRSTSCENT: { type: 'percent', value: 10, minSubtotal: 0, label: '10% First Acquisition' },
};

// Cached Google public certificates for Firebase ID token verification
let cachedCerts: Record<string, string> = {};
let certsExpiresAt = 0;

async function getGoogleCerts(): Promise<Record<string, string>> {
  if (Date.now() < certsExpiresAt && Object.keys(cachedCerts).length > 0) {
    return cachedCerts;
  }
  const resp = await fetch(
    'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com'
  );
  if (!resp.ok) {
    throw new Error('Unable to fetch Firebase verification certificates');
  }
  const cacheControl = resp.headers.get('cache-control') || '';
  const maxAgeMatch = cacheControl.match(/max-age=(\d+)/);
  const maxAgeSec = maxAgeMatch ? Number(maxAgeMatch[1]) : 3600;
  cachedCerts = (await resp.json()) as Record<string, string>;
  certsExpiresAt = Date.now() + maxAgeSec * 1000;
  return cachedCerts;
}

function base64UrlDecode(str: string): Buffer {
  const normalized = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
  return Buffer.from(normalized + pad, 'base64');
}

async function verifyFirebaseToken(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }
    const token = authHeader.slice(7).trim();
    const parts = token.split('.');
    if (parts.length !== 3) {
      res.status(401).json({ error: 'Invalid authentication token format.' });
      return;
    }

    const headerJson = JSON.parse(base64UrlDecode(parts[0]).toString('utf8')) as { alg?: string; kid?: string };
    const payloadJson = JSON.parse(base64UrlDecode(parts[1]).toString('utf8')) as {
      aud?: string;
      iss?: string;
      exp?: number;
      iat?: number;
      sub?: string;
      email?: string;
      email_verified?: boolean;
    };

    if (headerJson.alg !== 'RS256' || !headerJson.kid) {
      res.status(401).json({ error: 'Unsupported token signature algorithm.' });
      return;
    }

    const certs = await getGoogleCerts();
    const certPem = certs[headerJson.kid];
    if (!certPem) {
      res.status(401).json({ error: 'Signing key not found.' });
      return;
    }

    const verifier = crypto.createVerify('RSA-SHA256');
    verifier.update(`${parts[0]}.${parts[1]}`);
    verifier.end();
    const signatureValid = verifier.verify(certPem, base64UrlDecode(parts[2]));
    if (!signatureValid) {
      res.status(401).json({ error: 'Token signature verification failed.' });
      return;
    }

    const nowSec = Math.floor(Date.now() / 1000);
    if (
      !firebaseProjectId ||
      payloadJson.aud !== firebaseProjectId ||
      payloadJson.iss !== `https://securetoken.google.com/${firebaseProjectId}` ||
      !payloadJson.exp ||
      payloadJson.exp <= nowSec ||
      !payloadJson.sub
    ) {
      res.status(401).json({ error: 'Token claims invalid or expired.' });
      return;
    }

    req.user = {
      uid: payloadJson.sub,
      email: payloadJson.email || '',
      emailVerified: Boolean(payloadJson.email_verified),
    };
    next();
  } catch {
    res.status(401).json({ error: 'Authentication verification failed.' });
  }
}

// RFC 6238 TOTP Helpers (Base32 + SHA-1 HMAC)
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function encodeBase32(buf: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = '';
  for (let i = 0; i < buf.length; i += 1) {
    value = (value << 8) | buf[i];
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }
  return output;
}

function decodeBase32(input: string): Buffer {
  const cleaned = input.toUpperCase().replace(/[^A-Z2-7]/g, '');
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];
  for (let i = 0; i < cleaned.length; i += 1) {
    const idx = BASE32_ALPHABET.indexOf(cleaned[i]);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

function generateTotpCode(secretBase32: string, counterOffset = 0): string {
  const key = decodeBase32(secretBase32);
  const counter = Math.floor(Date.now() / 1000 / 30) + counterOffset;
  const counterBuf = Buffer.alloc(8);
  counterBuf.writeBigUInt64BE(BigInt(counter));
  const hmac = crypto.createHmac('sha1', key).update(counterBuf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  return String(code % 1_000_000).padStart(6, '0');
}

function sealSecret(plaintext: string, uid: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', TOTP_CIPHER_KEY, iv);
  cipher.setAAD(Buffer.from(uid, 'utf8'));
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('base64')}.${tag.toString('base64')}.${encrypted.toString('base64')}`;
}

function unsealSecret(sealed: string, uid: string): string {
  const [ivB64, tagB64, encB64] = sealed.split('.');
  if (!ivB64 || !tagB64 || !encB64) {
    throw new Error('Malformed sealed token');
  }
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    TOTP_CIPHER_KEY,
    Buffer.from(ivB64, 'base64')
  );
  decipher.setAAD(Buffer.from(uid, 'utf8'));
  decipher.setAuthTag(Buffer.from(tagB64, 'base64'));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encB64, 'base64')),
    decipher.final(),
  ]);
  return decrypted.toString('utf8');
}

interface QuoteLineItem {
  productId: string;
  quantity: number;
  volumeMl?: number;
}

function computeAuthoritativeTotals(
  items: QuoteLineItem[],
  promoCode?: string,
  shippingMethod?: string
) {
  let subtotal = 0;
  for (const item of items) {
    const product = CATALOG_PRICES[item.productId];
    if (!product) {
      throw new Error(`Unknown fragrance identifier: ${item.productId}`);
    }
    const qty = Math.max(1, Math.min(25, Math.floor(Number(item.quantity) || 1)));
    const sizeMultiplier = item.volumeMl === 50 ? 0.72 : item.volumeMl === 200 ? 1.55 : 1;
    subtotal += Math.round(product.price * sizeMultiplier) * qty;
  }

  let discount = 0;
  let appliedPromoLabel: string | null = null;
  const normalizedPromo = (promoCode || '').trim().toUpperCase();
  if (normalizedPromo && PROMO_CODES[normalizedPromo]) {
    const rule = PROMO_CODES[normalizedPromo];
    if (subtotal >= rule.minSubtotal) {
      discount =
        rule.type === 'percent'
          ? Math.round((subtotal * rule.value) / 100)
          : Math.min(subtotal, rule.value);
      appliedPromoLabel = rule.label;
    }
  }

  const netSubtotal = Math.max(0, subtotal - discount);
  let shippingCost = netSubtotal >= 220 ? 0 : 18;
  if (shippingMethod === 'Express Air Courier') shippingCost = 28;
  if (shippingMethod === 'Same-Day Boutique Courier') shippingCost = 45;

  const tax = Math.round(netSubtotal * 0.08 * 100) / 100;
  const total = Math.round((netSubtotal + shippingCost + tax) * 100) / 100;

  return {
    subtotal,
    discount,
    appliedPromoLabel,
    shippingCost,
    tax,
    total,
  };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '256kb' }));

  // Integration readiness status (exposes zero private secrets)
  app.get('/api/config/integrations', (_req: Request, res: Response) => {
    const stripeConfigured = Boolean(
      process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PUBLISHABLE_KEY
    );
    const smtpConfigured = Boolean(
      process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
    );
    res.json({
      stripeConfigured,
      stripePublishableKey: stripeConfigured ? process.env.STRIPE_PUBLISHABLE_KEY : null,
      smtpConfigured,
      requiredEnvVars: {
        stripe: ['STRIPE_SECRET_KEY', 'STRIPE_PUBLISHABLE_KEY'],
        email: ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM'],
      },
    });
  });

  // Authoritative quote calculation & promo code verification
  app.post('/api/checkout/quote', (req: Request, res: Response) => {
    try {
      const { items, promoCode, shippingMethod } = req.body as {
        items?: QuoteLineItem[];
        promoCode?: string;
        shippingMethod?: string;
      };
      if (!Array.isArray(items) || items.length === 0 || items.length > 25) {
        res.status(400).json({ error: 'Cart items must contain between 1 and 25 items.' });
        return;
      }
      const quote = computeAuthoritativeTotals(items, promoCode, shippingMethod);
      res.json(quote);
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : 'Invalid checkout quote request.' });
    }
  });

  // Stripe PaymentIntent (Apple Pay + Card) creation
  app.post('/api/payments/create-intent', verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { items, promoCode, shippingMethod } = req.body as {
        items?: QuoteLineItem[];
        promoCode?: string;
        shippingMethod?: string;
      };
      if (!Array.isArray(items) || items.length === 0 || items.length > 25) {
        res.status(400).json({ error: 'Invalid bag items.' });
        return;
      }
      const totals = computeAuthoritativeTotals(items, promoCode, shippingMethod);
      const stripeSecret = process.env.STRIPE_SECRET_KEY;

      if (!stripeSecret) {
        res.json({
          configured: false,
          requiredEnvVars: ['STRIPE_SECRET_KEY', 'STRIPE_PUBLISHABLE_KEY'],
          totals,
        });
        return;
      }

      const stripe = new Stripe(stripeSecret);
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totals.total * 100),
        currency: 'usd',
        automatic_payment_methods: { enabled: true },
        metadata: {
          uid: req.user?.uid || '',
          email: req.user?.email || '',
        },
      });

      res.json({
        configured: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        totals,
      });
    } catch (err) {
      res.status(500).json({
        error: err instanceof Error ? err.message : 'Unable to initialize payment intent.',
      });
    }
  });

  // 2FA TOTP Enrollment (Authenticated)
  app.post('/api/auth/2fa/enroll', verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = req.user!;
      const rawBytes = crypto.randomBytes(20);
      const secretBase32 = encodeBase32(rawBytes);
      const issuer = 'Maison Leonie';
      const label = encodeURIComponent(`${issuer}:${user.email || user.uid}`);
      const otpAuthUri = `otpauth://totp/${label}?secret=${secretBase32}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
      const qrDataUrl = await QRCode.toDataURL(otpAuthUri, {
        width: 220,
        margin: 1,
        color: { dark: '#161412', light: '#FAF8F5' },
      });
      const sealedSecret = sealSecret(secretBase32, user.uid);
      res.json({
        qrDataUrl,
        manualKey: secretBase32,
        sealedSecret,
      });
    } catch {
      res.status(500).json({ error: 'Failed to generate 2FA enrollment credentials.' });
    }
  });

  // 2FA TOTP Verification (Authenticated)
  app.post('/api/auth/2fa/verify', verifyFirebaseToken, (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = req.user!;
      const { code, sealedSecret } = req.body as { code?: string; sealedSecret?: string };
      if (typeof code !== 'string' || !/^\d{6}$/.test(code.trim())) {
        res.status(400).json({ valid: false, error: 'Enter a valid 6-digit authenticator code.' });
        return;
      }
      if (typeof sealedSecret !== 'string' || sealedSecret.length < 10) {
        res.status(400).json({ valid: false, error: '2FA enrollment secret not found.' });
        return;
      }

      const secretBase32 = unsealSecret(sealedSecret, user.uid);
      const submittedBuf = Buffer.from(code.trim(), 'utf8');
      let valid = false;
      for (const offset of [-1, 0, 1]) {
        const expected = generateTotpCode(secretBase32, offset);
        const expectedBuf = Buffer.from(expected, 'utf8');
        if (expectedBuf.length === submittedBuf.length && crypto.timingSafeEqual(expectedBuf, submittedBuf)) {
          valid = true;
          break;
        }
      }
      res.json({ valid });
    } catch {
      res.status(400).json({ valid: false, error: 'Unable to verify 2FA token.' });
    }
  });

  // Transactional Email Dispatch (Authenticated)
  app.post('/api/notifications/email', verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = req.user!;
      const { subject, headline, bodyText, orderNumber } = req.body as {
        subject?: string;
        headline?: string;
        bodyText?: string;
        orderNumber?: string;
      };

      if (!subject || !bodyText) {
        res.status(400).json({ error: 'Subject and message body are required.' });
        return;
      }

      const host = process.env.SMTP_HOST;
      const smtpUser = process.env.SMTP_USER;
      const smtpPass = process.env.SMTP_PASS;
      const smtpPort = Number(process.env.SMTP_PORT || 587);
      const fromAddress = process.env.SMTP_FROM || 'concierge@maisonleonie.paris';

      if (!host || !smtpUser || !smtpPass) {
        res.json({
          sent: false,
          configured: false,
          requiredEnvVars: ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM'],
        });
        return;
      }

      const transporter = nodemailer.createTransport({
        host,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: { user: smtpUser, pass: smtpPass },
      });

      const safeHeadline = escapeHtml(headline || subject);
      const safeBody = escapeHtml(bodyText);
      const safeOrder = orderNumber ? `<p style="font-size:13px;color:#9A7B4F;">Reference: ${escapeHtml(orderNumber)}</p>` : '';

      await transporter.sendMail({
        from: fromAddress,
        to: user.email,
        subject,
        text: `${headline || subject}\n\n${bodyText}${orderNumber ? `\n\nReference: ${orderNumber}` : ''}`,
        html: `
          <div style="font-family:Georgia,serif;background:#FAF8F5;color:#161412;padding:40px;max-width:560px;margin:0 auto;border:1px solid #E5DFD5;">
            <p style="letter-spacing:0.2em;font-size:11px;text-transform:uppercase;color:#9A7B4F;margin:0 0 12px;">MAISON LÉONIE · PARIS</p>
            <h1 style="font-size:26px;font-weight:400;margin:0 0 16px;">${safeHeadline}</h1>
            ${safeOrder}
            <p style="font-family:sans-serif;font-size:14px;line-height:1.7;color:#3D3833;">${safeBody}</p>
          </div>
        `,
      });

      res.json({ sent: true, configured: true });
    } catch (err) {
      res.status(500).json({
        sent: false,
        error: err instanceof Error ? err.message : 'Email dispatch failed.',
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Maison Léonie server listening on port ${PORT}`);
  });
}

startServer();
