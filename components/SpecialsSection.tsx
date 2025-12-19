
import React, { useState } from 'react';
import { SpecialItem } from '../App';
import SpecialModal from './SpecialModal';
import { BullSkullOutline } from './icons/SalonIcons';

interface SpecialsSectionProps {
  specials: SpecialItem[];
  onNavigate: (view: 'home' | 'admin') => void;
  whatsAppNumber: string;
}

const SpecialsSection: React.FC<SpecialsSectionProps> = ({ specials, onNavigate, whatsAppNumber }) => {
  const [selectedSpecial, setSelectedSpecial] = useState<SpecialItem | null>(null);
  const activeSpecials = specials.filter(item => item.active);

  if (activeSpecials.length === 0) return null;

  const handleSpecialClick = (special: SpecialItem) => {
    setSelectedSpecial(special);
  };

  const closeModal = () => {
    setSelectedSpecial(null);
  };

  const createWhatsAppLink = (item: SpecialItem) => {
    let message = `Hi! I'm interested in the following special:\n\n`;
    message += `*Title:* ${item.title}\n`;
    message += `*Description:* ${item.description}\n`;
    
    let priceInfo = "Price: Inquire";
    switch (item.priceType) {
      case 'fixed':
        priceInfo = `*Price:* R${item.priceValue} (fixed)`;
        break;
      case 'hourly':
        priceInfo = `*Price:* R${item.priceValue}/hr`;
        break;
      case 'percentage':
        priceInfo = `*Discount:* ${item.priceValue}% OFF`;
        break;
      default:
        priceInfo = `*Price:* R${item.price}`;
        break;
    }
    message += `${priceInfo}\n`;

    if (item.details && item.details.length > 0) {
        message += `\n*Details:*\n`;
        item.details.forEach(detail => {
            message += `• ${detail}\n`;
        });
    }

    if (item.voucherCode) {
        message += `\n*Voucher Code:* ${item.voucherCode}\n`;
    }

    message += `\nCan you please provide more information on booking?`;
    
    return `https://wa.me/${whatsAppNumber}?text=${encodeURIComponent(message)}`;
  };

  const formatPriceSmall = (item: SpecialItem) => {
     if (item.priceType === 'percentage') {
         return `${item.priceValue}% OFF`;
     }
     const val = item.priceValue || item.price;
     return `R${val}`;
  };

  return (
    <section className="py-10 sm:py-16 bg-brand-off-white text-brand-light">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="text-center mb-6 sm:mb-10">
          <h2 className="font-script text-3xl sm:text-5xl text-brand-green mb-2">Seasonal Specials</h2>
          <div className="w-16 h-1 bg-brand-gold mx-auto mb-2 rounded-full"></div>
          <p className="text-gray-500 text-xs sm:text-sm max-w-xl mx-auto">
            Treat yourself to our exclusive offers.
          </p>
        </div>

        {/* Mobile: 3 Cols, Desktop: 5 Cols */}
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4">
          {activeSpecials.map((special) => (
            <div 
              key={special.id} 
              onClick={() => handleSpecialClick(special)}
              className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 flex flex-col cursor-pointer"
            >
              <div className="relative h-24 sm:h-40 overflow-hidden bg-gray-100">
                <img 
                  src={special.imageUrl} 
                  alt={special.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-brand-gold/90 text-white px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-bold shadow-sm backdrop-blur-sm">
                  {formatPriceSmall(special)}
                </div>
              </div>
              <div className="p-2 sm:p-4 flex-grow flex flex-col">
                <h3 className="text-[10px] sm:text-sm font-bold text-brand-light mb-1 line-clamp-1 group-hover:text-brand-green transition-colors leading-tight">{special.title}</h3>
                <p className="text-[9px] sm:text-xs text-gray-500 line-clamp-2 mb-2 leading-tight flex-grow">{special.description}</p>
                <div className="mt-auto pt-1 sm:pt-2 border-t border-gray-50 flex items-center justify-between">
                    <span className="text-[8px] sm:text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Details</span>
                    <BullSkullOutline className="text-brand-green w-3 h-3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedSpecial && (
        <SpecialModal
          isOpen={!!selectedSpecial}
          onClose={closeModal}
          item={selectedSpecial}
          createWhatsAppLink={createWhatsAppLink}
        />
      )}
    </section>
  );
};

export default SpecialsSection;
