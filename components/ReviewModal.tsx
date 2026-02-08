import React, { useState } from 'react';
import type { User, Booking } from '../types';
import Icon from './Icon';
import { useAppContext } from '../contexts/AppContext';
import { useUser } from '../contexts/UserContext';

interface ReviewModalProps {
  booking: Booking;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ booking }) => {
  const { setReviewingBooking } = useAppContext();
  const { users, postReview } = useUser();
  const user = users.find(u => u.id === booking.professionalId)!;

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating > 0 && comment.trim() !== '') {
      postReview(booking, { rating, comment });
      onClose();
    }
  };

  const onClose = () => setReviewingBooking(null);

  if (!user) return null; // Should not happen

  return (
    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <form onSubmit={handleSubmit} className="bg-gray-900/80 backdrop-blur-md rounded-2xl w-full max-w-md border border-gray-700 shadow-2xl shadow-purple-500/10 animate-scale-in">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-lg font-bold">Évaluer {user.name}</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-white">
            <Icon name="close" />
          </button>
        </div>
        
        <div className="p-6">
            <div className="text-center mb-6">
                <img src={user.avatarUrl} alt={user.name} className="w-20 h-20 rounded-full mx-auto mb-2 border-2 border-purple-500" />
                <p className="text-gray-300">Comment s'est passée votre séance du {booking.date} ?</p>
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2 text-center">Votre note</label>
                <div className="flex justify-center items-center gap-2" onMouseLeave={() => setHoverRating(0)}>
                    {[...Array(5)].map((_, index) => {
                        const starValue = index + 1;
                        return (
                            <button
                                type="button"
                                key={starValue}
                                onMouseEnter={() => setHoverRating(starValue)}
                                onClick={() => setRating(starValue)}
                                className="text-3xl"
                            >
                                <Icon name="star" className={(hoverRating || rating) >= starValue ? 'text-yellow-400' : 'text-gray-600'} />
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="mb-6">
                <label htmlFor="comment" className="block text-sm font-medium text-gray-300 mb-2">Votre commentaire</label>
                <textarea
                    id="comment"
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full bg-gray-700 text-white p-3 rounded-md border border-gray-600 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                    placeholder={`Décrivez votre expérience avec ${user.name}...`}
                />
            </div>

            <button
                type="submit"
                disabled={rating === 0 || comment.trim() === ''}
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
                Envoyer l'avis
            </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewModal;