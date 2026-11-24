export type ProductCategory =
  | 'Best Sellers'
  | 'New Arrivals'
  | 'Exclusive Collections'
  | 'Limited Editions';

export type FragranceFamily =
  | 'Floral'
  | 'Woody'
  | 'Oriental'
  | 'Fresh'
  | 'Citrus'
  | 'Gourmand';

export type ConcentrationType =
  | 'Extrait de Parfum'
  | 'Eau de Parfum'
  | 'Eau de Toilette';

export type IntensityLevel = 'Intimate' | 'Moderate' | 'Statement';

export interface PerfumeProduct {
  id: string;
  slug: string;
  name: string;
  brand: string;
  subtitle?: string;
  category: ProductCategory;
  fragranceFamily: FragranceFamily;
  concentration: ConcentrationType;
  longevityHours: number;
  intensity: IntensityLevel;
  price: number;
  volumeMl: number;
  stockCount: number;
  popularityScore: number;
  shortDescription: string;
  description: string;
  perfumerNote?: string;
  topNotes: string[];
  heartNotes: string[];
  baseNotes: string[];
  occasion: string[];
  season: string[];
  images: string[];
  ratingAvg: number;
  reviewCount: number;
  lifeChapter?: string;
  emotionalResonance?: string;
  lifeMemoryQuote?: string;
  frequencyResonance?: string;
}

export interface ProductReview {
  id: string;
  authorId: string;
  authorName: string;
  rating: number;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  createdAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  brand: string;
  image: string;
  volumeMl: number;
  unitPrice: number;
  quantity: number;
  engraving?: string;
}

export interface AddressRecord {
  id: string;
  uid: string;
  label: string;
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}

export interface OrderRecord {
  id: string;
  userId: string;
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  items: {
    productId: string;
    productName: string;
    volumeMl: number;
    unitPrice: number;
    quantity: number;
    image: string;
    engraving?: string;
  }[];
  subtotal: number;
  discount: number;
  promoCode?: string;
  shippingCost: number;
  tax: number;
  total: number;
  shippingMethod:
    | 'Complimentary Atelier Courier'
    | 'Express Air Courier'
    | 'Same-Day Boutique Courier';
  shippingAddress: string;
  paymentMethod: 'Apple Pay' | 'Card' | 'Atelier Concierge Reservation';
  paymentStatus: 'paid' | 'reserved' | 'pending_config';
  status: 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';
  trackingCode?: string;
  giftNote?: string;
  createdAtIso: string;
}

export interface UserPreferences {
  uid: string;
  role: 'customer' | 'admin';
  theme: 'light' | 'dark';
  wishlistIds: string[];
  recentlyViewedIds: string[];
  preferredFamilies: FragranceFamily[];
  favoriteNotes: string[];
  twoFactorEnabled: boolean;
  emailNotifications: boolean;
  reorderReminders: boolean;
  launchAlerts: boolean;
  pushEnabled: boolean;
  privacyAnalytics: boolean;
  quizSummary?: string;
}

export interface UserPrivateProfile {
  uid: string;
  fullName: string;
  email: string;
  phone?: string;
  totpSecret?: string;
  totpVerified?: boolean;
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: 'order' | 'shipping' | 'reorder' | 'restock' | 'launch';
  title: string;
  message: string;
  read: boolean;
  createdAtIso: string;
}

export interface SupportMessage {
  sender: 'customer' | 'concierge';
  senderName: string;
  text: string;
  sentAtIso: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  subject: string;
  category: 'Order Support' | 'Fragrance Consultation' | 'Delivery' | 'Bespoke Inquiry';
  status: 'open' | 'resolved';
  messages: SupportMessage[];
  createdAtIso: string;
}

export interface QuizAnswers {
  families: FragranceFamily[];
  lifestyle: string;
  notes: string[];
  intensity: IntensityLevel;
  timeOfDay: 'Daytime' | 'Evening' | 'Versatile';
  season: 'Spring' | 'Summer' | 'Autumn' | 'Winter';
}
