
import { supabase, isSupabaseConfigured } from './supabaseClient';

// --- Types ---
type CollectionName = 'portfolio' | 'specials' | 'showroom' | 'bookings' | 'expenses' | 'inventory' | 'settings' | 'invoices' | 'clients';
type Listener = (data: any[]) => void;
type DocListener = (data: any) => void;

// --- MOCK DATA GENERATORS ---
const generateMockPortfolio = () => [
  {
    id: '1',
    title: 'Marble & Gold Foil',
    story: 'A luxurious combination of soft white marble textures accented with genuine gold leaf. Perfect for weddings or special occasions. Created using hand-painted techniques and premium foil.',
    primaryImage: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=800&q=80',
    galleryImages: ['https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80'],
    featured: true
  },
  {
    id: '2',
    title: 'Classic Red Stiletto',
    story: 'Bold, timeless, and empowering. The perfect shape and shade to make a statement. Sculpted acrylics with a high-gloss gel finish.',
    primaryImage: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=800&q=80',
    galleryImages: [],
    featured: true
  },
  {
    id: '3',
    title: 'Pastel Abstract',
    story: 'Playful swirls of pastel pinks, blues, and lilacs on a nude base. A fun, artistic expression perfect for spring.',
    primaryImage: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=800&q=80',
    galleryImages: [],
    featured: true
  },
  {
    id: '4',
    title: 'Matte Olive & Gold',
    story: 'Understated elegance with a velvety matte finish, paired with subtle gold geometric lines.',
    primaryImage: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80',
    galleryImages: [],
    featured: true
  }
];

const generateMockSpecials = () => [
  {
    id: '1',
    title: 'Gel Polish Special',
    description: 'Get a flawless gel overlay on natural nails. Includes cuticle care, shaping, and a relaxing hand massage.',
    price: 350,
    imageUrl: 'https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?auto=format&fit=crop&w=800&q=80',
    images: ['https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?auto=format&fit=crop&w=800&q=80'],
    active: true,
    priceType: 'fixed',
    priceValue: 350,
    details: ['Solid colors only', 'Soak-off not included', 'Approx 60 mins']
  },
  {
    id: '2',
    title: 'Full Set Acrylics',
    description: 'Extend your length with our durable sculpted acrylics. Includes one feature nail art per hand.',
    price: 550,
    imageUrl: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=800&q=80',
    images: ['https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=800&q=80'],
    active: true,
    priceType: 'fixed',
    priceValue: 550,
    voucherCode: 'NEWSET2024'
  },
  {
    id: '3',
    title: 'Student Mani-Pedi',
    description: '15% off any combination of manicure and pedicure treatments with a valid student ID card.',
    price: 0,
    imageUrl: 'https://images.unsplash.com/photo-1599693359672-8bb06c564102?auto=format&fit=crop&w=800&q=80',
    images: ['https://images.unsplash.com/photo-1599693359672-8bb06c564102?auto=format&fit=crop&w=800&q=80'],
    active: true,
    priceType: 'percentage',
    priceValue: 15
  }
];

const generateMockShowroom = () => [
  {
    id: '1',
    name: 'Minimalist',
    items: [
      { id: 's1', title: 'Negative Space', images: ['https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=400&q=80'] },
      { id: 's2', title: 'Micro French', images: ['https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=400&q=80'] }
    ]
  },
  {
    id: '2',
    name: 'Nail Art',
    items: [
      { id: 's3', title: 'Florals', images: ['https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=400&q=80'] },
      { id: 's4', title: 'Tortoise Shell', images: ['https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=400&q=80'] }
    ]
  },
  {
    id: '3',
    name: 'Pedicures',
    items: [
      { id: 's5', title: 'Fresh White', images: ['https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?auto=format&fit=crop&w=400&q=80'] }
    ]
  }
];

const generateMockBookings = () => {
  const bookings = [];
  const services = ['Gel Manicure', 'Full Set Acrylics', 'Nail Art Consultation', 'Fill & Shape', 'Luxury Pedicure'];
  const now = new Date();
  
  // Past year data for charts
  for (let i = 0; i < 50; i++) {
    const date = new Date(now);
    date.setDate(now.getDate() - Math.floor(Math.random() * 365));
    bookings.push({
      id: `mock_b_${i}`,
      name: `Client ${i}`,
      email: `client${i}@example.com`,
      whatsappNumber: '27123456789',
      message: `Requesting ${services[Math.floor(Math.random() * services.length)]}`,
      bookingDate: date.toISOString().split('T')[0],
      status: 'completed',
      bookingType: 'online',
      totalCost: 350 + Math.floor(Math.random() * 500),
      amountPaid: 350 + Math.floor(Math.random() * 500),
      paymentMethod: ['cash', 'card', 'eft'][Math.floor(Math.random() * 3)],
    });
  }

  // Future/Recent bookings
  bookings.push({
    id: 'future_1',
    name: 'Sarah Connor',
    email: 'sarah@example.com',
    message: 'Looking for chrome hearts design on long coffin shape.',
    bookingDate: new Date(now.getTime() + 86400000).toISOString().split('T')[0], // Tomorrow
    status: 'confirmed',
    bookingType: 'online',
    totalCost: 650,
    amountPaid: 300,
    paymentMethod: 'eft'
  });
  
  bookings.push({
    id: 'pending_1',
    name: 'John Wick',
    email: 'john@example.com',
    message: 'Manicure and hand treatment. No polish.',
    bookingDate: new Date(now.getTime() + 172800000).toISOString().split('T')[0], // 2 days
    status: 'pending',
    bookingType: 'online',
    totalCost: 250
  });

  bookings.push({
    id: 'pending_2',
    name: 'Alice Wonderland',
    email: 'alice@example.com',
    message: 'Quote for bridal party nails (5 people).',
    bookingDate: new Date(now.getTime() + 259200000).toISOString().split('T')[0], // 3 days
    status: 'pending',
    bookingType: 'manual'
  });

  return bookings;
};

const generateMockExpenses = () => {
  const expenses = [];
  const categories = ['Supplies', 'Rent', 'Utilities', 'Marketing', 'Stock'];
  const now = new Date();
  
  for (let i = 0; i < 40; i++) {
    const date = new Date(now);
    date.setDate(now.getDate() - Math.floor(Math.random() * 365));
    expenses.push({
      id: `mock_e_${i}`,
      date: date.toISOString().split('T')[0],
      category: categories[Math.floor(Math.random() * categories.length)],
      description: 'Monthly restocking',
      amount: 100 + Math.floor(Math.random() * 1000)
    });
  }
  return expenses;
};

const generateMockInventory = () => [
  { id: '1', productName: 'Gel Polish - Classic Red', brand: 'OPI', category: 'Gel Polish', quantity: 12, minStockLevel: 5, unitCost: 250, supplier: 'Nail Supply Co' },
  { id: '2', productName: 'Acrylic Powder - Clear', brand: 'Young Nails', category: 'Acrylic', quantity: 4, minStockLevel: 2, unitCost: 450, supplier: 'Nail Supply Co' },
  { id: '3', productName: 'Acetone (5L)', brand: 'Generic', category: 'Removers', quantity: 2, minStockLevel: 1, unitCost: 300, supplier: 'Chemical Depot' },
  { id: '4', productName: 'Nitrile Gloves (S)', brand: 'Black Dragon', category: 'Hygiene', quantity: 20, minStockLevel: 5, unitCost: 150, supplier: 'Medical Depot' },
  { id: '5', productName: 'Nail Files 100/180', brand: 'Professional', category: 'Consumables', quantity: 50, minStockLevel: 20, unitCost: 15, supplier: 'Nail Supply Co' },
  { id: '6', productName: 'Cuticle Oil', brand: 'Essie', category: 'Care', quantity: 10, minStockLevel: 3, unitCost: 120, supplier: 'Beauty Wholesalers' },
  { id: '7', productName: 'Top Coat', brand: 'Gelish', category: 'Gel Polish', quantity: 6, minStockLevel: 3, unitCost: 380, supplier: 'Nail Supply Co' },
];

const generateMockInvoices = () => [
    {
        id: '1',
        type: 'quote',
        number: 'Q-1001',
        clientName: 'Alice Wonderland',
        clientEmail: 'alice@example.com',
        clientPhone: '27123456789',
        dateIssued: new Date().toISOString().split('T')[0],
        dateDue: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        status: 'sent',
        items: [
            { id: '1', description: 'Bridal Party: Gel Manicures (x5)', quantity: 5, unitPrice: 350 },
            { id: '2', description: 'Bridal Nail Art (Intricate)', quantity: 1, unitPrice: 200 }
        ],
        notes: 'Deposit of 50% required to book the morning slot.',
        subtotal: 1950,
        taxAmount: 292.5,
        total: 2242.5
    },
    {
        id: '2',
        type: 'invoice',
        number: 'INV-2023-44',
        clientName: 'John Wick',
        clientEmail: 'john@example.com',
        clientPhone: '27999999999',
        dateIssued: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
        dateDue: new Date().toISOString().split('T')[0], // Due today
        status: 'paid',
        items: [
            { id: '1', description: 'Men\'s Manicure', quantity: 1, unitPrice: 250 },
            { id: '2', description: 'Hand Cream Purchase', quantity: 1, unitPrice: 150 }
        ],
        notes: 'Thank you for your business.',
        subtotal: 400,
        taxAmount: 60,
        total: 460
    }
];

const generateMockClients = () => [
    {
        id: '1',
        name: 'Alice Wonderland',
        email: 'alice@example.com',
        phone: '27123456789',
        password: 'nails', 
        notes: 'Likes surreal designs.'
    },
    {
        id: '2',
        name: 'John Wick',
        email: 'john@example.com',
        phone: '27999999999',
        password: 'dog',
        notes: 'VIP Client.'
    }
];

const generateMockSettings = () => ({
    id: 'main',
    companyName: 'Bos Salon',
    logoUrl: 'https://i.ibb.co/gLSThX4v/unnamed-removebg-preview.png',
    heroTattooGunImageUrl: 'https://i.ibb.co/8DFd4pt7/unnamed-1.jpg',
    aboutUsImageUrl: 'https://images.unsplash.com/photo-1520699049698-acd2fcc51056?auto=format&fit=crop&w=500&q=80',
    whatsAppNumber: '27795904162',
    address: '123 Nature Way, Green Valley, 45678',
    phone: '+27 12 345 6789',
    email: 'bookings@bossalon.com',
    socialLinks: [],
    showroomTitle: 'Nail Art Gallery',
    showroomDescription: "Browse our collection of hand-painted designs and natural treatments.",
    bankName: 'FNB',
    accountNumber: '1234567890',
    branchCode: '250655',
    accountType: 'Cheque',
    vatNumber: '4200123456',
    isMaintenanceMode: false,
    apkUrl: '',
    taxEnabled: true,
    vatPercentage: 15,
    emailServiceId: '',
    emailTemplateId: '',
    emailPublicKey: '',
    hero: {
        title: 'Nail and beauty',
        subtitle: 'Experience the art of nature',
        buttonText: 'Book an Appointment'
    },
    about: {
        title: 'Our Story',
        text1: 'Bos Salon was born from a love for natural beauty and intricate art.',
        text2: 'We specialize in bespoke nail art, ensuring your hands and feet look their absolute best.'
    },
    contact: {
        intro: 'Ready for a fresh look? Fill out the form below.'
    }
});

// --- Local Storage Helpers ---
const getLocalCollection = (name: string): any[] => {
  const data = localStorage.getItem(`bossalon_${name}`);
  
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error(`Error parsing local collection ${name}`, e);
      return [];
    }
  }
  
  // --- INITIALIZE MOCK DATA IF EMPTY ---
  let mockData: any[] = [];
  switch (name) {
    case 'portfolio': mockData = generateMockPortfolio(); break;
    case 'specials': mockData = generateMockSpecials(); break;
    case 'showroom': mockData = generateMockShowroom(); break;
    case 'bookings': mockData = generateMockBookings(); break;
    case 'expenses': mockData = generateMockExpenses(); break;
    case 'inventory': mockData = generateMockInventory(); break;
    case 'settings': mockData = [generateMockSettings()]; break;
    case 'invoices': mockData = generateMockInvoices(); break;
    case 'clients': mockData = generateMockClients(); break;
  }
  
  if (mockData.length > 0) {
      localStorage.setItem(`bossalon_${name}`, JSON.stringify(mockData));
  }
  
  return mockData;
};

const setLocalCollection = (name: string, data: any[]) => {
  localStorage.setItem(`bossalon_${name}`, JSON.stringify(data));
  window.dispatchEvent(new Event(`local_update_${name}`));
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// --- AUTH ---
export const dbLogin = async (email: string, passwordOrPin: string): Promise<{ user: any, error: any }> => {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: passwordOrPin,
    });
    return { user: data.user, error };
  } else {
    // Local Mode: Hardcoded Auth
    if (email.toLowerCase() === 'jstyp' && passwordOrPin === '1723') {
      const fakeUser = { id: 'local-admin', email };
      localStorage.setItem('bossalon_user', JSON.stringify(fakeUser));
      window.dispatchEvent(new Event('local_auth_change'));
      return { user: fakeUser, error: null };
    }
    return { user: null, error: { message: 'Invalid credentials (Local Mode)' } };
  }
};

export const dbLogout = async () => {
  if (isSupabaseConfigured && supabase) {
    await supabase.auth.signOut();
  } else {
    localStorage.removeItem('bossalon_user');
    window.dispatchEvent(new Event('local_auth_change'));
  }
};

export const dbOnAuthStateChange = (callback: (user: any) => void) => {
  if (isSupabaseConfigured && supabase) {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user || null);
    });
    return () => data.subscription.unsubscribe();
  } else {
    const stored = localStorage.getItem('bossalon_user');
    if (stored) callback(JSON.parse(stored));
    else callback(null);

    const listener = () => {
       const u = localStorage.getItem('bossalon_user');
       callback(u ? JSON.parse(u) : null);
    };
    window.addEventListener('local_auth_change', listener);
    return () => window.removeEventListener('local_auth_change', listener);
  }
};

// --- DATA SUBSCRIPTIONS ---
export const dbSubscribeToCollection = (collection: CollectionName, callback: Listener) => {
  if (isSupabaseConfigured && supabase) {
    supabase.from(collection).select('*').then(({ data }) => {
      if (data) callback(data);
    });

    const channel = supabase
      .channel(`public:${collection}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: collection }, (payload) => {
         supabase.from(collection).select('*').then(({ data }) => {
            if(data) callback(data);
         });
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  } else {
    const load = () => callback(getLocalCollection(collection));
    load(); 
    const eventName = `local_update_${collection}`;
    window.addEventListener(eventName, load);
    return () => window.removeEventListener(eventName, load);
  }
};

export const dbSubscribeToDoc = (collection: CollectionName, docId: string, callback: DocListener) => {
    if (isSupabaseConfigured && supabase) {
        const fetch = () => supabase.from(collection).select('*').eq('id', docId).single().then(({ data }) => {
            if (data) callback(data);
        });
        fetch();
        const channel = supabase.channel(`public:${collection}:${docId}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: collection, filter: `id=eq.${docId}` }, (payload) => {
                fetch();
            })
            .subscribe();
        return () => supabase.removeChannel(channel);
    } else {
        const load = () => {
            const list = getLocalCollection(collection);
            const item = list.find(i => i.id === docId);
            if (item) callback(item);
        }
        load();
        const eventName = `local_update_${collection}`;
        window.addEventListener(eventName, load);
        return () => window.removeEventListener(eventName, load);
    }
};

// --- CRUD OPERATIONS ---
export const dbAddItem = async (collection: CollectionName, item: any) => {
  const newItem = { ...item, id: item.id || crypto.randomUUID() };

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from(collection).insert(newItem);
    if (error) throw error;
  } else {
    const list = getLocalCollection(collection);
    list.push(newItem);
    setLocalCollection(collection, list);
  }
  return newItem;
};

export const dbUpdateItem = async (collection: CollectionName, item: any) => {
  if (!item.id) throw new Error("Item must have an ID to update");

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from(collection).update(item).eq('id', item.id);
    if (error) throw error;
  } else {
    const list = getLocalCollection(collection);
    const index = list.findIndex(i => i.id === item.id);
    if (index !== -1) {
      list[index] = { ...list[index], ...item };
      setLocalCollection(collection, list);
    }
  }
};

export const dbDeleteItem = async (collection: CollectionName, id: string) => {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from(collection).delete().eq('id', id);
    if (error) throw error;
  } else {
    const list = getLocalCollection(collection);
    const newList = list.filter(i => i.id !== id);
    setLocalCollection(collection, newList);
  }
};

export const dbSetDoc = async (collection: CollectionName, docId: string, data: any) => {
    if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from(collection).upsert({ ...data, id: docId });
        if(error) throw error;
    } else {
        const list = getLocalCollection(collection);
        const index = list.findIndex(i => i.id === docId);
        if (index !== -1) {
            list[index] = { ...list[index], ...data };
        } else {
            list.push({ ...data, id: docId });
        }
        setLocalCollection(collection, list);
    }
}

// --- STORAGE ---
export const dbUploadFile = async (file: File, bucket: string, pathPrefix: string = ''): Promise<string> => {
  if (isSupabaseConfigured && supabase) {
    const filePath = `${pathPrefix}${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage.from(bucket).upload(filePath, file);
    if (error) throw error;
    
    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return publicUrlData.publicUrl;
  } else {
    console.warn("Local Mode: converting file to Base64. This may exceed storage limits.");
    return await fileToBase64(file);
  }
};

// --- BATCH DELETE (Used for clearing data) ---
export const dbClearCollection = async (collection: CollectionName) => {
    if(isSupabaseConfigured && supabase) {
        const { error } = await supabase.from(collection).delete().neq('id', '00000000-0000-0000-0000-000000000000'); 
        if (error) throw error;
    } else {
        localStorage.removeItem(`bossalon_${collection}`);
        window.dispatchEvent(new Event(`local_update_${collection}`));
    }
}
