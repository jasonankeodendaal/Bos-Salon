
import React, { useState, useEffect } from 'react';
import { PortfolioItem } from '../../App';
import StarIcon from '../../components/icons/StarIcon';
import TrashIcon from '../../components/icons/TrashIcon';
import PlusIcon from '../../components/icons/PlusIcon';
import { dbUploadFile } from '../../utils/dbAdapter';
import { compressVideo } from '../../utils/mediaOptimizer';

const getPreviewUrl = (media: string | File): string => {
    if (typeof media === 'string') return media;
    return URL.createObjectURL(media);
};

// --- Edit Form Component ---
const PortfolioItemEditForm = ({
  initialItem,
  onSave,
  onCancel,
  isAddingNew
}: {
  initialItem: Partial<PortfolioItem> & { id?: string };
  onSave: (itemData: any) => Promise<void>;
  onCancel: () => void;
  isAddingNew: boolean;
}) => {
  const [formData, setFormData] = useState<any>({
    title: initialItem.title || '',
    story: initialItem.story || '',
  });
  const [gallery, setGallery] = useState<(string | File)[]>([]);
  const [primaryImage, setPrimaryImage] = useState<string | File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(initialItem.videoData || null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);
  
  useEffect(() => {
    const allImages = [initialItem.primaryImage, ...(initialItem.galleryImages || [])].filter(Boolean) as (string | File)[];
    setGallery(allImages);
    setPrimaryImage(initialItem.primaryImage || null);
    setVideoUrl(initialItem.videoData || null);
  }, [initialItem]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newGallery = [...gallery, ...files];
      setGallery(newGallery);
      if (!primaryImage) {
        setPrimaryImage(files[0]);
      }
    }
    e.target.value = '';
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const originalFile = e.target.files[0];
        setIsCompressing(true);
        setCompressionProgress(0);
        try {
            const compressedFile = await compressVideo(originalFile, (progress) => {
                setCompressionProgress(progress * 100);
            });
            setVideoFile(compressedFile);
            setVideoUrl(URL.createObjectURL(compressedFile));
        } catch (error) {
            console.error("Video compression failed:", error);
            alert("Video compression failed. Uploading the original file instead.");
            // Fallback to original file
            setVideoFile(originalFile);
            setVideoUrl(URL.createObjectURL(originalFile));
        } finally {
            setIsCompressing(false);
        }
    }
    e.target.value = '';
  };
  
  const removeVideo = () => {
    if (videoUrl && videoUrl.startsWith('blob:')) URL.revokeObjectURL(videoUrl);
    setVideoFile(null);
    setVideoUrl(null);
  };

  const removeImage = (imgToRemove: string | File) => {
    const newGallery = gallery.filter(img => img !== imgToRemove);
    setGallery(newGallery);
    if (primaryImage === imgToRemove) {
      setPrimaryImage(newGallery.length > 0 ? newGallery[0] : null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!primaryImage) {
      alert("Please upload and select a primary image (using the star icon).");
      return;
    }
    setIsLoading(true);

    const finalGallery = gallery.filter(img => img !== primaryImage);
    
    await onSave({
      ...initialItem,
      ...formData,
      primaryImage,
      galleryImages: finalGallery,
      videoFile,
    });
    setIsLoading(false);
  };
  
  const inputClasses = "w-full bg-white border border-admin-dark-border rounded-lg p-2.5 text-admin-dark-text focus:ring-2 focus:ring-admin-dark-primary outline-none transition";
  const fileInputClasses = "block w-full text-sm text-admin-dark-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-admin-dark-primary/10 file:text-admin-dark-primary hover:file:bg-admin-dark-primary/20";

  return (
    <form onSubmit={handleSubmit} className="bg-white/50 border border-admin-dark-border rounded-2xl p-4 sm:p-6 my-4 space-y-6 animate-fade-in md:col-span-2 shadow-sm">
      <header>
          <h3 className="text-lg sm:text-xl font-bold text-admin-dark-text">{isAddingNew ? 'Create Art' : 'Edit Art'}</h3>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
              <div>
                  <label className="block text-xs sm:text-sm font-semibold mb-2 text-admin-dark-text-secondary">Title</label>
                  <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className={inputClasses} required />
              </div>
              <div>
                  <label className="block text-xs sm:text-sm font-semibold mb-2 text-admin-dark-text-secondary">Story</label>
                  <textarea value={formData.story} onChange={(e) => setFormData({...formData, story: e.target.value})} rows={3} className={inputClasses} required />
              </div>
          </div>
          <div className="space-y-2">
              <label className="block text-xs sm:text-sm font-semibold text-admin-dark-text-secondary">Video (Optional)</label>
              {isCompressing ? (
                <div className="w-full bg-white p-4 rounded-lg text-center border border-gray-200">
                    <p className="text-xs sm:text-sm text-admin-dark-text-secondary mb-2">Compressing...</p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-admin-dark-primary h-2.5 rounded-full" style={{ width: `${compressionProgress}%` }}></div>
                    </div>
                </div>
              ) : videoUrl ? (
                  <div className="relative">
                      <video className="w-full rounded-lg bg-black max-h-32 object-contain" controls src={videoUrl}></video>
                      <button type="button" onClick={removeVideo} className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-red-500/80 transition-colors" aria-label="Remove video">
                          <TrashIcon className="w-3 h-3" />
                      </button>
                  </div>
              ) : (
                  <>
                    <input type="file" accept="video/*" onChange={handleVideoUpload} className={fileInputClasses} />
                  </>
              )}
          </div>
      </div>
      
      <div>
          <label className="block text-xs sm:text-sm font-semibold mb-2 text-admin-dark-text-secondary">Image Collection</label>
          <div className="bg-white border border-admin-dark-border rounded-lg p-2 sm:p-4">
              {gallery.length > 0 ? (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {gallery.map((img, index) => (
                          <div key={index} className="relative group aspect-square">
                              <img src={getPreviewUrl(img)} className={`w-full h-full object-cover rounded-lg transition-all duration-300 ${primaryImage === img ? 'ring-2 ring-offset-1 ring-offset-white ring-admin-dark-primary' : ''}`} alt="Gallery item" />
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                                  <button type="button" onClick={() => setPrimaryImage(img)} className="p-1.5 bg-black/50 text-white rounded-full hover:bg-admin-dark-primary" title="Set as Primary">
                                      <StarIcon className={`w-3 h-3 ${primaryImage === img ? 'text-yellow-400' : ''}`} />
                                  </button>
                                  <button type="button" onClick={() => removeImage(img)} className="p-1.5 bg-black/50 text-white rounded-full hover:bg-red-500/80" title="Delete Image">
                                      <TrashIcon className="w-3 h-3" />
                                  </button>
                              </div>
                          </div>
                      ))}
                  </div>
              ) : (
                  <div className="text-center py-4">
                      <p className="text-xs text-admin-dark-text-secondary">No images.</p>
                  </div>
              )}
               <div className="mt-2 pt-2 border-t border-admin-dark-border">
                   <input id="image-upload" type="file" multiple accept="image/png, image/jpeg" onChange={handleImageUpload} className={fileInputClasses} />
               </div>
          </div>
      </div>

      <div className="flex items-center gap-4 pt-4 border-t border-admin-dark-border">
          <button type="submit" disabled={isLoading || isCompressing} className="flex items-center gap-2 bg-admin-dark-primary text-white px-4 py-2 rounded-lg font-bold text-xs sm:text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
              {isLoading ? 'Wait...' : 'Save'}
          </button>
          <button type="button" onClick={onCancel} className="bg-white border border-admin-dark-border px-4 py-2 rounded-lg font-bold text-xs sm:text-sm text-admin-dark-text-secondary hover:bg-gray-50 transition-opacity">Cancel</button>
      </div>
    </form>
  );
};

// --- Main Manager Component ---
interface PortfolioManagerProps {
  portfolioData: PortfolioItem[];
  onAddPortfolioItem: (item: Omit<PortfolioItem, 'id'>) => Promise<void>;
  onUpdatePortfolioItem: (item: PortfolioItem) => Promise<void>;
  onDeletePortfolioItem: (id: string) => Promise<void>;
  startTour: (tourKey: 'art') => void;
}

const PortfolioManager: React.FC<PortfolioManagerProps> = ({
  portfolioData, onAddPortfolioItem, onUpdatePortfolioItem, onDeletePortfolioItem, startTour
}) => {
    const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
    const [isAddingNew, setIsAddingNew] = useState(false);

    const handleSaveItem = async (itemData: any) => {
        try {
            const { primaryImage, galleryImages, videoFile, ...restOfData } = itemData;

            const primaryImageUrl = primaryImage instanceof File ? await dbUploadFile(primaryImage, 'portfolio') : primaryImage;

            const galleryImageUrls = await Promise.all(
                (galleryImages || []).map((img: string | File) =>
                    img instanceof File ? dbUploadFile(img, 'portfolio') : Promise.resolve(img)
                )
            );
            
            const videoUrl = videoFile instanceof File ? await dbUploadFile(videoFile, 'portfolio', 'videos/') : videoFile ? itemData.videoData : undefined;

            const finalData = { ...restOfData, primaryImage: primaryImageUrl, galleryImages: galleryImageUrls, videoData: videoUrl };
            
            if (isAddingNew) {
                const { id, ...newItemData } = finalData;
                await onAddPortfolioItem(newItemData);
            } else {
                await onUpdatePortfolioItem(finalData as PortfolioItem);
            }
        } catch (error) {
            console.error("Failed to save portfolio item:", error);
            alert("Error saving item. Check the console for details.");
        } finally {
            setEditingItem(null);
            setIsAddingNew(false);
        }
    };

    const handleAddNewItem = () => {
        setEditingItem({} as PortfolioItem); // Use empty object for form
        setIsAddingNew(true);
    };

    const handleDeleteItem = async (id: string) => {
        if (window.confirm('Delete this art piece?')) {
            await onDeletePortfolioItem(id);
        }
    };

    const handleToggleFeature = async (item: PortfolioItem) => {
        await onUpdatePortfolioItem({ ...item, featured: !item.featured });
    };

    return (
        <div className="bg-admin-dark-card border border-admin-dark-border rounded-xl shadow-lg p-3 sm:p-6 space-y-4 sm:space-y-8 h-full flex flex-col">
            <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 flex-shrink-0">
                <div>
                    <h3 className="text-lg sm:text-xl font-bold text-admin-dark-text">Portfolio Items</h3>
                    <p className="text-xs sm:text-sm text-admin-dark-text-secondary mt-1">Manage masterpieces.</p>
                </div>
                {!(isAddingNew || editingItem) && (
                    <button data-tour-id="add-new-item-button" onClick={handleAddNewItem} className="flex items-center gap-2 bg-admin-dark-primary text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-bold text-xs sm:text-sm hover:opacity-90 transition-opacity self-start sm:self-auto">
                        <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5"/>
                        Add
                    </button>
                )}
            </header>
            
            {/* Updated Grid Layout: 3 Columns on Mobile */}
            <div data-tour-id="portfolio-item-list" className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4 overflow-y-auto pr-1">
                {(isAddingNew || editingItem) && 
                    <div className="col-span-full">
                        <PortfolioItemEditForm 
                            initialItem={editingItem || {}} 
                            onSave={handleSaveItem} 
                            onCancel={() => { setEditingItem(null); setIsAddingNew(false); }} 
                            isAddingNew={isAddingNew}
                        />
                    </div>
                }

                {!editingItem && !isAddingNew && portfolioData.map(item => (
                    <div key={item.id} className="bg-white border border-admin-dark-border rounded-lg p-2 sm:p-3 flex flex-col justify-between gap-2 hover:border-admin-dark-primary/30 transition-colors shadow-sm">
                        <div className="flex flex-col gap-2">
                            <img src={item.primaryImage} alt={item.title} className="w-full h-20 sm:h-32 object-cover rounded-lg shadow-sm"/>
                            <div className="overflow-hidden">
                                <p className="font-semibold text-admin-dark-text truncate text-[10px] sm:text-sm">{item.title}</p>
                                <p className="text-[9px] sm:text-xs text-admin-dark-text-secondary truncate mt-0.5">{item.story}</p>
                                {item.videoData && <span className="text-[8px] sm:text-[10px] uppercase tracking-wider font-bold text-blue-500 mt-0.5 block">Video</span>}
                            </div>
                        </div>
                        <div className="flex justify-between items-center border-t border-admin-dark-border pt-2 mt-auto">
                            <button onClick={() => handleToggleFeature(item)} className={`p-1 rounded text-[10px] font-bold border ${item.featured ? 'bg-admin-dark-primary text-white border-admin-dark-primary' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
                                Feat.
                            </button>
                            <div className="flex gap-1">
                                <button onClick={() => { setIsAddingNew(false); setEditingItem(item); }} className="p-1 hover:bg-black/5 rounded text-admin-dark-text-secondary" aria-label="Edit">
                                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z"></path></svg>
                                </button>
                                <button onClick={() => handleDeleteItem(item.id)} className="p-1 hover:bg-red-50 text-red-400 rounded" aria-label="Delete">
                                    <TrashIcon className="w-3 h-3 sm:w-4 sm:h-4"/>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PortfolioManager;
