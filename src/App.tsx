import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { Search, X } from 'lucide-react';
import { INITIAL_PERFUMES } from './data/perfumes';
import {
  AddressRecord,
  CartItem,
  FragranceFamily,
  NotificationItem,
  OrderRecord,
  PerfumeProduct,
  ProductCategory,
  QuizAnswers,
  UserPreferences,
  UserPrivateProfile,
} from './types/perfume';
import { auth, googleProvider, testFirestoreConnection } from './lib/firebase';
import {
  deletePersistentCartItem,
  ensureUserDocuments,
  fetchPersistentCart,
  fetchProductsCatalog,
  fetchUserAddresses,
  fetchUserOrders,
  savePersistentCartItem,
  subscribeNotifications,
  syncCatalogAsAdmin,
  updateUserPreferences,
} from './lib/storeService';
import { Navbar, AppPage } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { LifeChaptersPage } from './pages/LifeChaptersPage';
import { MemoryVaultPage } from './pages/MemoryVaultPage';
import { DailyRitualsPage } from './pages/DailyRitualsPage';
import { CollectionsPage } from './pages/CollectionsPage';
import { HumanMemoirsPage } from './pages/HumanMemoirsPage';
import { BotanicalDiscoveryPage } from './pages/BotanicalDiscoveryPage';
import { ScentQuizPage } from './pages/ScentQuizPage';
import { ClientDashboardPage } from './pages/ClientDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { FloatingQuickOrder } from './components/FloatingQuickOrder';
import { ProductDetailModal } from './components/ProductDetailModal';
import { UnboxingExperienceModal } from './components/UnboxingExperienceModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { AccountDashboard } from './components/AccountDashboard';
import { CustomerSupportWidget } from './components/CustomerSupportWidget';
import { Footer } from './components/Footer';

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('maison_leonie_theme');
      if (saved === 'dark' || saved === 'light') return saved;
    }
    return 'light';
  });
  const [isScrolled, setIsScrolled] = useState(false);

  const [products, setProducts] = useState<PerfumeProduct[]>(INITIAL_PERFUMES);
  const [user, setUser] = useState<User | null>(null);
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [privateProfile, setPrivateProfile] = useState<UserPrivateProfile | null>(null);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [addresses, setAddresses] = useState<AddressRecord[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Guest-compatible local states synced with Firestore when signed in
  const [cart, setCart] = useState<CartItem[]>([]);
  const [guestWishlist, setGuestWishlist] = useState<string[]>([]);
  const [guestRecentlyViewed, setGuestRecentlyViewed] = useState<string[]>([]);

  // Catalog filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | ProductCategory>('All');
  const [selectedFamily, setSelectedFamily] = useState<'All' | FragranceFamily>('All');
  const [selectedNote, setSelectedNote] = useState('');

  // Modals & Drawers
  const [activeProduct, setActiveProduct] = useState<PerfumeProduct | null>(null);
  const [unboxingProduct, setUnboxingProduct] = useState<PerfumeProduct | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [overlayQuery, setOverlayQuery] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Sync dark mode class on <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    window.localStorage.setItem('maison_leonie_theme', theme);
  }, [theme]);

  // Scroll listener for navbar transition
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Boot: test Firestore connection & load catalog + check shared ?scent= param
  useEffect(() => {
    testFirestoreConnection();
    fetchProductsCatalog()
      .then((catalog) => {
        setProducts(catalog);
        const params = new URLSearchParams(window.location.search);
        const scentSlug = params.get('scent');
        if (scentSlug) {
          const found = catalog.find((p) => p.slug === scentSlug);
          if (found) setActiveProduct(found);
        }
      })
      .catch(() => {});
  }, []);

  // Auth state listener & Firestore hydration
  useEffect(() => {
    let unsubNotifs: (() => void) | null = null;
    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (unsubNotifs) {
        unsubNotifs();
        unsubNotifs = null;
      }
      if (!firebaseUser) {
        setPrefs(null);
        setPrivateProfile(null);
        setOrders([]);
        setAddresses([]);
        setNotifications([]);
        return;
      }

      try {
        const { prefs: loadedPrefs, privateProfile: loadedPriv } =
          await ensureUserDocuments(firebaseUser);
        setPrefs(loadedPrefs);
        setPrivateProfile(loadedPriv);
        if (loadedPrefs.theme) {
          setTheme(loadedPrefs.theme);
        }
        if (loadedPrefs.role === 'admin') {
          syncCatalogAsAdmin(INITIAL_PERFUMES)
            .then(() => fetchProductsCatalog().then(setProducts))
            .catch(() => {});
        }

        const [loadedOrders, loadedAddresses, loadedCart] = await Promise.all([
          fetchUserOrders(firebaseUser.uid, loadedPrefs.role === 'admin'),
          fetchUserAddresses(firebaseUser.uid),
          fetchPersistentCart(firebaseUser.uid),
        ]);

        setOrders(loadedOrders);
        setAddresses(loadedAddresses);

        // Merge guest cart items into persistent cart if present
        setCart((prevGuestCart) => {
          const mergedMap = new Map<string, CartItem>();
          for (const item of loadedCart) mergedMap.set(item.id, item);
          for (const guestItem of prevGuestCart) {
            const existing = mergedMap.get(guestItem.id);
            const nextItem = existing
              ? { ...existing, quantity: existing.quantity + guestItem.quantity }
              : guestItem;
            mergedMap.set(guestItem.id, nextItem);
            savePersistentCartItem(firebaseUser.uid, nextItem).catch(() => {});
          }
          return Array.from(mergedMap.values());
        });

        unsubNotifs = subscribeNotifications(firebaseUser.uid, (list) => {
          setNotifications(list);
        });
      } catch (err) {
        console.error(err);
      }
    });

    return () => {
      unsubAuth();
      if (unsubNotifs) unsubNotifs();
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    window.setTimeout(() => setToastMsg(null), 2600);
  };

  const handleToggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    if (user && prefs) {
      setPrefs({ ...prefs, theme: next });
      updateUserPreferences(user.uid, { theme: next }).catch(() => {});
    }
  };

  const handleSignInGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      showToast('Welcome to Maison Léonie.');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Sign-in cancelled.');
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setIsAccountOpen(false);
    showToast('Signed out securely.');
  };

  const activeWishlistIds = prefs ? prefs.wishlistIds : guestWishlist;
  const activeRecentlyViewedIds = prefs ? prefs.recentlyViewedIds : guestRecentlyViewed;

  const handleToggleWishlist = async (productId: string) => {
    const exists = activeWishlistIds.includes(productId);
    const next = exists
      ? activeWishlistIds.filter((id) => id !== productId)
      : [productId, ...activeWishlistIds].slice(0, 50);

    if (user && prefs) {
      setPrefs({ ...prefs, wishlistIds: next });
      await updateUserPreferences(user.uid, { wishlistIds: next });
    } else {
      setGuestWishlist(next);
    }
    showToast(exists ? 'Removed from wishlist.' : 'Saved to wishlist.');
  };

  const handleViewProduct = (product: PerfumeProduct) => {
    setActiveProduct(product);
    const nextViewed = [
      product.id,
      ...activeRecentlyViewedIds.filter((id) => id !== product.id),
    ].slice(0, 12);

    if (user && prefs) {
      setPrefs({ ...prefs, recentlyViewedIds: nextViewed });
      updateUserPreferences(user.uid, { recentlyViewedIds: nextViewed }).catch(() => {});
    } else {
      setGuestRecentlyViewed(nextViewed);
    }
  };

  const handleAddToCart = async (
    product: PerfumeProduct,
    volumeMl = product.volumeMl,
    unitPrice?: number,
    engraving?: string
  ) => {
    if (product.stockCount <= 0) {
      handleViewProduct(product);
      return;
    }
    const resolvedPrice =
      unitPrice ??
      (product.id === 'coffret-decouverte'
        ? product.price
        : Math.round(
            product.price * (volumeMl === 50 ? 0.72 : volumeMl === 200 ? 1.55 : 1)
          ));
    const cleanEngraving = engraving?.trim();
    const itemId = cleanEngraving
      ? `${product.id}-${volumeMl}-${cleanEngraving.replace(/[^a-zA-Z0-9]/g, '').slice(0, 12)}`
      : `${product.id}-${volumeMl}`;

    const existing = cart.find((i) => i.id === itemId);
    const nextItem: CartItem = existing
      ? { ...existing, quantity: Math.min(25, existing.quantity + 1) }
      : {
          id: itemId,
          productId: product.id,
          productName: product.name,
          brand: product.brand,
          image: product.images[0],
          volumeMl,
          unitPrice: resolvedPrice,
          quantity: 1,
          engraving: cleanEngraving,
        };

    setCart((prev) =>
      existing
        ? prev.map((i) => (i.id === itemId ? nextItem : i))
        : [...prev, nextItem]
    );
    if (user) {
      savePersistentCartItem(user.uid, nextItem).catch(() => {});
    }
    showToast(
      cleanEngraving
        ? `Added ${product.name} (Engraved: "${cleanEngraving}") to your bag.`
        : `Added ${product.name} (${volumeMl} ml) to your bag.`
    );
  };

  const handleExpressOrder = async (
    product: PerfumeProduct,
    volumeMl = product.volumeMl,
    unitPrice?: number,
    engraving?: string
  ) => {
    await handleAddToCart(product, volumeMl, unitPrice, engraving);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleCopyPromo = (code: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code).catch(() => {});
    }
    showToast(`Privilege code ${code} copied & ready at checkout!`);
  };

  const handleUpdateQty = async (itemId: string, delta: number) => {
    const target = cart.find((i) => i.id === itemId);
    if (!target) return;
    const nextQty = target.quantity + delta;
    if (nextQty <= 0) {
      await handleRemoveCartItem(itemId);
      return;
    }
    const updated = { ...target, quantity: Math.min(25, nextQty) };
    setCart((prev) => prev.map((i) => (i.id === itemId ? updated : i)));
    if (user) {
      savePersistentCartItem(user.uid, updated).catch(() => {});
    }
  };

  const handleRemoveCartItem = async (itemId: string) => {
    setCart((prev) => prev.filter((i) => i.id !== itemId));
    if (user) {
      deletePersistentCartItem(user.uid, itemId).catch(() => {});
    }
  };

  const handleSaveQuizProfile = async (answers: QuizAnswers, summary: string) => {
    if (!user || !prefs) return;
    const updates = {
      preferredFamilies: answers.families,
      favoriteNotes: answers.notes,
      quizSummary: summary,
    };
    setPrefs({ ...prefs, ...updates });
    await updateUserPreferences(user.uid, updates);
  };

  const handleReorderItems = async (order: OrderRecord) => {
    for (const item of order.items) {
      const product = products.find((p) => p.id === item.productId);
      if (product && product.stockCount > 0) {
        await handleAddToCart(product, item.volumeMl, item.unitPrice);
      }
    }
    setIsAccountOpen(false);
    setIsCartOpen(true);
  };

  const getInitialPage = (): AppPage => {
    if (typeof window === 'undefined') return 'home';
    const path = window.location.pathname.replace(/^\/+/, '').split('/')[0];
    const validPages: AppPage[] = [
      'home',
      'chapters',
      'memory-vault',
      'rituals',
      'collections',
      'memoirs',
      'discovery',
      'quiz',
      'client',
      'admin',
    ];
    if (validPages.includes(path as AppPage)) return path as AppPage;
    const pageParam = new URLSearchParams(window.location.search).get('page');
    if (pageParam && validPages.includes(pageParam as AppPage)) return pageParam as AppPage;
    return 'home';
  };

  const [currentPage, setCurrentPage] = useState<AppPage>(getInitialPage);

  const handleNavigatePage = (page: AppPage | string) => {
    const validPages: AppPage[] = [
      'home',
      'chapters',
      'memory-vault',
      'rituals',
      'collections',
      'memoirs',
      'discovery',
      'quiz',
      'client',
      'admin',
    ];
    const targetPage: AppPage = validPages.includes(page as AppPage)
      ? (page as AppPage)
      : 'home';

    setCurrentPage(targetPage);
    if (typeof window !== 'undefined') {
      const targetUrl = targetPage === 'home' ? '/' : `/${targetPage}`;
      window.history.pushState({ page: targetPage }, '', targetUrl);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const onPopState = (event: PopStateEvent) => {
      if (event.state && event.state.page) {
        setCurrentPage(event.state.page);
      } else {
        setCurrentPage(getInitialPage());
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const totalBagCount = cart.reduce((s, i) => s + i.quantity, 0);
  const wishlistProducts = products.filter((p) => activeWishlistIds.includes(p.id));
  const purchasedIds = new Set(orders.flatMap((o) => o.items.map((i) => i.productId)));

  const overlaySearchMatches = overlayQuery.trim()
    ? products.filter((p) =>
        [p.name, p.brand, p.fragranceFamily, ...p.topNotes, ...p.heartNotes, ...p.baseNotes]
          .join(' ')
          .toLowerCase()
          .includes(overlayQuery.trim().toLowerCase())
      )
    : products.slice(0, 4);

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0E0D0C] text-[#161412] dark:text-[#F4F0EA] transition-colors duration-300">
      <Navbar
        cartCount={totalBagCount}
        isScrolled={isScrolled}
        activePage={currentPage}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAccount={() => setIsAccountOpen(true)}
        onNavigatePage={handleNavigatePage}
        userDisplayName={privateProfile?.fullName || user?.displayName}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onCopyPromo={handleCopyPromo}
        onInstantOrder={() => {
          if (currentPage !== 'home') {
            handleNavigatePage('home');
            setTimeout(() => {
              const el = document.getElementById('express-order-ribbon');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          } else {
            const el = document.getElementById('express-order-ribbon');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      />

      <main className="transition-opacity duration-300">
        {currentPage === 'home' && (
          <HomePage
            products={products}
            onExpressOrder={(p, vol, price, eng) => handleExpressOrder(p, vol, price, eng)}
            onAddToCart={(p, vol, price, eng) => handleAddToCart(p, vol, price, eng)}
            onViewProduct={handleViewProduct}
            onNavigatePage={handleNavigatePage}
            onCopyPromo={handleCopyPromo}
            onOpenUnboxing={(p) => setUnboxingProduct(p)}
            onChooseFamily={(fam) => {
              setSelectedFamily(fam);
              handleNavigatePage('collections');
            }}
          />
        )}

        {currentPage === 'chapters' && (
          <LifeChaptersPage
            products={products}
            onAddToCartWithEngraving={(p, engraving) =>
              handleAddToCart(p, p.volumeMl, undefined, engraving)
            }
            onViewProduct={handleViewProduct}
            onNavigatePage={handleNavigatePage}
          />
        )}

        {currentPage === 'memory-vault' && (
          <MemoryVaultPage
            products={products}
            onViewProduct={handleViewProduct}
            onAddToCart={(p) => handleAddToCart(p)}
            onNavigatePage={handleNavigatePage}
          />
        )}

        {currentPage === 'rituals' && (
          <DailyRitualsPage
            products={products}
            onViewProduct={handleViewProduct}
            onAddToCart={(p) => handleAddToCart(p)}
            onNavigatePage={handleNavigatePage}
          />
        )}

        {currentPage === 'collections' && (
          <CollectionsPage
            products={products}
            wishlistIds={activeWishlistIds}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedFamily={selectedFamily}
            onFamilyChange={setSelectedFamily}
            selectedNote={selectedNote}
            onNoteChange={setSelectedNote}
            onToggleWishlist={handleToggleWishlist}
            onQuickView={handleViewProduct}
            onAddToCart={(p, vol) => handleAddToCart(p, vol)}
            onExpressOrder={(p, vol) => handleExpressOrder(p, vol)}
            onNavigatePage={handleNavigatePage}
          />
        )}

        {currentPage === 'memoirs' && (
          <HumanMemoirsPage
            products={products}
            onViewProduct={handleViewProduct}
            onNavigatePage={handleNavigatePage}
          />
        )}

        {currentPage === 'discovery' && (
          <BotanicalDiscoveryPage
            products={products}
            onSelectNoteFilter={(note) => {
              setSelectedNote(note);
              handleNavigatePage('collections');
            }}
            onSelectFamilyFilter={(fam) => {
              setSelectedFamily(fam);
              handleNavigatePage('collections');
            }}
            onViewProduct={handleViewProduct}
            onNavigatePage={handleNavigatePage}
          />
        )}

        {currentPage === 'quiz' && (
          <ScentQuizPage
            products={products}
            onAddToCart={(p) => handleAddToCart(p)}
            onViewProduct={handleViewProduct}
            onSaveQuizProfile={user ? handleSaveQuizProfile : undefined}
            onNavigatePage={handleNavigatePage}
          />
        )}

        {currentPage === 'client' && (
          <ClientDashboardPage
            user={user}
            prefs={prefs}
            privateProfile={privateProfile}
            orders={orders}
            addresses={addresses}
            notifications={notifications}
            products={products}
            wishlistIds={activeWishlistIds}
            onNavigatePage={handleNavigatePage}
            onSignInGoogle={handleSignInGoogle}
            onSignOut={handleSignOut}
            onUpdatePrefsLocal={(updates) =>
              setPrefs((prev) => (prev ? { ...prev, ...updates } : prev))
            }
            onUpdatePrivateLocal={(updates) =>
              setPrivateProfile((prev) => (prev ? { ...prev, ...updates } : prev))
            }
            onAddressesChanged={setAddresses}
            onReorderItems={handleReorderItems}
            onViewProduct={handleViewProduct}
            onAddToCart={(p, vol) => handleAddToCart(p, vol)}
            onToggleWishlist={handleToggleWishlist}
          />
        )}

        {currentPage === 'admin' && (
          <AdminDashboardPage
            user={user}
            prefs={prefs}
            orders={orders}
            products={products}
            onNavigatePage={handleNavigatePage}
            onProductsChanged={setProducts}
            onOrdersChanged={setOrders}
          />
        )}
      </main>

      <Footer
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onNavigatePage={handleNavigatePage}
        onOpenAccount={() => setIsAccountOpen(true)}
      />

      {/* Editorial Quick Search Overlay */}
      {isSearchOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Search Maison Léonie"
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center p-4 sm:p-10"
        >
          <div className="w-full max-w-2xl bg-[#FAF8F5] dark:bg-[#12100E] border border-[#E5DFD5] dark:border-[#2B2723] p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#E5DFD5] dark:border-[#2B2723]">
              <div className="flex items-center gap-3 flex-1">
                <Search className="w-4 h-4 text-[#9A7B4F]" aria-hidden="true" />
                <input
                  type="search"
                  autoFocus
                  value={overlayQuery}
                  onChange={(e) => setOverlayQuery(e.target.value)}
                  placeholder="Search by perfume, ingredient (e.g. Jasmine, Oud), or family..."
                  className="w-full bg-transparent text-base focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                aria-label="Close search overlay"
                className="p-2 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="pt-5 space-y-3 max-h-[360px] overflow-y-auto">
              {overlaySearchMatches.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setIsSearchOpen(false);
                    handleViewProduct(p);
                  }}
                  className="w-full p-3 flex items-center gap-4 text-left border border-transparent hover:border-[#E5DFD5] dark:hover:border-[#2B2723] hover:bg-[#FFFFFF] dark:hover:bg-[#171513] transition-colors cursor-pointer"
                >
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    referrerPolicy="no-referrer"
                    className="w-12 h-14 object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-editorial text-xl truncate">{p.name}</p>
                    <p className="text-xs text-[#6B655E] dark:text-[#A39C93] truncate">
                      {p.brand} · {p.fragranceFamily} · {p.topNotes.join(', ')}
                    </p>
                  </div>
                  <span className="text-sm tabular-nums">${p.price}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <ProductDetailModal
        product={activeProduct}
        user={user}
        isWishlisted={activeProduct ? activeWishlistIds.includes(activeProduct.id) : false}
        hasPurchased={activeProduct ? purchasedIds.has(activeProduct.id) : false}
        onClose={() => setActiveProduct(null)}
        onToggleWishlist={handleToggleWishlist}
        onAddToCart={(p, vol, price, engraving) => handleAddToCart(p, vol, price, engraving)}
        onExpressCheckout={(p, vol, price, engraving) =>
          handleExpressOrder(p, vol, price, engraving)
        }
        onOpenUnboxing={(p) => setUnboxingProduct(p)}
        onRequireAuth={() => {
          setActiveProduct(null);
          setIsAccountOpen(true);
        }}
      />

      <UnboxingExperienceModal
        isOpen={Boolean(unboxingProduct)}
        product={unboxingProduct}
        onClose={() => setUnboxingProduct(null)}
        onExpressOrder={(p, vol, price, eng) => handleExpressOrder(p, vol, price, eng)}
        onAddToCart={(p, vol, price, eng) => handleAddToCart(p, vol, price, eng)}
      />

      <CartDrawer
        isOpen={isCartOpen}
        items={cart}
        wishlistProducts={wishlistProducts}
        onClose={() => setIsCartOpen(false)}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveCartItem}
        onMoveWishlistToCart={(p) => handleAddToCart(p)}
        onRemoveWishlist={handleToggleWishlist}
        onProceedCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        user={user}
        items={cart}
        addresses={addresses}
        onClose={() => setIsCheckoutOpen(false)}
        onRequireAuth={() => {
          setIsCheckoutOpen(false);
          setIsAccountOpen(true);
        }}
        onOrderComplete={(order) => {
          setCart([]);
          setOrders((prev) => [order, ...prev]);
        }}
      />

      <AccountDashboard
        isOpen={isAccountOpen}
        user={user}
        prefs={prefs}
        privateProfile={privateProfile}
        orders={orders}
        addresses={addresses}
        notifications={notifications}
        products={products}
        onClose={() => setIsAccountOpen(false)}
        onSignInGoogle={handleSignInGoogle}
        onSignOut={handleSignOut}
        onUpdatePrefsLocal={(updates) =>
          setPrefs((prev) => (prev ? { ...prev, ...updates } : prev))
        }
        onUpdatePrivateLocal={(updates) =>
          setPrivateProfile((prev) => (prev ? { ...prev, ...updates } : prev))
        }
        onAddressesChanged={setAddresses}
        onReorderItems={handleReorderItems}
        onViewProduct={(p) => {
          setIsAccountOpen(false);
          handleViewProduct(p);
        }}
        onProductsChanged={setProducts}
        onOrdersChanged={setOrders}
      />

      <FloatingQuickOrder
        cart={cart}
        products={products}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenCheckout={() => setIsCheckoutOpen(true)}
        onExpressOrder={(p, vol) => handleExpressOrder(p, vol)}
        onCopyPromo={handleCopyPromo}
      />

      <CustomerSupportWidget
        user={user}
        isAdmin={prefs?.role === 'admin'}
        onRequireAuth={() => setIsAccountOpen(true)}
      />

      {/* Subtle Toast Confirmation */}
      {toastMsg && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 left-5 z-50 px-5 py-3 bg-[#161412] text-[#FAF8F5] dark:bg-[#C8A97E] dark:text-[#0E0D0C] text-xs tracking-[0.12em] uppercase shadow-lg"
        >
          {toastMsg}
        </div>
      )}
    </div>
  );
}
