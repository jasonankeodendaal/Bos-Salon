
import React, { useState, useEffect } from 'react';
import { SpecialItem } from '../../App';
import { dbUploadFile } from '../../utils/dbAdapter';
import PlusIcon from '../../components/icons/PlusIcon';
import TrashIcon from '../../components/icons/TrashIcon';
import PencilIcon from '../../components/icons/PencilIcon';

const SpecialForm = ({
  initialItem,
  onSave,
  onCancel,
}: {
  initialItem: Partial<SpecialItem>;
  onSave: (item: any) => Promise<void>;
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState(initialItem);
  const [images, setImages] = useState<(string | File)[]>([]);
  const [primaryImage, setPrimaryImage] = useState<string | File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initialize images from props
    const existingImages = initialItem.images || (initialItem.imageUrl ? [initialItem.imageUrl] : []);
    setImages(existingImages);
    setPrimaryImage(initialItem.imageUrl || existingImages[0] || null);
  }, [initialItem]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const updatedImages = [...images, ...newFiles];
      setImages(updatedImages);
      if (!primaryImage) {
        setPrimaryImage(updatedImages[0]);
      }
    }
    e.target.value = ''; // Reset input
  };

  const removeImage = (img: string | File) => {
    const updatedImages = images.filter(i => i !== img);
    setImages(updatedImages);
    if (primaryImage === img) {
      setPrimaryImage(updatedImages[0] || null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) {
      alert("Please upload at least one image.");
      return;
    }
    setLoading(true);
    
    // Pass everything to parent, parent handles uploads
    await onSave({ ...formData, images, primaryImage });
    setLoading(false);
  };

  const getPreviewUrl = (img: string | File) => {
    return typeof img === 'string' ? img : URL.createObjectURL(img);
  };

  const inputClasses = "w-full bg-white border border-admin-dark-border rounded-lg p-2 text-admin-dark-text text-sm outline-none focus:ring-1 focus:ring-admin-dark-primary font-medium";

  return (
    <form onSubmit={handleSubmit} className="bg-white/50 border border-admin-dark-border rounded-lg p-4 sm:p-6 mb-6 col-span-full shadow-sm">
      <h3 className="text-lg sm:text-xl font-bold text-admin-dark-text mb-4">{initialItem.id ? 'Edit Special' : 'Add New Special'}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-semibold mb-1 text-admin-dark-text-secondary">Title</label>
            <input 
              type="text" 
              value={formData.title || ''} 
              onChange={e => setFormData({...formData, title: e.target.value})}
              className={inputClasses} 
              required
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-semibold mb-1 text-admin-dark-text-secondary">Description</label>
            <textarea 
              value={formData.description || ''} 
              onChange={e => setFormData({...formData, description: e.target.value})}
              className={inputClasses} 
              rows={3}
              required
            />
          </div>
          <div className="flex gap-2">
             <div className="flex-1">
                <label className="block text-xs sm:text-sm font-semibold mb-1 text-admin-dark-text-secondary">Price (R)</label>
                <input 
                  type="number" 
                  value={formData.price || ''} 
                  onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})}
                  className={inputClasses} 
                  step="0.01"
                  required
                />
             </div>
             <div className="flex-1">
               <label className="block text-xs sm:text-sm font-semibold mb-1 text-admin-dark-text-secondary">Price Type</label>
               <select 
                  value={formData.priceType || 'fixed'} 
                  onChange={e => setFormData({...formData, priceType: e.target.value as any})}
                  className={inputClasses}
               >
                 <option value="fixed">Fixed</option>
                 <option value="hourly">/Hour</option>
                 <option value="percentage">% Off</option>
               </select>
             </div>
          </div>
          <div className="flex items-center space-x-2 pt-2">
             <input 
                type="checkbox" 
                id="active"
                checked={formData.active !== false} 
                onChange={e => setFormData({...formData, active: e.target.checked})}
                className="w-4 h-4 accent-admin-dark-primary rounded"
             />
             <label htmlFor="active" className="text-admin-dark-text text-sm font-semibold cursor-pointer">Active</label>
          </div>
        </div>
        
        <div>
          <label className="block text-xs sm:text-sm font-semibold mb-2 text-admin-dark-text-secondary">Images</label>
          
          <div className="grid grid-cols-4 gap-2 mb-2">
            {images.map((img, idx) => (
              <div key={idx} className="relative group aspect-square rounded overflow-hidden border border-admin-dark-border bg-white">
                <img src={getPreviewUrl(img)} alt="preview" className="w-full h-full object-cover" />
                <div className={`absolute inset-0 border-2 ${primaryImage === img ? 'border-brand-green' : 'border-transparent'} pointer-events-none`}></div>
                
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                   <button type="button" onClick={() => setPrimaryImage(img)} className="p-1 bg-white text-black rounded-full" title="Set as Cover">
                      <span className="text-[10px]">★</span>
                   </button>
                   <button type="button" onClick={() => removeImage(img)} className="p-1 bg-white text-red-500 rounded-full" title="Remove">
                      <TrashIcon className="w-3 h-3" />
                   </button>
                </div>
              </div>
            ))}
            <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-admin-dark-border rounded cursor-pointer hover:border-admin-dark-primary bg-white/50">
               <PlusIcon className="w-4 h-4 text-admin-dark-text-secondary" />
               <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-admin-dark-border">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-xs font-bold text-admin-dark-text-secondary">Cancel</button>
        <button type="submit" disabled={loading} className="bg-admin-dark-primary text-white px-6 py-2 rounded-lg text-xs font-bold hover:opacity-90">
          {loading ? '...' : 'Save'}
        </button>
      </div>
    </form>
  );
};

interface SpecialsManagerProps {
  specialsData: SpecialItem[];
  onAddSpecialItem: (item: Omit<SpecialItem, 'id'>) => Promise<void>;
  onUpdateSpecialItem: (item: SpecialItem) => Promise<void>;
  onDeleteSpecialItem: (id: string) => Promise<void>;
}

const SpecialsManager: React.FC<SpecialsManagerProps> = ({ specialsData, onAddSpecialItem, onUpdateSpecialItem, onDeleteSpecialItem }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState<SpecialItem | null>(null);

  const handleSave = async (data: any) => {
    try {
      // 1. Upload all new images
      const images: string[] = [];
      
      // Process images array
      if (data.images && data.images.length > 0) {
          const uploadPromises = data.images.map(async (img: string | File) => {
              if (typeof img === 'string') return img;
              return await dbUploadFile(img, 'specials');
          });
          const uploadedUrls = await Promise.all(uploadPromises);
          images.push(...uploadedUrls);
      }

      // Determine primary image URL
      let imageUrl = images[0] || '';
      if (data.primaryImage) {
          if (typeof data.primaryImage === 'string') {
              imageUrl = data.primaryImage;
          } else {
              imageUrl = images[0];
          }
      }

      const itemPayload = {
        title: data.title,
        description: data.description,
        price: data.price,
        priceType: data.priceType || 'fixed',
        active: data.active !== false,
        imageUrl: imageUrl, 
        images: images,     
        details: data.details || [],
        voucherCode: data.voucherCode || '',
        priceValue: data.price 
      };

      if (editingItem) {
        await onUpdateSpecialItem({ ...editingItem, ...itemPayload } as SpecialItem);
      } else {
        await onAddSpecialItem(itemPayload as any);
      }
      setIsAdding(false);
      setEditingItem(null);
    } catch (error) {
      console.error("Error saving special:", error);
      alert("Failed to save special. Check console.");
    }
  };

  const handleDelete = async (id: string) => {
    if(window.confirm("Remove this special offer?")) {
      await onDeleteSpecialItem(id);
    }
  };

  return (
    <div className="bg-admin-dark-card border border-admin-dark-border rounded-xl shadow-lg p-3 sm:p-6 h-full flex flex-col">
      <header className="flex justify-between items-center mb-4 sm:mb-8 flex-shrink-0">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-admin-dark-text">Specials</h2>
          <p className="text-xs sm:text-sm text-admin-dark-text-secondary">Manage flash offers.</p>
        </div>
        {!isAdding && !editingItem && (
          <button onClick={() => setIsAdding(true)} className="flex items-center gap-1 sm:gap-2 bg-admin-dark-primary text-white px-3 py-1.5 rounded-lg font-bold text-xs sm:text-sm hover:opacity-90">
            <PlusIcon className="w-4 h-4" /> Add
          </button>
        )}
      </header>

      {/* Grid: 3 Cols Mobile */}
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4 overflow-y-auto pr-1">
        
        {(isAdding || editingItem) && (
            <SpecialForm 
            initialItem={editingItem || {}} 
            onSave={handleSave} 
            onCancel={() => { setIsAdding(false); setEditingItem(null); }} 
            />
        )}

        {specialsData.map(special => (
          <div key={special.id} className={`bg-white border ${special.active ? 'border-green-500/30' : 'border-red-500/30'} rounded-lg overflow-hidden flex flex-col hover:border-opacity-60 transition-colors shadow-sm`}>
            <div className="relative h-20 sm:h-32">
              <img src={special.imageUrl} alt={special.title} className="w-full h-full object-cover" />
              <div className="absolute top-1 right-1 flex gap-1">
                <span className={`px-1 py-0.5 text-[8px] uppercase font-bold rounded text-white shadow-sm ${special.active ? 'bg-green-600' : 'bg-red-500'}`}>
                  {special.active ? 'On' : 'Off'}
                </span>
              </div>
              <div className="absolute bottom-1 right-1 bg-black/70 text-white px-1.5 py-0.5 rounded text-[8px] sm:text-xs font-bold backdrop-blur-sm">
                {special.priceType === 'percentage' ? `${special.priceValue}%` : `R${special.price}`}
              </div>
            </div>
            <div className="p-2 flex-grow">
              <h4 className="font-bold text-admin-dark-text text-[10px] sm:text-sm mb-0.5 line-clamp-1">{special.title}</h4>
              <p className="text-[9px] sm:text-xs text-admin-dark-text-secondary line-clamp-2">{special.description}</p>
            </div>
            <div className="p-1 border-t border-admin-dark-border flex justify-end gap-1 bg-gray-50">
              <button onClick={() => setEditingItem(special)} className="p-1 text-admin-dark-text-secondary hover:text-admin-dark-text rounded transition-colors" title="Edit">
                <PencilIcon className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
              <button onClick={() => handleDelete(special.id)} className="p-1 text-red-400 hover:text-red-500 rounded transition-colors" title="Delete">
                <TrashIcon className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpecialsManager;
