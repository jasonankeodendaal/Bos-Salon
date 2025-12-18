
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
  const [contactMethod, setContactMethod] = useState<'email' | 'whatsapp'>('email');
  const [message, setMessage] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [referenceImages, setReferenceImages] = useState<File[]>([]);
  const [referenceImagePreviews, setReferenceImagePreviews] = useState<string[]>([]);

  // Destructure content settings with fallbacks
  const contactContent = settings?.contact || {};
  const processTitle = contactContent.processTitle || 'Our Process';
  const processIntro = contactContent.processIntro || "We believe in personal care. Whether it's a simple tattoo or complex custom art, we ensure every detail is perfect.";
  const processSteps = contactContent.processSteps || [
      "Request Appointment: Use this form to tell us what service you need.",
      "Consultation: We'll contact you to confirm details, colors, and specific requirements.",
      "Relax & Enjoy: Come in, relax in our studio, and let us work our magic."
  ];
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
    if (!name || !email || !message || !bookingDate) {
      setErrorMessage('Please fill out all required fields to request a booking.');
      return;
    }
    if (contactMethod === 'whatsapp' && !whatsappNumber) {
      setErrorMessage('Please provide your WhatsApp number if you prefer to be contacted that way.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    
    let referenceImageUrls: string[] = [];
    if (referenceImages.length > 0) {
        try {
            const uploadPromises = referenceImages.map(file => 
                dbUploadFile(file, 'booking-references')
            );
            referenceImageUrls = await Promise.all(uploadPromises);
        } catch (error) {
            console.error("Error uploading reference images:", error);
            setErrorMessage('There was an error uploading your images. Please try again.');
            setIsLoading(false);
            return;
        }
    }

    onAddBooking({ name, email, message, bookingDate, whatsappNumber, contactMethod, referenceImages: referenceImageUrls });
    
    // Reset form and show success message
    setName('');
    setEmail('');
    setWhatsappNumber('');
    setContactMethod('email');
    setMessage('');
    setBookingDate('');
    referenceImagePreviews.forEach(URL.revokeObjectURL);
    setReferenceImages([]);
    setReferenceImagePreviews([]);
    setErrorMessage('');
    setIsLoading(false);
    setSuccessMessage('Your booking request has been sent! We will contact you shortly to confirm.');
    setTimeout(() => setSuccessMessage(''), 5000);
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

                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">Preferred Contact Method</label>
                                    <div className="flex gap-1 rounded-lg bg-brand-off-white border border-gray-300 p-1">
                                        <button type="button" onClick={() => setContactMethod('email')} className={`w-1/2 p-2 rounded-md text-sm font-semibold transition-colors ${contactMethod === 'email' ? 'bg-white shadow-sm text-brand-green' : 'text-gray-500 hover:bg-white/50'}`}>Email</button>
                                        <button type="button" onClick={() => setContactMethod('whatsapp')} className={`w-1/2 p-2 rounded-md text-sm font-semibold transition-colors ${contactMethod === 'whatsapp' ? 'bg-white shadow-sm text-brand-green' : 'text-gray-500 hover:bg-white/50'}`}>WhatsApp</button>
                                    </div>
                                </div>

                                {contactMethod === 'whatsapp' && (
                                    <div className="animate-fade-in">
                                        <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-600 mb-2">WhatsApp Number</label>
                                        <input type="tel" id="whatsapp" value={whatsappNumber} onChange={e => setWhatsappNumber(e.target.value)} placeholder="e.g. 27795904162" className="w-full bg-brand-off-white border border-gray-300 rounded-lg p-3 text-brand-light focus:ring-2 focus:ring-brand-green focus:border-brand-green outline-none" required/>
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
                                {successMessage && <p className="text-center text-green-600 text-sm">{successMessage}</p>}

                                <div>
                                <button type="submit" disabled={isLoading} className="w-full bg-brand-green text-white py-3 rounded-full font-bold text-lg hover:bg-opacity-90 transition-all duration-300 mt-2 transform hover:-translate-y-1 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                                    {isLoading ? 'Sending...' : 'Request Booking/Quote'}
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
