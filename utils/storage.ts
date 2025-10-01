import { supabase } from './supabaseClient';

/**
 * Gets the public URL for a file in Supabase storage
 * @param bucketName - The name of the storage bucket
 * @param fileName - The name of the file in the bucket
 * @returns The public URL for the file, or null if not found
 */
export const getStorageUrl = (bucketName: string, fileName: string): string | null => {
  if (!supabase || !fileName) {
    return null;
  }

  try {
    const { data } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    return data.publicUrl;
  } catch (error) {
    console.error(`Error getting storage URL for ${fileName} from ${bucketName}:`, error);
    return null;
  }
};

/**
 * Uploads a file to Supabase storage
 * @param bucketName - The name of the storage bucket
 * @param file - The file to upload
 * @param fileName - The name to give the file in storage
 * @returns The public URL of the uploaded file, or null if upload failed
 */
export const uploadFile = async (bucketName: string, file: File, fileName: string): Promise<string | null> => {
  if (!supabase) {
    console.error('Supabase client not initialized');
    return null;
  }

  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error(`Error uploading file to ${bucketName}:`, error);
      return null;
    }

    // Get the public URL
    const publicUrl = getStorageUrl(bucketName, data.path);
    return publicUrl;
  } catch (error) {
    console.error(`Exception uploading file to ${bucketName}:`, error);
    return null;
  }
};

/**
 * Gets the public URL for a speaker photo
 * @param photoFileName - The filename of the speaker photo or a full URL
 * @returns The public URL for the speaker photo, or null if not found
 */
export const getSpeakerPhotoUrl = (photoFileName: string): string | null => {
  // Si ya es una URL completa, devolverla tal como está
  if (photoFileName.startsWith('http://') || photoFileName.startsWith('https://')) {
    return photoFileName;
  }
  
  // Si es solo un nombre de archivo, construir la URL desde Supabase Storage
  const url = getStorageUrl('speakers_event_photos', photoFileName);
  return url;
};

/**
 * Gets the public URL for a company logo
 * @param logoFileName - The filename of the company logo or a full URL
 * @returns The public URL for the company logo, or null if not found
 */
export const getCompanyLogoUrl = (logoFileName: string): string | null => {
  // Si ya es una URL completa, devolverla tal como está
  if (logoFileName.startsWith('http://') || logoFileName.startsWith('https://')) {
    return logoFileName;
  }
  
  // Si es solo un nombre de archivo, construir la URL desde Supabase Storage
  const url = getStorageUrl('company_logo_event', logoFileName);
  return url;
};
