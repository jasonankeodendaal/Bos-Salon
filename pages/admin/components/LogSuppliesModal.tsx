
import React, { useState, useEffect } from 'react';
import { Booking, InventoryItem, Expense } from '../../../App';

interface LogSuppliesModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  inventory: InventoryItem[];
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onUpdateInventoryItem: (item: InventoryItem) => void;
  mode?: 'log' | 'reserve'; // New prop to distinguish between final logging and checking stock
}

const LogSuppliesModal: React.FC<LogSuppliesModalProps> = ({
  isOpen,
  onClose,
  booking,
  inventory,
  onAddExpense,
  onUpdateInventoryItem,
  mode = 'log'
}) => {
  const [usedSupplies, setUsedSupplies] = useState<Record<string, number>>({});

  useEffect(() => {
    if (isOpen) {
      setUsedSupplies({});
    }
  }, [isOpen]);

  if (!isOpen || !booking) return null;

  // --- SMART DOSE LOGIC ---
  const getDosePerService = (category: string): number => {
      const cat = category.toLowerCase();
      // Estimations based on industry averages
      if (cat.includes('gel') || cat.includes('polish')) return 0.5; // ~0.5ml per coat/service
      if (cat.includes('powder') || cat.includes('acrylic')) return 5.0; // ~5g per set
      if (cat.includes('liquid') || cat.includes('monomer')) return 10.0; // ~10ml per set
      if (cat.includes('acetone') || cat.includes('remover')) return 20.0; // ~20ml soak off
      if (cat.includes('glove') || cat.includes('file') || cat.includes('buffer')) return 1.0; // 1 unit
      if (cat.includes('oil') || cat.includes('lotion')) return 2.0; // ~2ml
      return 1.0; // Default
  };

  const addServiceDose = (itemId: string, currentQty: number) => {
      const item = inventory.find(i => i.id === itemId);
      if (!item) return;
      
      const dose = getDosePerService(item.category);
      const currentUsed = usedSupplies[itemId] || 0;
      const newAmount = Math.min(item.quantity, currentUsed + dose);
      
      setUsedSupplies(prev => ({
          ...prev,
          [itemId]: parseFloat(newAmount.toFixed(1))
      }));
  };

  const handleQuantityChange = (itemId: string, quantity: string) => {
    const value = parseFloat(quantity);
    const inventoryItem = inventory.find(i => i.id === itemId);
    if (!inventoryItem) return;

    const clampedValue = Math.max(0, Math.min(value, inventoryItem.quantity));

    setUsedSupplies(prev => ({
      ...prev,
      [itemId]: isNaN(clampedValue) ? 0 : clampedValue,
    }));
  };

  const getUnitLabel = (category: string) => {
      const cat = category.toLowerCase();
      if (cat.includes('polish') || cat.includes('gel') || cat.includes('liquid') || cat.includes('monomer') || cat.includes('acetone')) return 'mL';
      if (cat.includes('powder') || cat.includes('acrylic')) return 'g';
      return 'units';
  };

  const handleSubmit = () => {
    if (!booking) return;

    // In 'reserve' mode, we might just want to acknowledge checking stock, 
    // but typically we only deduct when completed. 
    // If user specifically wants to deduct NOW (e.g. taking items off shelf), we proceed.
    
    Object.entries(usedSupplies).forEach(([itemId, quantityUsed]) => {
      const numQuantityUsed = Number(quantityUsed);
      if (numQuantityUsed > 0) {
        const inventoryItem = inventory.find(i => i.id === itemId);
        if (inventoryItem) {
          // 1. Create expense
          const totalCost = numQuantityUsed * inventoryItem.unitCost; // using unitCost from item
          const unit = getUnitLabel(inventoryItem.category);
          
          const description = `${numQuantityUsed}${unit} of ${inventoryItem.brand || ''} ${inventoryItem.productName} used for ${booking.name}`;

          const newExpense: Omit<Expense, 'id'> = {
            date: new Date().toISOString().split('T')[0],
            category: 'Supplies',
            description,
            amount: totalCost,
          };
          onAddExpense(newExpense);

          // 2. Update inventory
          const updatedInventoryItem: InventoryItem = {
            ...inventoryItem,
            quantity: inventoryItem.quantity - numQuantityUsed,
          };
          onUpdateInventoryItem(updatedInventoryItem);
        }
      }
    });

    onClose();
  };
  
  const inputClasses = "w-20 bg-admin-dark-bg border border-admin-dark-border rounded-lg p-2 text-admin-dark-text focus:ring-2 focus:ring-admin-dark-primary outline-none transition text-center font-mono text-sm";

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-admin-dark-card border border-admin-dark-border rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <header className={`p-6 border-b border-admin-dark-border flex-shrink-0 ${mode === 'reserve' ? 'bg-yellow-50' : ''}`}>
            <h2 className={`text-xl font-bold ${mode === 'reserve' ? 'text-yellow-800' : 'text-admin-dark-text'}`}>
                {mode === 'reserve' ? 'Check & Reserve Stock' : 'Confirm Stock Used'}
            </h2>
            <p className="text-sm text-admin-dark-text-secondary mt-1">
                For <span className="font-semibold text-admin-dark-text">{booking.name}</span> 
                {mode === 'reserve' ? ' (Upcoming)' : ' (Completed)'}
            </p>
        </header>
        
        <div className="p-6 space-y-4 overflow-y-auto flex-grow">
          {mode === 'reserve' && (
              <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm mb-4">
                  <strong>Tip:</strong> You can verify you have enough stock now. Changes made here will deduct from inventory immediately. If you prefer to wait until the appointment is done, just click "Done checking".
              </div>
          )}
          
          <div className="grid grid-cols-1 gap-2">
            {inventory.length > 0 ? inventory.map(item => {
                const unit = getUnitLabel(item.category);
                const dose = getDosePerService(item.category);
                const isLiquidOrPowder = unit === 'mL' || unit === 'g';
                const currentUsage = usedSupplies[item.id] || 0;
                
                return (
                <div key={item.id} className="flex justify-between items-center bg-admin-dark-bg/50 p-3 rounded-lg border border-transparent hover:border-admin-dark-border transition-colors">
                    <div className="flex-1">
                        <p className="font-semibold text-admin-dark-text text-sm">{item.productName}</p>
                        <p className="text-xs text-admin-dark-text-secondary">
                            {item.brand} <span className="mx-1">•</span> Stock: <span className={item.quantity <= item.minStockLevel ? 'text-red-500 font-bold' : ''}>{item.quantity.toFixed(1)}{unit}</span>
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        {/* Quick Add Button */}
                        <button 
                            type="button"
                            onClick={() => addServiceDose(item.id, item.quantity)}
                            className="text-[10px] bg-blue-100 text-blue-700 px-2 py-1.5 rounded font-bold hover:bg-blue-200 transition-colors whitespace-nowrap"
                            title={`Add approx ${dose}${unit}`}
                        >
                            +1 Service ({dose}{unit})
                        </button>

                        <div className="flex items-center gap-1">
                            <input
                                type="number"
                                value={currentUsage || ''}
                                onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                                min="0"
                                max={item.quantity}
                                step={isLiquidOrPowder ? "0.1" : "1"}
                                className={inputClasses}
                                placeholder="0"
                            />
                            <span className="text-xs text-gray-500 w-6">{unit}</span>
                        </div>
                    </div>
                </div>
                );
            }) : (
                <p className="text-center text-admin-dark-text-secondary py-8">Your inventory is empty.</p>
            )}
          </div>
        </div>
        
        <footer className="flex justify-end gap-4 p-6 border-t border-admin-dark-border flex-shrink-0 bg-gray-50 rounded-b-xl">
            <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-800 font-semibold text-sm">
                {mode === 'reserve' ? 'Done checking (Do nothing)' : 'Cancel'}
            </button>
            <button type="button" onClick={handleSubmit} className="bg-admin-dark-primary text-white px-6 py-2 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity shadow-sm">
                {mode === 'reserve' ? 'Reserve/Deduct Now' : 'Confirm Usage'}
            </button>
        </footer>
      </div>
    </div>
  );
};

export default LogSuppliesModal;
