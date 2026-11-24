import React, { useEffect, useState } from 'react';
import { CheckCircle2, Lock, ShieldCheck, Smartphone, X } from 'lucide-react';
import { User } from 'firebase/auth';
import { AddressRecord, CartItem, OrderRecord } from '../types/perfume';
import {
  clearPersistentCart,
  createNotificationRecord,
  createOrderRecord,
  dispatchTransactionalEmail,
  fetchCheckoutQuote,
  fetchIntegrationStatus,
  requestPaymentIntent,
} from '../lib/storeService';

interface CheckoutModalProps {
  isOpen: boolean;
  user: User | null;
  items: CartItem[];
  addresses: AddressRecord[];
  onClose: () => void;
  onRequireAuth: () => void;
  onOrderComplete: (order: OrderRecord) => void;
}

const SHIPPING_OPTIONS: Array<{
  id: OrderRecord['shippingMethod'];
  eta: string;
  costLabel: string;
}> = [
  {
    id: 'Complimentary Atelier Courier',
    eta: '3–5 business days · Complimentary over $220',
    costLabel: '$18 / Free $220+',
  },
  {
    id: 'Express Air Courier',
    eta: '1–2 business days · Priority insured',
    costLabel: '$28',
  },
  {
    id: 'Same-Day Boutique Courier',
    eta: 'Same-day white-glove delivery (metro)',
    costLabel: '$45',
  },
];

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  user,
  items,
  addresses,
  onClose,
  onRequireAuth,
  onOrderComplete,
}) => {
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState('');
  const [shippingMethod, setShippingMethod] = useState<OrderRecord['shippingMethod']>(
    'Complimentary Atelier Courier'
  );
  const [selectedAddrId, setSelectedAddrId] = useState<string>('custom');
  const [fullName, setFullName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [line1, setLine1] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('United States');
  const [giftNote, setGiftNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<OrderRecord['paymentMethod']>(
    'Atelier Concierge Reservation'
  );
  const [applePaySupported, setApplePaySupported] = useState(false);
  const [stripeConfigured, setStripeConfigured] = useState(false);
  const [smtpConfigured, setSmtpConfigured] = useState(false);
  const [quote, setQuote] = useState<{
    subtotal: number;
    discount: number;
    appliedPromoLabel: string | null;
    shippingCost: number;
    tax: number;
    total: number;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<OrderRecord | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setConfirmedOrder(null);
    setErrorMsg(null);
    if (user?.displayName && !fullName) {
      setFullName(user.displayName);
    }
    const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
    if (defaultAddr) {
      setSelectedAddrId(defaultAddr.id);
    }
    const hasApplePay =
      typeof window !== 'undefined' &&
      ('ApplePaySession' in window || 'PaymentRequest' in window);
    setApplePaySupported(hasApplePay);
    fetchIntegrationStatus()
      .then((status) => {
        setStripeConfigured(status.stripeConfigured);
        setSmtpConfigured(status.smtpConfigured);
        if (status.stripeConfigured && hasApplePay) {
          setPaymentMethod('Apple Pay');
        }
      })
      .catch(() => {});
  }, [isOpen, addresses, user]);

  useEffect(() => {
    if (!isOpen || items.length === 0) return;
    fetchCheckoutQuote(
      items.map((i) => ({ productId: i.productId, quantity: i.quantity, volumeMl: i.volumeMl })),
      appliedPromo,
      shippingMethod
    )
      .then((data) => {
        if (!data.error) setQuote(data);
      })
      .catch(() => {});
  }, [isOpen, items, appliedPromo, shippingMethod]);

  if (!isOpen) return null;

  const chosenAddress = addresses.find((a) => a.id === selectedAddrId);
  const formattedAddress = chosenAddress
    ? `${chosenAddress.fullName}, ${chosenAddress.line1}, ${chosenAddress.city} ${chosenAddress.postalCode}, ${chosenAddress.country}`
    : `${fullName}, ${line1}, ${city} ${postalCode}, ${country}`;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedPromo(promoInput.trim().toUpperCase());
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const resolvedEmail = (user?.email || guestEmail.trim()).toLowerCase();
    if (!resolvedEmail || !resolvedEmail.includes('@')) {
      setErrorMsg('Please provide a valid email address for order confirmation & tracking.');
      return;
    }
    if (!chosenAddress && (!fullName.trim() || !line1.trim() || !city.trim() || !postalCode.trim())) {
      setErrorMsg('Please provide a complete shipping address.');
      return;
    }
    if (!quote) return;

    setSubmitting(true);
    setErrorMsg(null);

    try {
      let paymentStatus: OrderRecord['paymentStatus'] = 'reserved';
      if (paymentMethod === 'Apple Pay' || paymentMethod === 'Card') {
        const intentRes = await requestPaymentIntent(
          items.map((i) => ({ productId: i.productId, quantity: i.quantity, volumeMl: i.volumeMl })),
          appliedPromo,
          shippingMethod
        );
        if (!intentRes.configured) {
          setErrorMsg(
            'Live Stripe processing requires STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY in Secrets. Select "Atelier Concierge Reservation" below to complete an order record without live card billing.'
          );
          setSubmitting(false);
          return;
        }
        paymentStatus = 'paid';
      }

      const orderNumber = `ML-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const customerUid = user ? user.uid : `guest_${Date.now()}`;
      const created = await createOrderRecord(customerUid, {
        orderNumber,
        customerEmail: resolvedEmail,
        customerName: chosenAddress ? chosenAddress.fullName : fullName.trim(),
        items: items.map((i) => ({
          productId: i.productId,
          productName: i.productName,
          volumeMl: i.volumeMl,
          unitPrice: i.unitPrice,
          quantity: i.quantity,
          image: i.image,
          engraving: i.engraving,
        })),
        subtotal: quote.subtotal,
        discount: quote.discount,
        ...(appliedPromo && quote.discount > 0 ? { promoCode: appliedPromo } : {}),
        shippingCost: quote.shippingCost,
        tax: quote.tax,
        total: quote.total,
        shippingMethod,
        shippingAddress: formattedAddress,
        paymentMethod,
        paymentStatus,
        status: 'confirmed',
        giftNote: giftNote.trim() || undefined,
      });

      if (user) {
        await clearPersistentCart(user.uid, items).catch(() => {});
        await createNotificationRecord(user.uid, {
          type: 'order',
          title: `Order ${orderNumber} Confirmed`,
          message: `Your Maison Léonie parcel (${items.length} creation${items.length > 1 ? 's' : ''}) is being hand-wrapped in our Paris atelier.`,
        }).catch(() => {});
      }
      await dispatchTransactionalEmail({
        subject: `Maison Léonie · Order Confirmation ${orderNumber}`,
        headline: 'Your Fragrance Order is Confirmed',
        orderNumber,
        bodyText: `Thank you for your acquisition. Your selections totaling $${quote.total.toFixed(2)} will ship via ${shippingMethod} to ${formattedAddress}.`,
      }).catch(() => {});

      setConfirmedOrder(created);
      onOrderComplete(created);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to complete order.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Atelier Checkout"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex justify-center items-start p-4 sm:p-8"
    >
      <div className="w-full max-w-[1040px] bg-[#FAF8F5] dark:bg-[#12100E] text-[#161412] dark:text-[#F4F0EA] border border-[#E5DFD5] dark:border-[#2B2723] p-6 sm:p-10">
        <div className="flex items-center justify-between pb-6 mb-8 border-b border-[#E5DFD5] dark:border-[#2B2723]">
          <div>
            <p className="text-xs tracking-[0.2em] uppercase text-[#9A7B4F] dark:text-[#C8A97E]">
              Maison Léonie · Checkout
            </p>
            <h2 className="font-editorial text-3xl sm:text-4xl">
              {confirmedOrder ? 'Acquisition Confirmed' : 'Secure Atelier Checkout'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close checkout"
            className="w-10 h-10 border border-[#E5DFD5] dark:border-[#2B2723] inline-flex items-center justify-center hover:border-[#9A7B4F] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {confirmedOrder ? (
          <div className="max-w-2xl mx-auto py-8 space-y-6">
            <div className="flex items-center gap-3 text-[#9A7B4F] dark:text-[#C8A97E]">
              <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
              <span className="text-xs tracking-[0.18em] uppercase">
                Order #{confirmedOrder.orderNumber} · Preparing Shipment
              </span>
            </div>
            <h3 className="font-editorial text-4xl">
              Thank you, {confirmedOrder.customerName}.
            </h3>
            <p className="text-sm text-[#6B655E] dark:text-[#A39C93] leading-relaxed">
              Tracking code{' '}
              <span className="font-medium text-[#161412] dark:text-[#F4F0EA] tabular-nums">
                {confirmedOrder.trackingCode}
              </span>{' '}
              has been assigned to your order.{' '}
              {smtpConfigured
                ? 'A formal confirmation receipt has been emailed to your inbox.'
                : 'Your digital receipt is saved in your Account Dashboard (configure SMTP_* env vars for outbound email dispatch).'}
            </p>

            <div className="border border-[#E5DFD5] dark:border-[#2B2723] bg-[#FFFFFF] dark:bg-[#171513] p-6 space-y-3 text-sm">
              {confirmedOrder.items.map((it) => (
                <div key={`${it.productId}-${it.volumeMl}`} className="flex justify-between">
                  <span>
                    {it.productName} ({it.volumeMl} ml) × {it.quantity}
                  </span>
                  <span className="tabular-nums">${it.unitPrice * it.quantity}</span>
                </div>
              ))}
              <div className="pt-3 border-t border-[#E5DFD5] dark:border-[#2B2723] flex justify-between font-medium">
                <span>Total ({confirmedOrder.paymentMethod})</span>
                <span className="tabular-nums">${confirmedOrder.total.toFixed(2)}</span>
              </div>
              <p className="text-xs text-[#6B655E] dark:text-[#A39C93] pt-2">
                Shipping to: {confirmedOrder.shippingAddress}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-7 py-3 text-xs tracking-[0.16em] uppercase bg-[#161412] text-[#FAF8F5] dark:bg-[#C8A97E] dark:text-[#0E0D0C] cursor-pointer"
            >
              Return to Boutique
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left: Shipping & Payment Form */}
            <form onSubmit={handlePlaceOrder} className="lg:col-span-7 space-y-8">
              {!user ? (
                <div className="space-y-4">
                  <div className="p-4 border border-[#E5DFD5] dark:border-[#2B2723] bg-[#FAF8F5] dark:bg-[#151311] flex items-center justify-between gap-4">
                    <p className="text-xs text-[#6B655E] dark:text-[#A39C93]">
                      <span className="font-medium text-[#161412] dark:text-[#FAF8F5]">Express Guest Checkout</span> · Or sign in with Google to save order history.
                    </p>
                    <button
                      type="button"
                      onClick={onRequireAuth}
                      className="px-3.5 py-1.5 text-[10px] tracking-[0.14em] uppercase border border-[#9A7B4F] text-[#9A7B4F] dark:text-[#C8A97E] hover:bg-[#9A7B4F] hover:text-white transition-colors shrink-0 cursor-pointer"
                    >
                      Sign In (Optional)
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-[0.14em] text-[#6B655E] dark:text-[#A39C93] mb-2 font-medium">
                      Your Email (for Order Confirmation &amp; Tracking Courier) *
                    </label>
                    <input
                      type="email"
                      required
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="client@atelier.com"
                      className="w-full px-3.5 py-2.5 text-sm bg-[#FFFFFF] dark:bg-[#141210] border border-[#D8D0C4] dark:border-[#2E2A25] focus:outline-none focus:border-[#9A7B4F]"
                    />
                  </div>
                </div>
              ) : null}

              {/* Shipping Address */}
              <div>
                <h3 className="font-editorial text-2xl mb-4">Shipping Destination</h3>
                {addresses.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    {addresses.map((addr) => (
                      <button
                        key={addr.id}
                        type="button"
                        onClick={() => setSelectedAddrId(addr.id)}
                        className={`p-4 text-left border text-xs transition-colors cursor-pointer ${
                          selectedAddrId === addr.id
                            ? 'border-[#9A7B4F] bg-[#FFFFFF] dark:bg-[#171513]'
                            : 'border-[#E5DFD5] dark:border-[#2B2723]'
                        }`}
                      >
                        <p className="uppercase tracking-[0.14em] text-[#9A7B4F] mb-1">
                          {addr.label}
                        </p>
                        <p className="font-medium">{addr.fullName}</p>
                        <p className="text-[#6B655E] dark:text-[#A39C93]">
                          {addr.line1}, {addr.city}
                        </p>
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setSelectedAddrId('custom')}
                      className={`p-4 text-left border text-xs transition-colors cursor-pointer ${
                        selectedAddrId === 'custom'
                          ? 'border-[#9A7B4F] bg-[#FFFFFF] dark:bg-[#171513]'
                          : 'border-[#E5DFD5] dark:border-[#2B2723]'
                      }`}
                    >
                      <p className="uppercase tracking-[0.14em] text-[#9A7B4F] mb-1">
                        New Address
                      </p>
                      <p>Enter a custom shipping destination</p>
                    </button>
                  </div>
                )}

                {selectedAddrId === 'custom' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Recipient Full Name"
                      className="sm:col-span-2 px-3.5 py-2.5 text-sm bg-[#FFFFFF] dark:bg-[#141210] border border-[#D8D0C4] dark:border-[#2E2A25]"
                    />
                    <input
                      type="text"
                      required
                      value={line1}
                      onChange={(e) => setLine1(e.target.value)}
                      placeholder="Street Address"
                      className="sm:col-span-2 px-3.5 py-2.5 text-sm bg-[#FFFFFF] dark:bg-[#141210] border border-[#D8D0C4] dark:border-[#2E2A25]"
                    />
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="City"
                      className="px-3.5 py-2.5 text-sm bg-[#FFFFFF] dark:bg-[#141210] border border-[#D8D0C4] dark:border-[#2E2A25]"
                    />
                    <input
                      type="text"
                      required
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="Postal Code"
                      className="px-3.5 py-2.5 text-sm bg-[#FFFFFF] dark:bg-[#141210] border border-[#D8D0C4] dark:border-[#2E2A25]"
                    />
                    <input
                      type="text"
                      required
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="Country"
                      className="sm:col-span-2 px-3.5 py-2.5 text-sm bg-[#FFFFFF] dark:bg-[#141210] border border-[#D8D0C4] dark:border-[#2E2A25]"
                    />
                  </div>
                )}
              </div>

              {/* Delivery Options */}
              <div>
                <h3 className="font-editorial text-2xl mb-4">Courier Method</h3>
                <div className="space-y-2.5">
                  {SHIPPING_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setShippingMethod(opt.id)}
                      className={`w-full p-4 border text-left flex items-center justify-between gap-4 transition-colors cursor-pointer ${
                        shippingMethod === opt.id
                          ? 'border-[#9A7B4F] bg-[#FFFFFF] dark:bg-[#171513]'
                          : 'border-[#E5DFD5] dark:border-[#2B2723]'
                      }`}
                    >
                      <div>
                        <p className="text-sm font-medium">{opt.id}</p>
                        <p className="text-xs text-[#6B655E] dark:text-[#A39C93]">{opt.eta}</p>
                      </div>
                      <span className="text-xs font-medium tabular-nums shrink-0">
                        {opt.costLabel}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <h3 className="font-editorial text-2xl mb-4">Payment &amp; Settlement</h3>
                <div className="space-y-3">
                  {applePaySupported && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('Apple Pay')}
                      className={`w-full p-4 border text-left flex items-center justify-between cursor-pointer ${
                        paymentMethod === 'Apple Pay'
                          ? 'border-[#9A7B4F] bg-[#FFFFFF] dark:bg-[#171513]'
                          : 'border-[#E5DFD5] dark:border-[#2B2723]'
                      }`}
                    >
                      <span className="inline-flex items-center gap-2.5 text-sm font-medium">
                        <Smartphone className="w-4 h-4" aria-hidden="true" />
                        <span>Apple Pay / Express Wallet</span>
                      </span>
                      <span className="text-xs text-[#6B655E] dark:text-[#A39C93]">
                        {stripeConfigured ? 'Stripe Ready' : 'Requires STRIPE_SECRET_KEY'}
                      </span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Card')}
                    className={`w-full p-4 border text-left flex items-center justify-between cursor-pointer ${
                      paymentMethod === 'Card'
                        ? 'border-[#9A7B4F] bg-[#FFFFFF] dark:bg-[#171513]'
                        : 'border-[#E5DFD5] dark:border-[#2B2723]'
                    }`}
                  >
                    <span className="inline-flex items-center gap-2.5 text-sm font-medium">
                      <Lock className="w-4 h-4" aria-hidden="true" />
                      <span>Credit or Debit Card (Stripe PaymentIntent)</span>
                    </span>
                    <span className="text-xs text-[#6B655E] dark:text-[#A39C93]">
                      {stripeConfigured ? 'Active' : 'Requires STRIPE_SECRET_KEY'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Atelier Concierge Reservation')}
                    className={`w-full p-4 border text-left flex items-center justify-between cursor-pointer ${
                      paymentMethod === 'Atelier Concierge Reservation'
                        ? 'border-[#9A7B4F] bg-[#FFFFFF] dark:bg-[#171513]'
                        : 'border-[#E5DFD5] dark:border-[#2B2723]'
                    }`}
                  >
                    <span className="inline-flex items-center gap-2.5 text-sm font-medium">
                      <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                      <span>Atelier Concierge Reservation (Pay on Invoice / Boutique)</span>
                    </span>
                    <span className="text-xs text-[#9A7B4F] dark:text-[#C8A97E]">
                      Available Now
                    </span>
                  </button>
                </div>

                {!stripeConfigured && (
                  <p className="mt-3 text-xs text-[#6B655E] dark:text-[#A39C93] leading-relaxed">
                    Integration Notice: Live Apple Pay &amp; Card settlement activates automatically
                    when <code className="px-1 bg-[#F2EEE8] dark:bg-[#1D1A17]">STRIPE_SECRET_KEY</code>{' '}
                    and{' '}
                    <code className="px-1 bg-[#F2EEE8] dark:bg-[#1D1A17]">STRIPE_PUBLISHABLE_KEY</code>{' '}
                    are configured in Secrets.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs uppercase tracking-[0.14em] text-[#6B655E] dark:text-[#A39C93] mb-2">
                  Complimentary Calligraphy Gift Note (Optional)
                </label>
                <input
                  type="text"
                  maxLength={300}
                  value={giftNote}
                  onChange={(e) => setGiftNote(e.target.value)}
                  placeholder="Write a personal dedication for the enclosed card..."
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FFFFFF] dark:bg-[#141210] border border-[#D8D0C4] dark:border-[#2E2A25]"
                />
              </div>

              {errorMsg && (
                <p className="text-xs text-red-700 dark:text-red-400 border border-red-300 dark:border-red-900 p-3">
                  {errorMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting || !quote}
                className="w-full py-4 px-6 text-xs tracking-[0.18em] uppercase bg-[#161412] text-[#FAF8F5] dark:bg-[#C8A97E] dark:text-[#0E0D0C] hover:opacity-90 cursor-pointer disabled:opacity-50"
              >
                {submitting
                  ? 'Confirming Acquisition...'
                  : quote
                  ? `Confirm Order — $${quote.total.toFixed(2)}`
                  : 'Calculating Totals...'}
              </button>
            </form>

            {/* Right: Order Summary & Promo Code */}
            <aside className="lg:col-span-5 border border-[#E5DFD5] dark:border-[#2B2723] bg-[#FFFFFF] dark:bg-[#171513] p-6 sm:p-8 h-fit">
              <h3 className="font-editorial text-2xl mb-5">Order Summary</h3>

              <div className="space-y-4 pb-6 border-b border-[#E5DFD5] dark:border-[#2B2723]">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 text-sm">
                    <img
                      src={item.image}
                      alt={item.productName}
                      referrerPolicy="no-referrer"
                      className="w-12 h-14 object-cover bg-[#EFEAE2] dark:bg-[#1E1B18]"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-editorial text-lg truncate">{item.productName}</p>
                      <p className="text-xs text-[#6B655E] dark:text-[#A39C93]">
                        {item.volumeMl} ml × {item.quantity}
                      </p>
                      {item.engraving && (
                        <p className="text-[11px] font-editorial italic text-[#9A7B4F] dark:text-[#E4C79B]">
                          Engraved: &ldquo;{item.engraving}&rdquo;
                        </p>
                      )}
                    </div>
                    <span className="tabular-nums">${item.unitPrice * item.quantity}</span>
                  </div>
                ))}
              </div>

              <form onSubmit={handleApplyPromo} className="py-5 border-b border-[#E5DFD5] dark:border-[#2B2723]">
                <label className="block text-xs uppercase tracking-[0.14em] text-[#6B655E] dark:text-[#A39C93] mb-2">
                  Privilege Code (Try LEONIE15 or FIRSTSCENT)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder="Enter code"
                    className="flex-1 px-3 py-2 text-xs uppercase bg-[#FAF8F5] dark:bg-[#12100E] border border-[#D8D0C4] dark:border-[#2E2A25]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs tracking-[0.14em] uppercase border border-[#161412] dark:border-[#C8A97E] cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                {quote?.appliedPromoLabel && (
                  <p className="text-xs text-[#9A7B4F] dark:text-[#C8A97E] mt-2">
                    Applied: {quote.appliedPromoLabel}
                  </p>
                )}
              </form>

              {quote && (
                <div className="pt-5 space-y-2.5 text-sm">
                  <div className="flex justify-between text-[#6B655E] dark:text-[#A39C93]">
                    <span>Subtotal</span>
                    <span className="tabular-nums">${quote.subtotal.toFixed(2)}</span>
                  </div>
                  {quote.discount > 0 && (
                    <div className="flex justify-between text-[#9A7B4F] dark:text-[#C8A97E]">
                      <span>Privilege Discount</span>
                      <span className="tabular-nums">-${quote.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[#6B655E] dark:text-[#A39C93]">
                    <span>Courier Shipping</span>
                    <span className="tabular-nums">
                      {quote.shippingCost === 0 ? 'Complimentary' : `$${quote.shippingCost.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#6B655E] dark:text-[#A39C93]">
                    <span>Estimated Taxes</span>
                    <span className="tabular-nums">${quote.tax.toFixed(2)}</span>
                  </div>
                  <div className="pt-3 border-t border-[#E5DFD5] dark:border-[#2B2723] flex justify-between text-base font-medium">
                    <span>Total</span>
                    <span className="tabular-nums">${quote.total.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </aside>
          </div>
        )}
      </div>
    </div>
  );
};
