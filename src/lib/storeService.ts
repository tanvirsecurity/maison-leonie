import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { INITIAL_PERFUMES, SEED_REVIEWS } from '../data/perfumes';
import {
  AddressRecord,
  CartItem,
  NotificationItem,
  OrderRecord,
  PerfumeProduct,
  ProductReview,
  SupportMessage,
  SupportTicket,
  UserPreferences,
  UserPrivateProfile,
} from '../types/perfume';
import {
  auth,
  BOOTSTRAP_ADMIN_EMAIL,
  db,
  handleFirestoreError,
  OperationType,
} from './firebase';

function makeSafeId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}-${Date.now()}-${rand}`.replace(/[^a-zA-Z0-9_-]/g, '');
}

function isoFromTimestamp(ts: unknown): string {
  if (ts && typeof ts === 'object' && 'toDate' in ts && typeof (ts as { toDate: () => Date }).toDate === 'function') {
    return (ts as { toDate: () => Date }).toDate().toISOString().slice(0, 10);
  }
  if (typeof ts === 'string') return ts;
  return new Date().toISOString().slice(0, 10);
}

export async function fetchProductsCatalog(): Promise<PerfumeProduct[]> {
  try {
    const snap = await getDocs(collection(db, 'products'));
    if (snap.empty) {
      return INITIAL_PERFUMES;
    }
    const items: PerfumeProduct[] = [];
    snap.forEach((docSnap) => {
      const d = docSnap.data();
      items.push({
        id: d.id || docSnap.id,
        slug: d.slug,
        name: d.name,
        brand: d.brand,
        subtitle: d.subtitle,
        category: d.category,
        fragranceFamily: d.fragranceFamily,
        concentration: d.concentration,
        longevityHours: d.longevityHours,
        intensity: d.intensity,
        price: d.price,
        volumeMl: d.volumeMl,
        stockCount: d.stockCount,
        popularityScore: d.popularityScore ?? 85,
        shortDescription: d.shortDescription,
        description: d.description,
        perfumerNote: d.perfumerNote,
        topNotes: d.topNotes || [],
        heartNotes: d.heartNotes || [],
        baseNotes: d.baseNotes || [],
        occasion: d.occasion || [],
        season: d.season || [],
        images: d.images || [],
        ratingAvg: d.ratingAvg ?? 4.8,
        reviewCount: d.reviewCount ?? 1,
      });
    });
    return items.length > 0 ? items : INITIAL_PERFUMES;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'products');
  }
}

export async function syncCatalogAsAdmin(products: PerfumeProduct[] = INITIAL_PERFUMES): Promise<void> {
  const user = auth.currentUser;
  if (!user || user.email !== BOOTSTRAP_ADMIN_EMAIL) return;
  try {
    const batch = writeBatch(db);
    for (const p of products) {
      const ref = doc(db, 'products', p.id);
      const existing = await getDoc(ref);
      if (!existing.exists()) {
        batch.set(ref, {
          ...p,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else {
        const currentBrand = existing.data()?.brand;
        if (currentBrand !== p.brand) {
          batch.update(ref, {
            brand: p.brand,
            subtitle: p.subtitle,
            updatedAt: serverTimestamp(),
          });
        }
      }
    }
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'products');
  }
}

export async function upsertProductAsAdmin(product: PerfumeProduct, isNew: boolean): Promise<void> {
  try {
    const ref = doc(db, 'products', product.id);
    if (isNew) {
      await setDoc(ref, {
        ...product,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(ref, {
        ...product,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, isNew ? OperationType.CREATE : OperationType.UPDATE, `products/${product.id}`);
  }
}

export async function fetchProductReviews(productId: string): Promise<ProductReview[]> {
  try {
    const q = query(
      collection(db, 'products', productId, 'reviews'),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    const firestoreReviews: ProductReview[] = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        authorId: data.authorId,
        authorName: data.authorName,
        rating: data.rating,
        title: data.title,
        comment: data.comment,
        verifiedPurchase: Boolean(data.verifiedPurchase),
        createdAt: isoFromTimestamp(data.createdAt),
      };
    });
    const seeded = SEED_REVIEWS[productId] || [];
    return [...firestoreReviews, ...seeded];
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `products/${productId}/reviews`);
  }
}

export async function submitProductReview(
  productId: string,
  review: { title: string; comment: string; rating: number; verifiedPurchase: boolean }
): Promise<ProductReview> {
  const user = auth.currentUser;
  if (!user) throw new Error('Sign in required to publish a review.');
  const reviewId = makeSafeId('rev');
  const path = `products/${productId}/reviews/${reviewId}`;
  try {
    const payload = {
      authorId: user.uid,
      authorName: user.displayName || user.email?.split('@')[0] || 'Atelier Client',
      rating: Math.min(5, Math.max(1, Math.round(review.rating))),
      title: review.title.trim().slice(0, 120),
      comment: review.comment.trim().slice(0, 1500),
      verifiedPurchase: review.verifiedPurchase,
      createdAt: serverTimestamp(),
    };
    await setDoc(doc(db, 'products', productId, 'reviews', reviewId), payload);
    return {
      id: reviewId,
      authorId: payload.authorId,
      authorName: payload.authorName,
      rating: payload.rating,
      title: payload.title,
      comment: payload.comment,
      verifiedPurchase: payload.verifiedPurchase,
      createdAt: new Date().toISOString().slice(0, 10),
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function ensureUserDocuments(user: User): Promise<{
  prefs: UserPreferences;
  privateProfile: UserPrivateProfile;
}> {
  const userRef = doc(db, 'users', user.uid);
  const privRef = doc(db, 'users', user.uid, 'private', 'profile');

  try {
    const [userSnap, privSnap] = await Promise.all([getDoc(userRef), getDoc(privRef)]);
    const isAdminUser = user.email === BOOTSTRAP_ADMIN_EMAIL && user.emailVerified;

    let prefs: UserPreferences;
    if (!userSnap.exists()) {
      prefs = {
        uid: user.uid,
        role: isAdminUser ? 'admin' : 'customer',
        theme: 'light',
        wishlistIds: [],
        recentlyViewedIds: [],
        preferredFamilies: [],
        favoriteNotes: [],
        twoFactorEnabled: false,
        emailNotifications: true,
        reorderReminders: true,
        launchAlerts: true,
        pushEnabled: false,
        privacyAnalytics: true,
        quizSummary: '',
      };
      await setDoc(userRef, {
        ...prefs,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      const d = userSnap.data();
      prefs = {
        uid: d.uid,
        role: d.role || 'customer',
        theme: d.theme || 'light',
        wishlistIds: d.wishlistIds || [],
        recentlyViewedIds: d.recentlyViewedIds || [],
        preferredFamilies: d.preferredFamilies || [],
        favoriteNotes: d.favoriteNotes || [],
        twoFactorEnabled: Boolean(d.twoFactorEnabled),
        emailNotifications: d.emailNotifications ?? true,
        reorderReminders: d.reorderReminders ?? true,
        launchAlerts: d.launchAlerts ?? true,
        pushEnabled: Boolean(d.pushEnabled),
        privacyAnalytics: d.privacyAnalytics ?? true,
        quizSummary: d.quizSummary || '',
      };
    }

    let privateProfile: UserPrivateProfile;
    if (!privSnap.exists()) {
      privateProfile = {
        uid: user.uid,
        fullName: user.displayName || 'Atelier Patron',
        email: user.email || '',
        phone: '',
        totpVerified: false,
      };
      await setDoc(privRef, {
        ...privateProfile,
        updatedAt: serverTimestamp(),
      });
    } else {
      const p = privSnap.data();
      privateProfile = {
        uid: p.uid,
        fullName: p.fullName || user.displayName || '',
        email: p.email || user.email || '',
        phone: p.phone || '',
        totpSecret: p.totpSecret,
        totpVerified: Boolean(p.totpVerified),
      };
    }

    return { prefs, privateProfile };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
  }
}

export async function updateUserPreferences(
  uid: string,
  updates: Partial<Omit<UserPreferences, 'uid' | 'role'>>
): Promise<void> {
  try {
    await updateDoc(doc(db, 'users', uid), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
  }
}

export async function updateUserPrivateProfile(
  uid: string,
  updates: Partial<Omit<UserPrivateProfile, 'uid'>>
): Promise<void> {
  try {
    await updateDoc(doc(db, 'users', uid, 'private', 'profile'), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${uid}/private/profile`);
  }
}

export async function fetchUserAddresses(uid: string): Promise<AddressRecord[]> {
  try {
    const snap = await getDocs(collection(db, 'users', uid, 'addresses'));
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        uid: data.uid,
        label: data.label,
        fullName: data.fullName,
        line1: data.line1,
        line2: data.line2 || '',
        city: data.city,
        state: data.state || '',
        postalCode: data.postalCode,
        country: data.country,
        phone: data.phone || '',
        isDefault: Boolean(data.isDefault),
      };
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `users/${uid}/addresses`);
  }
}

export async function saveUserAddress(
  uid: string,
  address: Omit<AddressRecord, 'id' | 'uid'> & { id?: string }
): Promise<AddressRecord> {
  const addrId = address.id || makeSafeId('addr');
  const isNew = !address.id;
  try {
    const ref = doc(db, 'users', uid, 'addresses', addrId);
    const payload = {
      uid,
      label: address.label.trim().slice(0, 40),
      fullName: address.fullName.trim().slice(0, 120),
      line1: address.line1.trim().slice(0, 180),
      line2: (address.line2 || '').trim().slice(0, 120),
      city: address.city.trim().slice(0, 80),
      state: (address.state || '').trim().slice(0, 80),
      postalCode: address.postalCode.trim().slice(0, 24),
      country: address.country.trim().slice(0, 80),
      phone: (address.phone || '').trim().slice(0, 40),
      isDefault: Boolean(address.isDefault),
      updatedAt: serverTimestamp(),
      ...(isNew ? { createdAt: serverTimestamp() } : {}),
    };
    if (isNew) {
      await setDoc(ref, payload);
    } else {
      await updateDoc(ref, payload);
    }
    return {
      id: addrId,
      uid,
      label: payload.label,
      fullName: payload.fullName,
      line1: payload.line1,
      line2: payload.line2,
      city: payload.city,
      state: payload.state,
      postalCode: payload.postalCode,
      country: payload.country,
      phone: payload.phone,
      isDefault: payload.isDefault,
    };
  } catch (error) {
    handleFirestoreError(error, isNew ? OperationType.CREATE : OperationType.UPDATE, `users/${uid}/addresses/${addrId}`);
  }
}

export async function removeUserAddress(uid: string, addressId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'users', uid, 'addresses', addressId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${uid}/addresses/${addressId}`);
  }
}

export async function fetchPersistentCart(uid: string): Promise<CartItem[]> {
  try {
    const snap = await getDocs(collection(db, 'users', uid, 'cart'));
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        productId: data.productId,
        productName: data.productName,
        brand: data.brand,
        image: data.image,
        volumeMl: data.volumeMl,
        unitPrice: data.unitPrice,
        quantity: data.quantity,
      };
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `users/${uid}/cart`);
  }
}

export async function savePersistentCartItem(uid: string, item: CartItem): Promise<void> {
  try {
    await setDoc(doc(db, 'users', uid, 'cart', item.id), {
      uid,
      productId: item.productId,
      productName: item.productName,
      brand: item.brand,
      image: item.image,
      volumeMl: item.volumeMl,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${uid}/cart/${item.id}`);
  }
}

export async function deletePersistentCartItem(uid: string, itemId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'users', uid, 'cart', itemId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${uid}/cart/${itemId}`);
  }
}

export async function clearPersistentCart(uid: string, items: CartItem[]): Promise<void> {
  try {
    const batch = writeBatch(db);
    for (const item of items) {
      batch.delete(doc(db, 'users', uid, 'cart', item.id));
    }
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${uid}/cart`);
  }
}

export async function createOrderRecord(
  uid: string,
  orderInput: Omit<OrderRecord, 'id' | 'userId' | 'createdAtIso'>
): Promise<OrderRecord> {
  const orderId = makeSafeId('ord');
  try {
    const payload = {
      userId: uid,
      orderNumber: orderInput.orderNumber,
      customerEmail: orderInput.customerEmail,
      customerName: orderInput.customerName,
      items: orderInput.items,
      subtotal: orderInput.subtotal,
      discount: orderInput.discount,
      ...(orderInput.promoCode ? { promoCode: orderInput.promoCode } : {}),
      shippingCost: orderInput.shippingCost,
      tax: orderInput.tax,
      total: orderInput.total,
      shippingMethod: orderInput.shippingMethod,
      shippingAddress: orderInput.shippingAddress,
      paymentMethod: orderInput.paymentMethod,
      paymentStatus: orderInput.paymentStatus,
      status: 'confirmed',
      trackingCode: orderInput.trackingCode || `ML-${Math.floor(100000 + Math.random() * 900000)}`,
      ...(orderInput.giftNote ? { giftNote: orderInput.giftNote.slice(0, 300) } : {}),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(doc(db, 'orders', orderId), payload);
    return {
      ...orderInput,
      id: orderId,
      userId: uid,
      status: 'confirmed',
      trackingCode: payload.trackingCode,
      createdAtIso: new Date().toISOString().slice(0, 10),
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `orders/${orderId}`);
  }
}

export async function fetchUserOrders(uid: string, isAdmin: boolean): Promise<OrderRecord[]> {
  try {
    const q = isAdmin
      ? query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
      : query(collection(db, 'orders'), where('userId', '==', uid), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        userId: data.userId,
        orderNumber: data.orderNumber,
        customerEmail: data.customerEmail,
        customerName: data.customerName,
        items: data.items || [],
        subtotal: data.subtotal,
        discount: data.discount,
        promoCode: data.promoCode,
        shippingCost: data.shippingCost,
        tax: data.tax,
        total: data.total,
        shippingMethod: data.shippingMethod,
        shippingAddress: data.shippingAddress,
        paymentMethod: data.paymentMethod,
        paymentStatus: data.paymentStatus,
        status: data.status,
        trackingCode: data.trackingCode,
        giftNote: data.giftNote,
        createdAtIso: isoFromTimestamp(data.createdAt),
      };
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'orders');
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderRecord['status']
): Promise<void> {
  try {
    await updateDoc(doc(db, 'orders', orderId), {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
  }
}

export async function createRestockAlert(
  uid: string,
  productId: string,
  productName: string,
  email: string
): Promise<void> {
  const alertId = `${uid}-${productId}`.replace(/[^a-zA-Z0-9_-]/g, '');
  try {
    await setDoc(doc(db, 'restockAlerts', alertId), {
      userId: uid,
      productId,
      productName: productName.slice(0, 120),
      email: email.slice(0, 180),
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `restockAlerts/${alertId}`);
  }
}

export async function createNotificationRecord(
  uid: string,
  notification: Omit<NotificationItem, 'id' | 'userId' | 'read' | 'createdAtIso'>
): Promise<NotificationItem> {
  const notifId = makeSafeId('notif');
  try {
    await setDoc(doc(db, 'users', uid, 'notifications', notifId), {
      userId: uid,
      type: notification.type,
      title: notification.title.slice(0, 120),
      message: notification.message.slice(0, 500),
      read: false,
      createdAt: serverTimestamp(),
    });

    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, { body: notification.message });
    }

    return {
      id: notifId,
      userId: uid,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      read: false,
      createdAtIso: new Date().toISOString().slice(0, 10),
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `users/${uid}/notifications/${notifId}`);
  }
}

export function subscribeNotifications(
  uid: string,
  callback: (items: NotificationItem[]) => void
): () => void {
  const path = `users/${uid}/notifications`;
  const q = query(collection(db, 'users', uid, 'notifications'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      const list: NotificationItem[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          userId: data.userId,
          type: data.type,
          title: data.title,
          message: data.message,
          read: Boolean(data.read),
          createdAtIso: isoFromTimestamp(data.createdAt),
        };
      });
      callback(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function markNotificationRead(uid: string, notificationId: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'users', uid, 'notifications', notificationId), {
      read: true,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${uid}/notifications/${notificationId}`);
  }
}

export function subscribeSupportTickets(
  uid: string,
  isAdmin: boolean,
  callback: (tickets: SupportTicket[]) => void
): () => void {
  const q = isAdmin
    ? query(collection(db, 'supportTickets'), orderBy('updatedAt', 'desc'))
    : query(
        collection(db, 'supportTickets'),
        where('userId', '==', uid),
        orderBy('updatedAt', 'desc')
      );
  return onSnapshot(
    q,
    (snap) => {
      const tickets: SupportTicket[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          userId: data.userId,
          userEmail: data.userEmail,
          userName: data.userName,
          subject: data.subject,
          category: data.category,
          status: data.status,
          messages: data.messages || [],
          createdAtIso: isoFromTimestamp(data.createdAt),
        };
      });
      callback(tickets);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'supportTickets');
    }
  );
}

export async function createSupportTicket(
  user: User,
  subject: string,
  category: SupportTicket['category'],
  initialMessage: string
): Promise<string> {
  const ticketId = makeSafeId('tkt');
  try {
    const firstMsg: SupportMessage = {
      sender: 'customer',
      senderName: user.displayName || user.email?.split('@')[0] || 'Client',
      text: initialMessage.trim().slice(0, 1000),
      sentAtIso: new Date().toISOString(),
    };
    await setDoc(doc(db, 'supportTickets', ticketId), {
      userId: user.uid,
      userEmail: user.email || '',
      userName: user.displayName || 'Atelier Client',
      subject: subject.trim().slice(0, 140),
      category,
      status: 'open',
      messages: [firstMsg],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return ticketId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `supportTickets/${ticketId}`);
  }
}

export async function appendSupportMessage(
  ticket: SupportTicket,
  message: SupportMessage,
  newStatus?: 'open' | 'resolved'
): Promise<void> {
  try {
    const updatedMessages = [...ticket.messages, message].slice(-50);
    await updateDoc(doc(db, 'supportTickets', ticket.id), {
      messages: updatedMessages,
      status: newStatus || ticket.status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `supportTickets/${ticket.id}`);
  }
}

// Authenticated Server API Helpers
async function authFetch(path: string, body?: unknown): Promise<Response> {
  const user = auth.currentUser;
  const token = user ? await user.getIdToken() : '';
  return fetch(path, {
    method: body ? 'POST' : 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}

export async function fetchIntegrationStatus(): Promise<{
  stripeConfigured: boolean;
  stripePublishableKey: string | null;
  smtpConfigured: boolean;
  requiredEnvVars: { stripe: string[]; email: string[] };
}> {
  const resp = await fetch('/api/config/integrations');
  return resp.json();
}

export async function fetchCheckoutQuote(
  items: { productId: string; quantity: number; volumeMl: number }[],
  promoCode: string,
  shippingMethod: string
) {
  const resp = await fetch('/api/checkout/quote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items, promoCode, shippingMethod }),
  });
  return resp.json();
}

export async function requestPaymentIntent(
  items: { productId: string; quantity: number; volumeMl: number }[],
  promoCode: string,
  shippingMethod: string
) {
  const resp = await authFetch('/api/payments/create-intent', {
    items,
    promoCode,
    shippingMethod,
  });
  return resp.json();
}

export async function enrollTwoFactor(): Promise<{
  qrDataUrl: string;
  manualKey: string;
  sealedSecret: string;
}> {
  const resp = await authFetch('/api/auth/2fa/enroll', {});
  if (!resp.ok) throw new Error('Unable to initialize 2FA enrollment.');
  return resp.json();
}

export async function verifyTwoFactorCode(
  code: string,
  sealedSecret: string
): Promise<{ valid: boolean; error?: string }> {
  const resp = await authFetch('/api/auth/2fa/verify', { code, sealedSecret });
  return resp.json();
}

export async function dispatchTransactionalEmail(payload: {
  subject: string;
  headline: string;
  bodyText: string;
  orderNumber?: string;
}): Promise<{ sent: boolean; configured: boolean; requiredEnvVars?: string[] }> {
  const resp = await authFetch('/api/notifications/email', payload);
  return resp.json();
}
