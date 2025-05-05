import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image_url: string;
  category: string;
  stock_quantity: number;
  created_at: string;
  updated_at: string;
}

// Helper function for Supabase error handling
export const handleSupabaseError = (error: any): string => {
  console.error('Supabase Error:', error);
  return error?.message || 'An unexpected error occurred';
};

// Helper function to check if a user is admin
export const isUserAdmin = async (userId: string): Promise<boolean> => {
  try {
    // In a real implementation, you would check against a roles table or claims
    // For demo purposes, we're using a simpler approach
    const { data, error } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    
    // Simple admin check - in a real app you'd use a role-based system
    return data?.email?.endsWith('admin@example.com') || data?.email === 'jbakshatbagdi@gmail.com' || false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};
