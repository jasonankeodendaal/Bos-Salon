
import { supabase, isSupabaseConfigured } from './supabaseClient';

// --- Types ---
type CollectionName = 'portfolio' | 'specials' | 'showroom' | 'bookings' | 'expenses' | 'inventory' | 'settings' | 'invoices' | 'clients';
type Listener = (data: any[]) => void;
type DocListener = (data: any) => void;

// --- ERROR HANDLING HELPER ---
const handleSupabaseError = (error: any, operation: string, table: string) => {
  if (!error) return;
  console.error(`Supabase Error [${operation} on ${table}]:`, error);
  
  if (error.code === '42501' || error.message?.toLowerCase().includes('row-level security') || error.message?.toLowerCase().includes('permission denied')) {
    const msg = `PERMISSION ERROR: You do not have permission to ${operation} in the '${table}' table.\n\nReason: Supabase Row Level Security (RLS) policies are missing or incorrect, or you are not logged in.\n\nFIX: Log in to the Admin Dashboard, go to the 'Setup' tab, and run the 'Table Permissions' SQL script in your Supabase SQL Editor.`;
    alert(msg);
    throw new Error(`RLS Permission denied: ${operation} on ${table}`);
  }

  if (error.code === '42P01' || (error.message?.includes('relation') && error.message?.includes('does not exist'))) {
      const msg = `DATABASE ERROR: The table '${table}' does not exist.\n\nFIX: Go to Admin Dashboard > Setup and run the 'Create Tables' SQL script.`;
      alert(msg);
      throw new Error(`Table missing: ${table}`);
  }

  if (error.code === 'PGRST204' || (error.message && error.message.includes("Could not find the") && error.message.includes("column"))) {
      const msg = `DATABASE SCHEMA ERROR: Your database is missing a required column.\n\nDetails: ${error.message}\n\nFIX: Go to Admin Dashboard > Setup > Script A. \n\nRun the script again to update your table structure with the missing columns.`;
      alert(msg);
      throw new Error(`Schema mismatch: ${error.message}`);
  }
  
  throw new Error(error.message || "Unknown Database Error");
};

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
  }
];

const generateMockShowroom = () => [
  {
    id: '1',
    name: 'Minimalist',
    items: [
      { id: 's1', title: 'Negative Space', images: ['https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=400&q=80'] }
    ]
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
    showroomTitle: 'Tattoo Flash Gallery',
    showroomDescription: "Browse our collection of custom designs and flash art.",
    bankName: 'FNB',
    accountNumber: '1234567890',
    branchCode: '250655',
    accountType: 'Cheque',
    vatNumber: '',
    isMaintenanceMode: false,
    apkUrl: '',
    taxEnabled: false,
    vatPercentage: 15,
});

// --- Local Storage Helpers ---
const getLocalCollection = (name: string): any[] => {
  const data = localStorage.getItem(`bossalon_${name}`);
  if (data) {
    try { return JSON.parse(data); } catch (e) { return []; }
  }
  let mockData: any[] = [];
  switch (name) {
    case 'portfolio': mockData = generateMockPortfolio(); break;
    case 'specials': mockData = generateMockSpecials(); break;
    case 'showroom': mockData = generateMockShowroom(); break;
    case 'settings': mockData = [generateMockSettings()]; break;
    default: mockData = []; break;
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
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: passwordOrPin });
    return { user: data.user, error };
  } else {
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
      options: { redirectTo: window.location.origin },
    });
    if (error) throw error;
    return data;
  }
  return null;
};

export const dbLogout = async () => {
  if (isSupabaseConfigured && supabase) { await supabase.auth.signOut(); }
  else {
    localStorage.removeItem('bossalon_user');
    window.dispatchEvent(new Event('local_auth_change'));
  }
};

export const dbOnAuthStateChange = (callback: (user: any) => void) => {
  if (isSupabaseConfigured && supabase) {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => { callback(session?.user || null); });
    return () => data.subscription.unsubscribe();
  } else {
    const stored = localStorage.getItem('bossalon_user');
    callback(stored ? JSON.parse(stored) : null);
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
    let localCache: any[] = [];
    
    // Initial fetch
    client.from(collection).select('*').then(({ data, error }) => {
      if (error) handleSupabaseError(error, 'read', collection);
      else if (data) {
          localCache = data;
          callback(data);
      }
    });

    // Realtime subscription - Process changes locally for instant feel
    const channel = client
      .channel(`public:${collection}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: collection }, (payload) => {
         if (payload.eventType === 'INSERT') {
             localCache = [...localCache, payload.new];
         } else if (payload.eventType === 'UPDATE') {
             localCache = localCache.map(item => item.id === payload.new.id ? payload.new : item);
         } else if (payload.eventType === 'DELETE') {
             localCache = localCache.filter(item => item.id === payload.old.id);
         }
         callback([...localCache]);
      })
      .subscribe();

    return () => { client.removeChannel(channel); };
  } else {
    const load = () => callback(getLocalCollection(collection));
    load(); 
    window.addEventListener(`local_update_${collection}`, load);
    return () => window.removeEventListener(`local_update_${collection}`, load);
  }
};

export const dbSubscribeToDoc = (collection: CollectionName, docId: string, callback: DocListener) => {
    const client = supabase;
    if (isSupabaseConfigured && client) {
        const fetch = () => client.from(collection).select('*').eq('id', docId).single().then(({ data, error }) => {
            if (error) { if (error.code !== 'PGRST116') handleSupabaseError(error, 'read doc', collection); }
            else if (data) callback(data);
        });
        fetch();
        const channel = client.channel(`public:${collection}:${docId}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: collection, filter: `id=eq.${docId}` }, (payload) => {
                if (payload.new) callback(payload.new);
                else fetch();
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
        window.addEventListener(`local_update_${collection}`, load);
        return () => window.removeEventListener(`local_update_${collection}`, load);
    }
};

// --- CRUD OPERATIONS (WRITE) ---
export const dbAddItem = async (collection: CollectionName, item: any) => {
  const newItem = { ...item, id: item.id || crypto.randomUUID() };
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from(collection).insert(newItem);
    if (error) handleSupabaseError(error, 'insert', collection);
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
    if (error) handleSupabaseError(error, 'update', collection);
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
    if (error) handleSupabaseError(error, 'delete', collection);
  } else {
    const list = getLocalCollection(collection);
    setLocalCollection(collection, list.filter(i => i.id !== id));
  }
};

export const dbSetDoc = async (collection: CollectionName, docId: string, data: any) => {
    if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from(collection).upsert({ ...data, id: docId });
        if (error) handleSupabaseError(error, 'upsert', collection);
    } else {
        const list = getLocalCollection(collection);
        const index = list.findIndex(i => i.id === docId);
        if (index !== -1) { list[index] = { ...list[index], ...data }; }
        else { list.push({ ...data, id: docId }); }
        setLocalCollection(collection, list);
    }
}

export const dbUploadFile = async (file: File, bucket: string, pathPrefix: string = ''): Promise<string> => {
  if (isSupabaseConfigured && supabase) {
    const filePath = `${pathPrefix}${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const { error } = await supabase.storage.from(bucket).upload(filePath, file);
    if (error) throw error;
    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return publicUrlData.publicUrl;
  }
  return await fileToBase64(file);
};

export const dbClearCollection = async (collection: CollectionName) => {
    if(isSupabaseConfigured && supabase) {
        const { error } = await supabase.from(collection).delete().neq('id', '00000000-0000-0000-0000-000000000000'); 
        if (error) handleSupabaseError(error, 'clear', collection);
    } else {
        localStorage.removeItem(`bossalon_${collection}`);
        window.dispatchEvent(new Event(`local_update_${collection}`));
    }
}
