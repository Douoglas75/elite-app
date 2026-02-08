import React, { useState, useEffect } from 'react';
import Icon from './Icon';
import type { PaymentMethod, Transaction } from '../types';

// Fenêtre modale pour l'ajout d'une nouvelle carte
const AddCardModal: React.FC<{
  onClose: () => void;
  onSave: (card: Omit<PaymentMethod, 'id' | 'isDefault'>) => void;
}> = ({ onClose, onSave }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVC, setCardCVC] = useState('');
  const [cardType, setCardType] = useState<'visa' | 'mastercard' | null>(null);
  const [error, setError] = useState('');

  // Détecte le type de carte en fonction du numéro
  useEffect(() => {
    if (cardNumber.startsWith('4')) {
      setCardType('visa');
    } else if (cardNumber.startsWith('5')) {
      setCardType('mastercard');
    } else {
      setCardType(null);
    }
  }, [cardNumber]);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Supprime les non-chiffres
    if (value.length <= 16) {
      // Ajoute des espaces pour le formatage
      setCardNumber(value.replace(/(.{4})/g, '$1 ').trim());
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 2) {
      value = `${value.slice(0, 2)}/${value.slice(2, 4)}`;
    }
    if (value.length <= 5) {
      setCardExpiry(value);
    }
  };
  
  const handleCVCChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 4) {
      setCardCVC(value);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validation de base
    if (cardNumber.replace(/\s/g, '').length < 16) {
        setError('Le numéro de carte est invalide.');
        return;
    }
    if (!cardName.trim()) {
        setError('Le nom sur la carte est requis.');
        return;
    }
    const [month, year] = cardExpiry.split('/');
    if (!month || !year || month.length !== 2 || year.length !== 2 || parseInt(month, 10) > 12) {
        setError("La date d'expiration est invalide (MM/AA).");
        return;
    }
    if (cardCVC.length < 3) {
        setError('Le CVC est invalide.');
        return;
    }
    if (!cardType) {
        setError('Type de carte non supporté.');
        return;
    }

    onSave({
      type: cardType,
      last4: cardNumber.replace(/\s/g, '').slice(-4),
      expiry: cardExpiry,
    });
  };

  return (
    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
      <form onSubmit={handleSubmit} className="bg-gray-900/80 backdrop-blur-md rounded-2xl w-full max-w-md border border-gray-700 shadow-2xl shadow-cyan-500/10 animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-lg font-bold">Ajouter une carte</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-white">
            <Icon name="close" />
          </button>
        </div>
        <div className="p-6 space-y-4">
            <div className="relative">
                <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-300 mb-1">Numéro de carte</label>
                <input
                    id="cardNumber"
                    type="tel"
                    inputMode="numeric"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    placeholder="0000 0000 0000 0000"
                    className="w-full bg-gray-700 text-white p-3 rounded-md border border-gray-600 focus:ring-cyan-500 focus:border-cyan-500 outline-none pr-12"
                    required
                />
                {cardType && <Icon name={cardType} className="absolute right-3 top-9 h-6 w-auto" />}
            </div>
            <div>
                <label htmlFor="cardName" className="block text-sm font-medium text-gray-300 mb-1">Nom sur la carte</label>
                <input
                    id="cardName"
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="Alex Martin"
                    className="w-full bg-gray-700 text-white p-3 rounded-md border border-gray-600 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                    required
                />
            </div>
             <div className="flex gap-4">
                <div className="flex-1">
                    <label htmlFor="cardExpiry" className="block text-sm font-medium text-gray-300 mb-1">Expiration</label>
                    <input
                        id="cardExpiry"
                        type="text"
                        value={cardExpiry}
                        onChange={handleExpiryChange}
                        placeholder="MM/AA"
                        className="w-full bg-gray-700 text-white p-3 rounded-md border border-gray-600 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                        required
                    />
                </div>
                <div className="flex-1">
                    <label htmlFor="cardCVC" className="block text-sm font-medium text-gray-300 mb-1">CVC</label>
                    <input
                        id="cardCVC"
                        type="text"
                        inputMode="numeric"
                        value={cardCVC}
                        onChange={handleCVCChange}
                        placeholder="123"
                        className="w-full bg-gray-700 text-white p-3 rounded-md border border-gray-600 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                        required
                    />
                </div>
            </div>
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <div className="pt-2">
                <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg">
                    Enregistrer la carte
                </button>
            </div>
        </div>
      </form>
    </div>
  );
};

// Composant principal de l'écran de paiement
const PaymentScreen: React.FC = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);

  const handleSetDefault = (id: string) => {
    setPaymentMethods(prev =>
      prev.map(pm => ({ ...pm, isDefault: pm.id === id }))
    );
    setActiveMenu(null);
  };

  const handleRemove = (id: string) => {
    setPaymentMethods(prev => prev.filter(pm => pm.id !== id));
    setActiveMenu(null);
  };
  
  const handleSaveCard = (newCardData: Omit<PaymentMethod, 'id' | 'isDefault'>) => {
    const newCard: PaymentMethod = {
      id: `pm_${Date.now()}`,
      ...newCardData,
      isDefault: paymentMethods.length === 0,
    };
    setPaymentMethods(prev => [...prev, newCard]);
    setIsAddCardModalOpen(false);
  };
  
  const CardMenu: React.FC<{ card: PaymentMethod; closeMenu: () => void; }> = ({ card, closeMenu }) => (
    <div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-md shadow-lg z-20 animate-fade-in">
      <div className="py-1">
        {!card.isDefault && (
          <button
            onClick={() => handleSetDefault(card.id)}
            className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-600"
          >
            Définir par défaut
          </button>
        )}
        <button
          onClick={() => handleRemove(card.id)}
          className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-600"
        >
          Supprimer
        </button>
      </div>
    </div>
  );


  return (
    <>
      <div className="p-4 sm:p-6 space-y-8" onClick={() => setActiveMenu(null)}>
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Mes Cartes</h2>
            <button
              onClick={() => setIsAddCardModalOpen(true)}
              className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold py-2 px-3 rounded-lg"
            >
              <Icon name="plusCircle" className="w-5 h-5" />
              <span>Ajouter</span>
            </button>
          </div>
          <div className="space-y-4">
            {paymentMethods.length > 0 ? paymentMethods.map(card => (
              <div key={card.id} className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-8 flex items-center justify-center bg-white rounded-md p-1">
                     <Icon name={card.type} className="h-full w-auto" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white">
                        {card.type.charAt(0).toUpperCase() + card.type.slice(1)} •••• {card.last4}
                      </h3>
                      {card.isDefault && (
                        <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-green-500/20 text-green-300">
                          Par défaut
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400">Expire le {card.expiry}</p>
                  </div>
                </div>
                <div className="relative">
                  <button
                    onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === card.id ? null : card.id); }}
                    className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-700"
                    aria-label="Ouvrir le menu de la carte"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/></svg>
                  </button>
                  {activeMenu === card.id && <CardMenu card={card} closeMenu={() => setActiveMenu(null)} />}
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-500 bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-700">
                <p>Aucune méthode de paiement ajoutée.</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-white mb-4">Historique des Transactions</h2>
          <div className="bg-gray-800 rounded-xl border border-gray-700">
            <ul className="divide-y divide-gray-700">
              {transactions.length > 0 ? transactions.map(tx => (
                <li key={tx.id} className="p-4 flex items-center justify-between hover:bg-gray-700/50">
                  <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'expense' ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
                          <Icon name={tx.type === 'expense' ? 'banknotes' : 'calendar'} className={`w-5 h-5 ${tx.type === 'expense' ? 'text-red-400' : 'text-green-400'}`} />
                      </div>
                      <div>
                          <p className="font-semibold text-white">{tx.description}</p>
                          <p className="text-sm text-gray-400">{tx.date}</p>
                      </div>
                  </div>
                  <div className="text-right">
                      <p className={`font-bold ${tx.type === 'expense' ? 'text-red-400' : 'text-green-400'}`}>
                          {tx.type === 'expense' ? '-' : '+'}
                          {Math.abs(tx.amount).toLocaleString('fr-FR', { style: 'currency', currency: 'USD' })}
                      </p>
                      <a href="#" onClick={(e) => e.preventDefault()} className="text-xs text-cyan-400 hover:underline">Facture</a>
                  </div>
                </li>
              )) : (
                <li className="p-8 text-center text-gray-500">
                  Aucune transaction pour le moment.
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
      {isAddCardModalOpen && (
        <AddCardModal
            onClose={() => setIsAddCardModalOpen(false)}
            onSave={handleSaveCard}
        />
      )}
    </>
  );
};

export default PaymentScreen;