import { getAssetUrl } from '../lib/assets';
import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Check,
  CheckCircle2,
  Clock,
  Compass,
  DollarSign,
  Download,
  Edit3,
  Eye,
  Filter,
  Package,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  Sparkles,
  Tag,
  Trash2,
  TrendingUp,
  Truck,
  Users,
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  ConcentrationType,
  FragranceFamily,
  OrderRecord,
  PerfumeProduct,
  ProductCategory,
  UserPreferences,
} from '../types/perfume';
import {
  syncCatalogAsAdmin,
  updateOrderStatus,
  upsertProductAsAdmin,
} from '../lib/storeService';
import { HUMAN_CHRONICLES, LIFE_CHAPTERS } from '../data/perfumes';

interface AdminDashboardPageProps {
  user: User | null;
  prefs: UserPreferences | null;
  orders: OrderRecord[];
  products: PerfumeProduct[];
  onNavigatePage: (page: string) => void;
  onProductsChanged: (products: PerfumeProduct[]) => void;
  onOrdersChanged: (orders: OrderRecord[]) => void;
}

type AdminTab = 'orders' | 'inventory' | 'promos' | 'memoirs' | 'analytics';

interface PromoCodeItem {
  id: string;
  code: string;
  discountPercent: number;
  minSpend: number;
  redemptions: number;
  active: boolean;
  note: string;
}

const DEFAULT_PROMOS: PromoCodeItem[] = [
  {
    id: 'pr-1',
    code: 'LEONIE15',
    discountPercent: 15,
    minSpend: 0,
    redemptions: 48,
    active: true,
    note: 'Welcome Atelier 15% discount for first-time visitors',
  },
  {
    id: 'pr-2',
    code: 'ATELIERVIP',
    discountPercent: 20,
    minSpend: 250,
    redemptions: 19,
    active: true,
    note: 'VIP private salon allocation code',
  },
  {
    id: 'pr-3',
    code: 'GRASSE40',
    discountPercent: 12,
    minSpend: 300,
    redemptions: 7,
    active: true,
    note: 'Seasonal oak batch maceration release privilege',
  },
];

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  user,
  prefs,
  orders,
  products,
  onNavigatePage,
  onProductsChanged,
  onOrdersChanged,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('orders');
  const [orderFilter, setOrderFilter] = useState<'all' | 'confirmed' | 'preparing' | 'shipped' | 'delivered'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [adminNotice, setAdminNotice] = useState<string | null>(null);

  // Promo Codes State
  const [promos, setPromos] = useState<PromoCodeItem[]>(DEFAULT_PROMOS);
  const [newCodeName, setNewCodeName] = useState('');
  const [newCodeDiscount, setNewCodeDiscount] = useState(15);
  const [newCodeMinSpend, setNewCodeMinSpend] = useState(0);

  // New Flacon Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newFlaconName, setNewFlaconName] = useState('');
  const [newFlaconCategory, setNewFlaconCategory] = useState<ProductCategory>('New Arrivals');
  const [newFlaconFamily, setNewFlaconFamily] = useState<FragranceFamily>('Woody');
  const [newFlaconPrice, setNewFlaconPrice] = useState(280);
  const [newFlaconStock, setNewFlaconStock] = useState(25);
  const [newFlaconConcentration, setNewFlaconConcentration] = useState<ConcentrationType>('Extrait de Parfum');
  const [newFlaconLongevity, setNewFlaconLongevity] = useState(14);
  const [newFlaconTopNotes, setNewFlaconTopNotes] = useState('Bergamot, Saffron, Pink Pepper');
  const [newFlaconHeartNotes, setNewFlaconHeartNotes] = useState('Damask Rose, Iris, Jasmine');
  const [newFlaconBaseNotes, setNewFlaconBaseNotes] = useState('Amber, Mysore Sandalwood, Vanilla');
  const [newFlaconDescription, setNewFlaconDescription] = useState('');

  // Memoirs curation state
  const [memoirsList, setMemoirsList] = useState(HUMAN_CHRONICLES);

  const showNotice = (msg: string) => {
    setAdminNotice(msg);
    setTimeout(() => setAdminNotice(null), 3200);
  };

  // KPI Calculations
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0) || 12450;
  const totalOrdersCount = orders.length || 38;
  const aov = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 325;
  const lowStockCount = products.filter((p) => p.stockCount <= 10).length;
  const totalBottlesInStock = products.reduce((sum, p) => sum + p.stockCount, 0);

  // Orders Filtered
  const filteredOrders = orders.filter((o) => {
    const matchesStatus = orderFilter === 'all' || o.status === orderFilter;
    const matchesSearch =
      searchQuery.trim() === '' ||
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.trackingCode && o.trackingCode.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const handleUpdateStatus = async (orderId: string, nextStatus: OrderRecord['status']) => {
    await updateOrderStatus(orderId, nextStatus);
    const updated = orders.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o));
    onOrdersChanged(updated);
    showNotice(`Order #${orderId} advanced to "${nextStatus}".`);
  };

  const handleRestockProduct = async (product: PerfumeProduct, delta: number) => {
    const nextStock = Math.max(0, product.stockCount + delta);
    const updatedProduct = { ...product, stockCount: nextStock };
    await upsertProductAsAdmin(updatedProduct, false);
    const nextList = products.map((p) => (p.id === product.id ? updatedProduct : p));
    onProductsChanged(nextList);
    showNotice(`Updated ${product.name} reserve to ${nextStock} flacons.`);
  };

  const handleSyncFirestore = async () => {
    await syncCatalogAsAdmin(products);
    showNotice('Atelier product catalog synchronized to Firestore database.');
  };

  const handleCreatePromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCodeName.trim()) return;
    const codeClean = newCodeName.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    const newPromo: PromoCodeItem = {
      id: `pr-${Date.now()}`,
      code: codeClean,
      discountPercent: newCodeDiscount,
      minSpend: newCodeMinSpend,
      redemptions: 0,
      active: true,
      note: 'Executive created promotional privilege',
    };
    setPromos([newPromo, ...promos]);
    setNewCodeName('');
    showNotice(`Privilege code ${codeClean} activated at ${newCodeDiscount}% discount.`);
  };

  const handleTogglePromo = (id: string) => {
    setPromos(promos.map((p) => (p.id === id ? { ...p, active: !p.active } : p)));
  };

  const handleCreateFlacon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFlaconName.trim()) return;

    const id = newFlaconName.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 32);
    const newPerfume: PerfumeProduct = {
      id,
      slug: id,
      name: newFlaconName.trim(),
      brand: 'Maison Léonie · Les Extraits',
      subtitle: `${newFlaconConcentration} · Grasse Reserve`,
      category: newFlaconCategory,
      fragranceFamily: newFlaconFamily,
      concentration: newFlaconConcentration,
      longevityHours: newFlaconLongevity,
      intensity: 'Statement',
      price: newFlaconPrice,
      volumeMl: 100,
      stockCount: newFlaconStock,
      popularityScore: 90,
      shortDescription: newFlaconDescription || 'A new bespoke masterwork from our Grasse atelier.',
      description: newFlaconDescription || 'Hand-macerated in seasoned French oak vessels to capture intimate sillage and golden resonance.',
      topNotes: newFlaconTopNotes.split(',').map((s) => s.trim()),
      heartNotes: newFlaconHeartNotes.split(',').map((s) => s.trim()),
      baseNotes: newFlaconBaseNotes.split(',').map((s) => s.trim()),
      occasion: ['Evening', 'Signature', 'Private Reserve'],
      season: ['Autumn', 'Winter', 'Spring'],
      images: [
        getAssetUrl('/src/assets/images/bottle_oud_velours_1795464159199.jpg'),
        getAssetUrl('/src/assets/images/hero_shutter_pickup_1795464157955.jpg'),
      ],
      ratingAvg: 5.0,
      reviewCount: 1,
    };

    await upsertProductAsAdmin(newPerfume, true);
    onProductsChanged([newPerfume, ...products]);
    setIsAddModalOpen(false);
    setNewFlaconName('');
    setNewFlaconDescription('');
    showNotice(`Created new flacon "${newPerfume.name}" with ${newFlaconStock} reserved bottles.`);
  };

  return (
    <div className="pt-28 sm:pt-32 min-h-screen bg-[#FAF8F5] dark:bg-[#0E0D0C] text-[#161412] dark:text-[#FAF8F5]">
      {/* 1. Header & Executive Breadcrumb */}
      <div className="border-b border-[#E5DFD5] dark:border-[#2B2723] bg-[#12100E] text-[#FAF8F5] px-6 lg:px-10 py-10 lg:py-14">
        <div className="max-w-[1360px] mx-auto">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[10px] tracking-[0.24em] uppercase text-[#8C847A] mb-5">
            <button
              type="button"
              onClick={() => onNavigatePage('home')}
              className="hover:text-[#E4C79B] transition-colors cursor-pointer flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Maison Léonie</span>
            </button>
            <span>/</span>
            <span className="text-[#E4C79B]">Bureau de Direction · Admin Command</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1E1B18] border border-[#E4C79B]/40 text-[#E4C79B] text-[10px] tracking-[0.2em] uppercase mb-3">
                <ShieldAlert className="w-3 h-3" />
                <span>Executive Command Center · Paris &amp; Grasse</span>
              </div>
              <h1 className="font-editorial text-4xl sm:text-5xl font-normal">
                Atelier Administration
              </h1>
              <p className="text-sm text-[#BFB7AA] mt-1">
                Fulfillment queue, oak maceration batch reserves, promo engine &amp; client memoirs.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleSyncFirestore}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs uppercase tracking-[0.16em] border border-[#E4C79B]/60 text-[#E4C79B] hover:bg-[#E4C79B] hover:text-black transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Sync DB</span>
              </button>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs uppercase tracking-[0.18em] bg-[#E4C79B] text-black font-semibold hover:bg-white transition-colors cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Flacon</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigatePage('client')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-[11px] uppercase tracking-[0.16em] border border-white/20 hover:border-white transition-colors cursor-pointer"
              >
                <span>View Client Salon →</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notice Alert Banner */}
      {adminNotice && (
        <div className="bg-[#9A7B4F] text-black px-6 py-2.5 text-xs uppercase tracking-[0.14em] font-medium text-center shadow-inner">
          {adminNotice}
        </div>
      )}

      {/* 2. Executive KPI Metrics Grid */}
      <div className="border-b border-[#E5DFD5] dark:border-[#2B2723] bg-[#FFFFFF] dark:bg-[#141210] px-6 lg:px-10 py-6">
        <div className="max-w-[1360px] mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 text-xs uppercase tracking-[0.16em]">
          <div className="space-y-1">
            <span className="text-[#8C847A] text-[10px] flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-[#9A7B4F]" />
              <span>Gross Revenue</span>
            </span>
            <p className="font-editorial text-2xl tabular-nums font-semibold">${totalRevenue.toLocaleString()}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[#8C847A] text-[10px] flex items-center gap-1">
              <Package className="w-3 h-3 text-[#9A7B4F]" />
              <span>Orders Placed</span>
            </span>
            <p className="font-editorial text-2xl tabular-nums font-semibold">{totalOrdersCount}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[#8C847A] text-[10px] flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-[#9A7B4F]" />
              <span>Average Order</span>
            </span>
            <p className="font-editorial text-2xl tabular-nums font-semibold">${aov.toFixed(0)}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[#8C847A] text-[10px] flex items-center gap-1">
              <Compass className="w-3 h-3 text-[#9A7B4F]" />
              <span>Catalog Flacons</span>
            </span>
            <p className="font-editorial text-2xl tabular-nums font-semibold">{products.length} Editions</p>
          </div>

          <div className="space-y-1">
            <span className="text-[#8C847A] text-[10px] flex items-center gap-1">
              <Package className="w-3 h-3 text-[#9A7B4F]" />
              <span>Total In Reserve</span>
            </span>
            <p className="font-editorial text-2xl tabular-nums font-semibold">{totalBottlesInStock} Bottles</p>
          </div>

          <div className="space-y-1">
            <span className="text-[#8C847A] text-[10px] flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-500" />
              <span>Low Stock Alerts</span>
            </span>
            <p className={`font-editorial text-2xl tabular-nums font-semibold ${lowStockCount > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
              {lowStockCount} Items
            </p>
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs & Content Area */}
      <div className="max-w-[1360px] mx-auto px-6 lg:px-10 py-10">
        {/* Tab Strip */}
        <div className="flex flex-wrap items-center gap-2 pb-4 mb-8 border-b border-[#E5DFD5] dark:border-[#2B2723] text-xs uppercase tracking-[0.18em]">
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`px-5 py-2.5 border transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'border-[#9A7B4F] dark:border-[#E4C79B] bg-[#9A7B4F]/10 text-[#9A7B4F] dark:text-[#E4C79B] font-semibold'
                : 'border-transparent hover:border-[#E5DFD5] dark:hover:border-[#2B2723]'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Fulfillment &amp; Orders ({orders.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            className={`px-5 py-2.5 border transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'inventory'
                ? 'border-[#9A7B4F] dark:border-[#E4C79B] bg-[#9A7B4F]/10 text-[#9A7B4F] dark:text-[#E4C79B] font-semibold'
                : 'border-transparent hover:border-[#E5DFD5] dark:hover:border-[#2B2723]'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Inventory &amp; Maceration ({products.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('promos')}
            className={`px-5 py-2.5 border transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'promos'
                ? 'border-[#9A7B4F] dark:border-[#E4C79B] bg-[#9A7B4F]/10 text-[#9A7B4F] dark:text-[#E4C79B] font-semibold'
                : 'border-transparent hover:border-[#E5DFD5] dark:hover:border-[#2B2723]'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Privilege Codes ({promos.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('memoirs')}
            className={`px-5 py-2.5 border transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'memoirs'
                ? 'border-[#9A7B4F] dark:border-[#E4C79B] bg-[#9A7B4F]/10 text-[#9A7B4F] dark:text-[#E4C79B] font-semibold'
                : 'border-transparent hover:border-[#E5DFD5] dark:hover:border-[#2B2723]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Human Memoirs Curation ({memoirsList.length})</span>
          </button>
        </div>

        {/* TAB 1: ORDERS FULFILLMENT */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Search & Status Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 bg-[#FFFFFF] dark:bg-[#141210] border border-[#E5DFD5] dark:border-[#2B2723]">
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <Search className="w-4 h-4 text-[#8C847A]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Order #, Patron Name, Email, or Tracking..."
                  className="w-full bg-transparent text-xs focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto text-[10px] tracking-[0.14em] uppercase">
                <span className="text-[#8C847A] mr-1">Status:</span>
                {(['all', 'confirmed', 'preparing', 'shipped', 'delivered'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setOrderFilter(st)}
                    className={`px-3 py-1.5 border transition-colors cursor-pointer whitespace-nowrap ${
                      orderFilter === st
                        ? 'border-[#9A7B4F] bg-[#9A7B4F] text-black font-semibold'
                        : 'border-[#E5DFD5] dark:border-[#2B2723] hover:border-[#9A7B4F]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders Table */}
            {filteredOrders.length === 0 ? (
              <div className="p-12 text-center border border-[#E5DFD5] dark:border-[#2B2723] bg-[#FFFFFF] dark:bg-[#151311]">
                <Package className="w-8 h-8 mx-auto text-[#8C847A] mb-3 opacity-60" />
                <p className="text-sm font-editorial">No orders matching the active criteria.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-6 bg-[#FFFFFF] dark:bg-[#141210] border border-[#E5DFD5] dark:border-[#2B2723] space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-[#E5DFD5] dark:border-[#2B2723]">
                      <div className="flex items-center gap-3">
                        <span className="font-editorial text-xl">{order.orderNumber}</span>
                        <span className="text-xs text-[#8C847A]">· {order.createdAtIso}</span>
                        <span className="px-2 py-0.5 text-[9px] uppercase tracking-wider font-semibold border border-[#9A7B4F] text-[#9A7B4F]">
                          {order.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs">
                        <span className="font-editorial text-xl tabular-nums font-medium">${order.total.toFixed(2)}</span>
                        <span className="text-[#8C847A]">({order.paymentMethod})</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 text-xs">
                      {/* Customer Details */}
                      <div className="md:col-span-4 space-y-1">
                        <p className="text-[10px] uppercase tracking-wider text-[#8C847A]">Patron Details</p>
                        <p className="font-medium text-sm">{order.customerName}</p>
                        <p className="text-[#8C847A]">{order.customerEmail}</p>
                        <p className="text-[#8C847A] mt-2 leading-relaxed">{order.shippingAddress}</p>
                        {order.giftNote && (
                          <div className="mt-2 p-2 bg-[#FAF8F5] dark:bg-[#1E1B18] border-l-2 border-[#9A7B4F] text-[11px] italic">
                            &ldquo;{order.giftNote}&rdquo;
                          </div>
                        )}
                      </div>

                      {/* Items & Engraving */}
                      <div className="md:col-span-5 space-y-2">
                        <p className="text-[10px] uppercase tracking-wider text-[#8C847A]">Items &amp; Bespoke Engravings</p>
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-2 bg-[#FAF8F5] dark:bg-[#181614] border border-[#E5DFD5] dark:border-[#2B2723]">
                            <img src={item.image} alt={item.productName} className="w-10 h-12 object-cover bg-black" />
                            <div className="flex-1 min-w-0">
                              <p className="font-editorial text-sm truncate">{item.productName} ({item.volumeMl}ml)</p>
                              <p className="text-[11px] text-[#8C847A]">Qty: {item.quantity} · ${item.unitPrice}</p>
                              {item.engraving && (
                                <p className="text-[11px] font-editorial italic text-[#9A7B4F] dark:text-[#E4C79B]">
                                  Engraving: &ldquo;{item.engraving}&rdquo;
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Status Action Workflow */}
                      <div className="md:col-span-3 space-y-3">
                        <p className="text-[10px] uppercase tracking-wider text-[#8C847A]">Fulfillment Actions</p>
                        <div className="space-y-2">
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(order.id, 'preparing')}
                            className="w-full py-1.5 px-3 text-[10px] uppercase tracking-wider border border-[#9A7B4F] text-[#9A7B4F] hover:bg-[#9A7B4F]/10 cursor-pointer"
                          >
                            Mark Macerating / Bottling
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(order.id, 'shipped')}
                            className="w-full py-1.5 px-3 text-[10px] uppercase tracking-wider bg-[#161412] text-white dark:bg-[#E4C79B] dark:text-black font-semibold hover:opacity-90 cursor-pointer"
                          >
                            Dispatch Courier
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(order.id, 'delivered')}
                            className="w-full py-1.5 px-3 text-[10px] uppercase tracking-wider border border-emerald-500 text-emerald-600 hover:bg-emerald-500/10 cursor-pointer"
                          >
                            Confirm Hand Delivery
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: INVENTORY & MACERATION */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#E5DFD5] dark:border-[#2B2723]">
              <div>
                <h3 className="font-editorial text-2xl">Atelier Flacons &amp; Reserve Inventory</h3>
                <p className="text-xs text-[#8C847A]">
                  Manage stock levels, small oak batch macerations, and catalogue formulations.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 text-xs uppercase tracking-wider bg-[#161412] text-white dark:bg-[#E4C79B] dark:text-black font-semibold cursor-pointer"
              >
                + Add Flacon
              </button>
            </div>

            {/* Inventory Table */}
            <div className="overflow-x-auto border border-[#E5DFD5] dark:border-[#2B2723] bg-[#FFFFFF] dark:bg-[#141210]">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E5DFD5] dark:border-[#2B2723] bg-[#FAF8F5] dark:bg-[#1A1816] text-[10px] uppercase tracking-[0.16em] text-[#8C847A]">
                    <th className="p-4">Flacon</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Family</th>
                    <th className="p-4">Concentration</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Reserve Stock</th>
                    <th className="p-4 text-right">Quick Restock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5DFD5] dark:divide-[#2B2723]">
                  {products.map((p) => {
                    const isLow = p.stockCount <= 10;
                    return (
                      <tr key={p.id} className="hover:bg-[#FAF8F5] dark:hover:bg-[#171513]">
                        <td className="p-4 flex items-center gap-3">
                          <img src={p.images[0]} alt={p.name} className="w-10 h-12 object-cover bg-black" />
                          <div>
                            <p className="font-editorial text-base font-medium">{p.name}</p>
                            <p className="text-[10px] text-[#8C847A]">{p.volumeMl} ml</p>
                          </div>
                        </td>
                        <td className="p-4">{p.category}</td>
                        <td className="p-4">{p.fragranceFamily}</td>
                        <td className="p-4">{p.concentration}</td>
                        <td className="p-4 font-mono font-medium">${p.price}</td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-1 font-semibold tabular-nums ${
                              isLow ? 'text-amber-500 font-bold' : 'text-[#161412] dark:text-[#FAF8F5]'
                            }`}
                          >
                            {p.stockCount} bottles
                            {isLow && <AlertTriangle className="w-3.5 h-3.5" />}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => handleRestockProduct(p, 12)}
                            className="px-2.5 py-1 text-[10px] uppercase tracking-wider border border-[#9A7B4F] text-[#9A7B4F] hover:bg-[#9A7B4F]/10 cursor-pointer"
                          >
                            +12 Batch
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRestockProduct(p, 24)}
                            className="px-2.5 py-1 text-[10px] uppercase tracking-wider border border-[#E5DFD5] dark:border-[#2B2723] hover:border-white cursor-pointer"
                          >
                            +24 Batch
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: PROMO ENGINE */}
        {activeTab === 'promos' && (
          <div className="space-y-8">
            <div className="pb-4 border-b border-[#E5DFD5] dark:border-[#2B2723]">
              <h3 className="font-editorial text-2xl">Privilèges &amp; Codes Promotionnels</h3>
              <p className="text-xs text-[#8C847A]">
                Create and manage customer discount codes, welcome privileges, and VIP salon allocations.
              </p>
            </div>

            {/* Create Promo Code Form */}
            <div className="p-6 bg-[#FFFFFF] dark:bg-[#141210] border border-[#E5DFD5] dark:border-[#2B2723]">
              <h4 className="font-editorial text-xl mb-4">Generate New Privilege Code</h4>
              <form onSubmit={handleCreatePromo} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#8C847A] mb-1">
                    Code Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newCodeName}
                    onChange={(e) => setNewCodeName(e.target.value)}
                    placeholder="e.g. GRASSE20"
                    className="w-full bg-[#FAF8F5] dark:bg-[#1E1B18] border border-[#E5DFD5] dark:border-[#2B2723] px-3.5 py-2 text-xs uppercase focus:outline-none focus:border-[#9A7B4F]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#8C847A] mb-1">
                    Discount Percentage (%)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={50}
                    value={newCodeDiscount}
                    onChange={(e) => setNewCodeDiscount(Number(e.target.value))}
                    className="w-full bg-[#FAF8F5] dark:bg-[#1E1B18] border border-[#E5DFD5] dark:border-[#2B2723] px-3.5 py-2 text-xs focus:outline-none focus:border-[#9A7B4F]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#8C847A] mb-1">
                    Minimum Order ($)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={newCodeMinSpend}
                    onChange={(e) => setNewCodeMinSpend(Number(e.target.value))}
                    className="w-full bg-[#FAF8F5] dark:bg-[#1E1B18] border border-[#E5DFD5] dark:border-[#2B2723] px-3.5 py-2 text-xs focus:outline-none focus:border-[#9A7B4F]"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs uppercase tracking-[0.18em] bg-[#161412] text-white dark:bg-[#E4C79B] dark:text-black font-semibold hover:opacity-90 cursor-pointer h-9"
                >
                  Activate Code
                </button>
              </form>
            </div>

            {/* Existing Promos Table */}
            <div className="border border-[#E5DFD5] dark:border-[#2B2723] bg-[#FFFFFF] dark:bg-[#141210]">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E5DFD5] dark:border-[#2B2723] bg-[#FAF8F5] dark:bg-[#1A1816] text-[10px] uppercase tracking-[0.16em] text-[#8C847A]">
                    <th className="p-4">Code</th>
                    <th className="p-4">Discount</th>
                    <th className="p-4">Min. Spend</th>
                    <th className="p-4">Redemptions</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5DFD5] dark:divide-[#2B2723]">
                  {promos.map((pr) => (
                    <tr key={pr.id}>
                      <td className="p-4">
                        <code className="font-mono text-sm font-semibold text-[#9A7B4F] dark:text-[#E4C79B]">
                          {pr.code}
                        </code>
                        <p className="text-[11px] text-[#8C847A]">{pr.note}</p>
                      </td>
                      <td className="p-4 font-semibold">{pr.discountPercent}% OFF</td>
                      <td className="p-4 font-mono">{pr.minSpend > 0 ? `$${pr.minSpend}` : 'None'}</td>
                      <td className="p-4 font-mono">{pr.redemptions} Uses</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 text-[9px] uppercase tracking-wider font-semibold ${
                            pr.active
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                              : 'bg-neutral-500/10 text-neutral-500 border border-neutral-500/30'
                          }`}
                        >
                          {pr.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleTogglePromo(pr.id)}
                          className="text-xs uppercase tracking-wider text-[#9A7B4F] hover:underline cursor-pointer"
                        >
                          {pr.active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: MEMOIRS & REVIEWS CURATION */}
        {activeTab === 'memoirs' && (
          <div className="space-y-6">
            <div className="pb-4 border-b border-[#E5DFD5] dark:border-[#2B2723]">
              <h3 className="font-editorial text-2xl">Curateur des Récits Humains</h3>
              <p className="text-xs text-[#8C847A]">
                Approve, feature, and curate real customer scent memoirs for display in *Les Récits Humains*.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {memoirsList.map((m) => (
                <div
                  key={m.id}
                  className="p-6 bg-[#FFFFFF] dark:bg-[#141210] border border-[#E5DFD5] dark:border-[#2B2723] flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-[#8C847A] mb-2">
                      <span className="font-semibold text-[#161412] dark:text-[#FAF8F5]">{m.author} · {m.city} ({m.profession})</span>
                      <span>{m.year}</span>
                    </div>
                    <p className="text-xs uppercase tracking-wider text-[#9A7B4F] dark:text-[#E4C79B] font-medium mb-1">
                      Perfume Companion: {m.scentWorn}
                    </p>
                    <p className="font-editorial text-lg italic text-[#161412] dark:text-[#FAF8F5] mb-2">
                      &ldquo;{m.quote}&rdquo;
                    </p>
                    <p className="text-xs text-[#8C847A] line-clamp-3">
                      {m.story}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#E5DFD5] dark:border-[#2B2723] flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approved for Public Exhibition</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => showNotice(`Memoir by ${m.author} pinned to featured gallery.`)}
                      className="text-xs uppercase tracking-wider text-[#9A7B4F] hover:underline cursor-pointer"
                    >
                      Pin to Top
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add New Flacon Modal Drawer */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#FAF8F5] dark:bg-[#141210] p-8 border border-[#E5DFD5] dark:border-[#2B2723] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#E5DFD5] dark:border-[#2B2723] mb-6">
              <h3 className="font-editorial text-2xl">Create New Extrait de Parfum</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-xs uppercase tracking-wider text-[#8C847A] hover:text-black dark:hover:text-white cursor-pointer"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleCreateFlacon} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#8C847A] mb-1">
                    Perfume Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newFlaconName}
                    onChange={(e) => setNewFlaconName(e.target.value)}
                    placeholder="e.g. Orgue d'Automne"
                    className="w-full bg-white dark:bg-[#1E1B18] border border-[#E5DFD5] dark:border-[#2B2723] px-3.5 py-2 text-xs focus:outline-none focus:border-[#9A7B4F]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#8C847A] mb-1">
                    Category
                  </label>
                  <select
                    value={newFlaconCategory}
                    onChange={(e) => setNewFlaconCategory(e.target.value as ProductCategory)}
                    className="w-full bg-white dark:bg-[#1E1B18] border border-[#E5DFD5] dark:border-[#2B2723] px-3.5 py-2 text-xs focus:outline-none"
                  >
                    <option value="New Arrivals">New Arrivals</option>
                    <option value="Best Sellers">Best Sellers</option>
                    <option value="Exclusive Collections">Exclusive Collections</option>
                    <option value="Limited Editions">Limited Editions</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#8C847A] mb-1">
                    Fragrance Family
                  </label>
                  <select
                    value={newFlaconFamily}
                    onChange={(e) => setNewFlaconFamily(e.target.value as FragranceFamily)}
                    className="w-full bg-white dark:bg-[#1E1B18] border border-[#E5DFD5] dark:border-[#2B2723] px-3.5 py-2 text-xs focus:outline-none"
                  >
                    <option value="Woody">Woody</option>
                    <option value="Floral">Floral</option>
                    <option value="Oriental">Oriental</option>
                    <option value="Fresh">Fresh</option>
                    <option value="Citrus">Citrus</option>
                    <option value="Gourmand">Gourmand</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#8C847A] mb-1">
                    Price (USD)
                  </label>
                  <input
                    type="number"
                    min={50}
                    max={1000}
                    value={newFlaconPrice}
                    onChange={(e) => setNewFlaconPrice(Number(e.target.value))}
                    className="w-full bg-white dark:bg-[#1E1B18] border border-[#E5DFD5] dark:border-[#2B2723] px-3.5 py-2 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#8C847A] mb-1">
                    Initial Reserve Stock
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={newFlaconStock}
                    onChange={(e) => setNewFlaconStock(Number(e.target.value))}
                    className="w-full bg-white dark:bg-[#1E1B18] border border-[#E5DFD5] dark:border-[#2B2723] px-3.5 py-2 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#8C847A] mb-1">
                  Top Notes (Comma separated)
                </label>
                <input
                  type="text"
                  value={newFlaconTopNotes}
                  onChange={(e) => setNewFlaconTopNotes(e.target.value)}
                  className="w-full bg-white dark:bg-[#1E1B18] border border-[#E5DFD5] dark:border-[#2B2723] px-3.5 py-2 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#8C847A] mb-1">
                  Heart Notes (Comma separated)
                </label>
                <input
                  type="text"
                  value={newFlaconHeartNotes}
                  onChange={(e) => setNewFlaconHeartNotes(e.target.value)}
                  className="w-full bg-white dark:bg-[#1E1B18] border border-[#E5DFD5] dark:border-[#2B2723] px-3.5 py-2 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#8C847A] mb-1">
                  Base Notes (Comma separated)
                </label>
                <input
                  type="text"
                  value={newFlaconBaseNotes}
                  onChange={(e) => setNewFlaconBaseNotes(e.target.value)}
                  className="w-full bg-white dark:bg-[#1E1B18] border border-[#E5DFD5] dark:border-[#2B2723] px-3.5 py-2 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#8C847A] mb-1">
                  Description &amp; Storytelling
                </label>
                <textarea
                  rows={3}
                  value={newFlaconDescription}
                  onChange={(e) => setNewFlaconDescription(e.target.value)}
                  placeholder="The nocturnal aura of autumn leaves and aged bourbon vanilla..."
                  className="w-full bg-white dark:bg-[#1E1B18] border border-[#E5DFD5] dark:border-[#2B2723] p-3 text-xs focus:outline-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2 text-xs uppercase tracking-wider border border-[#E5DFD5] dark:border-[#2B2723] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-xs uppercase tracking-wider bg-[#E4C79B] text-black font-semibold hover:bg-white cursor-pointer"
                >
                  Publish Flacon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
