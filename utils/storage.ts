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
 * Gets the public URL for a speaker photo
 * @param photoFileName - The filename of the speaker photo or a full URL
 * @returns The public URL for the speaker photo, or null if not found
 */
export const getSpeakerPhotoUrl = (photoFileName: string): string | null => {
  console.log('getSpeakerPhotoUrl called with:', photoFileName);
  
  // Si ya es una URL completa, construir la URL correcta
  if (photoFileName.startsWith('http://') || photoFileName.startsWith('https://')) {
    // Extraer el nombre del archivo de la URL
    const fileName = photoFileName.split('/').pop();
    if (fileName) {
      // Construir la URL correcta usando Supabase Storage
      const url = getStorageUrl('speakers_event_photos', fileName);
      console.log('Corrected speaker photo URL:', url);
      return url;
    }
    return photoFileName;
  }
  
  // Si es solo un nombre de archivo, construir la URL desde Supabase Storage
  const url = getStorageUrl('speakers_event_photos', photoFileName);
  console.log('Generated storage URL:', url);
  return url;
};

/**
 * Gets the public URL for a company logo
 * @param logoFileName - The filename of the company logo or a full URL
 * @returns The public URL for the company logo, or null if not found
 */
export const getCompanyLogoUrl = (logoFileName: string): string | null => {
  console.log('getCompanyLogoUrl called with:', logoFileName);
  
  // Si ya es una URL completa, construir la URL correcta
  if (logoFileName.startsWith('http://') || logoFileName.startsWith('https://')) {
    // Extraer el nombre del archivo de la URL
    const fileName = logoFileName.split('/').pop();
    if (fileName) {
      // Construir la URL correcta usando Supabase Storage
      const url = getStorageUrl('company_logo_event', fileName);
      console.log('Corrected company logo URL:', url);
      return url;
    }
    return logoFileName;
  }
  
  // Si es solo un nombre de archivo, construir la URL desde Supabase Storage
  const url = getStorageUrl('company_logo_event', logoFileName);
  console.log('Generated company logo storage URL:', url);
  return url;
};
