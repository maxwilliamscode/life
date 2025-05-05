import { supabase } from '@/integrations/supabase/client';

/**
 * Upload a profile picture to Supabase storage
 */
export async function uploadProfilePicture(userId: string, file: File) {
  try {
    // Validate file
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const allowedTypes = ['jpg', 'jpeg', 'png', 'gif'];
    
    if (!fileExt || !allowedTypes.includes(fileExt)) {
      throw new Error('Invalid file type. Please upload a jpg, jpeg, png, or gif file.');
    }
    
    if (file.size > 2 * 1024 * 1024) {
      throw new Error('File size too large. Please upload a file smaller than 2MB.');
    }

    // First, try to delete existing avatar
    try {
      await deleteProfilePicture(userId);
    } catch (error) {
      console.log('No existing avatar to delete');
    }

    // Create unique filename with timestamp
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    // Upload new file
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    // Get public URL
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return data.publicUrl;

  } catch (error) {
    console.error('Error in uploadProfilePicture:', error);
    throw error;
  }
}

/**
 * Delete a profile picture from Supabase storage
 */
export async function deleteProfilePicture(userId: string) {
  try {
    // List files in user's folder
    const { data: files, error: listError } = await supabase.storage
      .from('avatars')
      .list(userId);

    if (listError) {
      console.error('List error:', listError);
      throw listError;
    }

    if (!files || files.length === 0) {
      return;
    }

    // Delete all files in user's folder
    const filesToDelete = files.map(file => `${userId}/${file.name}`);
    
    const { error: deleteError } = await supabase.storage
      .from('avatars')
      .remove(filesToDelete);

    if (deleteError) {
      console.error('Delete error:', deleteError);
      throw deleteError;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteProfilePicture:', error);
    throw error;
  }
}

// Export both functions as named exports
export { uploadProfilePicture as uploadAvatar, deleteProfilePicture as deleteAvatar };
