
export enum UserType {
  Model = 'Modèle',
  Photographer = 'Photographe',
  Videographer = 'Vidéaste',
}

export type VerificationStatus = 'none' | 'pending' | 'approved' | 'rejected';
export type EscrowStatus = 'none' | 'held' | 'released' | 'refunded';

export interface Review {
  id: number;
  authorId: number;
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

export interface User {
  id: number;
  name: string;
  type: UserType;
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
  age?: number;
  socialLinks?: { website?: string; instagram?: string; };
  isPremium?: boolean;
  reviews?: Review[];
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

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
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
