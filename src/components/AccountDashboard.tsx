import React, { useState } from 'react';
import {
  Bell,
  Check,
  KeyRound,
  LogOut,
  MapPin,
  Package,
  RefreshCw,
  Shield,
  Sliders,
  Trash2,
  UserCheck,
  X,
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  AddressRecord,
  NotificationItem,
  OrderRecord,
  PerfumeProduct,
  UserPreferences,
  UserPrivateProfile,
} from '../types/perfume';
import {
  createNotificationRecord,
  enrollTwoFactor,
  markNotificationRead,
  removeUserAddress,
  saveUserAddress,
  syncCatalogAsAdmin,
  updateOrderStatus,
  updateUserPreferences,
  updateUserPrivateProfile,
  upsertProductAsAdmin,
  verifyTwoFactorCode,
} from '../lib/storeService';

interface AccountDashboardProps {
  isOpen: boolean;
  user: User | null;
  prefs: UserPreferences | null;
  privateProfile: UserPrivateProfile | null;
  orders: OrderRecord[];
  addresses: AddressRecord[];
  notifications: NotificationItem[];
  products: PerfumeProduct[];
  onClose: () => void;
  onSignInGoogle: () => void;
  onSignOut: () => void;
  onUpdatePrefsLocal: (updates: Partial<UserPreferences>) => void;
  onUpdatePrivateLocal: (updates: Partial<UserPrivateProfile>) => void;
  onAddressesChanged: (next: AddressRecord[]) => void;
  onReorderItems: (order: OrderRecord) => void;
  onViewProduct: (product: PerfumeProduct) => void;
  onProductsChanged: (next: PerfumeProduct[]) => void;
  onOrdersChanged: (next: OrderRecord[]) => void;
}

type DashTab = 'profile' | 'orders' | 'addresses' | 'wishlist' | 'notifications' | 'admin';

export const AccountDashboard: React.FC<AccountDashboardProps> = ({
  isOpen,
  user,
  prefs,
  privateProfile,
  orders,
  addresses,
  notifications,
  products,
  onClose,
  onSignInGoogle,
  onSignOut,
  onUpdatePrefsLocal,
  onUpdatePrivateLocal,
  onAddressesChanged,
  onReorderItems,
  onViewProduct,
  onProductsChanged,
  onOrdersChanged,
}) => {
  const [activeTab, setActiveTab] = useState<DashTab>('profile');
  const [fullNameInput, setFullNameInput] = useState(privateProfile?.fullName || '');
  const [phoneInput, setPhoneInput] = useState(privateProfile?.phone || '');
  const [profileStatus, setProfileStatus] = useState<string | null>(null);

  // 2FA Enrollment & Verification state
  const [totpEnrollData, setTotpEnrollData] = useState<{
    qrDataUrl: string;
    manualKey: string;
    sealedSecret: string;
  } | null>(null);
  const [totpCodeInput, setTotpCodeInput] = useState('');
  const [totpStatus, setTotpStatus] = useState<string | null>(null);

  // Address Form
  const [addrLabel, setAddrLabel] = useState('Residence');
  const [addrName, setAddrName] = useState('');
  const [addrLine1, setAddrLine1] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrPostal, setAddrPostal] = useState('');
  const [addrCountry, setAddrCountry] = useState('United States');

  // Admin inventory sync status
  const [adminStatus, setAdminStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const isAdmin = prefs?.role === 'admin';
  const wishlistProducts = products.filter((p) => prefs?.wishlistIds.includes(p.id));
  const purchasedProductIds = new Set(orders.flatMap((o) => o.items.map((i) => i.productId)));
  const purchasedProducts = products.filter((p) => purchasedProductIds.has(p.id));

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    await updateUserPrivateProfile(user.uid, {
      fullName: fullNameInput.trim() || user.displayName || 'Atelier Patron',
      phone: phoneInput.trim(),
    });
    onUpdatePrivateLocal({
      fullName: fullNameInput.trim() || user.displayName || 'Atelier Patron',
      phone: phoneInput.trim(),
    });
    setProfileStatus('Profile information updated securely.');
  };

  const handleStart2fa = async () => {
    setTotpStatus(null);
    try {
      const data = await enrollTwoFactor();
      setTotpEnrollData(data);
    } catch (err) {
      setTotpStatus(err instanceof Error ? err.message : 'Unable to start 2FA enrollment.');
    }
  };

  const handleConfirm2fa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !totpEnrollData) return;
    const res = await verifyTwoFactorCode(totpCodeInput, totpEnrollData.sealedSecret);
    if (res.valid) {
      await updateUserPrivateProfile(user.uid, {
        totpSecret: totpEnrollData.sealedSecret,
        totpVerified: true,
      });
      await updateUserPreferences(user.uid, { twoFactorEnabled: true });
      onUpdatePrivateLocal({ totpSecret: totpEnrollData.sealedSecret, totpVerified: true });
      onUpdatePrefsLocal({ twoFactorEnabled: true });
      setTotpEnrollData(null);
      setTotpCodeInput('');
      setTotpStatus('Two-Factor Authentication (TOTP) is now active on your account.');
    } else {
      setTotpStatus(res.error || 'Verification code did not match. Please try again.');
    }
  };

  const handleDisable2fa = async () => {
    if (!user) return;
    await updateUserPreferences(user.uid, { twoFactorEnabled: false });
    await updateUserPrivateProfile(user.uid, { totpVerified: false, totpSecret: '' });
    onUpdatePrefsLocal({ twoFactorEnabled: false });
    onUpdatePrivateLocal({ totpVerified: false, totpSecret: '' });
    setTotpStatus('Two-Factor Authentication disabled.');
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const saved = await saveUserAddress(user.uid, {
      label: addrLabel,
      fullName: addrName || privateProfile?.fullName || user.displayName || 'Patron',
      line1: addrLine1,
      city: addrCity,
      postalCode: addrPostal,
      country: addrCountry,
      isDefault: addresses.length === 0,
    });
    onAddressesChanged([...addresses, saved]);
    setAddrLine1('');
    setAddrCity('');
    setAddrPostal('');
  };

  const handleTogglePref = async (
    key: 'emailNotifications' | 'reorderReminders' | 'launchAlerts' | 'privacyAnalytics'
  ) => {
    if (!user || !prefs) return;
    const nextVal = !prefs[key];
    await updateUserPreferences(user.uid, { [key]: nextVal });
    onUpdatePrefsLocal({ [key]: nextVal });
  };

  const handleEnableBrowserPush = async () => {
    if (!user || typeof window === 'undefined' || !('Notification' in window)) return;
    const perm = await Notification.requestPermission();
    const granted = perm === 'granted';
    await updateUserPreferences(user.uid, { pushEnabled: granted });
    onUpdatePrefsLocal({ pushEnabled: granted });
    if (granted) {
      await createNotificationRecord(user.uid, {
        type: 'launch',
        title: 'Seasonal Atelier Invitations Enabled',
        message: 'You will now receive instant browser alerts for limited Grasse harvests and restocks.',
      });
    }
  };

  const handleScheduleReorderReminder = async (order: OrderRecord) => {
    if (!user) return;
    const itemName = order.items[0]?.productName || 'your signature extrait';
    await createNotificationRecord(user.uid, {
      type: 'reorder',
      title: `Reorder Reminder Scheduled: ${itemName}`,
      message: `Based on Order #${order.orderNumber}, we have set an automated 90-day replenishment reminder.`,
    });
  };

  const handleAdminSyncCatalog = async () => {
    await syncCatalogAsAdmin(products);
    setAdminStatus('Catalog synchronized to Firestore.');
  };

  const handleAdminRestock = async (product: PerfumeProduct) => {
    const updated = { ...product, stockCount: product.stockCount + 12 };
    await upsertProductAsAdmin(updated, false);
    onProductsChanged(products.map((p) => (p.id === product.id ? updated : p)));
    setAdminStatus(`Restocked ${product.name} (+12 flacons).`);
  };

  const handleAdminOrderAdvance = async (order: OrderRecord, nextStatus: OrderRecord['status']) => {
    await updateOrderStatus(order.id, nextStatus);
    onOrdersChanged(orders.map((o) => (o.id === order.id ? { ...o, status: nextStatus } : o)));
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Client Account Dashboard"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex justify-center items-start p-4 sm:p-8"
    >
      <div className="w-full max-w-[1100px] bg-[#FAF8F5] dark:bg-[#12100E] text-[#161412] dark:text-[#F4F0EA] border border-[#E5DFD5] dark:border-[#2B2723] p-6 sm:p-10">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 mb-8 border-b border-[#E5DFD5] dark:border-[#2B2723]">
          <div>
            <p className="text-xs tracking-[0.2em] uppercase text-[#9A7B4F] dark:text-[#C8A97E]">
              Maison Léonie · Private Client Salon
            </p>
            <h2 className="font-editorial text-3xl sm:text-4xl">
              {user ? privateProfile?.fullName || user.displayName : 'Patron Sign In'}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <button
                type="button"
                onClick={onSignOut}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs tracking-[0.14em] uppercase border border-[#D8D0C4] dark:border-[#2E2A25] hover:border-[#9A7B4F] cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Sign Out</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close account dashboard"
              className="w-10 h-10 border border-[#E5DFD5] dark:border-[#2B2723] inline-flex items-center justify-center hover:border-[#9A7B4F] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!user ? (
          <div className="max-w-lg mx-auto py-12 text-center space-y-6">
            <UserCheck className="w-8 h-8 mx-auto text-[#9A7B4F]" aria-hidden="true" />
            <h3 className="font-editorial text-3xl">Enter Your Private Fragrance Archive</h3>
            <p className="text-sm text-[#6B655E] dark:text-[#A39C93] leading-relaxed">
              Sign in securely with Google to access order tracking, saved shipping addresses,
              two-factor authenticator protection, bespoke quiz dossiers, and instant reorder care.
            </p>
            <button
              type="button"
              onClick={onSignInGoogle}
              className="px-8 py-3.5 text-xs tracking-[0.18em] uppercase bg-[#161412] text-[#FAF8F5] dark:bg-[#C8A97E] dark:text-[#0E0D0C] hover:opacity-90 cursor-pointer"
            >
              Continue with Google
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Sidebar Navigation */}
            <nav className="lg:col-span-3 flex lg:flex-col gap-2 overflow-x-auto pb-2">
              {[
                { id: 'profile', label: 'Profile & 2FA', icon: Shield },
                { id: 'orders', label: `Orders (${orders.length})`, icon: Package },
                { id: 'wishlist', label: `Saved & Owned`, icon: RefreshCw },
                { id: 'addresses', label: `Addresses (${addresses.length})`, icon: MapPin },
                { id: 'notifications', label: `Alerts (${notifications.filter((n) => !n.read).length})`, icon: Bell },
                ...(isAdmin ? [{ id: 'admin', label: 'Atelier Admin', icon: Sliders }] : []),
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as DashTab)}
                    className={`inline-flex items-center gap-2.5 px-4 py-3 text-xs tracking-[0.14em] uppercase text-left border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      activeTab === tab.id
                        ? 'border-[#161412] dark:border-[#C8A97E] bg-[#161412] text-[#FAF8F5] dark:bg-[#C8A97E] dark:text-[#0E0D0C]'
                        : 'border-[#E5DFD5] dark:border-[#2B2723] hover:border-[#9A7B4F]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Tab Content */}
            <div className="lg:col-span-9 space-y-8">
              {activeTab === 'profile' && (
                <div className="space-y-8">
                  <form
                    onSubmit={handleSaveProfile}
                    className="p-6 border border-[#E5DFD5] dark:border-[#2B2723] bg-[#FFFFFF] dark:bg-[#171513] space-y-4"
                  >
                    <h3 className="font-editorial text-2xl">Personal Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs uppercase tracking-[0.14em] text-[#6B655E] dark:text-[#A39C93] mb-1.5">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={fullNameInput}
                          onChange={(e) => setFullNameInput(e.target.value)}
                          placeholder={privateProfile?.fullName || ''}
                          className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F5] dark:bg-[#12100E] border border-[#D8D0C4] dark:border-[#2E2A25]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-[0.14em] text-[#6B655E] dark:text-[#A39C93] mb-1.5">
                          Telephone
                        </label>
                        <input
                          type="tel"
                          value={phoneInput}
                          onChange={(e) => setPhoneInput(e.target.value)}
                          placeholder="+1 (555) 019-2834"
                          className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F5] dark:bg-[#12100E] border border-[#D8D0C4] dark:border-[#2E2A25]"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-[#6B655E] dark:text-[#A39C93]">
                      Verified Email: {user.email}
                      {prefs?.quizSummary ? ` · Olfactive Profile: ${prefs.quizSummary}` : ''}
                    </p>
                    {profileStatus && (
                      <p className="text-xs text-[#9A7B4F] dark:text-[#C8A97E]">{profileStatus}</p>
                    )}
                    <button
                      type="submit"
                      className="px-6 py-2.5 text-xs tracking-[0.14em] uppercase bg-[#161412] text-[#FAF8F5] dark:bg-[#C8A97E] dark:text-[#0E0D0C] cursor-pointer"
                    >
                      Save Details
                    </button>
                  </form>

                  {/* 2FA Authenticator Card */}
                  <div className="p-6 border border-[#E5DFD5] dark:border-[#2B2723] bg-[#FFFFFF] dark:bg-[#171513] space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <h3 className="font-editorial text-2xl inline-flex items-center gap-2">
                          <KeyRound className="w-4 h-4 text-[#9A7B4F]" aria-hidden="true" />
                          <span>Two-Factor Authentication (2FA)</span>
                        </h3>
                        <p className="text-xs text-[#6B655E] dark:text-[#A39C93] mt-1">
                          Protect your account with RFC 6238 Authenticator App verification.
                        </p>
                      </div>
                      <span className="text-xs uppercase tracking-[0.14em] text-[#9A7B4F] dark:text-[#C8A97E]">
                        {prefs?.twoFactorEnabled ? 'Enabled' : 'Inactive'}
                      </span>
                    </div>

                    {totpStatus && (
                      <p className="text-xs text-[#9A7B4F] dark:text-[#C8A97E]">{totpStatus}</p>
                    )}

                    {!prefs?.twoFactorEnabled && !totpEnrollData && (
                      <button
                        type="button"
                        onClick={handleStart2fa}
                        className="px-5 py-2.5 text-xs tracking-[0.14em] uppercase border border-[#161412] dark:border-[#C8A97E] cursor-pointer"
                      >
                        Configure Authenticator App
                      </button>
                    )}

                    {totpEnrollData && (
                      <form onSubmit={handleConfirm2fa} className="pt-4 border-t border-[#E5DFD5] dark:border-[#2B2723] grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                        <div className="sm:col-span-4">
                          <img
                            src={totpEnrollData.qrDataUrl}
                            alt="2FA QR Code"
                            className="w-40 h-40 border border-[#E5DFD5] bg-[#FAF8F5]"
                          />
                        </div>
                        <div className="sm:col-span-8 space-y-3">
                          <p className="text-xs text-[#6B655E] dark:text-[#A39C93]">
                            Scan with Google Authenticator, 1Password, or Apple Passwords. Manual Key:{' '}
                            <code className="text-[#161412] dark:text-[#F4F0EA]">
                              {totpEnrollData.manualKey}
                            </code>
                          </p>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              inputMode="numeric"
                              maxLength={6}
                              required
                              value={totpCodeInput}
                              onChange={(e) => setTotpCodeInput(e.target.value)}
                              placeholder="Enter 6-digit code"
                              className="px-3.5 py-2 text-sm tabular-nums bg-[#FAF8F5] dark:bg-[#12100E] border border-[#D8D0C4] dark:border-[#2E2A25]"
                            />
                            <button
                              type="submit"
                              className="px-5 py-2 text-xs tracking-[0.14em] uppercase bg-[#161412] text-[#FAF8F5] dark:bg-[#C8A97E] dark:text-[#0E0D0C] cursor-pointer"
                            >
                              Verify &amp; Activate
                            </button>
                          </div>
                        </div>
                      </form>
                    )}

                    {prefs?.twoFactorEnabled && (
                      <button
                        type="button"
                        onClick={handleDisable2fa}
                        className="px-5 py-2 text-xs tracking-[0.14em] uppercase border border-[#D8D0C4] dark:border-[#2E2A25] cursor-pointer"
                      >
                        Disable 2FA
                      </button>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'orders' && (
                <div className="space-y-4">
                  <h3 className="font-editorial text-2xl">Order History &amp; Tracking</h3>
                  {orders.length === 0 ? (
                    <p className="text-sm text-[#6B655E] dark:text-[#A39C93]">
                      You have not placed an order yet.
                    </p>
                  ) : (
                    orders.map((ord) => (
                      <div
                        key={ord.id}
                        className="p-6 border border-[#E5DFD5] dark:border-[#2B2723] bg-[#FFFFFF] dark:bg-[#171513] space-y-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-4 text-xs uppercase tracking-[0.14em]">
                          <span>
                            Order #{ord.orderNumber} · {ord.createdAtIso}
                          </span>
                          <span className="text-[#9A7B4F] dark:text-[#C8A97E]">
                            Status: {ord.status} {ord.trackingCode ? `· ${ord.trackingCode}` : ''}
                          </span>
                        </div>
                        <div className="space-y-2 text-sm">
                          {ord.items.map((it) => (
                            <div key={`${ord.id}-${it.productId}`} className="flex justify-between">
                              <span>
                                {it.productName} ({it.volumeMl} ml) × {it.quantity}
                              </span>
                              <span className="tabular-nums">${it.unitPrice * it.quantity}</span>
                            </div>
                          ))}
                        </div>
                        <div className="pt-3 border-t border-[#E5DFD5] dark:border-[#2B2723] flex flex-wrap items-center justify-between gap-3">
                          <span className="text-sm font-medium tabular-nums">
                            Total: ${ord.total.toFixed(2)} ({ord.paymentMethod})
                          </span>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => handleScheduleReorderReminder(ord)}
                              className="px-3.5 py-2 text-xs uppercase tracking-[0.12em] border border-[#D8D0C4] dark:border-[#2E2A25] cursor-pointer"
                            >
                              Set Reorder Reminder
                            </button>
                            <button
                              type="button"
                              onClick={() => onReorderItems(ord)}
                              className="px-4 py-2 text-xs uppercase tracking-[0.14em] bg-[#161412] text-[#FAF8F5] dark:bg-[#C8A97E] dark:text-[#0E0D0C] cursor-pointer"
                            >
                              Reorder
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'wishlist' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="font-editorial text-2xl mb-4">Saved Wishlist</h3>
                    {wishlistProducts.length === 0 ? (
                      <p className="text-sm text-[#6B655E] dark:text-[#A39C93]">
                        No fragrances saved to your wishlist.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {wishlistProducts.map((p) => (
                          <div
                            key={p.id}
                            className="flex items-center gap-4 p-4 border border-[#E5DFD5] dark:border-[#2B2723] bg-[#FFFFFF] dark:bg-[#171513]"
                          >
                            <img
                              src={p.images[0]}
                              alt={p.name}
                              referrerPolicy="no-referrer"
                              className="w-16 h-20 object-cover"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="font-editorial text-xl truncate">{p.name}</p>
                              <p className="text-xs text-[#6B655E] dark:text-[#A39C93] tabular-nums mb-2">
                                ${p.price} · {p.concentration}
                              </p>
                              <button
                                type="button"
                                onClick={() => onViewProduct(p)}
                                className="text-xs underline uppercase tracking-wider cursor-pointer"
                              >
                                Inspect Flacon
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="font-editorial text-2xl mb-4">Previously Purchased</h3>
                    {purchasedProducts.length === 0 ? (
                      <p className="text-sm text-[#6B655E] dark:text-[#A39C93]">
                        Your acquired bottles will appear here.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {purchasedProducts.map((p) => (
                          <div
                            key={p.id}
                            className="flex items-center gap-4 p-4 border border-[#E5DFD5] dark:border-[#2B2723] bg-[#FFFFFF] dark:bg-[#171513]"
                          >
                            <img
                              src={p.images[0]}
                              alt={p.name}
                              referrerPolicy="no-referrer"
                              className="w-16 h-20 object-cover"
                            />
                            <div className="min-w-0">
                              <p className="font-editorial text-xl truncate">{p.name}</p>
                              <p className="text-xs text-[#6B655E] dark:text-[#A39C93]">
                                {p.fragranceFamily}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'addresses' && (
                <div className="space-y-6">
                  <h3 className="font-editorial text-2xl">Saved Shipping Addresses</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className="p-5 border border-[#E5DFD5] dark:border-[#2B2723] bg-[#FFFFFF] dark:bg-[#171513] flex justify-between items-start gap-3"
                      >
                        <div className="text-sm">
                          <p className="text-xs uppercase tracking-[0.14em] text-[#9A7B4F] mb-1">
                            {addr.label}
                          </p>
                          <p className="font-medium">{addr.fullName}</p>
                          <p className="text-[#6B655E] dark:text-[#A39C93]">
                            {addr.line1}, {addr.city} {addr.postalCode}, {addr.country}
                          </p>
                        </div>
                        <button
                          type="button"
                          aria-label="Remove address"
                          onClick={async () => {
                            await removeUserAddress(user.uid, addr.id);
                            onAddressesChanged(addresses.filter((a) => a.id !== addr.id));
                          }}
                          className="text-[#6B655E] hover:text-[#161412] cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <form
                    onSubmit={handleAddAddress}
                    className="p-6 border border-[#E5DFD5] dark:border-[#2B2723] bg-[#FFFFFF] dark:bg-[#171513] grid grid-cols-1 sm:grid-cols-2 gap-3"
                  >
                    <h4 className="sm:col-span-2 font-editorial text-xl mb-1">
                      Add Shipping Address
                    </h4>
                    <input
                      type="text"
                      required
                      value={addrLabel}
                      onChange={(e) => setAddrLabel(e.target.value)}
                      placeholder="Label (e.g. Residence, Studio)"
                      className="px-3.5 py-2 text-sm bg-[#FAF8F5] dark:bg-[#12100E] border border-[#D8D0C4] dark:border-[#2E2A25]"
                    />
                    <input
                      type="text"
                      required
                      value={addrName}
                      onChange={(e) => setAddrName(e.target.value)}
                      placeholder="Recipient Name"
                      className="px-3.5 py-2 text-sm bg-[#FAF8F5] dark:bg-[#12100E] border border-[#D8D0C4] dark:border-[#2E2A25]"
                    />
                    <input
                      type="text"
                      required
                      value={addrLine1}
                      onChange={(e) => setAddrLine1(e.target.value)}
                      placeholder="Street Address"
                      className="sm:col-span-2 px-3.5 py-2 text-sm bg-[#FAF8F5] dark:bg-[#12100E] border border-[#D8D0C4] dark:border-[#2E2A25]"
                    />
                    <input
                      type="text"
                      required
                      value={addrCity}
                      onChange={(e) => setAddrCity(e.target.value)}
                      placeholder="City"
                      className="px-3.5 py-2 text-sm bg-[#FAF8F5] dark:bg-[#12100E] border border-[#D8D0C4] dark:border-[#2E2A25]"
                    />
                    <input
                      type="text"
                      required
                      value={addrPostal}
                      onChange={(e) => setAddrPostal(e.target.value)}
                      placeholder="Postal Code"
                      className="px-3.5 py-2 text-sm bg-[#FAF8F5] dark:bg-[#12100E] border border-[#D8D0C4] dark:border-[#2E2A25]"
                    />
                    <input
                      type="text"
                      required
                      value={addrCountry}
                      onChange={(e) => setAddrCountry(e.target.value)}
                      placeholder="Country"
                      className="sm:col-span-2 px-3.5 py-2 text-sm bg-[#FAF8F5] dark:bg-[#12100E] border border-[#D8D0C4] dark:border-[#2E2A25]"
                    />
                    <button
                      type="submit"
                      className="sm:col-span-2 py-2.5 text-xs tracking-[0.14em] uppercase bg-[#161412] text-[#FAF8F5] dark:bg-[#C8A97E] dark:text-[#0E0D0C] cursor-pointer"
                    >
                      Save Address
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div className="p-6 border border-[#E5DFD5] dark:border-[#2B2723] bg-[#FFFFFF] dark:bg-[#171513] space-y-4">
                    <h3 className="font-editorial text-2xl">Notification &amp; Privacy Preferences</h3>
                    {[
                      {
                        key: 'emailNotifications' as const,
                        label: 'Transactional Order & Shipping Emails',
                      },
                      {
                        key: 'reorderReminders' as const,
                        label: 'Automated Replenishment & Reorder Reminders',
                      },
                      {
                        key: 'launchAlerts' as const,
                        label: 'Seasonal Harvests, Exclusive Launches & Private Offers',
                      },
                      {
                        key: 'privacyAnalytics' as const,
                        label: 'Personalized Olfactive Browsing Recommendations',
                      },
                    ].map((row) => (
                      <label
                        key={row.key}
                        className="flex items-center justify-between gap-4 py-2 border-b last:border-b-0 border-[#E5DFD5] dark:border-[#2B2723] text-sm cursor-pointer"
                      >
                        <span>{row.label}</span>
                        <input
                          type="checkbox"
                          checked={Boolean(prefs?.[row.key])}
                          onChange={() => handleTogglePref(row.key)}
                          className="w-4 h-4 accent-[#9A7B4F]"
                        />
                      </label>
                    ))}

                    <div className="pt-2 flex items-center justify-between gap-4">
                      <span className="text-sm">Browser Push Notifications</span>
                      <button
                        type="button"
                        onClick={handleEnableBrowserPush}
                        className="px-4 py-2 text-xs uppercase tracking-[0.14em] border border-[#161412] dark:border-[#C8A97E] cursor-pointer"
                      >
                        {prefs?.pushEnabled ? 'Push Enabled' : 'Enable Browser Push'}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-editorial text-2xl">Atelier Inbox</h4>
                    {notifications.length === 0 ? (
                      <p className="text-sm text-[#6B655E] dark:text-[#A39C93]">
                        No notifications yet.
                      </p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-4 border flex items-start justify-between gap-4 ${
                            n.read
                              ? 'border-[#E5DFD5] dark:border-[#2B2723] opacity-75'
                              : 'border-[#9A7B4F] bg-[#FFFFFF] dark:bg-[#171513]'
                          }`}
                        >
                          <div>
                            <p className="text-xs uppercase tracking-[0.14em] text-[#9A7B4F] mb-1">
                              {n.type} · {n.createdAtIso}
                            </p>
                            <p className="font-medium text-sm mb-1">{n.title}</p>
                            <p className="text-xs text-[#6B655E] dark:text-[#A39C93]">{n.message}</p>
                          </div>
                          {!n.read && (
                            <button
                              type="button"
                              onClick={() => markNotificationRead(user.uid, n.id)}
                              className="text-xs underline shrink-0 cursor-pointer"
                            >
                              Mark Read
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'admin' && isAdmin && (
                <div className="space-y-6">
                  <div className="p-6 border border-[#E5DFD5] dark:border-[#2B2723] bg-[#FFFFFF] dark:bg-[#171513] flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h3 className="font-editorial text-2xl">Atelier Catalog &amp; Stock Control</h3>
                      <p className="text-xs text-[#6B655E] dark:text-[#A39C93]">
                        Sync initial catalog to Firestore or replenish bottle reserves.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAdminSyncCatalog}
                      className="px-5 py-2.5 text-xs uppercase tracking-[0.14em] bg-[#161412] text-[#FAF8F5] dark:bg-[#C8A97E] dark:text-[#0E0D0C] cursor-pointer"
                    >
                      Sync Catalog to Firestore
                    </button>
                  </div>

                  {adminStatus && (
                    <p className="text-xs text-[#9A7B4F] dark:text-[#C8A97E] inline-flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" />
                      <span>{adminStatus}</span>
                    </p>
                  )}

                  <div className="space-y-2">
                    {products.map((p) => (
                      <div
                        key={p.id}
                        className="p-4 border border-[#E5DFD5] dark:border-[#2B2723] bg-[#FFFFFF] dark:bg-[#171513] flex items-center justify-between gap-4 text-sm"
                      >
                        <span>
                          {p.name} · <span className="tabular-nums">{p.stockCount} in stock</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAdminRestock(p)}
                          className="px-3.5 py-1.5 text-xs uppercase tracking-[0.12em] border border-[#D8D0C4] dark:border-[#2E2A25] cursor-pointer"
                        >
                          +12 Restock
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3 pt-4">
                    <h4 className="font-editorial text-2xl">Fulfillment Queue</h4>
                    {orders.map((ord) => (
                      <div
                        key={ord.id}
                        className="p-4 border border-[#E5DFD5] dark:border-[#2B2723] bg-[#FFFFFF] dark:bg-[#171513] flex flex-wrap items-center justify-between gap-4 text-xs"
                      >
                        <span>
                          #{ord.orderNumber} · {ord.customerName} · {ord.status}
                        </span>
                        <div className="flex gap-2">
                          {(['preparing', 'shipped', 'delivered'] as const).map((st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => handleAdminOrderAdvance(ord, st)}
                              className="px-3 py-1.5 uppercase tracking-wider border border-[#D8D0C4] dark:border-[#2E2A25] cursor-pointer"
                            >
                              Mark {st}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
