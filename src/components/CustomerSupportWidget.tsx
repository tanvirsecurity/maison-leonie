import React, { useEffect, useState } from 'react';
import { MessageSquare, Send, X } from 'lucide-react';
import { User } from 'firebase/auth';
import { SupportTicket } from '../types/perfume';
import {
  appendSupportMessage,
  createSupportTicket,
  subscribeSupportTickets,
} from '../lib/storeService';

interface CustomerSupportWidgetProps {
  user: User | null;
  isAdmin: boolean;
  onRequireAuth: () => void;
}

const FAQS = [
  {
    q: 'How long do Maison Léonie Extraits last on skin?',
    a: 'Our Extraits de Parfum are blended at 28–32% aromatic oil concentration and macerated in Grasse for 12 weeks, delivering 12 to 16 hours of poised sillage.',
  },
  {
    q: 'What courier and complimentary sample options are included?',
    a: 'Orders over $220 receive Complimentary Atelier Courier shipping and two 2ml glass discovery vials matched to your order.',
  },
  {
    q: 'How does Two-Factor Authentication protect my account?',
    a: 'You may bind any RFC 6238 authenticator app (Google Authenticator, 1Password, Apple Passwords) inside your Private Client Salon under Profile & 2FA.',
  },
  {
    q: 'Can I return an unopened fragrance flacon?',
    a: 'Sealed, unopened flacons in original linen presentation boxes may be returned within 30 days via complimentary insured courier.',
  },
];

export const CustomerSupportWidget: React.FC<CustomerSupportWidgetProps> = ({
  user,
  isAdmin,
  onRequireAuth,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<'chat' | 'faq' | 'contact'>('chat');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // New inquiry / consultation form
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<SupportTicket['category']>('Fragrance Consultation');
  const [initialMessage, setInitialMessage] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!user) {
      setTickets([]);
      return;
    }
    const unsub = subscribeSupportTickets(user.uid, isAdmin, (list) => {
      setTickets(list);
      if (list.length > 0 && !activeTicketId) {
        setActiveTicketId(list[0].id);
      }
    });
    return () => unsub();
  }, [user, isAdmin]);

  const activeTicket = tickets.find((t) => t.id === activeTicketId) || tickets[0] || null;

  const handleStartTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onRequireAuth();
      return;
    }
    if (!subject.trim() || !initialMessage.trim()) return;
    setCreating(true);
    try {
      const id = await createSupportTicket(user, subject, category, initialMessage);
      setActiveTicketId(id);
      setSubject('');
      setInitialMessage('');
      setTab('chat');
    } finally {
      setCreating(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !activeTicket || !replyText.trim()) return;
    const text = replyText.trim();
    setReplyText('');
    await appendSupportMessage(activeTicket, {
      sender: isAdmin && activeTicket.userId !== user.uid ? 'concierge' : 'customer',
      senderName:
        isAdmin && activeTicket.userId !== user.uid
          ? 'Atelier Concierge'
          : user.displayName || 'Patron',
      text,
      sentAtIso: new Date().toISOString(),
    });
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open Atelier Concierge support"
          className="inline-flex items-center gap-2.5 px-5 py-3 bg-[#161412] text-[#FAF8F5] dark:bg-[#C8A97E] dark:text-[#0E0D0C] border border-white/15 shadow-lg text-xs tracking-[0.16em] uppercase hover:opacity-95 transition-opacity cursor-pointer"
        >
          <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Concierge</span>
        </button>
      ) : (
        <div
          role="dialog"
          aria-label="Maison Léonie Client Concierge"
          className="w-[340px] sm:w-[390px] bg-[#FAF8F5] dark:bg-[#141210] text-[#161412] dark:text-[#F4F0EA] border border-[#D8D0C4] dark:border-[#2B2723] shadow-2xl flex flex-col max-h-[540px]"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-[#E5DFD5] dark:border-[#2B2723] flex items-center justify-between">
            <div>
              <p className="text-[11px] tracking-[0.18em] uppercase text-[#9A7B4F] dark:text-[#C8A97E]">
                Maison Léonie
              </p>
              <h3 className="font-editorial text-xl">Atelier Concierge</h3>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Minimize concierge"
              className="p-1.5 hover:text-[#9A7B4F] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Sub-navigation */}
          <div className="grid grid-cols-3 border-b border-[#E5DFD5] dark:border-[#2B2723] text-[11px] tracking-[0.14em] uppercase">
            {[
              { id: 'chat', label: 'Live Chat' },
              { id: 'contact', label: 'Consult' },
              { id: 'faq', label: 'FAQ' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id as 'chat' | 'faq' | 'contact')}
                className={`py-2.5 text-center transition-colors cursor-pointer ${
                  tab === t.id
                    ? 'bg-[#FFFFFF] dark:bg-[#1D1A17] text-[#9A7B4F] dark:text-[#C8A97E]'
                    : 'text-[#6B655E] dark:text-[#A39C93]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5">
            {tab === 'faq' && (
              <div className="space-y-4">
                {FAQS.map((item) => (
                  <div
                    key={item.q}
                    className="pb-4 border-b last:border-b-0 border-[#E5DFD5] dark:border-[#2B2723]"
                  >
                    <p className="font-medium text-xs mb-1.5">{item.q}</p>
                    <p className="text-xs text-[#6B655E] dark:text-[#A39C93] leading-relaxed">
                      {item.a}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {tab === 'contact' && (
              <form onSubmit={handleStartTicket} className="space-y-3">
                <p className="text-xs text-[#6B655E] dark:text-[#A39C93]">
                  Start a fragrance consultation, delivery request, or bespoke inquiry.
                </p>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as SupportTicket['category'])}
                  className="w-full px-3 py-2 text-xs bg-[#FFFFFF] dark:bg-[#1B1815] border border-[#D8D0C4] dark:border-[#2E2A25]"
                >
                  <option value="Fragrance Consultation">Fragrance Consultation</option>
                  <option value="Order Support">Order Support</option>
                  <option value="Delivery">Delivery Inquiry</option>
                  <option value="Bespoke Inquiry">Bespoke Inquiry</option>
                </select>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Subject"
                  className="w-full px-3 py-2 text-xs bg-[#FFFFFF] dark:bg-[#1B1815] border border-[#D8D0C4] dark:border-[#2E2A25]"
                />
                <textarea
                  rows={4}
                  required
                  value={initialMessage}
                  onChange={(e) => setInitialMessage(e.target.value)}
                  placeholder="Describe what scent notes or order assistance you need..."
                  className="w-full px-3 py-2 text-xs bg-[#FFFFFF] dark:bg-[#1B1815] border border-[#D8D0C4] dark:border-[#2E2A25]"
                />
                <button
                  type="submit"
                  disabled={creating}
                  className="w-full py-2.5 text-xs tracking-[0.14em] uppercase bg-[#161412] text-[#FAF8F5] dark:bg-[#C8A97E] dark:text-[#0E0D0C] cursor-pointer"
                >
                  {user ? (creating ? 'Sending...' : 'Send to Concierge') : 'Sign In to Send'}
                </button>
              </form>
            )}

            {tab === 'chat' && (
              <div className="space-y-4">
                {!user ? (
                  <div className="py-8 text-center space-y-3">
                    <p className="text-xs text-[#6B655E] dark:text-[#A39C93]">
                      Sign in with Google to chat directly with our Paris fragrance advisors and
                      track active consultations.
                    </p>
                    <button
                      type="button"
                      onClick={onRequireAuth}
                      className="px-5 py-2 text-xs tracking-[0.14em] uppercase bg-[#161412] text-[#FAF8F5] dark:bg-[#C8A97E] dark:text-[#0E0D0C] cursor-pointer"
                    >
                      Sign In for Live Chat
                    </button>
                  </div>
                ) : !activeTicket ? (
                  <div className="py-6 text-center space-y-3">
                    <p className="text-xs text-[#6B655E] dark:text-[#A39C93]">
                      No open concierge threads yet.
                    </p>
                    <button
                      type="button"
                      onClick={() => setTab('contact')}
                      className="px-5 py-2 text-xs tracking-[0.14em] uppercase border border-[#161412] dark:border-[#C8A97E] cursor-pointer"
                    >
                      Start Consultation
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tickets.length > 1 && (
                      <select
                        value={activeTicket.id}
                        onChange={(e) => setActiveTicketId(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-[#FFFFFF] dark:bg-[#1B1815] border border-[#D8D0C4] dark:border-[#2E2A25]"
                      >
                        {tickets.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.subject} ({t.category})
                          </option>
                        ))}
                      </select>
                    )}

                    <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                      {activeTicket.messages.map((m, idx) => (
                        <div
                          key={idx}
                          className={`p-3 text-xs border ${
                            m.sender === 'concierge'
                              ? 'border-[#9A7B4F]/40 bg-[#FFFFFF] dark:bg-[#1B1815]'
                              : 'border-[#E5DFD5] dark:border-[#2B2723] bg-[#F2EEE8] dark:bg-[#171513]'
                          }`}
                        >
                          <p className="uppercase tracking-wider text-[10px] text-[#9A7B4F] mb-1">
                            {m.senderName}
                          </p>
                          <p className="leading-relaxed">{m.text}</p>
                        </div>
                      ))}
                    </div>

                    <form onSubmit={handleSendReply} className="flex gap-2">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write a message..."
                        className="flex-1 px-3 py-2 text-xs bg-[#FFFFFF] dark:bg-[#1B1815] border border-[#D8D0C4] dark:border-[#2E2A25]"
                      />
                      <button
                        type="submit"
                        aria-label="Send message"
                        className="px-3.5 py-2 bg-[#161412] text-[#FAF8F5] dark:bg-[#C8A97E] dark:text-[#0E0D0C] cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
