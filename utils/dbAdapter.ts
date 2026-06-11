
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { compressImage } from './imageCompression';

// --- Types ---
type CollectionName = 'portfolio' | 'specials' | 'showroom' | 'bookings' | 'expenses' | 'inventory' | 'settings' | 'invoices' | 'clients' | 'photo_library' | 'photo_bookings' | 'photo_invoices';
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

// --- Local Storage Helpers ---
// Local storage has been removed. All data now comes strictly from Supabase.

// --- AUTH ---
export const dbLogin = async (email: string, passwordOrPin: string): Promise<{ user: any, error: any }> => {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: passwordOrPin });
    return { user: data.user, error };
  } else {
    throw new Error('Supabase is not configured. Local storage auth has been removed.');
  }
};

export const dbLoginWithGoogle = async (redirectDest?: string) => {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: redirectDest ? `${window.location.origin}?redirect=${redirectDest}` : window.location.origin },
    });
    if (error) throw error;
    return data;
  }
  throw new Error('Supabase is not configured.');
};

export const dbLogout = async () => {
  if (isSupabaseConfigured && supabase) { await supabase.auth.signOut(); }
  else {
    throw new Error('Supabase is not configured.');
  }
};

export const dbOnAuthStateChange = (callback: (user: any) => void) => {
  if (isSupabaseConfigured && supabase) {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => { callback(session?.user || null); });
    return () => data.subscription.unsubscribe();
  } else {
    console.warn('Supabase is not configured. Auth change listener ignored.');
    return () => {};
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
         // Force a new array reference to trigger React re-render
         callback([...localCache]);
      })
      .subscribe();

    return () => { client.removeChannel(channel); };
  } else {
    console.warn('Supabase is not configured. Collection listener ignored.');
    return () => {};
  }
};

export const dbSubscribeToDoc = (collection: CollectionName, docId: string, callback: DocListener) => {
    const client = supabase;
    if (isSupabaseConfigured && client) {
        const fetch = () => client.from(collection).select('*').eq('id', docId).maybeSingle().then(({ data, error }) => {
            if (error) { if (error.code !== 'PGRST116') handleSupabaseError(error, 'read doc', collection); }
            else if (data) callback(data);
        });
        fetch();
        const channel = client.channel(`public:${collection}:${docId}`)
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: collection, filter: `id=eq.${docId}` }, (payload) => {
                if (payload.new) callback(payload.new);
            })
            .subscribe();
        return () => { client.removeChannel(channel); };
    } else {
        console.warn('Supabase is not configured. Document listener ignored.');
        return () => {};
    }
};

// --- CRUD OPERATIONS (WRITE) ---
export const dbAddItem = async (collection: CollectionName, item: any) => {
  const newItem = { ...item, id: item.id || crypto.randomUUID() };
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from(collection).insert(newItem);
    if (error) handleSupabaseError(error, 'insert', collection);
  } else {
    throw new Error('Supabase is not configured.');
  }
  return newItem;
};

export const dbUpdateItem = async (collection: CollectionName, item: any) => {
  if (!item.id) throw new Error("Item must have an ID to update");
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from(collection).update(item).eq('id', item.id);
    if (error) handleSupabaseError(error, 'update', collection);
  } else {
    throw new Error('Supabase is not configured.');
  }
};

export const dbDeleteItem = async (collection: CollectionName, id: string) => {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from(collection).delete().eq('id', id);
    if (error) handleSupabaseError(error, 'delete', collection);
  } else {
    throw new Error('Supabase is not configured.');
  }
};

export const dbSetDoc = async (collection: CollectionName, docId: string, data: any) => {
    if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from(collection).upsert({ ...data, id: docId });
        if (error) handleSupabaseError(error, 'upsert', collection);
    } else {
        throw new Error('Supabase is not configured.');
    }
}

export const dbUploadFile = async (file: File, bucket: string, pathPrefix: string = ''): Promise<string> => {
  if (isSupabaseConfigured && supabase) {
    let fileToUpload = file;
    if (file.type.startsWith('image/')) {
        try {
            fileToUpload = await compressImage(file, 1920, 1080, 0.75); // compress to max 1920x1080 with 75% quality
        } catch (e) {
            console.warn('Image compression failed, using original file', e);
        }
    }
    const filePath = `${pathPrefix}${Date.now()}-${fileToUpload.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const { error } = await supabase.storage.from(bucket).upload(filePath, fileToUpload);
    if (error) throw error;
    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return publicUrlData.publicUrl;
  }
  throw new Error('Supabase is not configured.');
};

export const dbClearCollection = async (collection: CollectionName) => {
    if(isSupabaseConfigured && supabase) {
        const { error } = await supabase.from(collection).delete().neq('id', '00000000-0000-0000-0000-000000000000'); 
        if (error) handleSupabaseError(error, 'clear', collection);
    } else {
        throw new Error('Supabase is not configured.');
    }
}
