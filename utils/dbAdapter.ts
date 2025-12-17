
import { supabase, isSupabaseConfigured } from './supabaseClient';

// --- Types ---
type CollectionName = 'portfolio' | 'specials' | 'showroom' | 'bookings' | 'expenses' | 'inventory' | 'settings' | 'invoices' | 'clients';
type Listener = (data: any[]) => void;
type DocListener = (data: any) => void;

// --- ERROR HANDLING HELPER ---
const handleSupabaseError = (error: any, operation: string, table: string) => {
  if (!error) return;
  console.error(`Supabase Error [${operation} on ${table}]:`, error);
  
  // Postgres Error 42501: insufficient_privilege (RLS Policy violation)
  if (error.code === '42501' || error.message?.toLowerCase().includes('row-level security') || error.message?.toLowerCase().includes('permission denied')) {
    const msg = `PERMISSION ERROR: You do not have permission to ${operation} in the '${table}' table.\n\nReason: Supabase Row Level Security (RLS) policies are missing or incorrect, or you are not logged in.\n\nFIX: Log in to the Admin Dashboard, go to the 'Setup' tab, and run the 'Table Permissions' SQL script in your Supabase SQL Editor.`;
    alert(msg);
    throw new Error(`RLS Permission denied: ${operation} on ${table}`);
  }

  // Postgres Error 42P01: undefined_table (Table missing)
  if (error.code === '42P01' || error.message?.includes('relation') && error.message?.includes('does not exist')) {
      const msg = `DATABASE ERROR: The table '${table}' does not exist.\n\nFIX: Go to Admin Dashboard > Setup and run the 'Create Tables' SQL script.`;
      alert(msg);
      throw new Error(`Table missing: ${table}`);
  }
  
  throw new Error(error.message || "Unknown Database Error");
};

// --- MOCK DATA GENERATORS (Kept for fallback/local mode) ---
// ... (Mock Data Generation code omitted for brevity as it is identical to previous versions, preserving file length)
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

  bookings.push({
    id: 'future_1',
    name: 'Sarah Connor',
    email: 'sarah@example.com',
    message: 'Looking for chrome hearts design on long coffin shape.',
    bookingDate: new Date(now.getTime() + 86400000).toISOString().split('T')[0],
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
    bookingDate: new Date(now.getTime() + 172800000).toISOString().split('T')[0],
    status: 'pending',
    bookingType: 'online',
    totalCost: 250
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
        ],
        subtotal: 1750,
        taxAmount: 262.5,
        total: 2012.5
    },
];

const generateMockClients = () => [
    {
        id: '1',
        name: 'Alice Wonderland',
        email: 'alice@example.com',
        phone: '27123456789',
        password: 'nails', 
        notes: 'Likes surreal designs.'
    }
];

const generateMockSettings = () => ({
    id: 'main',
    companyName: 'Bos Salon',
    logoUrl: 'https://i.ibb.co/gLSThX4v/unnamed-removebg-preview.png',
    heroBgUrl: 'https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?auto=format&fit=crop&w=1920&q=80',
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
    vatNumber: '',
    isMaintenanceMode: false,
    apkUrl: '',
    taxEnabled: true,
    vatPercentage: 15,
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

export const dbLoginWithGoogle = async () => {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) throw error;
    return data;
  } else {
    alert("Google Login requires a live Supabase connection. It does not work in local mock mode.");
    return null;
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

// --- DATA SUBSCRIPTIONS (READ) ---
export const dbSubscribeToCollection = (collection: CollectionName, callback: Listener) => {
  const client = supabase;
  if (isSupabaseConfigured && client) {
    // Initial fetch
    client.from(collection).select('*').then(({ data, error }) => {
      if (error) {
          handleSupabaseError(error, 'read/subscribe', collection);
      } else if (data) {
          callback(data);
      }
    });

    // Realtime subscription
    const channel = client
      .channel(`public:${collection}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: collection }, (payload) => {
         client.from(collection).select('*').then(({ data, error }) => {
            if (error) console.error(`Realtime fetch error for ${collection}:`, error);
            if(data) callback(data);
         });
      })
      .subscribe();

    return () => { client.removeChannel(channel); };
  } else {
    const load = () => callback(getLocalCollection(collection));
    load(); 
    const eventName = `local_update_${collection}`;
    window.addEventListener(eventName, load);
    return () => window.removeEventListener(eventName, load);
  }
};

export const dbSubscribeToDoc = (collection: CollectionName, docId: string, callback: DocListener) => {
    const client = supabase;
    if (isSupabaseConfigured && client) {
        const fetch = () => client.from(collection).select('*').eq('id', docId).single().then(({ data, error }) => {
            if (error) {
                // Ignore "zero rows" error for single docs as it might just not exist yet
                if (error.code !== 'PGRST116') handleSupabaseError(error, 'read/subscribe doc', collection);
            } else if (data) {
                callback(data);
            }
        });
        fetch();
        const channel = client.channel(`public:${collection}:${docId}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: collection, filter: `id=eq.${docId}` }, (payload) => {
                fetch();
            })
            .subscribe();
        return () => { client.removeChannel(channel); };
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

// --- CRUD OPERATIONS (WRITE) ---
export const dbAddItem = async (collection: CollectionName, item: any) => {
  const newItem = { ...item, id: item.id || crypto.randomUUID() };
  const client = supabase;

  if (isSupabaseConfigured && client) {
    const { error } = await client.from(collection).insert(newItem);
    if (error) handleSupabaseError(error, 'insert item', collection);
  } else {
    const list = getLocalCollection(collection);
    list.push(newItem);
    setLocalCollection(collection, list);
  }
  return newItem;
};

export const dbUpdateItem = async (collection: CollectionName, item: any) => {
  if (!item.id) throw new Error("Item must have an ID to update");
  const client = supabase;

  if (isSupabaseConfigured && client) {
    const { error } = await client.from(collection).update(item).eq('id', item.id);
    if (error) handleSupabaseError(error, 'update item', collection);
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
  const client = supabase;
  if (isSupabaseConfigured && client) {
    const { error } = await client.from(collection).delete().eq('id', id);
    if (error) handleSupabaseError(error, 'delete item', collection);
  } else {
    const list = getLocalCollection(collection);
    const newList = list.filter(i => i.id !== id);
    setLocalCollection(collection, newList);
  }
};

export const dbSetDoc = async (collection: CollectionName, docId: string, data: any) => {
    const client = supabase;
    if (isSupabaseConfigured && client) {
        // IMPORTANT: We must explicitly include 'id' in the update payload for upsert to work correctly on a specific row
        const { error } = await client.from(collection).upsert({ ...data, id: docId });
        if (error) handleSupabaseError(error, 'upsert doc', collection);
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
  const client = supabase;
  if (isSupabaseConfigured && client) {
    const filePath = `${pathPrefix}${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const { data, error } = await client.storage.from(bucket).upload(filePath, file);
    
    if (error) {
        // Handle specific storage errors
        const err = error as any;
        
        // Bucket not found
        if (error.message && (error.message.includes("Bucket not found") || error.message.includes("not found"))) {
            const msg = `CRITICAL ERROR: The storage bucket '${bucket}' does not exist in your Supabase project.\n\nFIX: Go to your Supabase Dashboard > Storage and create a new Public bucket named '${bucket}'. \n(See Setup tab in Admin Dashboard for details)`;
            alert(msg);
            throw new Error(`Bucket '${bucket}' missing.`);
        }

        // Permission denied (RLS)
        if (err.statusCode === '403' || err.message?.includes('new row violates row-level security policy') || err.message?.includes('AccessDenied') || err.message?.includes('permission denied')) {
             const msg = `UPLOAD ERROR: Permission Denied for bucket '${bucket}'.\n\nReason: Supabase Storage RLS policy is blocking the upload, or you are not logged in.\n\nFIX: Go to Admin Dashboard > Setup > Step 3 and run the Storage Permissions SQL script.`;
             alert(msg);
             throw new Error(`Storage Permission denied: ${bucket}`);
        }
        
        console.error(`Upload error to bucket '${bucket}':`, error);
        throw error;
    }
    
    const { data: publicUrlData } = client.storage.from(bucket).getPublicUrl(filePath);
    return publicUrlData.publicUrl;
  } else {
    console.warn("Local Mode: converting file to Base64. This may exceed storage limits.");
    return await fileToBase64(file);
  }
};

// --- BATCH DELETE (Used for clearing data) ---
export const dbClearCollection = async (collection: CollectionName) => {
    const client = supabase;
    if(isSupabaseConfigured && client) {
        const { error } = await client.from(collection).delete().neq('id', '00000000-0000-0000-0000-000000000000'); 
        if (error) handleSupabaseError(error, 'clear collection', collection);
    } else {
        localStorage.removeItem(`bossalon_${collection}`);
        window.dispatchEvent(new Event(`local_update_${collection}`));
    }
}
