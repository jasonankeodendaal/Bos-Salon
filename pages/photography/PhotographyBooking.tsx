import React, { useState } from 'react';
import { dbAddItem, dbUploadFile } from '../../utils/dbAdapter';

const PhotographyBooking: React.FC<{ settings: any }> = ({ settings }) => {
  const [formData, setFormData] = useState({
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      service: '',
      date: '',
      time: '',
      message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [waLink, setWaLink] = useState('');
  const [error, setError] = useState('');
  const [referenceImages, setReferenceImages] = useState<File[]>([]);
  const [referenceImagePreviews, setReferenceImagePreviews] = useState<string[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  
  const pricingOpts = settings.bookingOptions || [];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      referenceImagePreviews.forEach(URL.revokeObjectURL);
      if (e.target.files && e.target.files.length > 0) {
          const files = Array.from(e.target.files);
          setReferenceImages(files);
          setReferenceImagePreviews(files.map(file => URL.createObjectURL(file)));
      } else {
          setReferenceImages([]);
          setReferenceImagePreviews([]);
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      setError('');
      try {
          let referenceImageUrls: string[] = [];
          if (referenceImages.length > 0) {
              const uploadPromises = referenceImages.map(file => 
                  dbUploadFile(file, 'media', 'booking-refs/').then(url => `${url}?download=`)
              );
              referenceImageUrls = await Promise.all(uploadPromises);
          }

          await dbAddItem('photo_bookings', {
              ...formData,
              status: 'pending'
          });
          
          const message = `📸 *New Photography Inquiry | Magical Memories* 📸

👤 *Client Details*
• Name: ${formData.clientName}
• Email: ${formData.clientEmail}
• Phone: ${formData.clientPhone}

📅 *Event/Shoot Details*
• Service Type: ${formData.service || 'Not specified'}
• Preferred Date: ${formData.date}
• Preferred Time: ${formData.time}

💬 *Message/Vision*
${formData.message || 'No additional details provided.'}

🖼️ *Reference Images/Inspiration*
${referenceImageUrls.length > 0 ? referenceImageUrls.join('\n') : 'No images attached.'}

_Sent via Magical Memories Booking Portal_`;
        
          // Redirect to WhatsApp
          const adminPhone = settings?.whatsAppNumber || "27795904162";
          const cleanPhone = adminPhone.replace(/\D/g, '');
          const whatsAppLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

          setWaLink(whatsAppLink);
          setSuccess(true);
          setFormData({ clientName: '', clientEmail: '', clientPhone: '', service: '', date: '', time: '', message: '' });
          setReferenceImages([]);
          setReferenceImagePreviews([]);
          
          setTimeout(() => {
              window.open(whatsAppLink, '_blank') || (window.location.href = whatsAppLink);
          }, 1500);
      } catch (err: any) {
          setError(err.message || 'Failed to submit booking. Please try again.');
      } finally {
          setIsSubmitting(false);
      }
  };

  const inputClass = "w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-stone-200 focus:outline-none focus:border-stone-400 transition-colors focus:ring-1 focus:ring-stone-400 shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)] text-sm";

  return (
    <div className="w-full pb-16 md:pb-20">
      <div className="text-center mb-10 md:mb-16">
          <p className="text-[9px] md:text-[10px] font-bold tracking-[0.2em] md:tracking-[0.3em] uppercase text-stone-500 mb-3 md:mb-4">Pricing & Commissions</p>
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tighter text-white drop-shadow-lg uppercase">Investment</h2>
          <div className="w-px h-10 md:h-16 bg-gradient-to-b from-stone-500/0 via-stone-500/50 to-stone-500/0 mx-auto mt-6 md:mt-8"></div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 lg:gap-24 items-start">
        
        {/* Pricing / Packages Column */}
        <div className="xl:col-span-6 space-y-8 md:space-y-10">
            <h3 className="text-xl md:text-2xl font-light tracking-tight text-stone-200 border-b border-white/5 pb-4">Curated Experiences</h3>
            
            {pricingOpts.length === 0 ? (
                <div className="p-6 md:p-8 border border-white/5 flex items-center justify-center">
                    <p className="text-stone-500 font-light text-xs md:text-sm italic">Please contact us for custom quotes.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {pricingOpts.map((opt: any, idx: number) => {
                        const images = opt.images || [];
                        const previewImages = images.slice(0, 4);

                        return (
                            <div 
                                key={idx} 
                                onClick={() => setSelectedPackage(opt)}
                                className="group relative w-full aspect-square md:aspect-[4/5] overflow-hidden cursor-pointer bg-[#0a0a0a] rounded-xl border border-white/5"
                            >
                                {/* Gallery Grid Layout for Thumbnail */}
                                <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-[1px]">
                                    {previewImages.map((img: string, i: number) => (
                                        <div key={i} className={`flex items-center justify-center overflow-hidden bg-[#000] ${previewImages.length === 1 ? 'col-span-2 row-span-2' : previewImages.length === 2 ? 'col-span-1 row-span-2' : previewImages.length === 3 && i === 0 ? 'col-span-2 row-span-1' : ''}`}>
                                            <img src={img} className="w-full h-full object-cover grayscale mix-blend-luminosity opacity-70 group-hover:mix-blend-normal group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000 group-hover:scale-105" alt={`preview-${i}`} />
                                        </div>
                                    ))}
                                    {previewImages.length === 0 && (
                                        <div className="col-span-2 row-span-2 bg-[#050505] flex items-center justify-center text-[10px] text-stone-600 uppercase tracking-widest font-bold">No Media</div>
                                    )}
                                </div>
                                
                                {/* Overlay / Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none transition-opacity duration-700 group-hover:opacity-80"></div>
                                
                                {/* Content */}
                                <div className="absolute inset-0 p-5 md:p-6 flex flex-col justify-end pointer-events-none">
                                    <div className="flex flex-col gap-1 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                        <h3 className="text-lg md:text-xl font-bold text-white drop-shadow-md tracking-tight uppercase line-clamp-1">{opt.label || 'Package Name'}</h3>
                                        <div className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-stone-400">R {opt.price || '0'}</div>
                                    </div>
                                    {opt.images?.length > 4 && (
                                      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[9px] md:text-[10px] text-stone-300 font-bold tracking-widest uppercase">
                                          +{opt.images.length - 4}
                                      </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>

        {/* Booking Form Column */}
        <div className="xl:col-span-6">
            <h3 className="text-xl md:text-2xl font-light tracking-tight text-stone-200 border-b border-white/5 pb-4 mb-6 md:mb-8">Secure a Session</h3>
             
             {success ? (
                 <div className="bg-[#121212] border border-white/5 text-stone-200 p-8 text-center shadow-inner pt-16 pb-16">
                     <h3 className="text-xl font-bold mb-4 tracking-wide uppercase">Request Received</h3>
                     <p className="text-stone-400 text-sm font-light max-w-sm mx-auto mb-6">Successfully submitted. You are being redirected to WhatsApp to send your details. If nothing happens, please click below.</p>
                     
                     <div className="flex flex-col items-center justify-center gap-4">
                         {waLink && (
                             <a 
                                 href={waLink} 
                                 target="_blank" 
                                 rel="noopener noreferrer"
                                 className="px-8 py-4 bg-[#25D366] text-white font-bold uppercase tracking-widest text-[11px] shadow-lg hover:bg-[#1ebd5a] transition rounded flex items-center justify-center gap-3 w-full sm:w-auto"
                             >
                                 Open WhatsApp to Send
                             </a>
                         )}
                         <button onClick={() => setSuccess(false)} className="px-8 py-3 text-stone-500 font-bold uppercase tracking-widest text-[10px] hover:text-white transition">
                             New Request
                         </button>
                     </div>
                 </div>
             ) : (
                 <form onSubmit={handleSubmit} className="space-y-8">
                     {error && <div className="bg-red-950/40 border border-red-500/30 text-red-200 p-4 text-xs tracking-wide">{error}</div>}
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                             <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">Full Name</label>
                             <input required type="text" className={inputClass} value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} placeholder="Jane Doe" />
                         </div>
                         <div>
                             <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">Email Address</label>
                             <input required type="email" className={inputClass} value={formData.clientEmail} onChange={e => setFormData({...formData, clientEmail: e.target.value})} placeholder="jane@example.com" />
                         </div>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                             <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">Phone / WhatsApp</label>
                             <input type="tel" className={inputClass} value={formData.clientPhone} onChange={e => setFormData({...formData, clientPhone: e.target.value})} placeholder="+27 00 000 0000" />
                         </div>
                         <div>
                             <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">Service / Package</label>
                             <select className={`${inputClass} appearance-none cursor-pointer`} value={formData.service} onChange={e => setFormData({...formData, service: e.target.value})}>
                                 <option value="">Select a service...</option>
                                 {pricingOpts.map((opt: any, idx: number) => (
                                     <option key={idx} value={opt.label || `pkg-${idx}`}>{opt.label} - R{opt.price}</option>
                                 ))}
                                 <option value="custom">Custom Request</option>
                             </select>
                         </div>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                             <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">Preferred Date</label>
                             <input type="date" className={`${inputClass} unstyled-date [color-scheme:dark]`} value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                         </div>
                         <div>
                             <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">Preferred Time</label>
                             <input type="time" className={`${inputClass} unstyled-time [color-scheme:dark]`} value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
                         </div>
                     </div>
                     <div>
                         <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">Tell us about your shoot</label>
                         <textarea required rows={4} className={inputClass} value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} placeholder="Locations, ideas, expectations..."></textarea>
                     </div>
                     <div>
                         <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">Moodboard / References</label>
                         <input type="file" multiple accept="image/*" onChange={handleImageChange} className="block w-full text-xs text-stone-400 file:mr-4 file:py-2.5 file:px-4 file:border-0 file:text-[10px] file:uppercase file:tracking-widest file:font-bold file:bg-stone-800 file:text-stone-300 hover:file:bg-stone-700 transition cursor-pointer border border-white/5 px-2 py-2 bg-[#0a0a0a]"/>
                         {referenceImagePreviews.length > 0 && (
                             <div className="mt-4 flex flex-wrap gap-2 p-4 bg-[#121212] border border-white/5">
                                 {referenceImagePreviews.map((src, index) => (
                                     <img key={index} src={src} alt={`Preview ${index + 1}`} className="w-16 h-16 object-cover opacity-80" />
                                 ))}
                             </div>
                         )}
                     </div>
                     <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full bg-stone-200 text-black py-4 font-bold uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50 shadow-lg text-[10px] mt-4"
                     >
                         {isSubmitting ? 'Transferring...' : 'Dispatch Request'}
                     </button>
                 </form>
             )}
        </div>
      </div>

      {/* Package Details Modal */}
      {selectedPackage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0 bg-black/95 backdrop-blur-md" onClick={() => setSelectedPackage(null)}>
              <div 
                  className="bg-[#050505] sm:rounded-[2rem] w-full max-w-6xl h-full sm:h-[85vh] overflow-hidden flex flex-col sm:flex-row shadow-2xl relative border border-white/5"
                  onClick={e => e.stopPropagation()}
              >
                  {/* Left Column: Fixed Content */}
                  <div className="w-full sm:w-[40%] bg-[#0a0a0a] p-8 md:p-12 border-b sm:border-b-0 sm:border-r border-white/5 flex flex-col justify-between shrink-0 overflow-y-auto">
                      <div>
                          <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-stone-500 mb-4">Investment View</p>
                          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white drop-shadow-sm mb-4 leading-none">{selectedPackage.label}</h2>
                          <div className="inline-block px-4 py-2 bg-white text-black text-xs font-bold uppercase tracking-widest rounded-xl mb-6 shadow-md">
                              R {selectedPackage.price}
                          </div>
                          <div className="prose prose-invert prose-stone text-stone-400 text-sm font-light leading-relaxed">
                              {selectedPackage.description?.split('\n').map((line:string, j:number)=><p key={j}>{line}</p>)}
                          </div>
                      </div>
                      
                      <div className="mt-12 space-y-4">
                          <button onClick={() => {
                              setFormData({...formData, service: selectedPackage.label});
                              setSelectedPackage(null);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                          }} className="w-full bg-stone-200 text-black px-6 py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-white transition shadow-lg">
                              Request This Package
                          </button>
                          <button onClick={() => setSelectedPackage(null)} className="w-full text-center text-[10px] uppercase tracking-widest text-stone-500 hover:text-white transition font-bold py-2">
                              Close Gallery
                          </button>
                      </div>
                  </div>

                  {/* Right Column: Scrollable Gallery */}
                  <div className="flex-1 p-6 md:p-10 overflow-y-auto bg-black">
                      {!selectedPackage.images || selectedPackage.images.length === 0 ? (
                          <div className="flex items-center justify-center h-full border border-white/5 text-stone-600 text-[10px] tracking-widest uppercase">
                              No Media Assigned
                          </div>
                      ) : (
                          <div className="columns-1 md:columns-2 gap-4 space-y-4">
                              {selectedPackage.images.map((imgUrl: string, idx: number) => (
                                  <div key={idx} className="relative group overflow-hidden bg-stone-900 border border-white/5">
                                      <img src={imgUrl} alt={`Review ${idx}`} className="w-full auto object-contain" loading="lazy" />
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default PhotographyBooking;
