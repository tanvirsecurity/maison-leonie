import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { AppPage } from './Navbar';

interface FooterProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onNavigatePage: (page: AppPage) => void;
  onOpenAccount: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  theme,
  onToggleTheme,
  onNavigatePage,
  onOpenAccount,
}) => {
  return (
    <footer className="border-t border-[#E5DFD5] dark:border-[#2B2723] bg-[#F7F4EE] dark:bg-[#0E0D0C] py-20 px-6 lg:px-10">
      <div className="max-w-[1360px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 pb-14 border-b border-[#E5DFD5] dark:border-[#2B2723]">
        <div className="md:col-span-5">
          <button
            type="button"
            onClick={() => onNavigatePage('home')}
            className="text-left cursor-pointer group"
          >
            <p className="font-editorial text-2xl tracking-[0.24em] uppercase mb-3 group-hover:text-[#9A7B4F] dark:group-hover:text-[#C8A97E] transition-colors">
              Maison Léonie
            </p>
            <p className="font-editorial italic text-base text-[#9A7B4F] dark:text-[#C8A97E] mb-3">
              Haute Parfumerie · Paris &amp; Grasse
            </p>
          </button>
          <p className="text-sm text-[#6B655E] dark:text-[#A39C93] leading-relaxed max-w-sm">
            24 Rue Saint-Honoré, 75001 Paris · Domaine des Oliviers, 06130 Grasse. Extraits de
            parfum macerated in small numbered oak batches to become part of your life&apos;s autobiography.
          </p>
        </div>

        <div className="md:col-span-4 grid grid-cols-2 gap-6 text-[11px] tracking-[0.18em] uppercase">
          <div className="space-y-3.5">
            <p className="text-[#9A7B4F] dark:text-[#C8A97E]">Scent &amp; Life</p>
            <button
              type="button"
              onClick={() => onNavigatePage('chapters')}
              className="block hover:text-[#9A7B4F] dark:hover:text-[#C8A97E] transition-colors cursor-pointer"
            >
              Life Chapters
            </button>
            <button
              type="button"
              onClick={() => onNavigatePage('memory-vault')}
              className="block hover:text-[#9A7B4F] dark:hover:text-[#C8A97E] transition-colors cursor-pointer"
            >
              Memory Vault
            </button>
            <button
              type="button"
              onClick={() => onNavigatePage('rituals')}
              className="block hover:text-[#9A7B4F] dark:hover:text-[#C8A97E] transition-colors cursor-pointer"
            >
              Daily Rituals
            </button>
            <button
              type="button"
              onClick={() => onNavigatePage('memoirs')}
              className="block hover:text-[#9A7B4F] dark:hover:text-[#C8A97E] transition-colors cursor-pointer"
            >
              Human Memoirs
            </button>
            <button
              type="button"
              onClick={() => onNavigatePage('discovery')}
              className="block hover:text-[#9A7B4F] dark:hover:text-[#C8A97E] transition-colors cursor-pointer"
            >
              Atelier Botanique
            </button>
          </div>

          <div className="space-y-3.5">
            <p className="text-[#9A7B4F] dark:text-[#C8A97E]">La Maison</p>
            <button
              type="button"
              onClick={() => onNavigatePage('collections')}
              className="block hover:text-[#9A7B4F] transition-colors cursor-pointer"
            >
              The Flacons
            </button>
            <button
              type="button"
              onClick={() => onNavigatePage('quiz')}
              className="block hover:text-[#9A7B4F] transition-colors cursor-pointer"
            >
              Scent Quiz
            </button>
            <button
              type="button"
              onClick={() => onNavigatePage('client')}
              className="block hover:text-[#9A7B4F] dark:hover:text-[#C8A97E] transition-colors cursor-pointer"
            >
              Private Salon (Client)
            </button>
            <button
              type="button"
              onClick={() => onNavigatePage('admin')}
              className="block hover:text-[#9A7B4F] dark:hover:text-[#E4C79B] transition-colors cursor-pointer"
            >
              Atelier Admin
            </button>
            <button
              type="button"
              onClick={onToggleTheme}
              className="inline-flex items-center gap-1.5 hover:text-[#9A7B4F] transition-colors cursor-pointer pt-2"
            >
              {theme === 'light' ? (
                <>
                  <Moon className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Theme: Noir</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Theme: Ivory</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="md:col-span-3 text-xs text-[#6B655E] dark:text-[#A39C93] leading-relaxed">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#9A7B4F] dark:text-[#C8A97E] mb-3">
            Atelier Privileges
          </p>
          <p className="mb-2">
            Every flacon ships in hand-waxed linen coffrets with two complimentary sample vials
            and insured courier service over $220.
          </p>
          <p className="font-editorial italic text-sm text-[#161412] dark:text-[#E4C79B]">
            Complimentary Gold Leaf Flacon Engraving
          </p>
        </div>
      </div>

      <div className="max-w-[1360px] mx-auto pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] tracking-[0.16em] uppercase text-[#7A7269] dark:text-[#A39C93]">
        <span>© {new Date().getFullYear()} Maison Léonie Haute Parfumerie</span>
        <span>Wear What You Want to Remember · Paris · Grasse</span>
      </div>
    </footer>
  );
};
