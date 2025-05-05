import { supabase } from "@/integrations/supabase/client";

export const createProduct = async (data: any, type: string) => {
  const { data: product, error } = await supabase
    .from(type)
    .insert([
      {
        ...data,
        category: data.category || (
          type === 'fish' ? data.species : 
          type === 'accessories' ? 'Accessories' : 
          'Fish Food'
        )
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return product;
};
