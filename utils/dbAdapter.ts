
import { supabase, isSupabaseConfigured } from './supabaseClient';

// --- Types ---
type CollectionName = 'portfolio' | 'specials' | 'showroom' | 'bookings' | 'expenses' | 'inventory' | 'settings' | 'invoices' | 'clients';
type Listener = (data: any[]) => void;
type DocListener = (data: any) => void;

// --- STORAGE HEALTH CHECK ---
export const dbCheckStorageConnection = async (): Promise<{ connected: boolean; error?: string; details?: any }> => {
  if (!isSupabaseConfigured || !supabase) {
    return { connected: false, error: "Supabase client not initialized. Check environment variables VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY." };
  }
  try {
    // Try to list buckets to verify connection and permissions
    const { data, error } = await supabase.storage.listBuckets();
    if (error) {
      return { connected: false, error: error.message, details: error };
    }
    return { connected: true, details: data };
  } catch (err: any) {
    return { connected: false, error: err.message || "Unknown error connecting to storage." };
  }
};

// --- MOCK DATA GENERATORS (TATTOO THEMED) ---
const generateMockPortfolio = () => [
  {
    id: '1',
    title: 'Neo-Traditional Tiger',
    story: 'A fierce chest piece combining bold lines with muted earth tones. This session took 8 hours and focuses on the dynamic movement of the tiger.',
    primaryImage: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=800&q=80',
    galleryImages: ['https://images.unsplash.com/photo-1562962230-16e4623d36e6?auto=format&fit=crop&w=800&q=80'],
    featured: true
  },
  {
    id: '2',
    title: 'Geometric Sleeve',
    story: 'Sacred geometry patterns flowing from shoulder to wrist. Dot-work shading creates depth without heavy blacks.',
    primaryImage: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?auto=format&fit=crop&w=800&q=80',
    galleryImages: [],
    featured: true
  },
  {
    id: '3',
    title: 'Realism Portrait',
    story: 'Hyper-realistic portrait using single needle technique for fine details. Memorial piece.',
    primaryImage: 'https://images.unsplash.com/photo-1560707303-4e98035872dc?auto=format&fit=crop&w=800&q=80',
    galleryImages: [],
    featured: true
  },
  {
    id: '4',
    title: 'Japanese Dragon',
    story: 'Full back piece in progress. Traditional irezumi style with wind bars and cherry blossoms.',
    primaryImage: 'https://images.unsplash.com/photo-1542382257-80dedb725088?auto=format&fit=crop&w=800&q=80',
    galleryImages: [],
    featured: true
  }
];

const generateMockSpecials = () => [
  {
    id: '1',
    title: 'Friday the 13th Flash',
    description: 'Classic superstition designs. Arms and legs only. First come, first served.',
    price: 1300,
    imageUrl: 'https://images.unsplash.com/photo-1590246296343-e5b306b4d32d?auto=format&fit=crop&w=800&q=80',
    images: ['https://images.unsplash.com/photo-1590246296343-e5b306b4d32d?auto=format&fit=crop&w=800&q=80'],
    active: true,
    priceType: 'fixed',
    priceValue: 1300,
    details: ['Pre-drawn designs only', 'Max size 3x3 inches', 'Black and grey only']
  },
  {
    id: '2',
    title: 'Full Day Tap-out',
    description: '8 Hours of tattooing. Great for large scale work like sleeves or back pieces.',
    price: 6000,
    imageUrl: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=800&q=80',
    images: ['https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=800&q=80'],
    active: true,
    priceType: 'fixed',
    priceValue: 6000,
    voucherCode: 'ALLDAYINK'
  },
  {
    id: '3',
    title: 'Apprentice Rates',
    description: 'Book with our junior artist for heavily discounted rates on text and simple line work.',
    price: 50,
    imageUrl: 'https://images.unsplash.com/photo-1621112904887-419379ce6824?auto=format&fit=crop&w=800&q=80',
    images: ['https://images.unsplash.com/photo-1621112904887-419379ce6824?auto=format&fit=crop&w=800&q=80'],
    active: true,
    priceType: 'percentage',
    priceValue: 50
  }
];

const generateMockShowroom = () => [
  {
    id: '1',
    name: 'Old School',
    items: [
      { id: 's1', title: 'Panther Head', images: ['https://images.unsplash.com/photo-1550537602-366689b08e3f?auto=format&fit=crop&w=400&q=80'] },
      { id: 's2', title: 'Dagger & Rose', images: ['https://images.unsplash.com/photo-1590246296343-e5b306b4d32d?auto=format&fit=crop&w=400&q=80'] }
    ]
  },
  {
    id: '2',
    name: 'Fine Line',
    items: [
      { id: 's3', title: 'Floral Bouquet', images: ['https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?auto=format&fit=crop&w=400&q=80'] },
      { id: 's4', title: 'Micro Script', images: ['https://images.unsplash.com/photo-1560707303-4e98035872dc?auto=format&fit=crop&w=400&q=80'] }
    ]
  },
  {
    id: '3',
    name: 'Flash Sheet 1',
    items: [
      { id: 's5', title: 'Skulls & Snakes', images: ['https://images.unsplash.com/photo-1542382257-80dedb725088?auto=format&fit=crop&w=400&q=80'] }
    ]
  }
];

const generateMockBookings = () => {
  const bookings = [];
  const services = ['Consultation', 'Full Day Session', 'Half Day Session', 'Touch Up', 'Flash Piece'];
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
      totalCost: 1000 + Math.floor(Math.random() * 3000),
      amountPaid: 1000 + Math.floor(Math.random() * 3000),
      paymentMethod: ['cash', 'card', 'eft'][Math.floor(Math.random() * 3)],
    });
  }

  // Future/Recent bookings
  bookings.push({
    id: 'future_1',
    name: 'Sarah Connor',
    email: 'sarah@example.com',
    message: 'Looking to start a leg sleeve. Terminator theme.',
    bookingDate: new Date(now.getTime() + 86400000).toISOString().split('T')[0], // Tomorrow
    status: 'confirmed',
    bookingType: 'online',
    totalCost: 3500,
    amountPaid: 1000,
    paymentMethod: 'eft'
  });
  
  bookings.push({
    id: 'pending_1',
    name: 'John Wick',
    email: 'john@example.com',
    message: 'Portrait of my dog on my back.',
    bookingDate: new Date(now.getTime() + 172800000).toISOString().split('T')[0], // 2 days
    status: 'pending',
    bookingType: 'online',
    totalCost: 0
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
      description: 'Studio Consumables',
      amount: 500 + Math.floor(Math.random() * 2000)
    });
  }
  return expenses;
};

const generateMockInventory = () => [
  { id: '1', productName: 'Dynamic Black Ink (8oz)', brand: 'Dynamic', category: 'Ink', quantity: 4, minStockLevel: 2, unitCost: 800, supplier: 'Tattoo Supply Co' },
  { id: '2', productName: 'Cartridges 3RL (Box)', brand: 'Kwadron', category: 'Needles', quantity: 15, minStockLevel: 5, unitCost: 450, supplier: 'Pro Arts' },
  { id: '3', productName: 'Cartridges 9M (Box)', brand: 'Kwadron', category: 'Needles', quantity: 8, minStockLevel: 5, unitCost: 450, supplier: 'Pro Arts' },
  { id: '4', productName: 'Black Gloves (M)', brand: 'Nitrile', category: 'Hygiene', quantity: 10, minStockLevel: 3, unitCost: 150, supplier: 'MedBase' },
  { id: '5', productName: 'Green Soap Conc.', brand: 'Studio', category: 'Hygiene', quantity: 2, minStockLevel: 1, unitCost: 300, supplier: 'Tattoo Supply Co' },
];

const generateMockInvoices = () => [
    {
        id: 'inv_1',
        type: 'invoice',
        number: 'INV-1001',
        clientName: 'Sarah Connor',
        clientEmail: 'sarah@example.com',
        clientPhone: '27123456789',
        dateIssued: '2023-10-01',
        dateDue: '2023-10-08',
        status: 'paid',
        items: [{ id: 'i1', description: 'Tattoo Session - Leg Sleeve', quantity: 1, unitPrice: 3500 }],
        subtotal: 3500,
        taxAmount: 0,
        total: 3500,
    },
    {
        id: 'q_1',
        type: 'quote',
        number: 'Q-1005',
        clientName: 'John Wick',
        clientEmail: 'john@example.com',
        clientPhone: '27987654321',
        dateIssued: '2023-10-15',
        dateDue: '2023-10-22',
        status: 'sent',
        items: [{ id: 'i2', description: 'Back Piece - Portrait', quantity: 1, unitPrice: 5000 }],
        subtotal: 5000,
        taxAmount: 0,
        total: 5000,
    }
];

const generateMockClients = () => [
    {
        id: 'c1',
        name: 'Sarah Connor',
        email: 'sarah@example.com',
        phone: '27123456789',
        password: '1234',
        stickers: 3,
        loyaltyProgress: { 'legacy': 3 },
        rewardsRedeemed: 0
    },
    {
        id: 'c2',
        name: 'John Wick',
        email: 'john@example.com',
        phone: '27987654321',
        password: '5678',
        stickers: 8,
        loyaltyProgress: { 'legacy': 8 },
        rewardsRedeemed: 1
    }
];

// --- ADAPTER FUNCTIONS ---

export const dbOnAuthStateChange = (callback: (user: any) => void) => {
  if (isSupabaseConfigured && supabase) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user || null);
    });
    return () => subscription.unsubscribe();
  } else {
    // Mock Auth: Check local storage
    const storedUser = localStorage.getItem('mockUser');
    if (storedUser) {
        callback(JSON.parse(storedUser));
    } else {
        callback(null);
    }
    return () => {};
  }
};

export const dbLogin = async (email: string, password?: string) => {
  if (isSupabaseConfigured && supabase) {
    return await supabase.auth.signInWithPassword({ email, password: password || '' });
  } else {
    // Mock Login
    if (email === 'admin' && password === 'admin') {
        const user = { id: 'mock-admin-id', email: 'admin@bossalon.com' };
        localStorage.setItem('mockUser', JSON.stringify(user));
        // Force reload to trigger auth state change in App.tsx (since we aren't using a real event emitter for mock)
        window.location.reload(); 
        return { user, error: null };
    }
    return { user: null, error: { message: 'Invalid mock credentials. Use admin/admin' } };
  }
};

export const dbLoginWithGoogle = async () => {
    if (isSupabaseConfigured && supabase) {
        return await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin
            }
        });
    } else {
        alert("Google Login requires Supabase configuration.");
        return { error: { message: 'Supabase not configured' } };
    }
};

export const dbLogout = async () => {
  if (isSupabaseConfigured && supabase) {
    return await supabase.auth.signOut();
  } else {
    localStorage.removeItem('mockUser');
    window.location.reload();
  }
};

export const dbSubscribeToCollection = (collection: CollectionName, callback: Listener) => {
  if (isSupabaseConfigured && supabase) {
    // Initial fetch
    supabase
      .from(collection)
      .select('*')
      .then(({ data, error }) => {
        if (!error && data) callback(data);
        if (error) console.error(`Error fetching ${collection}:`, error);
      });

    // Subscription
    const channel = supabase
      .channel(`${collection}_changes`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: collection },
        (payload) => {
            // Re-fetch all data to keep it simple and consistent
            supabase.from(collection).select('*').then(({ data }) => {
                if (data) callback(data);
            });
        }
      )
      .subscribe();

    return () => {
      supabase!.removeChannel(channel);
    };
  } else {
    // Mock Data
    let data: any[] = [];
    switch(collection) {
        case 'portfolio': data = generateMockPortfolio(); break;
        case 'specials': data = generateMockSpecials(); break;
        case 'showroom': data = generateMockShowroom(); break;
        case 'bookings': data = generateMockBookings(); break;
        case 'expenses': data = generateMockExpenses(); break;
        case 'inventory': data = generateMockInventory(); break;
        case 'invoices': data = generateMockInvoices(); break;
        case 'clients': data = generateMockClients(); break;
        case 'settings': data = []; break; // handled by doc subscriber
    }
    // Simulate async load
    setTimeout(() => callback(data), 500);
    return () => {};
  }
};

export const dbSubscribeToDoc = (collection: string, docId: string, callback: DocListener) => {
    if (isSupabaseConfigured && supabase) {
        supabase
            .from(collection)
            .select('*')
            .eq('id', docId)
            .single()
            .then(({ data }) => {
                if (data) callback(data);
            });
            
        // For simplicity, we reuse the collection subscriber logic or just poll if needed.
        // But here let's just do a one-time fetch for settings mainly.
        return () => {};
    } else {
        // Mock Settings
        if (collection === 'settings') {
             setTimeout(() => callback({
                 companyName: 'Bos Salon Mock',
                 // ... other defaults handled in App.tsx state init
             }), 500);
        }
        return () => {};
    }
};

export const dbAddItem = async (collection: CollectionName, item: any) => {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from(collection).insert([item]);
    if (error) throw error;
  } else {
    console.log(`[MOCK] Added to ${collection}:`, item);
  }
};

export const dbUpdateItem = async (collection: CollectionName, item: any) => {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from(collection).update(item).eq('id', item.id);
    if (error) throw error;
  } else {
    console.log(`[MOCK] Updated in ${collection}:`, item);
  }
};

export const dbDeleteItem = async (collection: CollectionName, id: string) => {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from(collection).delete().eq('id', id);
    if (error) throw error;
  } else {
    console.log(`[MOCK] Deleted from ${collection}:`, id);
  }
};

export const dbSetDoc = async (collection: string, docId: string, data: any) => {
    if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from(collection).upsert({ id: docId, ...data });
        if (error) throw error;
    } else {
        console.log(`[MOCK] Set Doc ${collection}/${docId}:`, data);
    }
};

export const dbUploadFile = async (file: File, bucket: string, pathPrefix: string = ''): Promise<string> => {
    if (isSupabaseConfigured && supabase) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${pathPrefix}${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(fileName, file);

        if (uploadError) {
            throw uploadError;
        }

        const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
        return data.publicUrl;
    } else {
        // Mock upload: return a fake URL (or blob URL for immediate preview if feasible in context)
        console.log(`[MOCK] Uploaded ${file.name} to ${bucket}`);
        return URL.createObjectURL(file);
    }
};

export const dbClearCollection = async (collection: CollectionName) => {
    if (isSupabaseConfigured && supabase) {
        // Supabase doesn't have a 'delete all', so we select all IDs then delete
        const { data } = await supabase.from(collection).select('id');
        if (data && data.length > 0) {
            const ids = data.map(d => d.id);
            const { error } = await supabase.from(collection).delete().in('id', ids);
            if (error) throw error;
        }
    } else {
        console.log(`[MOCK] Cleared collection: ${collection}`);
    }
}
