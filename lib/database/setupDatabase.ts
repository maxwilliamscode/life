import { supabase } from '@/integrations/supabase/client';

export const checkDatabaseTables = async () => {
  try {
    // Check each table directly instead of using information_schema
    const tables = ['fish', 'accessories', 'food'];
    const results = await Promise.all(
      tables.map(table =>
        supabase
          .from(table)
          .select('count')
          .single()
          .then(({ error }) => ({ table, exists: !error }))
      )
    );

    console.log('Database tables status:', results);
    return results.every(r => r.exists);
  } catch (error) {
    console.error('Error checking database tables:', error);
    return false;
  }
};
