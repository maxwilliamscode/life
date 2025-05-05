import { useState } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useProductForm = (productType: 'fish' | 'accessories' | 'food') => {
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const queryClient = useQueryClient();

  const uploadMedia = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).slice(2)}.${fileExt}`;
    const bucket = `${productType}_media`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const addProduct = useMutation({
    mutationFn: async (data: any) => {
      let mediaUrl = '';
      if (mediaFile) {
        mediaUrl = await uploadMedia(mediaFile);
      }

      const { data: product, error } = await supabase
        .from(productType)
        .insert([{ ...data, image_url: mediaUrl }])
        .select()
        .single();

      if (error) throw error;
      return product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setMediaFile(null);
    }
  });

  return {
    mediaFile,
    setMediaFile,
    addProduct
  };
};
