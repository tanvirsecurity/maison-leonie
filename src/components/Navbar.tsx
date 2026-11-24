import React, { useEffect, useState } from 'react';
import {
  Menu,
  Moon,
  Search,
  ShoppingBag,
  Sparkles,
  Sun,
  User,
  Volume2,
  VolumeX,
  X,
  Zap,
} from 'lucide-react';
import { atelierAudio } from '../lib/audioAtmosphere';

export type AppPage =
  | 'home'
  | 'chapters'
  | 'memory-vault'
  | 'rituals'
  | 'collections'
  | 'memoirs'
  | 'discovery'
  | 'quiz'
  | 'client'
  | 'admin';

interface NavbarProps {
  cartCount: number;
  isScrolled: boolean;
  activePage: AppPage;
  onOpenCart: () => void;
  onOpenSearch: () => void;
  onOpenAccount: () => void;
  onNavigatePage: (page: AppPage) => void;
  userDisplayName?: string | null;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  onCopyPromo?: (code: string) => void;
  onInstantOrder?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  isScrolled,
  activePage,
  onOpenCart,
  onOpenSearch,
  onOpenAccount,
  onNavigatePage,
  userDisplayName,
  theme,
  onToggleTheme,
  onCopyPromo,
  onInstantOrder,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAudioActive, setIsAudioActive] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    const unsub = atelierAudio.subscribe((playing) => setIsAudioActive(playing));
    return unsub;
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLinkClick = (page: AppPage) => {
    setMobileOpen(false);
    onNavigatePage(page);
  };

  const handleToggleAudio = () => {
    atelierAudio.toggle();
  };

  const handleCopyCode = () => {
    if (onCopyPromo) {
      onCopyPromo('LEONIE15');
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText('LEONIE15').catch(() => {});
    }
    setCopiedCode(true);
    atelierAudio.playChime(880, 0.12);
    setTimeout(() => setCopiedCode(false), 2400);
  };

  return (
    <header className="fixed top-0 inset-x-0 z-40 transition-all duration-300">
      {/* Top Luxury Privilege Micro-Bar */}
      <div
        className={`w-full py-1.5 px-6 lg:px-10 text-[10px] tracking-[0.22em] uppercase transition-all duration-300 ${
          isScrolled
            ? 'bg-[#12100E] text-[#D8C7B0] border-b border-[#2B2723]/60'
            : 'bg-black/80 text-[#E5DFD5] backdrop-blur-sm border-b border-white/10'
        }`}
      >
        <div className="max-w-[1360px] mx-auto flex items-center justify-between gap-4">
          <div className="hidden sm:flex items-center gap-2 text-[#C8A97E]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C8A97E]" />
            <span>Rue Saint-Honoré, Paris · Domaine de Grasse</span>
          </div>

          <div className="flex-1 text-center truncate">
            <span className="text-[#FAF8F5]/90">Complimentary Courier over $220 · Code </span>
            <button
              type="button"
              onClick={handleCopyCode}
              className="inline-flex items-center gap-1 font-semibold text-[#E4C79B] underline decoration-dotted hover:text-white transition-colors cursor-pointer"
              title="Click to copy 15% off promo code"
            >
              <span>LEONIE15</span>
              {copiedCode && <span className="text-[#73BA82] text-[9px] font-normal">[Copied!]</span>}
            </button>
            <span className="text-[#FAF8F5]/90"> for -15%</span>
          </div>

          <div className="hidden md:flex items-center gap-3 text-[#C8A97E]">
            <button
              type="button"
              onClick={() => handleLinkClick('client')}
              className={`hover:text-white transition-colors cursor-pointer text-[9.5px] uppercase tracking-wider ${
                activePage === 'client' ? 'text-white font-semibold underline' : ''
              }`}
            >
              Salon Privé
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => handleLinkClick('admin')}
              className={`hover:text-[#E4C79B] transition-colors cursor-pointer text-[9.5px] uppercase tracking-wider ${
                activePage === 'admin' ? 'text-[#E4C79B] font-semibold underline' : ''
              }`}
            >
              Atelier Admin
            </button>
            <span>·</span>
            {onToggleTheme && (
              <button
                type="button"
                onClick={onToggleTheme}
                className="hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-[9.5px]"
                title="Toggle Theme"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-3 h-3 text-[#E4C79B]" />
                    <span>Ivory</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3 h-3 text-[#E4C79B]" />
                    <span>Noir</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Luxury Navigation Bar */}
      <div
        className={`transition-all duration-300 ${
          !isScrolled && activePage === 'home'
            ? 'bg-gradient-to-b from-black/85 via-black/45 to-transparent text-[#FAF8F5]'
            : 'bg-[#12100E]/98 dark:bg-[#0E0D0C]/98 backdrop-blur-xl border-b border-[#2B2723] text-[#FAF8F5] shadow-md'
        }`}
      >
        <div
          className={`max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 transition-[height] duration-300 ${
            isScrolled ? 'h-16' : 'h-20'
          }`}
        >
          {/* Left: Dedicated Page Navigation */}
          <nav
            aria-label="Story & Discovery Navigation"
            className="hidden xl:flex items-center gap-3.5 2xl:gap-5 text-[10px] 2xl:text-[11px] tracking-[0.16em] 2xl:tracking-[0.2em] uppercase font-medium shrink min-w-0"
          >
            <button
              type="button"
              onClick={() => handleLinkClick('home')}
              className={`whitespace-nowrap shrink-0 py-1 border-b transition-colors cursor-pointer ${
                activePage === 'home'
                  ? 'border-[#C8A97E] text-[#E4C79B] font-semibold'
                  : 'border-transparent hover:border-[#C8A97E]'
              }`}
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => handleLinkClick('chapters')}
              className={`whitespace-nowrap shrink-0 py-1 border-b transition-colors cursor-pointer ${
                activePage === 'chapters'
                  ? 'border-[#C8A97E] text-[#E4C79B] font-semibold'
                  : 'border-transparent hover:border-[#C8A97E]'
              }`}
            >
              Life Chapters
            </button>
            <button
              type="button"
              onClick={() => handleLinkClick('memory-vault')}
              className={`whitespace-nowrap shrink-0 py-1 border-b transition-colors cursor-pointer ${
                activePage === 'memory-vault'
                  ? 'border-[#C8A97E] text-[#E4C79B] font-semibold'
                  : 'border-transparent hover:border-[#C8A97E]'
              }`}
            >
              Memory Vault
            </button>
            <button
              type="button"
              onClick={() => handleLinkClick('rituals')}
              className={`whitespace-nowrap shrink-0 py-1 border-b transition-colors cursor-pointer ${
                activePage === 'rituals'
                  ? 'border-[#C8A97E] text-[#E4C79B] font-semibold'
                  : 'border-transparent hover:border-[#C8A97E]'
              }`}
            >
              Daily Rituals
            </button>
            <button
              type="button"
              onClick={() => handleLinkClick('collections')}
              className={`whitespace-nowrap shrink-0 py-1 border-b transition-colors cursor-pointer ${
                activePage === 'collections'
                  ? 'border-[#C8A97E] text-[#E4C79B] font-semibold'
                  : 'border-transparent hover:border-[#C8A97E]'
              }`}
            >
              The Flacons
            </button>
          </nav>

          {/* Center: Crowned Brand Wordmark (Protected with shrink-0 & whitespace-nowrap) */}
          <button
            type="button"
            onClick={() => handleLinkClick('home')}
            className="group flex flex-col items-center justify-center text-center cursor-pointer shrink-0 whitespace-nowrap px-2 z-10 focus-visible:outline-2 focus-visible:outline-[#C8A97E]"
          >
            <span className="font-editorial text-xl sm:text-2xl tracking-[0.22em] uppercase font-normal leading-tight whitespace-nowrap group-hover:text-[#E4C79B] transition-colors">
              Maison Léonie
            </span>
            <span className="text-[7.5px] sm:text-[8px] tracking-[0.28em] uppercase font-sans text-[#C8A97E] mt-0.5 whitespace-nowrap opacity-90 group-hover:opacity-100 transition-opacity">
              Haute Parfumerie · Paris &amp; Grasse
            </span>
          </button>

          {/* Right: Atelier Audio + Search + Salon + 1-Click Order + Bag */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Atelier Audio Atmosphere Toggle */}
            <button
              type="button"
              onClick={handleToggleAudio}
              title={isAudioActive ? 'Mute Atelier Atmosphere' : 'Immerse in French Rain & Crystal Soundscape'}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] tracking-[0.14em] uppercase border transition-colors cursor-pointer shrink-0 ${
                isAudioActive
                  ? 'border-[#E4C79B] text-[#E4C79B] bg-[#E4C79B]/15 shadow-[0_0_12px_rgba(228,199,155,0.25)]'
                  : 'border-white/30 text-white/80 hover:border-white hover:text-white'
              }`}
            >
              {isAudioActive ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-[#E4C79B]" />
                  <span className="hidden 2xl:inline">Sound</span>
                  <span className="inline-flex gap-0.5 items-end h-2.5">
                    <span className="w-0.5 h-1.5 bg-[#E4C79B] animate-bounce" />
                    <span className="w-0.5 h-2.5 bg-[#E4C79B] animate-bounce delay-75" />
                    <span className="w-0.5 h-1 bg-[#E4C79B] animate-bounce delay-150" />
                  </span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
                  <span className="hidden 2xl:inline">Atmosphere</span>
                </>
              )}
            </button>

            {/* Search */}
            <button
              type="button"
              onClick={onOpenSearch}
              className={`p-2 border transition-colors cursor-pointer ${
                isScrolled
                  ? 'border-transparent text-[#161412] dark:text-[#FAF8F5] hover:text-[#C8A97E]'
                  : 'border-transparent text-white/90 hover:text-white'
              }`}
              title="Search Catalog"
              aria-label="Search Catalog"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Account / Private Salon */}
            <button
              type="button"
              onClick={() => handleLinkClick('client')}
              className={`hidden sm:inline-flex items-center gap-1.5 p-2 border transition-colors cursor-pointer text-xs ${
                activePage === 'client'
                  ? 'border-[#C8A97E] text-[#E4C79B] font-semibold'
                  : isScrolled
                  ? 'border-transparent text-[#161412] dark:text-[#FAF8F5] hover:text-[#C8A97E]'
                  : 'border-transparent text-white/90 hover:text-white'
              }`}
              title="Private Salon (Client Dashboard)"
              aria-label="Private Salon Account"
            >
              <User className="w-4 h-4" />
              {userDisplayName ? (
                <span className="text-[10px] uppercase tracking-wider max-w-[80px] truncate hidden md:inline">
                  {userDisplayName.split(' ')[0]}
                </span>
              ) : (
                <span className="text-[10px] uppercase tracking-wider hidden md:inline">Salon</span>
              )}
            </button>

            {/* 1-Click Order Direct Jump Button */}
            <button
              type="button"
              onClick={() => {
                if (onInstantOrder) onInstantOrder();
                else handleLinkClick('collections');
              }}
              className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#E4C79B] text-[#0E0D0C] hover:bg-[#FAF8F5] transition-colors text-[10px] tracking-[0.2em] uppercase font-semibold cursor-pointer shadow-sm"
              title="Order in 1 Look"
            >
              <Zap className="w-3 h-3 text-[#0E0D0C]" />
              <span>Order in 1 Look</span>
            </button>

            {/* Bag Button */}
            <button
              type="button"
              onClick={onOpenCart}
              aria-label={`Open shopping bag with ${cartCount} items`}
              className={`inline-flex items-center gap-2 px-3 py-1.5 text-[10px] tracking-[0.18em] uppercase whitespace-nowrap shrink-0 border transition-colors cursor-pointer ${
                cartCount > 0
                  ? 'border-[#E4C79B] bg-[#E4C79B]/10 text-[#E4C79B]'
                  : isScrolled
                  ? 'border-[#161412]/20 dark:border-[#C8A97E]/30 text-[#161412] dark:text-[#FAF8F5] hover:border-[#C8A97E]'
                  : 'border-white/30 text-white hover:border-[#E4C79B]'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="tabular-nums font-medium">({cartCount})</span>
            </button>

            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              className="xl:hidden p-2 min-w-[36px] min-h-[36px] inline-flex items-center justify-center cursor-pointer"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Editorial Mobile Menu Drawer */}
      {mobileOpen && (
        <div className="xl:hidden bg-[#FAF8F5]/98 dark:bg-[#0E0D0C]/98 backdrop-blur-2xl text-[#161412] dark:text-[#F4F0EA] border-b border-[#E5DFD5] dark:border-[#2B2723] px-6 py-8 flex flex-col gap-5 text-xs tracking-[0.18em] uppercase shadow-2xl">
          {/* Quick Order Banner in Menu */}
          <button
            type="button"
            onClick={() => handleLinkClick('collections')}
            className="w-full py-3 px-4 bg-[#E4C79B] text-[#0E0D0C] flex items-center justify-between font-semibold tracking-[0.2em] shadow-md"
          >
            <span className="inline-flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span>Order in 1 Look</span>
            </span>
            <span className="text-[10px] tracking-normal font-sans">Immediate Dispatch &rarr;</span>
          </button>

          <div className="pt-2 space-y-3">
            <p className="text-[10px] tracking-[0.24em] text-[#9A7B4F] dark:text-[#C8A97E] uppercase font-semibold">
              Separate Dedicated Pages
            </p>
            <button
              type="button"
              onClick={() => handleLinkClick('home')}
              className={`w-full text-left py-2 border-b border-[#E5DFD5] dark:border-[#26221E] ${
                activePage === 'home' ? 'text-[#E4C79B] font-semibold' : ''
              }`}
            >
              Home · Maison Léonie
            </button>
            <button
              type="button"
              onClick={() => handleLinkClick('chapters')}
              className={`w-full text-left py-2 border-b border-[#E5DFD5] dark:border-[#26221E] ${
                activePage === 'chapters' ? 'text-[#E4C79B] font-semibold' : ''
              }`}
            >
              Chapter I–VI · Life Chapters Page
            </button>
            <button
              type="button"
              onClick={() => handleLinkClick('memory-vault')}
              className={`w-full text-left py-2 border-b border-[#E5DFD5] dark:border-[#26221E] ${
                activePage === 'memory-vault' ? 'text-[#E4C79B] font-semibold' : ''
              }`}
            >
              Memory Vault (Proustian Prescription Page)
            </button>
            <button
              type="button"
              onClick={() => handleLinkClick('rituals')}
              className={`w-full text-left py-2 border-b border-[#E5DFD5] dark:border-[#26221E] ${
                activePage === 'rituals' ? 'text-[#E4C79B] font-semibold' : ''
              }`}
            >
              Daily 24H Rituals &amp; Scent Layering Page
            </button>
            <button
              type="button"
              onClick={() => handleLinkClick('collections')}
              className={`w-full text-left py-2 border-b border-[#E5DFD5] dark:border-[#26221E] ${
                activePage === 'collections' ? 'text-[#E4C79B] font-semibold' : ''
              }`}
            >
              Complete Flacon Archive Page
            </button>
            <button
              type="button"
              onClick={() => handleLinkClick('memoirs')}
              className={`w-full text-left py-2 border-b border-[#E5DFD5] dark:border-[#26221E] ${
                activePage === 'memoirs' ? 'text-[#E4C79B] font-semibold' : ''
              }`}
            >
              Human Memoirs &amp; Real Stories Page
            </button>
            <button
              type="button"
              onClick={() => handleLinkClick('discovery')}
              className={`w-full text-left py-2 border-b border-[#E5DFD5] dark:border-[#26221E] ${
                activePage === 'discovery' ? 'text-[#E4C79B] font-semibold' : ''
              }`}
            >
              Ingredients &amp; Grasse Botanicals Page
            </button>
            <button
              type="button"
              onClick={() => handleLinkClick('quiz')}
              className={`w-full text-left py-2 border-b border-[#E5DFD5] dark:border-[#26221E] ${
                activePage === 'quiz' ? 'text-[#E4C79B] font-semibold' : ''
              }`}
            >
              Personalized Scent Quiz Page
            </button>
            <button
              type="button"
              onClick={() => handleLinkClick('client')}
              className={`w-full text-left py-2 border-b border-[#E5DFD5] dark:border-[#26221E] text-[#9A7B4F] dark:text-[#E4C79B] font-medium ${
                activePage === 'client' ? 'font-semibold underline' : ''
              }`}
            >
              Private Salon (Client Dashboard)
            </button>
            <button
              type="button"
              onClick={() => handleLinkClick('admin')}
              className={`w-full text-left py-2 border-b border-[#E5DFD5] dark:border-[#26221E] text-[#E4C79B] font-medium ${
                activePage === 'admin' ? 'font-semibold underline' : ''
              }`}
            >
              Atelier Admin (Command Center)
            </button>
          </div>

          <div className="pt-4 border-t border-[#E5DFD5] dark:border-[#26221E] flex items-center justify-between">
            <button
              type="button"
              onClick={() => handleLinkClick('client')}
              className="inline-flex items-center gap-2 text-xs text-[#9A7B4F] dark:text-[#C8A97E]"
            >
              <User className="w-4 h-4" />
              <span>{userDisplayName ? `Account (${userDisplayName})` : 'Private Salon / Sign In'}</span>
            </button>

            {onToggleTheme && (
              <button
                type="button"
                onClick={onToggleTheme}
                className="inline-flex items-center gap-1.5 text-xs text-[#8C847A]"
              >
                {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-[#E4C79B]" /> : <Moon className="w-3.5 h-3.5 text-[#E4C79B]" />}
                <span>{theme === 'dark' ? 'Ivory' : 'Noir'}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
