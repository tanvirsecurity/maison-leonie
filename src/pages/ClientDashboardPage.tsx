import { getAssetUrl } from '../lib/assets';
import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Check,
  CheckCircle2,
  Clock,
  Compass,
  Copy,
  ExternalLink,
  Heart,
  KeyRound,
  Lock,
  LogOut,
  MapPin,
  Package,
  Printer,
  RefreshCw,
  Shield,
  ShieldCheck,
  Sliders,
  Sparkles,
  Trash2,
  Truck,
  User as UserIcon,
  UserCheck,
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
  updateUserPreferences,
  updateUserPrivateProfile,
  verifyTwoFactorCode,
} from '../lib/storeService';

interface ClientDashboardPageProps {
  user: User | null;
  prefs: UserPreferences | null;
  privateProfile: UserPrivateProfile | null;
  orders: OrderRecord[];
  addresses: AddressRecord[];
  notifications: NotificationItem[];
  products: PerfumeProduct[];
  wishlistIds: string[];
  onNavigatePage: (page: string) => void;
  onSignInGoogle: () => void;
  onSignOut: () => void;
  onUpdatePrefsLocal: (updates: Partial<UserPreferences>) => void;
  onUpdatePrivateLocal: (updates: Partial<UserPrivateProfile>) => void;
  onAddressesChanged: (next: AddressRecord[]) => void;
  onReorderItems: (order: OrderRecord) => void;
  onViewProduct: (product: PerfumeProduct) => void;
  onAddToCart: (product: PerfumeProduct, volumeMl?: number) => void;
  onToggleWishlist: (productId: string) => void;
}

type ClientTab = 'orders' | 'wardrobe' | 'addresses' | 'security' | 'wishlist' | 'notifications';

const SAMPLE_DEMO_ORDERS: OrderRecord[] = [
  {
    id: 'ord-demo-1',
    userId: 'demo-client',
    orderNumber: 'ML-849201',
    customerEmail: 'patron.vip@maisonleonie.paris',
    customerName: 'Camille de Montalembert',
    items: [
      {
        productId: 'voie-dor',
        productName: "Voie d'Or",
        volumeMl: 100,
        unitPrice: 340,
        quantity: 1,
        image: getAssetUrl('/src/assets/images/hero_shutter_pickup_1795464157955.jpg'),
        engraving: 'Pour Camille · Oct 14',
      },
      {
        productId: 'coffret-decouverte',
        productName: 'Le Coffret Découverte',
        volumeMl: 60,
        unitPrice: 165,
        quantity: 1,
        image: getAssetUrl('/src/assets/images/atelier_grasse_organ_1795464161874.jpg'),
      },
    ],
    subtotal: 505,
    discount: 75.75,
    promoCode: 'LEONIE15',
    shippingCost: 0,
    tax: 34.34,
    total: 463.59,
    shippingMethod: 'Complimentary Atelier Courier',
    shippingAddress: '28 Avenue Montaigne, 75008 Paris, France',
    paymentMethod: 'Apple Pay',
    paymentStatus: 'paid',
    status: 'preparing',
    trackingCode: 'ML-PAR-98214',
    giftNote: 'Please wrap with dark amber wax seal for our autumn anniversary.',
    createdAtIso: '2026-11-20',
  },
  {
    id: 'ord-demo-2',
    userId: 'demo-client',
    orderNumber: 'ML-772910',
    customerEmail: 'patron.vip@maisonleonie.paris',
    customerName: 'Camille de Montalembert',
    items: [
      {
        productId: 'ember-noir',
        productName: 'Ember Noir',
        volumeMl: 100,
        unitPrice: 285,
        quantity: 1,
        image: getAssetUrl('/src/assets/images/bottle_oud_velours_1795464159199.jpg'),
        engraving: 'Courage & Grace',
      },
    ],
    subtotal: 285,
    discount: 0,
    shippingCost: 0,
    tax: 22.8,
    total: 307.8,
    shippingMethod: 'Express Air Courier',
    shippingAddress: '28 Avenue Montaigne, 75008 Paris, France',
    paymentMethod: 'Card',
    paymentStatus: 'paid',
    status: 'delivered',
    trackingCode: 'ML-GRS-33109',
    createdAtIso: '2026-10-12',
  },
];

export const ClientDashboardPage: React.FC<ClientDashboardPageProps> = ({
  user,
  prefs,
  privateProfile,
  orders,
  addresses,
  notifications,
  products,
  wishlistIds,
  onNavigatePage,
  onSignInGoogle,
  onSignOut,
  onUpdatePrefsLocal,
  onUpdatePrivateLocal,
  onAddressesChanged,
  onReorderItems,
  onViewProduct,
  onAddToCart,
  onToggleWishlist,
}) => {
  const [activeTab, setActiveTab] = useState<ClientTab>('orders');
  const [useDemoData, setUseDemoData] = useState(!user && orders.length === 0);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [receiptOrder, setReceiptOrder] = useState<OrderRecord | null>(null);

  // Profile Edit State
  const [fullNameInput, setFullNameInput] = useState(privateProfile?.fullName || user?.displayName || 'Camille de Montalembert');
  const [phoneInput, setPhoneInput] = useState(privateProfile?.phone || '+33 1 42 68 55 00');
  const [profileMsg, setProfileMsg] = useState<string | null>(null);

  // Address Form State
  const [addrLabel, setAddrLabel] = useState('Primary Residence');
  const [addrName, setAddrName] = useState('');
  const [addrLine1, setAddrLine1] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrPostal, setAddrPostal] = useState('');
  const [addrCountry, setAddrCountry] = useState('France');

  // 2FA Enrollment State
  const [totpEnrollData, setTotpEnrollData] = useState<{
    qrDataUrl: string;
    manualKey: string;
    sealedSecret: string;
  } | null>(null);
  const [totpCodeInput, setTotpCodeInput] = useState('');
  const [totpStatus, setTotpStatus] = useState<string | null>(null);

  // Effective Orders & Addresses (Fallback to luxury demo data if guest wants to explore)
  const displayOrders = orders.length > 0 ? orders : useDemoData ? SAMPLE_DEMO_ORDERS : [];
  const displayAddresses =
    addresses.length > 0
      ? addresses
      : useDemoData
      ? [
          {
            id: 'addr-demo-1',
            uid: 'demo',
            label: 'Hôtel Particulier',
            fullName: 'Camille de Montalembert',
            line1: '28 Avenue Montaigne',
            city: 'Paris',
            postalCode: '75008',
            country: 'France',
            isDefault: true,
          },
          {
            id: 'addr-demo-2',
            uid: 'demo',
            label: 'Domaine de Vacances',
            fullName: 'Camille de Montalembert',
            line1: 'Chemin des Collines',
            city: 'Grasse',
            postalCode: '06130',
            country: 'France',
            isDefault: false,
          },
        ]
      : [];

  const wishlistProducts = products.filter((p) => wishlistIds.includes(p.id));
  const purchasedIds = new Set(displayOrders.flatMap((o) => o.items.map((i) => i.productId)));
  const wardrobeProducts = products.filter((p) => purchasedIds.has(p.id));

  const totalSpent = displayOrders.reduce((sum, o) => sum + o.total, 0);
  const loyaltyPoints = Math.round(totalSpent * 2);

  const handleCopy = (text: string, id: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2200);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      await updateUserPrivateProfile(user.uid, {
        fullName: fullNameInput.trim(),
        phone: phoneInput.trim(),
      });
      onUpdatePrivateLocal({
        fullName: fullNameInput.trim(),
        phone: phoneInput.trim(),
      });
    }
    setProfileMsg('Your private salon profile has been updated.');
    setTimeout(() => setProfileMsg(null), 3000);
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrLine1 || !addrCity) return;
    if (user) {
      const saved = await saveUserAddress(user.uid, {
        label: addrLabel,
        fullName: addrName || fullNameInput || 'Patron',
        line1: addrLine1,
        city: addrCity,
        postalCode: addrPostal,
        country: addrCountry,
        isDefault: displayAddresses.length === 0,
      });
      onAddressesChanged([...addresses, saved]);
    } else {
      const mockAddr: AddressRecord = {
        id: `addr-${Date.now()}`,
        uid: 'guest',
        label: addrLabel,
        fullName: addrName || fullNameInput || 'Patron',
        line1: addrLine1,
        city: addrCity,
        postalCode: addrPostal,
        country: addrCountry,
        isDefault: displayAddresses.length === 0,
      };
      onAddressesChanged([...addresses, mockAddr]);
    }
    setAddrLine1('');
    setAddrCity('');
    setAddrPostal('');
  };

  const handleStart2fa = async () => {
    setTotpStatus(null);
    try {
      const data = await enrollTwoFactor();
      setTotpEnrollData(data);
    } catch (err) {
      setTotpStatus(err instanceof Error ? err.message : 'Unable to initialize 2FA authenticator.');
    }
  };

  const handleConfirm2fa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!totpEnrollData) return;
    const res = await verifyTwoFactorCode(totpCodeInput, totpEnrollData.sealedSecret);
    if (res.valid) {
      if (user) {
        await updateUserPrivateProfile(user.uid, {
          totpSecret: totpEnrollData.sealedSecret,
          totpVerified: true,
        });
        await updateUserPreferences(user.uid, { twoFactorEnabled: true });
        onUpdatePrivateLocal({ totpSecret: totpEnrollData.sealedSecret, totpVerified: true });
        onUpdatePrefsLocal({ twoFactorEnabled: true });
      }
      setTotpEnrollData(null);
      setTotpCodeInput('');
      setTotpStatus('Two-Factor Authentication is now active on your private salon.');
    } else {
      setTotpStatus(res.error || 'Verification code failed. Please check your authenticator.');
    }
  };

  return (
    <div className="pt-28 sm:pt-32 min-h-screen bg-[#FAF8F5] dark:bg-[#0E0D0C] text-[#161412] dark:text-[#FAF8F5]">
      {/* 1. Page Header & Breadcrumb */}
      <div className="border-b border-[#E5DFD5] dark:border-[#2B2723] bg-[#F5EFE6] dark:bg-[#13110F] px-6 lg:px-10 py-10 lg:py-14">
        <div className="max-w-[1360px] mx-auto">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[10px] tracking-[0.24em] uppercase text-[#8C847A] mb-5">
            <button
              type="button"
              onClick={() => onNavigatePage('home')}
              className="hover:text-[#9A7B4F] dark:hover:text-[#E4C79B] transition-colors cursor-pointer flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Maison Léonie</span>
            </button>
            <span>/</span>
            <span className="text-[#9A7B4F] dark:text-[#E4C79B]">Salon Privé des Patrons</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFFFFF] dark:bg-[#1D1A17] border border-[#9A7B4F]/40 text-[#9A7B4F] dark:text-[#E4C79B] text-[10px] tracking-[0.2em] uppercase mb-3">
                <Sparkles className="w-3 h-3" />
                <span>Membre Privilégié · Le Cercle Noir</span>
              </div>
              <h1 className="font-editorial text-4xl sm:text-5xl font-normal">
                Private Client Salon
              </h1>
              <p className="text-sm text-[#6B655E] dark:text-[#A39C93] mt-1">
                {user ? user.email : 'Visiting as Honored Guest Patron'} · Macerated oak allocations &amp; courier tracking
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {user ? (
                <button
                  type="button"
                  onClick={onSignOut}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs uppercase tracking-[0.16em] border border-[#E5DFD5] dark:border-[#2B2723] hover:bg-[#161412] hover:text-white dark:hover:bg-[#E4C79B] dark:hover:text-black transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={onSignInGoogle}
                    className="inline-flex items-center gap-2 px-6 py-2.5 text-xs uppercase tracking-[0.18em] bg-[#161412] text-white dark:bg-[#E4C79B] dark:text-black hover:opacity-90 transition-opacity cursor-pointer font-medium shadow-sm"
                  >
                    <UserIcon className="w-3.5 h-3.5" />
                    <span>Sign In With Google</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseDemoData(!useDemoData)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-[11px] uppercase tracking-[0.16em] border border-[#9A7B4F] text-[#9A7B4F] dark:text-[#E4C79B] hover:bg-[#9A7B4F]/10 cursor-pointer"
                  >
                    <span>{useDemoData ? 'Live User Mode' : 'Preview Demo Patron Salon'}</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Patron Privilege Stats Micro-Bar */}
      <div className="border-b border-[#E5DFD5] dark:border-[#2B2723] bg-[#FAF8F5] dark:bg-[#0E0D0C] px-6 lg:px-10 py-5">
        <div className="max-w-[1360px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-xs uppercase tracking-[0.16em]">
          <div>
            <span className="text-[#8C847A] block text-[10px] mb-1">Patron Status</span>
            <span className="font-semibold text-[#9A7B4F] dark:text-[#E4C79B]">Titulaire d&apos;Atelier</span>
          </div>
          <div>
            <span className="text-[#8C847A] block text-[10px] mb-1">Flacons Acquired</span>
            <span className="font-medium text-base font-editorial">{wardrobeProducts.length || displayOrders.reduce((s, o) => s + o.items.length, 0)} Bottles</span>
          </div>
          <div>
            <span className="text-[#8C847A] block text-[10px] mb-1">Privilege Points</span>
            <span className="font-medium text-base font-editorial text-[#9A7B4F] dark:text-[#E4C79B]">{loyaltyPoints} pts (${(loyaltyPoints / 10).toFixed(0)} Credit)</span>
          </div>
          <div>
            <span className="text-[#8C847A] block text-[10px] mb-1">Active Guarantees</span>
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Sample-First 100% Protection</span>
            </span>
          </div>
        </div>
      </div>

      {/* 3. Main Dashboard Navigation & Content Grid */}
      <div className="max-w-[1360px] mx-auto px-6 lg:px-10 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Navigation Sidebar */}
          <aside className="lg:col-span-3 space-y-2">
            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              className={`w-full text-left px-4 py-3.5 text-xs uppercase tracking-[0.18em] border transition-colors flex items-center justify-between cursor-pointer ${
                activeTab === 'orders'
                  ? 'border-[#9A7B4F] dark:border-[#E4C79B] bg-[#9A7B4F]/10 font-semibold text-[#9A7B4F] dark:text-[#E4C79B]'
                  : 'border-transparent hover:border-[#E5DFD5] dark:hover:border-[#2B2723]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Package className="w-4 h-4" />
                <span>Orders &amp; Tracking</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E5DFD5] dark:bg-[#2B2723]">
                {displayOrders.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('wardrobe')}
              className={`w-full text-left px-4 py-3.5 text-xs uppercase tracking-[0.18em] border transition-colors flex items-center justify-between cursor-pointer ${
                activeTab === 'wardrobe'
                  ? 'border-[#9A7B4F] dark:border-[#E4C79B] bg-[#9A7B4F]/10 font-semibold text-[#9A7B4F] dark:text-[#E4C79B]'
                  : 'border-transparent hover:border-[#E5DFD5] dark:hover:border-[#2B2723]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Compass className="w-4 h-4" />
                <span>Scent Wardrobe</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E5DFD5] dark:bg-[#2B2723]">
                {wardrobeProducts.length || 2}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('wishlist')}
              className={`w-full text-left px-4 py-3.5 text-xs uppercase tracking-[0.18em] border transition-colors flex items-center justify-between cursor-pointer ${
                activeTab === 'wishlist'
                  ? 'border-[#9A7B4F] dark:border-[#E4C79B] bg-[#9A7B4F]/10 font-semibold text-[#9A7B4F] dark:text-[#E4C79B]'
                  : 'border-transparent hover:border-[#E5DFD5] dark:hover:border-[#2B2723]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Heart className="w-4 h-4" />
                <span>Saved Flacons</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E5DFD5] dark:bg-[#2B2723]">
                {wishlistProducts.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('addresses')}
              className={`w-full text-left px-4 py-3.5 text-xs uppercase tracking-[0.18em] border transition-colors flex items-center justify-between cursor-pointer ${
                activeTab === 'addresses'
                  ? 'border-[#9A7B4F] dark:border-[#E4C79B] bg-[#9A7B4F]/10 font-semibold text-[#9A7B4F] dark:text-[#E4C79B]'
                  : 'border-transparent hover:border-[#E5DFD5] dark:hover:border-[#2B2723]'
              }`}
            >
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4" />
                <span>Concierge Addresses</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E5DFD5] dark:bg-[#2B2723]">
                {displayAddresses.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('security')}
              className={`w-full text-left px-4 py-3.5 text-xs uppercase tracking-[0.18em] border transition-colors flex items-center justify-between cursor-pointer ${
                activeTab === 'security'
                  ? 'border-[#9A7B4F] dark:border-[#E4C79B] bg-[#9A7B4F]/10 font-semibold text-[#9A7B4F] dark:text-[#E4C79B]'
                  : 'border-transparent hover:border-[#E5DFD5] dark:hover:border-[#2B2723]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4" />
                <span>Security &amp; 2FA</span>
              </div>
            </button>

            {/* Quick Link to Admin Command Center */}
            <div className="pt-6 mt-6 border-t border-[#E5DFD5] dark:border-[#2B2723]">
              <button
                type="button"
                onClick={() => onNavigatePage('admin')}
                className="w-full p-4 bg-[#1E1B18] text-[#FAF8F5] border border-[#C8A97E]/40 text-left hover:border-[#E4C79B] transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between text-[10px] tracking-[0.2em] uppercase text-[#E4C79B] mb-1">
                  <span>Executive Access</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="font-editorial text-lg text-white">Atelier Admin Command</p>
                <p className="text-[11px] text-[#A39C93] mt-0.5">Manage live orders, catalog reserves &amp; memoirs</p>
              </button>
            </div>
          </aside>

          {/* Right Column: Active Tab Content */}
          <main className="lg:col-span-9">
            {/* TAB 1: ORDERS & LIVE TRACKING */}
            {activeTab === 'orders' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between pb-4 border-b border-[#E5DFD5] dark:border-[#2B2723]">
                  <div>
                    <h2 className="font-editorial text-2xl sm:text-3xl">Commandes &amp; Expéditions</h2>
                    <p className="text-xs text-[#6B655E] dark:text-[#A39C93]">
                      Real-time maceration &amp; white-glove courier status for your numbered flacons.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigatePage('collections')}
                    className="text-xs uppercase tracking-[0.16em] text-[#9A7B4F] dark:text-[#E4C79B] hover:underline"
                  >
                    Acquire New Scent →
                  </button>
                </div>

                {displayOrders.length === 0 ? (
                  <div className="p-12 text-center border border-[#E5DFD5] dark:border-[#2B2723] bg-[#FFFFFF] dark:bg-[#151311]">
                    <Package className="w-10 h-10 mx-auto text-[#9A7B4F] mb-4 opacity-60" />
                    <h3 className="font-editorial text-2xl mb-2">No Active Acquisitions Yet</h3>
                    <p className="text-xs text-[#6B655E] dark:text-[#A39C93] max-w-md mx-auto mb-6">
                      Explore our centenary collections or take the 2-minute olfactive consultation to begin your personal perfume archive.
                    </p>
                    <button
                      type="button"
                      onClick={() => onNavigatePage('collections')}
                      className="px-8 py-3.5 text-xs uppercase tracking-[0.18em] bg-[#161412] text-white dark:bg-[#E4C79B] dark:text-black font-semibold hover:opacity-90 cursor-pointer"
                    >
                      Explore The Flacons
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {displayOrders.map((order) => {
                      const isDelivered = order.status === 'delivered';
                      const isPreparing = order.status === 'preparing' || order.status === 'confirmed';

                      return (
                        <div
                          key={order.id}
                          className="p-6 sm:p-8 bg-[#FFFFFF] dark:bg-[#141210] border border-[#E5DFD5] dark:border-[#2B2723] space-y-6"
                        >
                          {/* Order Header */}
                          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E5DFD5] dark:border-[#2B2723]">
                            <div>
                              <div className="flex items-center gap-3">
                                <span className="font-editorial text-xl">{order.orderNumber}</span>
                                <span
                                  className={`px-2.5 py-0.5 text-[10px] tracking-[0.18em] uppercase font-semibold border ${
                                    isDelivered
                                      ? 'border-emerald-600/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10'
                                      : 'border-[#9A7B4F] text-[#9A7B4F] dark:text-[#E4C79B] bg-[#9A7B4F]/10'
                                  }`}
                                >
                                  {order.status === 'confirmed'
                                    ? 'Order Confirmed'
                                    : order.status === 'preparing'
                                    ? 'Macerating & Bottling'
                                    : order.status === 'shipped'
                                    ? 'In Oak Transit'
                                    : order.status === 'delivered'
                                    ? 'Hand-Delivered'
                                    : order.status}
                                </span>
                              </div>
                              <p className="text-xs text-[#8C847A] mt-1">
                                Ordered {order.createdAtIso} · Destination: {order.shippingAddress}
                              </p>
                            </div>

                            <div className="text-right">
                              <span className="font-editorial text-2xl tabular-nums">${order.total.toFixed(2)}</span>
                              <div className="flex items-center gap-2 mt-1">
                                <button
                                  type="button"
                                  onClick={() => setReceiptOrder(order)}
                                  className="text-[11px] uppercase tracking-[0.14em] text-[#9A7B4F] dark:text-[#E4C79B] hover:underline cursor-pointer flex items-center gap-1"
                                >
                                  <Printer className="w-3 h-3" />
                                  <span>View Receipt</span>
                                </button>
                                <span className="text-[#8C847A]">·</span>
                                <button
                                  type="button"
                                  onClick={() => onReorderItems(order)}
                                  className="text-[11px] uppercase tracking-[0.14em] text-[#161412] dark:text-white hover:underline cursor-pointer flex items-center gap-1"
                                >
                                  <RefreshCw className="w-3 h-3" />
                                  <span>Reorder</span>
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Live Luxury Courier Timeline */}
                          <div className="p-4 bg-[#FAF8F5] dark:bg-[#181614] border border-[#E5DFD5] dark:border-[#2B2723]">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs uppercase tracking-[0.16em] mb-4">
                              <div className="flex items-center gap-2">
                                <Truck className="w-4 h-4 text-[#9A7B4F]" />
                                <span>{order.shippingMethod}</span>
                              </div>
                              {order.trackingCode && (
                                <div className="flex items-center gap-2">
                                  <span className="text-[#8C847A]">Tracking:</span>
                                  <code className="font-mono text-xs font-semibold">{order.trackingCode}</code>
                                  <button
                                    type="button"
                                    onClick={() => handleCopy(order.trackingCode!, order.id)}
                                    className="p-1 hover:text-[#9A7B4F] cursor-pointer"
                                    title="Copy tracking number"
                                  >
                                    {copiedCode === order.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Timeline Stepper */}
                            <div className="grid grid-cols-4 gap-2 text-center text-[10px] tracking-[0.14em] uppercase pt-2">
                              <div className="space-y-1">
                                <div className="h-1.5 w-full bg-[#9A7B4F] dark:bg-[#E4C79B]" />
                                <span className="font-semibold text-[#9A7B4F] dark:text-[#E4C79B]">Confirmed</span>
                              </div>
                              <div className="space-y-1">
                                <div className={`h-1.5 w-full ${isPreparing || isDelivered ? 'bg-[#9A7B4F] dark:bg-[#E4C79B]' : 'bg-[#E5DFD5] dark:bg-[#2B2723]'}`} />
                                <span className={isPreparing || isDelivered ? 'font-semibold text-[#9A7B4F] dark:text-[#E4C79B]' : 'text-[#8C847A]'}>
                                  Macerating
                                </span>
                              </div>
                              <div className="space-y-1">
                                <div className={`h-1.5 w-full ${order.status === 'shipped' || isDelivered ? 'bg-[#9A7B4F] dark:bg-[#E4C79B]' : 'bg-[#E5DFD5] dark:bg-[#2B2723]'}`} />
                                <span className={order.status === 'shipped' || isDelivered ? 'font-semibold text-[#9A7B4F] dark:text-[#E4C79B]' : 'text-[#8C847A]'}>
                                  In Transit
                                </span>
                              </div>
                              <div className="space-y-1">
                                <div className={`h-1.5 w-full ${isDelivered ? 'bg-emerald-500' : 'bg-[#E5DFD5] dark:bg-[#2B2723]'}`} />
                                <span className={isDelivered ? 'font-semibold text-emerald-600 dark:text-emerald-400' : 'text-[#8C847A]'}>
                                  Delivered
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Items Purchased in Order */}
                          <div className="space-y-4">
                            {order.items.map((item, idx) => (
                              <div
                                key={`${order.id}-item-${idx}`}
                                className="flex items-center gap-4 p-3 bg-[#FAF8F5] dark:bg-[#1A1816] border border-[#E5DFD5] dark:border-[#2B2723]"
                              >
                                <img
                                  src={item.image}
                                  alt={item.productName}
                                  referrerPolicy="no-referrer"
                                  className="w-14 h-16 object-cover bg-black"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="font-editorial text-lg leading-tight truncate">{item.productName}</p>
                                  <p className="text-xs text-[#8C847A]">
                                    Volume: {item.volumeMl} ml · Qty: {item.quantity} · Unit: ${item.unitPrice}
                                  </p>
                                  {item.engraving && (
                                    <p className="text-xs font-editorial italic text-[#9A7B4F] dark:text-[#E4C79B] mt-0.5">
                                      Gold Leaf Engraving: &ldquo;{item.engraving}&rdquo;
                                    </p>
                                  )}
                                </div>
                                <span className="font-editorial text-lg tabular-nums">
                                  ${item.unitPrice * item.quantity}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Sample-First Guarantee Callout */}
                          <div className="p-3 bg-[#F0EDE6] dark:bg-[#1D1A17] flex items-center justify-between text-xs text-[#6B655E] dark:text-[#A39C93]">
                            <div className="flex items-center gap-2">
                              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                              <span>Sample-First Trial Active: Test matching 2ml vial prior to breaking box seal for 100% return eligibility.</span>
                            </div>
                            <span className="font-medium text-[#161412] dark:text-[#E4C79B] text-[10px] uppercase tracking-wider">
                              30-Day Window Active
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: SCENT WARDROBE & MEMOIRS */}
            {activeTab === 'wardrobe' && (
              <div className="space-y-8">
                <div className="pb-4 border-b border-[#E5DFD5] dark:border-[#2B2723]">
                  <h2 className="font-editorial text-2xl sm:text-3xl">Armoire Olfactive &amp; Journal</h2>
                  <p className="text-xs text-[#6B655E] dark:text-[#A39C93]">
                    Your personal perfume collection, olfactive profile resonance, and life memories.
                  </p>
                </div>

                {/* Olfactive Profile Resonance Summary Card */}
                <div className="p-6 sm:p-8 bg-gradient-to-br from-[#F5EFE6] to-[#FAF8F5] dark:from-[#1A1714] dark:to-[#12100E] border border-[#E5DFD5] dark:border-[#2B2723] space-y-4">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#9A7B4F] dark:text-[#E4C79B]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Your Olfactive Signature Profile</span>
                  </div>
                  <h3 className="font-editorial text-2xl sm:text-3xl">
                    Oriental Sostenuto &amp; Resinous Wood
                  </h3>
                  <p className="text-xs sm:text-sm text-[#6B655E] dark:text-[#A39C93] leading-relaxed max-w-2xl">
                    Your profile gravitates toward hand-cured Florentine orris butter, Mysore heartwood, and nocturnal ambergris. Formulated to provide continuous 14-hour skin intimacy during contemplation and twilight gatherings.
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    {['Orris Butter', 'Assam Oud', 'Cistus Amber', 'Calabrian Bergamot', 'Madagascar Vanilla'].map((note) => (
                      <span key={note} className="px-3 py-1 text-[11px] uppercase tracking-wider bg-white dark:bg-[#201D1A] border border-[#E5DFD5] dark:border-[#2B2723]">
                        {note}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Owned Bottles Grid */}
                <div>
                  <h3 className="text-xs uppercase tracking-[0.2em] text-[#8C847A] mb-4">
                    Bottles in Your Archive ({wardrobeProducts.length || 2})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(wardrobeProducts.length > 0 ? wardrobeProducts : products.slice(0, 2)).map((p) => (
                      <div
                        key={p.id}
                        className="p-5 bg-[#FFFFFF] dark:bg-[#141210] border border-[#E5DFD5] dark:border-[#2B2723] flex gap-4 items-start"
                      >
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="w-20 h-24 object-cover shrink-0 bg-black"
                        />
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <p className="text-[10px] uppercase tracking-[0.2em] text-[#9A7B4F] dark:text-[#E4C79B]">
                            {p.fragranceFamily} · {p.concentration}
                          </p>
                          <h4 className="font-editorial text-xl">{p.name}</h4>
                          <p className="text-xs text-[#8C847A] line-clamp-2">{p.shortDescription}</p>
                          <div className="pt-2 flex items-center gap-3 text-xs">
                            <button
                              type="button"
                              onClick={() => onViewProduct(p)}
                              className="text-[#9A7B4F] dark:text-[#E4C79B] hover:underline"
                            >
                              View Notes &amp; Pyramid →
                            </button>
                            <button
                              type="button"
                              onClick={() => onAddToCart(p)}
                              className="text-[#161412] dark:text-white hover:underline"
                            >
                              Replenish Flacon
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: CONCIERGE ADDRESSES */}
            {activeTab === 'addresses' && (
              <div className="space-y-8">
                <div className="pb-4 border-b border-[#E5DFD5] dark:border-[#2B2723]">
                  <h2 className="font-editorial text-2xl sm:text-3xl">Carnet d&apos;Adresses</h2>
                  <p className="text-xs text-[#6B655E] dark:text-[#A39C93]">
                    Manage destinations for your insured atelier courier and white-glove deliveries.
                  </p>
                </div>

                {/* Existing Addresses Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {displayAddresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="p-6 bg-[#FFFFFF] dark:bg-[#141210] border border-[#E5DFD5] dark:border-[#2B2723] relative space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-editorial text-lg">{addr.label}</span>
                        {addr.isDefault && (
                          <span className="px-2 py-0.5 text-[9px] uppercase tracking-widest bg-[#9A7B4F] text-white">
                            Default Residence
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-medium">{addr.fullName}</p>
                      <p className="text-xs text-[#8C847A] leading-relaxed">
                        {addr.line1}
                        {addr.line2 && <br />}
                        {addr.line2}
                        <br />
                        {addr.city}, {addr.postalCode} · {addr.country}
                      </p>
                      <div className="pt-3 flex items-center justify-between text-xs">
                        <span className="text-[#8C847A] text-[10px] uppercase tracking-wider">
                          Insured Courier Zone
                        </span>
                        {user && (
                          <button
                            type="button"
                            onClick={() => {
                              removeUserAddress(user.uid, addr.id);
                              onAddressesChanged(addresses.filter((a) => a.id !== addr.id));
                            }}
                            className="text-red-500 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Remove</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add New Address Form */}
                <div className="p-6 bg-[#FFFFFF] dark:bg-[#141210] border border-[#E5DFD5] dark:border-[#2B2723]">
                  <h3 className="font-editorial text-xl mb-4">Add a New Delivery Residence</h3>
                  <form onSubmit={handleAddAddress} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-[0.16em] text-[#8C847A] mb-1">
                          Address Label
                        </label>
                        <input
                          type="text"
                          value={addrLabel}
                          onChange={(e) => setAddrLabel(e.target.value)}
                          placeholder="e.g. Paris Residence, Villa in Grasse"
                          className="w-full bg-[#FAF8F5] dark:bg-[#1E1B18] border border-[#E5DFD5] dark:border-[#2B2723] px-3.5 py-2 text-xs focus:outline-none focus:border-[#9A7B4F]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-[0.16em] text-[#8C847A] mb-1">
                          Full Recipient Name
                        </label>
                        <input
                          type="text"
                          value={addrName}
                          onChange={(e) => setAddrName(e.target.value)}
                          placeholder="e.g. Camille Laurent"
                          className="w-full bg-[#FAF8F5] dark:bg-[#1E1B18] border border-[#E5DFD5] dark:border-[#2B2723] px-3.5 py-2 text-xs focus:outline-none focus:border-[#9A7B4F]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.16em] text-[#8C847A] mb-1">
                        Street Address &amp; Suite / Concierge
                      </label>
                      <input
                        type="text"
                        required
                        value={addrLine1}
                        onChange={(e) => setAddrLine1(e.target.value)}
                        placeholder="e.g. 24 Rue Saint-Honoré, Apt 4B"
                        className="w-full bg-[#FAF8F5] dark:bg-[#1E1B18] border border-[#E5DFD5] dark:border-[#2B2723] px-3.5 py-2 text-xs focus:outline-none focus:border-[#9A7B4F]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-[0.16em] text-[#8C847A] mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          required
                          value={addrCity}
                          onChange={(e) => setAddrCity(e.target.value)}
                          placeholder="Paris"
                          className="w-full bg-[#FAF8F5] dark:bg-[#1E1B18] border border-[#E5DFD5] dark:border-[#2B2723] px-3.5 py-2 text-xs focus:outline-none focus:border-[#9A7B4F]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-[0.16em] text-[#8C847A] mb-1">
                          Postal Code
                        </label>
                        <input
                          type="text"
                          value={addrPostal}
                          onChange={(e) => setAddrPostal(e.target.value)}
                          placeholder="75001"
                          className="w-full bg-[#FAF8F5] dark:bg-[#1E1B18] border border-[#E5DFD5] dark:border-[#2B2723] px-3.5 py-2 text-xs focus:outline-none focus:border-[#9A7B4F]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-[0.16em] text-[#8C847A] mb-1">
                          Country
                        </label>
                        <input
                          type="text"
                          value={addrCountry}
                          onChange={(e) => setAddrCountry(e.target.value)}
                          placeholder="France"
                          className="w-full bg-[#FAF8F5] dark:bg-[#1E1B18] border border-[#E5DFD5] dark:border-[#2B2723] px-3.5 py-2 text-xs focus:outline-none focus:border-[#9A7B4F]"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="px-6 py-3 text-xs uppercase tracking-[0.18em] bg-[#161412] text-white dark:bg-[#E4C79B] dark:text-black font-semibold hover:opacity-90 cursor-pointer"
                    >
                      Save Residence
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* TAB 4: SAVED FLACONS (WISHLIST) */}
            {activeTab === 'wishlist' && (
              <div className="space-y-8">
                <div className="pb-4 border-b border-[#E5DFD5] dark:border-[#2B2723]">
                  <h2 className="font-editorial text-2xl sm:text-3xl">Coffre de Souhaits</h2>
                  <p className="text-xs text-[#6B655E] dark:text-[#A39C93]">
                    Flacons preserved for future celebrations, seasonal batches, and gift occasions.
                  </p>
                </div>

                {wishlistProducts.length === 0 ? (
                  <div className="p-12 text-center border border-[#E5DFD5] dark:border-[#2B2723] bg-[#FFFFFF] dark:bg-[#151311]">
                    <Heart className="w-10 h-10 mx-auto text-[#9A7B4F] mb-4 opacity-60" />
                    <h3 className="font-editorial text-2xl mb-2">No Saved Flacons in Vault</h3>
                    <p className="text-xs text-[#6B655E] dark:text-[#A39C93] max-w-md mx-auto mb-6">
                      Click the heart icon on any flacon across our collections or life chapters to save it here.
                    </p>
                    <button
                      type="button"
                      onClick={() => onNavigatePage('collections')}
                      className="px-8 py-3.5 text-xs uppercase tracking-[0.18em] bg-[#161412] text-white dark:bg-[#E4C79B] dark:text-black font-semibold hover:opacity-90 cursor-pointer"
                    >
                      Browse Collections
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlistProducts.map((p) => (
                      <div
                        key={p.id}
                        className="p-5 bg-[#FFFFFF] dark:bg-[#141210] border border-[#E5DFD5] dark:border-[#2B2723] flex flex-col justify-between"
                      >
                        <div>
                          <div className="relative aspect-[3/4] overflow-hidden bg-black mb-4">
                            <img
                              src={p.images[0]}
                              alt={p.name}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => onToggleWishlist(p.id)}
                              className="absolute top-2 right-2 p-1.5 bg-black/60 text-white hover:text-red-400 cursor-pointer"
                              title="Remove from saved"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="text-[10px] uppercase tracking-[0.2em] text-[#9A7B4F] dark:text-[#E4C79B]">
                            {p.fragranceFamily}
                          </p>
                          <h4 className="font-editorial text-xl">{p.name}</h4>
                          <p className="text-xs text-[#8C847A] mt-1 line-clamp-2">{p.shortDescription}</p>
                        </div>

                        <div className="pt-4 border-t border-[#E5DFD5] dark:border-[#2B2723] mt-4 flex items-center justify-between">
                          <span className="font-editorial text-lg tabular-nums">${p.price}</span>
                          <button
                            type="button"
                            onClick={() => onAddToCart(p)}
                            className="px-4 py-2 text-[10px] uppercase tracking-[0.16em] bg-[#E4C79B] text-[#0E0D0C] font-semibold hover:bg-white transition-colors cursor-pointer"
                          >
                            Add to Bag
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: SECURITY & 2FA */}
            {activeTab === 'security' && (
              <div className="space-y-8">
                <div className="pb-4 border-b border-[#E5DFD5] dark:border-[#2B2723]">
                  <h2 className="font-editorial text-2xl sm:text-3xl">Sécurité &amp; Privilèges Privés</h2>
                  <p className="text-xs text-[#6B655E] dark:text-[#A39C93]">
                    Multi-factor authentication (TOTP), private allocations, and profile credentials.
                  </p>
                </div>

                {/* Profile Edit Block */}
                <div className="p-6 bg-[#FFFFFF] dark:bg-[#141210] border border-[#E5DFD5] dark:border-[#2B2723]">
                  <h3 className="font-editorial text-xl mb-4">Client Profile Information</h3>
                  {profileMsg && (
                    <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs">
                      {profileMsg}
                    </div>
                  )}
                  <form onSubmit={handleSaveProfile} className="space-y-4 max-w-xl">
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.16em] text-[#8C847A] mb-1">
                        Patron Full Name
                      </label>
                      <input
                        type="text"
                        value={fullNameInput}
                        onChange={(e) => setFullNameInput(e.target.value)}
                        className="w-full bg-[#FAF8F5] dark:bg-[#1E1B18] border border-[#E5DFD5] dark:border-[#2B2723] px-3.5 py-2 text-xs focus:outline-none focus:border-[#9A7B4F]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.16em] text-[#8C847A] mb-1">
                        Private Concierge Telephone
                      </label>
                      <input
                        type="text"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        className="w-full bg-[#FAF8F5] dark:bg-[#1E1B18] border border-[#E5DFD5] dark:border-[#2B2723] px-3.5 py-2 text-xs focus:outline-none focus:border-[#9A7B4F]"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-6 py-2.5 text-xs uppercase tracking-[0.18em] bg-[#161412] text-white dark:bg-[#E4C79B] dark:text-black font-semibold hover:opacity-90 cursor-pointer"
                    >
                      Update Profile
                    </button>
                  </form>
                </div>

                {/* Two-Factor Authentication Block */}
                <div className="p-6 bg-[#FFFFFF] dark:bg-[#141210] border border-[#E5DFD5] dark:border-[#2B2723] space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <KeyRound className="w-4 h-4 text-[#9A7B4F]" />
                        <h3 className="font-editorial text-xl">Two-Factor Authentication (TOTP)</h3>
                      </div>
                      <p className="text-xs text-[#8C847A] mt-1">
                        Protect your private allocations with standard authenticator apps (Google Authenticator, Apple Passwords, 1Password).
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 text-[10px] uppercase tracking-widest border ${
                        prefs?.twoFactorEnabled
                          ? 'border-emerald-500 text-emerald-600 bg-emerald-500/10'
                          : 'border-[#E5DFD5] text-[#8C847A]'
                      }`}
                    >
                      {prefs?.twoFactorEnabled ? 'Active' : 'Disabled'}
                    </span>
                  </div>

                  {totpStatus && (
                    <div className="p-3 bg-[#FAF8F5] dark:bg-[#1E1B18] border border-[#9A7B4F]/40 text-xs text-[#9A7B4F] dark:text-[#E4C79B]">
                      {totpStatus}
                    </div>
                  )}

                  {!prefs?.twoFactorEnabled && !totpEnrollData && (
                    <button
                      type="button"
                      onClick={handleStart2fa}
                      className="px-6 py-2.5 text-xs uppercase tracking-[0.18em] bg-[#9A7B4F] text-white font-medium hover:bg-[#7D643E] cursor-pointer"
                    >
                      Enable 2FA Protection
                    </button>
                  )}

                  {totpEnrollData && (
                    <div className="p-5 border border-[#9A7B4F]/40 bg-[#FAF8F5] dark:bg-[#1A1816] space-y-4">
                      <p className="text-xs text-[#8C847A]">
                        Scan this QR code with your authenticator app, then enter the 6-digit verification code below:
                      </p>
                      <img
                        src={totpEnrollData.qrDataUrl}
                        alt="2FA QR Code"
                        className="w-40 h-40 border border-white mx-auto sm:mx-0"
                      />
                      <form onSubmit={handleConfirm2fa} className="flex gap-3 max-w-sm">
                        <input
                          type="text"
                          maxLength={6}
                          value={totpCodeInput}
                          onChange={(e) => setTotpCodeInput(e.target.value)}
                          placeholder="000000"
                          className="w-32 text-center tracking-widest font-mono text-base px-3 py-2 bg-white dark:bg-[#201D1A] border border-[#E5DFD5] dark:border-[#2B2723] focus:outline-none"
                        />
                        <button
                          type="submit"
                          className="px-5 py-2 text-xs uppercase tracking-wider bg-[#161412] text-white dark:bg-[#E4C79B] dark:text-black font-semibold cursor-pointer"
                        >
                          Verify &amp; Activate
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Printable Receipt Modal */}
      {receiptOrder && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white text-[#161412] p-8 border border-[#E5DFD5] shadow-2xl relative">
            <button
              type="button"
              onClick={() => setReceiptOrder(null)}
              className="absolute top-4 right-4 text-xs uppercase tracking-wider text-[#8C847A] hover:text-black cursor-pointer"
            >
              Close
            </button>
            <div className="text-center pb-6 border-b border-[#E5DFD5]">
              <p className="font-editorial text-2xl tracking-[0.2em] uppercase">Maison Léonie</p>
              <p className="text-[10px] tracking-[0.24em] uppercase text-[#9A7B4F]">Haute Parfumerie · Paris &amp; Grasse</p>
              <p className="text-xs text-[#8C847A] mt-2">Order Receipt #{receiptOrder.orderNumber} · {receiptOrder.createdAtIso}</p>
            </div>

            <div className="py-6 space-y-3 text-xs border-b border-[#E5DFD5]">
              <div className="flex justify-between text-[#8C847A]">
                <span>Recipient:</span>
                <span className="font-medium text-[#161412]">{receiptOrder.customerName}</span>
              </div>
              <div className="flex justify-between text-[#8C847A]">
                <span>Destination:</span>
                <span className="font-medium text-[#161412] text-right max-w-xs">{receiptOrder.shippingAddress}</span>
              </div>
              <div className="flex justify-between text-[#8C847A]">
                <span>Payment:</span>
                <span className="font-medium text-[#161412]">{receiptOrder.paymentMethod} ({receiptOrder.paymentStatus})</span>
              </div>
            </div>

            <div className="py-4 space-y-2 border-b border-[#E5DFD5] text-xs">
              {receiptOrder.items.map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>{item.productName} ({item.volumeMl}ml x{item.quantity})</span>
                  <span className="font-mono">${item.unitPrice * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 space-y-1 text-xs">
              <div className="flex justify-between text-[#8C847A]">
                <span>Subtotal:</span>
                <span>${receiptOrder.subtotal.toFixed(2)}</span>
              </div>
              {receiptOrder.discount > 0 && (
                <div className="flex justify-between text-[#9A7B4F]">
                  <span>Privilege Discount ({receiptOrder.promoCode || 'PROMO'}):</span>
                  <span>-${receiptOrder.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#8C847A]">
                <span>Courier Delivery:</span>
                <span>${receiptOrder.shippingCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-editorial pt-2 border-t border-[#E5DFD5]">
                <span>Total Paid:</span>
                <span>${receiptOrder.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-[#E5DFD5] flex items-center justify-between text-[10px] text-[#8C847A] uppercase tracking-wider">
              <span>Insured by Maison Léonie Concierge</span>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-[#161412] text-white hover:bg-black cursor-pointer"
              >
                Print Official Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
