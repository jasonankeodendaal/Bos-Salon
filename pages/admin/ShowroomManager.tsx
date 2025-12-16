
import React, { useState, useEffect } from 'react';
import { Genre, ShowroomItem } from '../../App';
import TrashIcon from '../../components/icons/TrashIcon';
import PlusIcon from '../../components/icons/PlusIcon';
import { dbUploadFile } from '../../utils/dbAdapter';
import { compressVideo } from '../../utils/mediaOptimizer';

const ShowroomItemForm = ({
  initialItem,
  onSave,
  onCancel,
}: {
  initialItem: Partial<ShowroomItem>;
  onSave: (itemData: {
      id: string;
      title: string;
      images: (string | File)[];
      videoUrl?: string | File;
  }) => Promise<void>;
  onCancel: () => void;
}) => {
  const [title, setTitle] = useState(initialItem.title || '');
  const [images, setImages] = useState<(string | File)[]>(initialItem.images || []);
  const [video, setVideo] = useState<string | File | undefined>(initialItem.videoUrl);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);

  useEffect(() => {
    const objectUrls: string[] = [];
    const previews = images.map(img => {
        if (typeof img === 'string') return img;
        const url = URL.createObjectURL(img);
        objectUrls.push(url);
        return url;
    });
    setImagePreviews(previews);
    return () => {
        objectUrls.forEach(URL.revokeObjectURL);
    };
  }, [images]);

  useEffect(() => {
    let objectUrl: string | null = null;
    if (video) {
        if (typeof video === 'string') {
            setVideoPreviewUrl(video);
        } else {
            objectUrl = URL.createObjectURL(video);
            setVideoPreviewUrl(objectUrl);
        }
    } else {
        setVideoPreviewUrl('');
    }
    return () => {
        if (objectUrl) {
            URL.revokeObjectURL(objectUrl);
        }
    };
  }, [video]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
        const currentImageCount = images.length;
        if (currentImageCount + files.length > 5) {
            alert("You can only upload a maximum of 5 images per piece.");
            return;
        }
        setImages(prev => [...prev, ...Array.from(files)]);
    }
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
            setVideo(compressedFile);
        } catch (error) {
            console.error("Video compression failed:", error);
            alert("Video compression failed. Uploading the original file instead.");
            setVideo(originalFile);
        } finally {
            setIsCompressing(false);
        }
    }
  };

  const removeImage = (index: number) => {
      setImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeVideo = () => setVideo(undefined);

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!title || images.length === 0) {
          alert("A title and at least one image are required.");
          return;
      }
      await onSave({
        id: initialItem.id || Date.now().toString(),
        title: title,
        images: images,
        videoUrl: video
      });
  };
  
  const inputClasses = "w-full bg-white border border-admin-dark-border rounded-lg p-2 text-admin-dark-text text-sm focus:ring-1 focus:ring-admin-dark-primary outline-none transition";

  return (
    <form onSubmit={handleSubmit} className="col-span-full bg-white/50 border border-admin-dark-border rounded-2xl p-4 my-4 space-y-4 animate-fade-in shadow-sm">
        <h3 className="text-lg font-bold text-admin-dark-text">{initialItem.id ? 'Edit' : 'Add'} Piece</h3>
        <div>
            <label className="block text-xs font-semibold mb-1 text-admin-dark-text-secondary">Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClasses} required />
        </div>
        <div>
            <label className="block text-xs font-semibold mb-1 text-admin-dark-text-secondary">Images</label>
            <div className="bg-white/50 border border-admin-dark-border rounded-lg p-2">
                <div className="grid grid-cols-5 gap-2 mb-2">
                    {imagePreviews.map((src, index) => (
                        <div key={index} className="relative group aspect-square">
                            <img src={src} alt="preview" className="w-full h-full object-cover rounded-md"/>
                            <button type="button" onClick={() => removeImage(index)} className="absolute -top-1 -right-1 p-0.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg>
                            </button>
                        </div>
                    ))}
                </div>
                {images.length < 5 && (
                    <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="block w-full text-xs text-admin-dark-text-secondary"/>
                )}
            </div>
        </div>
        <div>
            <label className="block text-xs font-semibold mb-1 text-admin-dark-text-secondary">Video (Opt)</label>
            {isCompressing ? (
                <div className="w-full bg-white p-2 rounded-lg text-center border border-gray-200">
                    <p className="text-xs text-admin-dark-text-secondary mb-1">Compressing...</p>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div className="bg-admin-dark-primary h-1.5 rounded-full" style={{ width: `${compressionProgress}%` }}></div>
                    </div>
                </div>
            ) : videoPreviewUrl ? (
                <div className="relative">
                    <video src={videoPreviewUrl} controls className="w-full max-w-xs rounded-lg bg-black max-h-24 object-contain"/>
                    <button type="button" onClick={removeVideo} className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full hover:bg-red-500/80 transition-colors">
                        <TrashIcon className="w-3 h-3" />
                    </button>
                </div>
            ) : (
                <input type="file" accept="video/*" onChange={handleVideoUpload} className="block w-full text-xs text-admin-dark-text-secondary"/>
            )}
        </div>
        <div className="flex items-center gap-3 pt-2 border-t border-admin-dark-border">
            <button type="submit" disabled={isCompressing} className="bg-admin-dark-primary text-white px-4 py-1.5 rounded-lg font-bold text-xs hover:opacity-90 disabled:opacity-50">Save</button>
            <button type="button" onClick={onCancel} className="bg-white border border-admin-dark-border px-4 py-1.5 rounded-lg font-bold text-xs text-admin-dark-text-secondary hover:bg-gray-50">Cancel</button>
        </div>
    </form>
  )
}

interface ShowroomManagerProps {
  showroomData: Genre[];
  onAddShowroomGenre: (genre: Omit<Genre, 'id'>) => Promise<void>;
  onUpdateShowroomGenre: (genre: Genre) => Promise<void>;
  onDeleteShowroomGenre: (id: string) => Promise<void>;
  startTour: (tourKey: 'art') => void;
}

const ShowroomManager: React.FC<ShowroomManagerProps> = ({ 
  showroomData, 
  onAddShowroomGenre,
  onUpdateShowroomGenre,
  onDeleteShowroomGenre,
  startTour 
}) => {
    const [editingItem, setEditingItem] = useState<{item: Partial<ShowroomItem>, genreId: string} | null>(null);

    const handleAddGenre = async () => {
        const name = prompt("Enter new genre name:");
        if (name) {
            await onAddShowroomGenre({ name, items: [] });
        }
    };
    
    const handleDeleteGenre = async (genreId: string) => {
        if (window.confirm("Delete genre?")) {
            await onDeleteShowroomGenre(genreId);
        }
    };

    const handleSaveItem = async (itemData: {
        id: string;
        title: string;
        images: (string | File)[];
        videoUrl?: string | File;
    }) => {
        if (!editingItem) return;
        const { genreId } = editingItem;
        const genreToUpdate = showroomData.find(g => g.id === genreId);
        if (!genreToUpdate) return;
        
        try {
            const imageUrls = await Promise.all(
                itemData.images.map(img => img instanceof File ? dbUploadFile(img, 'showroom', 'images/') : Promise.resolve(img))
            );
    
            let finalVideoUrl: string | undefined;
            if (itemData.videoUrl) {
                finalVideoUrl = itemData.videoUrl instanceof File
                    ? await dbUploadFile(itemData.videoUrl, 'showroom', 'videos/')
                    : itemData.videoUrl;
            }
    
            const finalItemData: ShowroomItem = {
                id: itemData.id,
                title: itemData.title,
                images: imageUrls,
                videoUrl: finalVideoUrl,
            };
    
            const itemExists = genreToUpdate.items.some(i => i.id === finalItemData.id);
            const updatedItems = itemExists
                ? genreToUpdate.items.map(i => i.id === finalItemData.id ? finalItemData : i)
                : [...genreToUpdate.items, finalItemData];
            
            await onUpdateShowroomGenre({ ...genreToUpdate, items: updatedItems });
            setEditingItem(null);
        } catch (error) {
            console.error("Error saving showroom item:", error);
            alert("Error saving.");
        }
    };

    const handleDeleteItem = async (genreId: string, itemId: string) => {
        if (window.confirm("Delete piece?")) {
            const genreToUpdate = showroomData.find(g => g.id === genreId);
            if(genreToUpdate) {
              const updatedItems = genreToUpdate.items.filter(i => i.id !== itemId);
              await onUpdateShowroomGenre({ ...genreToUpdate, items: updatedItems });
            }
        }
    };

    return (
    <div className="bg-admin-dark-card border border-admin-dark-border rounded-xl shadow-lg p-3 sm:p-6 space-y-4 sm:space-y-8 h-full overflow-y-auto">
        <header className="flex justify-between items-center gap-4 flex-shrink-0">
            <div>
                <h2 className="text-lg sm:text-xl font-bold text-admin-dark-text">Showroom</h2>
                <p className="text-xs sm:text-sm text-admin-dark-text-secondary">Manage flash wall genres.</p>
            </div>
            <button data-tour-id="add-genre-button" onClick={handleAddGenre} className="flex items-center gap-1 bg-admin-dark-primary text-white px-3 py-1.5 rounded-lg font-bold text-xs hover:opacity-90 transition-opacity">
                <PlusIcon className="w-4 h-4"/>
                Add Genre
            </button>
        </header>

        <div data-tour-id="showroom-genre-list" className="space-y-4 sm:space-y-6">
            {showroomData.map(genre => (
                <div key={genre.id} className="bg-white/50 border border-admin-dark-border rounded-lg p-3 sm:p-4">
                    <div className="flex justify-between items-center mb-3">
                        <h4 className="font-semibold text-admin-dark-text text-sm sm:text-base">{genre.name}</h4>
                        <button onClick={() => handleDeleteGenre(genre.id)} className="p-1 hover:bg-red-500/20 text-red-500 rounded-full transition-colors" aria-label={`Delete genre ${genre.name}`}>
                            <TrashIcon className="w-3 h-3 sm:w-4 sm:h-4"/>
                        </button>
                    </div>

                    {editingItem?.genreId === genre.id && (
                        <ShowroomItemForm 
                            initialItem={editingItem.item}
                            onSave={handleSaveItem}
                            onCancel={() => setEditingItem(null)}
                        />
                    )}

                    {/* Grid: 4 Cols Mobile */}
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 sm:gap-3">
                         {genre.items.map(item => (
                            <div key={item.id} className="relative group aspect-square">
                                <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover rounded-md"/>
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                                     <button onClick={() => setEditingItem({ item, genreId: genre.id })} className="p-1 bg-black/50 text-white rounded-full hover:bg-admin-dark-primary">
                                         <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z"/></svg>
                                     </button>
                                     <button onClick={() => handleDeleteItem(genre.id, item.id)} className="p-1 bg-black/50 text-white rounded-full hover:bg-red-500/80">
                                        <TrashIcon className="w-3 h-3"/>
                                     </button>
                                </div>
                            </div>
                        ))}
                        <button 
                            onClick={() => setEditingItem({ item: {}, genreId: genre.id })} 
                            className="flex items-center justify-center aspect-square bg-white border-2 border-dashed border-admin-dark-border rounded-lg text-admin-dark-text-secondary hover:bg-admin-dark-primary/10 hover:text-admin-dark-primary transition-colors"
                        >
                            <PlusIcon className="w-5 h-5"/>
                        </button>
                    </div>
                </div>
            ))}
        </div>
    </div>
    );
};

export default ShowroomManager;
