
export enum UserType {
  Model = 'Modèle',
  Photographer = 'Photographe',
  Videographer = 'Vidéaste',
}

export type DiscoverMode = 'talents' | 'spots';
export type VerificationStatus = 'none' | 'pending' | 'approved' | 'rejected';
export type EscrowStatus = 'none' | 'held' | 'released' | 'refunded';

export interface Review {
  id: number;
  authorId: number;
  authorName: string;
  rating: number;
  comment: string;
  timestamp: string;
}

export interface PortfolioItem {
  type: 'image' | 'video';
  url: string;
  thumbnailUrl?: string;
}

export interface MoodboardItem {
  id: string;
  url: string;
  addedBy: string;
  comment: string;
  timestamp: number;
}

export interface Spot {
  id: number;
  name: string;
  type: 'Indoor' | 'Outdoor';
  category: string;
  description: string;
  imageUrl: string;
  location: { lat: number; lng: number; };
  sourceUrl?: string;
}

export interface User {
  id: number;
  name: string;
  types: UserType[];
  avatarUrl: string;
  location: { lat: number; lng: number; };
  headline: string;
  rating: number;
  portfolio: PortfolioItem[];
  bio: string;
  rate: number;
  isPro?: boolean;
  isAvailableNow?: boolean;
  verificationStatus?: VerificationStatus;
  styleVector?: string; 
  email?: string;
  password?: string; // [SECURITY-NOTE] Simple storage for demo/MVP
  age?: number;
  socialLinks?: { website?: string; instagram?: string; };
  isPremium?: boolean;
  reviews?: Review[];
  availableDays?: string[];
  completedShootsCount: number;
}

export interface Booking {
    id: number;
    clientId: number;
    professionalId: number;
    date: string;
    time: string;
    duration: number;
    status: 'Pending' | 'Confirmed' | 'Completed' | 'Declined';
    escrowStatus: EscrowStatus;
    notes?: string;
    shootLocation?: string;
    contractUrl?: string;
    photosUrl?: string;
    reviewSubmitted?: boolean;
}

export interface AISuggestion {
  userId: number;
  justification: string;
}

export interface ChatMessage {
  id: number;
  senderId: number;
  text: string;
  timestamp: string;
}

export interface MessageThread {
  id: number;
  participantId: number;
  messages: ChatMessage[];
  lastMessage: string;
  timestamp: string;
  unread: boolean;
}

export interface PaymentMethod {
  id: string;
  type: 'visa' | 'mastercard';
  last4: string;
  expiry: string;
  isDefault: boolean;
}

export interface Transaction {
  id: string;
  type: 'expense' | 'income';
  amount: number;
  description: string;
  date: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
}
