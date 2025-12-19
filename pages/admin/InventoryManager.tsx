
import React, { useState, useMemo } from 'react';
import { InventoryItem } from '../../App';
import PlusIcon from '../../components/icons/PlusIcon';
import TrashIcon from '../../components/icons/TrashIcon';
import PencilIcon from '../../components/icons/PencilIcon';
import SearchIcon from '../../components/icons/SearchIcon';
import HelpGuideModal from './components/HelpGuideModal';

interface InventoryManagerProps {
  inventory: InventoryItem[];
  onAddInventoryItem: (item: Omit<InventoryItem, 'id'>) => Promise<void>;
  onUpdateInventoryItem: (item: InventoryItem) => Promise<void>;
  onDeleteInventoryItem: (id: string) => Promise<void>;
}

const InventoryManager: React.FC<InventoryManagerProps> = ({ 
  inventory, 
  onAddInventoryItem, 
  onUpdateInventoryItem, 
  onDeleteInventoryItem 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<InventoryItem>>({
    productName: '',
    brand: '',
    category: '',
    quantity: 0,
    minStockLevel: 5,
    unitCost: 0,
    supplier: ''
  });

  // Derived Statistics
  const totalValue = inventory.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);
  const lowStockCount = inventory.filter(i => i.quantity <= i.minStockLevel).length;
  const categories = ['All', ...Array.from(new Set(inventory.map(i => i.category).filter(Boolean)))];

  const filteredInventory = useMemo(() => {
    return (inventory || []).filter(item => {
      const productName = item.productName || '';
      const brand = item.brand || '';
      const matchesSearch = productName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            brand.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [inventory, searchTerm, filterCategory]);

  const handleEdit = (item: InventoryItem) => {
    setFormData(item);
    setCurrentId(item.id);
    setIsEditing(true);
  };

  const handleAddNew = () => {
    setFormData({
      productName: '',
      brand: '',
      category: '',
      quantity: 0,
      minStockLevel: 5,
      unitCost: 0,
      supplier: ''
    });
    setCurrentId(null);
    setIsEditing(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentId && isEditing) {
        await onUpdateInventoryItem({ ...formData, id: currentId } as InventoryItem);
      } else {
        await onAddInventoryItem(formData as Omit<InventoryItem, 'id'>);
      }
      setIsEditing(false);
    } catch (error) {
      console.error("Inventory Error:", error);
      alert("Failed to save item.");
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!id) return;
    
    if (window.confirm("Are you sure you want to permanently delete this inventory item?")) {
      try {
        await onDeleteInventoryItem(id);
      } catch (error) {
        console.error("Delete failed:", error);
        alert("Failed to delete item. Please check your connection.");
      }
    }
  };

  const inputClasses = "w-full bg-admin-dark-bg border border-admin-dark-border rounded-lg p-2 text-admin-dark-text text-sm focus:ring-1 focus:ring-admin-dark-primary outline-none transition";

  return (
    <div className="space-y-4 sm:space-y-6 h-full flex flex-col">
      <HelpGuideModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} section="inventory" />

      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 shrink-0">
          <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-admin-dark-text">Inventory</h2>
              <button onClick={() => setIsHelpOpen(true)} className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center font-bold text-xs hover:bg-blue-200 transition-colors" title="Guide">i</button>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
              <div className="bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm flex-1 md:flex-none">
                  <span className="text-[10px] font-bold text-gray-400 uppercase block">Value</span>
                  <div className="text-sm font-bold text-green-600">R {totalValue.toFixed(0)}</div>
              </div>
              <div className="bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm flex-1 md:flex-none">
                  <span className="text-[10px] font-bold text-gray-400 uppercase block">Low Stock</span>
                  <div className={`text-sm font-bold ${lowStockCount > 0 ? 'text-red-500' : 'text-gray-700'}`}>{lowStockCount}</div>
              </div>
          </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-admin-dark-card border border-admin-dark-border rounded-xl shadow-lg flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="p-2 sm:p-4 border-b border-admin-dark-border flex flex-col sm:flex-row justify-between gap-2 bg-admin-dark-bg/30">
          <div className="flex items-center gap-2 flex-1">
             <div className="relative flex-1 max-w-xs">
                <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"/>
                <input 
                  type="text" 
                  placeholder="Search..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-admin-dark-bg border border-admin-dark-border rounded-full pl-8 pr-3 py-1.5 text-xs text-admin-dark-text focus:ring-1 focus:ring-admin-dark-primary outline-none"
                />
             </div>
             <select 
                value={filterCategory} 
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-admin-dark-bg border border-admin-dark-border rounded-lg px-2 py-1.5 text-xs text-admin-dark-text outline-none max-w-[100px]"
             >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
             </select>
          </div>
          <button 
            onClick={handleAddNew}
            className="flex items-center gap-1 bg-admin-dark-primary text-white px-3 py-1.5 rounded-lg font-bold text-xs hover:opacity-90 transition-all shadow-sm"
          >
            <PlusIcon className="w-4 h-4" />
            Add
          </button>
        </div>

        {/* Edit/Add Form Overlay */}
        {isEditing && (
          <div className="border-b border-admin-dark-border bg-admin-dark-bg/50 p-4 animate-fade-in">
             <h3 className="text-sm font-bold text-admin-dark-text mb-3">{currentId ? 'Edit' : 'Add'} Product</h3>
             <form onSubmit={handleSubmit} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="col-span-2">
                   <label className="block text-[10px] text-admin-dark-text-secondary mb-0.5">Name</label>
                   <input className={inputClasses} value={formData.productName} onChange={e => setFormData({...formData, productName: e.target.value})} required placeholder="Name" />
                </div>
                <div>
                   <label className="block text-[10px] text-admin-dark-text-secondary mb-0.5">Brand</label>
                   <input className={inputClasses} value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} placeholder="Brand" />
                </div>
                <div>
                   <label className="block text-[10px] text-admin-dark-text-secondary mb-0.5">Category</label>
                   <input className={inputClasses} value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="Cat" />
                </div>
                <div>
                   <label className="block text-[10px] text-admin-dark-text-secondary mb-0.5">Qty</label>
                   <input type="number" step="any" className={inputClasses} value={formData.quantity} onChange={e => setFormData({...formData, quantity: parseFloat(e.target.value) || 0})} required />
                </div>
                <div>
                   <label className="block text-[10px] text-admin-dark-text-secondary mb-0.5">Min</label>
                   <input type="number" className={inputClasses} value={formData.minStockLevel} onChange={e => setFormData({...formData, minStockLevel: parseFloat(e.target.value) || 0})} required />
                </div>
                <div>
                   <label className="block text-[10px] text-admin-dark-text-secondary mb-0.5">Cost</label>
                   <input type="number" step="0.01" className={inputClasses} value={formData.unitCost} onChange={e => setFormData({...formData, unitCost: parseFloat(e.target.value) || 0})} required />
                </div>
                <div>
                   <label className="block text-[10px] text-admin-dark-text-secondary mb-0.5">Supplier</label>
                   <input className={inputClasses} value={formData.supplier} onChange={e => setFormData({...formData, supplier: e.target.value})} />
                </div>
                <div className="col-span-2 lg:col-span-4 flex justify-end gap-2 mt-2">
                   <button type="button" onClick={() => setIsEditing(false)} className="px-3 py-1 text-xs text-admin-dark-text-secondary">Cancel</button>
                   <button type="submit" className="bg-green-600 text-white px-4 py-1.5 rounded text-xs font-bold hover:bg-green-700">Save</button>
                </div>
             </form>
          </div>
        )}

        {/* Grid Card View */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-4">
          {filteredInventory.length === 0 ? (
             <div className="text-center py-10 text-xs text-admin-dark-text-secondary">
                No items found matching your criteria.
             </div>
          ) : (
             <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4">
               {filteredInventory.map(item => {
                 const isLowStock = item.quantity <= item.minStockLevel;
                 const stockPercent = Math.min(100, (item.quantity / (item.minStockLevel * 3 || 1)) * 100); 
                 
                 return (
                   <div key={item.id} className={`bg-white rounded-lg shadow-sm border p-2 flex flex-col justify-between transition-all hover:shadow-md ${isLowStock ? 'border-red-300 bg-red-50/10' : 'border-gray-200'}`}>
                      <div>
                        <div className="flex justify-between items-start mb-1">
                           <h4 className="font-bold text-gray-800 text-[10px] sm:text-sm truncate w-full" title={item.productName}>{item.productName}</h4>
                        </div>
                        <p className="text-[9px] sm:text-xs text-gray-500 mb-2 truncate">{item.brand}</p>
                        
                        {/* Stock Visual */}
                        <div className="mb-2">
                           <div className="flex justify-between text-[8px] sm:text-xs mb-0.5 font-semibold text-gray-600">
                              <span className={isLowStock ? 'text-red-500' : ''}>{item.quantity.toFixed(1)}</span>
                              <span className="text-gray-400">/ {item.minStockLevel}</span>
                           </div>
                           <div className="w-full h-1 sm:h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${isLowStock ? 'bg-red-500' : stockPercent < 50 ? 'bg-yellow-400' : 'bg-green-500'}`} 
                                style={{ width: `${stockPercent}%` }}
                              ></div>
                           </div>
                        </div>
                      </div>

                      <div className="pt-1 border-t border-gray-100 flex justify-between items-center">
                         <div className="text-[8px] sm:text-xs text-gray-500 font-mono">
                            R{item.unitCost}
                         </div>
                         <div className="flex gap-1 items-center">
                            <button 
                              onClick={() => handleEdit(item)} 
                              className="p-1.5 text-blue-500 hover:bg-blue-50 rounded transition-colors"
                              title="Edit Item"
                            >
                              <PencilIcon className="w-3 h-3 sm:w-4 sm:h-4"/>
                            </button>
                            <button 
                              onClick={(e) => handleDelete(e, item.id)} 
                              className="p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700 rounded transition-all"
                              title="Delete Item"
                            >
                              <TrashIcon className="w-3 h-3 sm:w-4 sm:h-4"/>
                            </button>
                         </div>
                      </div>
                   </div>
                 );
               })}
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryManager;
