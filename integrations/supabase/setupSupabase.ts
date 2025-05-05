import { supabase } from './client';

export const setupSupabase = async () => {
  try {
    // Instead of querying information_schema, directly check each table
    const tables = ['fish', 'accessories', 'food'];
    
    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .select('id')
        .limit(1);

      if (error) {
        console.error(`Error checking ${table} table:`, error);
        // Create table if it doesn't exist
        await createTable(table);
      }
    }
  } catch (error) {
    console.error('Error setting up tables:', error);
  }
};

const createTable = async (tableName: string) => {
  const createTableQuery = getCreateTableSQL(tableName);
  const { error } = await supabase.rpc('create_table', { query: createTableQuery });
  
  if (error) {
    console.error(`Error creating ${tableName} table:`, error);
  }
};

const getCreateTableSQL = (tableName: string) => {
  const commonColumns = `
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    title TEXT,
    price DECIMAL(10,2),
    stock_quantity INTEGER DEFAULT 0,
    image_url TEXT,
    video_url TEXT
  `;

  switch (tableName) {
    case 'fish':
      return `
        CREATE TABLE IF NOT EXISTS ${tableName} (
          ${commonColumns},
          species TEXT,
          type TEXT,
          size TEXT,
          origin TEXT
        )
      `;
    case 'accessories':
      return `
        CREATE TABLE IF NOT EXISTS ${tableName} (
          ${commonColumns},
          brand TEXT,
          material TEXT,
          dimensions TEXT,
          compatibility TEXT
        )
      `;
    case 'food':
      return `
        CREATE TABLE IF NOT EXISTS ${tableName} (
          ${commonColumns},
          brand TEXT,
          weight TEXT,
          suitable_for TEXT,
          feeding_instructions TEXT,
          description TEXT
        )
      `;
    default:
      throw new Error(`Unknown table: ${tableName}`);
  }
};

export default setupSupabase;
