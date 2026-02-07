
import React from 'react';
import { User, UserType, MessageThread, Booking, PaymentMethod, Transaction, Spot } from './types';

export const CURRENT_USER: User = {
    id: 999,
    name: 'Utilisateur Test',
    types: [UserType.Model],
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80',
    location: { lat: 48.8566, lng: 2.3522 },
    headline: 'Explorateur Créatif',
    rating: 0,
    portfolio: [],
    bio: "Compte test pour l'évaluation de Findaphotographer Elite.",
    rate: 0,
    isPro: false,
    isPremium: false,
    email: 'test@elite.com',
    completedShootsCount: 0
};

export const MOCK_SPOTS: Spot[] = [
    {
        id: 1,
        name: 'Pont Bir-Hakeim',
        type: 'Outdoor',
        category: 'Architecture',
        description: 'Iconique pour ses lignes de fuite et sa vue sur la Tour Eiffel. Parfait pour le Streetwear et la Mode.',
        imageUrl: 'https://images.unsplash.com/photo-1549213821-4708d624e1d1?auto=format&fit=crop&w=800&q=80',
        location: { lat: 48.8556, lng: 2.2876 }
    },
    {
        id: 2,
        name: 'Rue Crémieux',
        type: 'Outdoor',
        category: 'Couleurs',
        description: 'Petite rue piétonne aux façades colorées. Ambiance pastel et estivale garantie.',
        imageUrl: 'https://images.unsplash.com/photo-1554907073-97e599bc570c?auto=format&fit=crop&w=800&q=80',
        location: { lat: 48.8469, lng: 2.3708 }
    },
    {
        id: 3,
        name: 'Colonnes de Buren',
        type: 'Outdoor',
        category: 'Graphic',
        description: 'Palais-Royal. Contrastes de noir et blanc. Idéal pour des portraits graphiques et éditoriaux.',
        imageUrl: 'https://images.unsplash.com/photo-1524338198850-8a2ff63aaceb?auto=format&fit=crop&w=800&q=80',
        location: { lat: 48.8633, lng: 2.3370 }
    },
    {
        id: 4,
        name: 'BNF Richelieu - Salle Ovale',
        type: 'Indoor',
        category: 'Library',
        description: 'Somptueuse bibliothèque gratuite. Lumière zénithale incroyable. Calme requis.',
        imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80',
        location: { lat: 48.8679, lng: 2.3385 }
    },
    {
        id: 5,
        name: 'La Défense - Esplanade',
        type: 'Outdoor',
        category: 'Futuriste',
        description: 'Architecture moderne, béton poli et structures massives. Parfait pour le Cyberpunk ou Business.',
        imageUrl: 'https://images.unsplash.com/photo-1508804059812-376af835584b?auto=format&fit=crop&w=800&q=80',
        location: { lat: 48.8897, lng: 2.2418 }
    },
    {
        id: 6,
        name: 'Passage du Grand-Cerf',
        type: 'Indoor',
        category: 'Vintage',
        description: 'L\'un des plus beaux passages couverts. Verrière XIXe et boutiques artisanales.',
        imageUrl: 'https://images.unsplash.com/photo-1503941421731-f925b6a7a030?auto=format&fit=crop&w=800&q=80',
        location: { lat: 48.8643, lng: 2.3488 }
    }
];

export const MOCK_USERS: User[] = [
    {
        id: 1,
        name: 'Élise Vallet',
        email: 'elise@elite.com',
        types: [UserType.Photographer],
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80',
        location: { lat: 48.8606, lng: 2.3376 },
        headline: 'Portraitiste Expert - Mode & Editorial',
        rating: 5.0,
        portfolio: [
            { type: 'image', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80' },
            { type: 'image', url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80' }
        ],
        bio: "Spécialisée dans la capture d'émotions authentiques pour les marques de luxe et les agences de mannequinat.",
        rate: 150,
        isPro: true,
        isPremium: true,
        isAvailableNow: true,
        completedShootsCount: 42
    },
    {
        id: 2,
        name: 'Marc Lefebvre',
        email: 'marc@elite.com',
        types: [UserType.Videographer, UserType.Photographer],
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
        location: { lat: 48.8529, lng: 2.3499 },
        headline: 'Réalisateur - Storytelling Visuel',
        rating: 4.9,
        portfolio: [
            { type: 'image', url: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1000&q=80' }
        ],
        bio: "Réalisateur passionné par les projets narratifs complexes. Je transforme vos visions en contenu cinématique.",
        rate: 300,
        isPro: true,
        isAvailableNow: false,
        completedShootsCount: 15
    }
];

export const MOCK_MESSAGES: MessageThread[] = [];
export const MOCK_BOOKINGS: Booking[] = [];
export const MOCK_PAYMENT_METHODS: PaymentMethod[] = [];
export const MOCK_TRANSACTIONS: Transaction[] = [];

export const ICONS = {
    search: <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />,
    heart: <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />,
    message: <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />,
    calendar: <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
    user: <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
    map: <path d="M9 20l-5-2.5V4l5 2.5L15 4l5 2.5V19l-5-2.5L9 20z" />,
    grid: <path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />,
    chevronRight: <path d="M9 5l7 7-7 7" />,
    plusCircle: <path d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />,
    play: <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />,
    star: <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />,
    bell: <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />,
    creditCard: <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2z" />,
    close: <path d="M6 18L18 6M6 6l12 12" />,
    check: <path d="M5 13l4 4L19 7" />,
    sparkles: <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />,
    bolt: <path d="M13 10V3L4 14h7v7l9-11h-7z" />,
    clock: <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
    documentText: <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
    shieldCheck: <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />,
    signature: <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />,
    banknotes: <path d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />,
    download: <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />,
    locationMarker: <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />,
    link: <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />,
    instagram: <path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm0 2a3 3 0 00-3 3v10a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H7zm5 3a5 5 0 110 10 5 5 0 010-10zm0 2a3 3 0 100 6 3 3 0 000-6zm4.75-.75a.75.75 0 100 1.5.75.75 0 000-1.5z" />,
    visa: <g transform="scale(1.5)"><path fill="#1A1F71" d="M16 10H0V0h16v10z"/><path fill="#FFF" d="M6.1 7.6h1.1l.7-4.4H6.8L6.1 7.6zm3.3-4.4l-1 4.4h1l1-4.4h-1zm3.8 2.8c-.1-.7-.8-1.1-1.6-1.1-.8 0-1.4.3-1.4 1 0 .6.5.9 1 .1.2.1.4.2.4.4 0 .3-.3.5-.8.5-.5 0-.9-.2-1.1-.4l-.2.8c.3.2.9.4 1.4.4 1 0 1.7-.5 1.7-1.4.1-.4-.2-.8-.4-1.2zM2.9 3.2L1 6.5h1.1l.2-.5h1.3l.1.5h1L3.9 3.2H2.9zm.6 2.3l.4-1.1.2 1.1h-.6z"/></g>,
    mastercard: <g transform="scale(1)"><circle cx="7" cy="7" r="7" fill="#EB001B"/><circle cx="17" cy="7" r="7" fill="#F79E1B"/><path fill="#FF5F00" d="M12 11.6c1-1.1 1.6-2.5 1.6-4.1s-.6-3-1.6-4.1c-1 1.1-1.6 2.5-1.6 4.1s.6 3 1.6 4.1z"/></g>,
};

export type IconName = keyof typeof ICONS;
