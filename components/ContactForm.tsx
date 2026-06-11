
import React, { useState } from 'react';
import { Booking } from '../App';
import { dbUploadFile } from '../utils/dbAdapter';

interface ContactFormProps {
    onAddBooking: (booking: Omit<Booking, 'id' | 'status' | 'bookingType'>) => void;
    settings?: any;
}

const ContactForm: React.FC<ContactFormProps> = ({ onAddBooking, settings }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [message, setMessage] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [waLink, setWaLink] = useState('');
  const [referenceImages, setReferenceImages] = useState<File[]>([]);
  const [referenceImagePreviews, setReferenceImagePreviews] = useState<string[]>([]);

  // Destructure content settings with fallbacks
  const contactContent = settings?.contact || {};
  const bookingOptions = settings?.bookingOptions || [];
  const processTitle = contactContent.processTitle || 'Our Process';
  const processIntro = contactContent.processIntro || "We believe in personal care. Whether it's a simple tattoo or complex custom art, we ensure every detail is perfect.";
  const processSteps = contactContent.processSteps || [
      "Request Appointment: Use this form to tell us what service you need.",
      "Consultation: We'll contact you to confirm details, colors, and specific requirements.",
      "Relax & Enjoy: Come in, relax in our studio, and let us work our magic."
  ];

  const toggleOption = (label: string) => {
    setSelectedOptions(prev => 
        prev.includes(label) 
            ? prev.filter(item => item !== label) 
            : [...prev, label]
    );
  };
  const designTitle = contactContent.designTitle || 'Design Ideas?';
  const designIntro = contactContent.designIntro || "If you have a specific design in mind, let us know!";
  const designPoints = contactContent.designPoints || [
      "Service Type: Fine Line, Traditional, Realism, or Custom Art?",
      "Inspiration: Upload photos of designs you love."
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Clean up old object URLs to prevent memory leaks
    referenceImagePreviews.forEach(URL.revokeObjectURL);

    if (e.target.files && e.target.files.length > 0) {
        const files: File[] = Array.from(e.target.files);
        if (files.length > 5) {
            setErrorMessage("You can only upload a maximum of 5 images.");
            e.target.value = '';
            setReferenceImages([]);
            setReferenceImagePreviews([]);
            return;
        }
        setReferenceImages(files);
        setReferenceImagePreviews(files.map(file => URL.createObjectURL(file)));
    } else {
        setReferenceImages([]);
        setReferenceImagePreviews([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message || !bookingDate || !whatsappNumber) {
      setErrorMessage('Please fill out all required fields to request a booking.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    
    let referenceImageUrls: string[] = [];
    if (referenceImages.length > 0) {
        try {
            const uploadPromises = referenceImages.map(file => 
                dbUploadFile(file, 'media', 'booking-references/').then(url => `${url}?download=`)
            );
            referenceImageUrls = await Promise.all(uploadPromises);
        } catch (error) {
            console.error("Error uploading reference images:", error);
            setErrorMessage('There was an error uploading your images. Please try again.');
            setIsLoading(false);
            return;
        }
    }

    onAddBooking({ 
        name, 
        email, 
        message, 
        bookingDate, 
        whatsappNumber,
        referenceImages: referenceImageUrls,
        selectedOptions
    });
    
    // Build WhatsApp message
    const waMessage = `✨ *New Appointment Request | Bos Salon* ✨

👤 *Client Details*
• Name: ${name}
• Email: ${email}
• WhatsApp: ${whatsappNumber}

📅 *Booking Preference*
• Requested Date: ${bookingDate}
• Selected Services: ${selectedOptions.length > 0 ? selectedOptions.join(', ') : 'None selected'}

💬 *Additional Notes*
${message || 'No additional message provided.'}

📸 *Reference Material*
${referenceImageUrls.length > 0 ? referenceImageUrls.join('\n') : 'No images attached.'}

_Sent via Bos Salon Booking Portal_`;
    
    // Redirect to WhatsApp
    const adminPhone = settings?.whatsAppNumber || "27795904162";
    const cleanPhone = adminPhone.replace(/\D/g, '');
    const whatsAppLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waMessage)}`;
    
    setWaLink(whatsAppLink);

    // Reset form and show success message
    setName('');
    setEmail('');
    setWhatsappNumber('');
    setMessage('');
    setBookingDate('');
    setSelectedOptions([]);
    referenceImagePreviews.forEach(URL.revokeObjectURL);
    setReferenceImages([]);
    setReferenceImagePreviews([]);
    setErrorMessage('');
    setIsLoading(false);
    setSuccessMessage('Booking request processing... Redirecting to WhatsApp to send message.');
    
    // Attempt redirect
    setTimeout(() => {
        window.open(whatsAppLink, '_blank') || (window.location.href = whatsAppLink);
        setSuccessMessage('Successfully submitted. If WhatsApp did not open, make sure pop-ups are allowed.');
    }, 1500);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <>
      <div className="bg-brand-dark">
        <div className="container mx-auto px-4">
          <div className="h-px bg-gradient-to-r from-brand-dark via-gray-200 to-brand-dark"></div>
        </div>
      </div>
      <section id="contact-form" className="bg-brand-dark py-16 sm:py-24 text-brand-light">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                  <h2 className="font-script text-5xl sm:text-6xl mb-4 text-brand-green">Get In Touch</h2>
                  <p className="text-gray-600 max-w-2xl mx-auto">{settings?.contact?.intro || 'Ready for a fresh look? Fill out the form below.'}</p>
              </div>
              <div className="grid lg:grid-cols-2 gap-16 items-start">
                  <div className="lg:mt-8 text-gray-700">
                      <div className="border-l-4 border-brand-green pl-6">
                          <h4 className="font-bold text-2xl text-brand-light mb-2">{processTitle}</h4>
                           <p className="text-sm leading-relaxed text-gray-600 mb-4">
                              {processIntro}
                          </p>
                          <ol className="list-none space-y-3 text-sm">
                              {processSteps.map((step: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-3">
                                    <span className="font-bold text-brand-green">{idx + 1}.</span>
                                    <span>{step}</span>
                                </li>
                              ))}
                          </ol>
                      </div>
                       <div className="mt-10 border-l-4 border-brand-green pl-6">
                          <h4 className="font-bold text-2xl text-brand-light mb-2">{designTitle}</h4>
                          <p className="text-sm leading-relaxed text-gray-600 mb-4">
                              {designIntro}
                          </p>
                           <ul className="list-none space-y-3 text-sm mt-4">
                              {designPoints.map((point: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-3">
                                    <span className="text-brand-green mt-1">🌿</span>
                                    <span>{point}</span>
                                </li>
                              ))}
                           </ul>
                      </div>
                  </div>
                  
                  {/* 3D Form Container */}
                  <div className="relative w-full [perspective:1000px]">
                      {/* Lid */}
                      <div className="absolute -top-12 left-0 w-full h-24 bg-white rounded-t-xl border-t border-x border-gray-200 [transform:rotateX(25deg)] [transform-origin:bottom_center] shadow-xl">
                         <div className="w-1/3 h-2 bg-gray-200 mx-auto mt-3 rounded-full"></div>
                      </div>

                      {/* Box Body */}
                      <div className="relative bg-white border border-gray-200 rounded-xl shadow-2xl shadow-gray-200">
                         
                         <div className="relative p-8">
                            <h3 className="font-bold text-2xl mb-6 text-brand-light text-center">Request Booking/Quote</h3>
                            <form onSubmit={handleSubmit} className="space-y-6 text-left">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-600 mb-2">Name</label>
                                        <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" className="w-full bg-brand-off-white border border-gray-300 rounded-lg p-3 text-brand-light focus:ring-2 focus:ring-brand-green focus:border-brand-green outline-none" required/>
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-2">Email</label>
                                        <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email Address" className="w-full bg-brand-off-white border border-gray-300 rounded-lg p-3 text-brand-light focus:ring-2 focus:ring-brand-green focus:border-brand-green outline-none" required/>
                                    </div>
                                </div>

                                {/* WhatsApp Number Input (Always Visible) */}
                                <div>
                                    <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-600 mb-2">WhatsApp Number</label>
                                    <input type="tel" id="whatsapp" value={whatsappNumber} onChange={e => setWhatsappNumber(e.target.value)} placeholder="e.g. 27795904162" className="w-full bg-brand-off-white border border-gray-300 rounded-lg p-3 text-brand-light focus:ring-2 focus:ring-brand-green focus:border-brand-green outline-none" required/>
                                </div>

                                {bookingOptions.length > 0 && (
                                    <div className="py-4 border-y border-gray-100 relative">
                                        <label className="block text-sm font-bold text-brand-light uppercase tracking-wider mb-2">Select Options</label>
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const menu = document.getElementById('options-menu');
                                                    if(menu) menu.classList.toggle('hidden');
                                                }}
                                                className="w-full flex items-center justify-between p-3 border rounded-lg bg-white text-sm text-brand-light hover:bg-gray-50 focus:ring-2 focus:ring-brand-green outline-none"
                                            >
                                                <span>{selectedOptions.length > 0 ? `${selectedOptions.length} option(s) selected` : 'Select options...'}</span>
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
                                            </button>
                                            <div id="options-menu" className="hidden absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto p-2 space-y-3">
                                                {Object.entries(bookingOptions.reduce((acc: any, opt: any) => {
                                                    const cat = opt.category || 'Uncategorized';
                                                    if (!acc[cat]) acc[cat] = [];
                                                    acc[cat].push(opt);
                                                    return acc;
                                                }, {})).map(([category, opts]: [string, any]) => (
                                                    <div key={category}>
                                                        <h4 className="font-bold text-xs uppercase text-brand-green border-b border-gray-100 pb-1 mb-1">{category}</h4>
                                                        {opts.map((opt: any) => (
                                                            <label key={opt.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer">
                                                                <div className="flex items-center gap-2">
                                                                    <input 
                                                                        type="checkbox" 
                                                                        checked={selectedOptions.includes(opt.label)}
                                                                        onChange={() => {
                                                                            setSelectedOptions(prev => 
                                                                                prev.includes(opt.label) 
                                                                                    ? prev.filter(l => l !== opt.label) 
                                                                                    : [...prev, opt.label]
                                                                            )
                                                                        }}
                                                                        className="accent-brand-green"
                                                                    />
                                                                    <span className="text-sm text-brand-light">{opt.label}</span>
                                                                </div>
                                                                <span className="text-xs text-gray-400 font-bold italic">R{opt.price || 0}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label htmlFor="bookingDate" className="block text-sm font-medium text-gray-600 mb-2">Preferred Date</label>
                                    <input type="date" id="bookingDate" value={bookingDate} onChange={e => setBookingDate(e.target.value)} min={today} className="w-full bg-brand-off-white border border-gray-300 rounded-lg p-3 text-brand-light focus:ring-2 focus:ring-brand-green focus:border-brand-green outline-none" required />
                                </div>
                                <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-600 mb-2">Message / Service Details</label>
                                <textarea id="message" rows={4} value={message} onChange={e => setMessage(e.target.value)} placeholder="Tell us about the service or design you want..." className="w-full bg-brand-off-white border border-gray-300 rounded-lg p-3 text-brand-light focus:ring-2 focus:ring-brand-green focus:border-brand-green outline-none" required></textarea>
                                </div>
                                <div>
                                    <label htmlFor="referenceImage" className="block text-sm font-medium text-gray-600 mb-2">Reference Images (Optional, up to 5)</label>
                                    <input type="file" id="referenceImage" multiple accept="image/*" onChange={handleImageChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-green/10 file:text-brand-green hover:file:bg-brand-green/20"/>
                                    {referenceImagePreviews.length > 0 && (
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {referenceImagePreviews.map((src, index) => (
                                                <img key={index} src={src} alt={`Preview ${index + 1}`} className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                                            ))}
                                        </div>
                                    )}
                                </div>
                                
                                {errorMessage && <p className="text-center text-red-500 text-sm">{errorMessage}</p>}
                                {successMessage && (
                                    <div className="text-center">
                                         <p className="text-green-600 text-sm font-bold mb-4">{successMessage}</p>
                                         {waLink && (
                                             <a 
                                                 href={waLink} 
                                                 target="_blank" 
                                                 rel="noopener noreferrer"
                                                 className="inline-flex items-center justify-center bg-[#25D366] text-white py-3 px-6 rounded-full font-bold shadow hover:bg-[#1ebd5a] transition"
                                             >
                                                 Click Here to Open WhatsApp
                                             </a>
                                         )}
                                    </div>
                                )}

                                <div>
                                <button type="submit" disabled={isLoading || !!successMessage} className="w-full bg-brand-green text-white py-3 rounded-full font-bold text-lg hover:bg-opacity-90 transition-all duration-300 mt-2 transform hover:-translate-y-1 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0">
                                    {isLoading ? 'Sending...' : 'Book an appointment'}
                                </button>
                                </div>
                            </form>
                         </div>
                      </div>
                  </div>
              </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ContactForm;
