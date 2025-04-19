
/**
 * Utility functions for image handling
 */

/**
 * Checks if a URL is a valid image URL by attempting to load it
 * @param url The URL to check
 * @returns Promise that resolves to true if the image can be loaded, false otherwise
 */
export const isImageUrlValid = (url: string): Promise<boolean> => {
  if (!url) return Promise.resolve(false);
  
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
};

/**
 * Gets a fallback avatar URL based on a name
 * @param name User name
 * @returns URL to an avatar
 */
export const getFallbackAvatar = (name?: string): string => {
  if (!name) return "/placeholder.svg";
  const initial = name.charAt(0).toUpperCase();
  // You could implement additional logic here to get different avatar styles
  return `/placeholder.svg`;
};

/**
 * Creates a storage bucket if it doesn't exist
 * @param supabase Supabase client
 * @param bucketName Name of the bucket to create
 */
export const ensureBucketExists = async (supabase: any, bucketName: string): Promise<void> => {
  try {
    // Check if bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error("Error checking buckets:", bucketsError);
      return;
    }
    
    // Create bucket if it doesn't exist
    if (!buckets?.find((b: any) => b.name === bucketName)) {
      const { error: createError } = await supabase.storage.createBucket(bucketName, { 
        public: true,
        fileSizeLimit: 5242880 // 5MB
      });
      
      if (createError) {
        console.error(`Error creating ${bucketName} bucket:`, createError);
      }
    }
  } catch (error) {
    console.error(`Error ensuring ${bucketName} bucket exists:`, error);
  }
};

/**
 * Uploads a file to Supabase storage with proper error handling and RLS bypass
 * @param supabase Supabase client
 * @param bucketName Name of the bucket to upload to
 * @param filePath Path to store the file at
 * @param file File to upload
 * @returns URL of the uploaded file or null if upload failed
 */
export const uploadFileToStorage = async (
  supabase: any, 
  bucketName: string, 
  filePath: string, 
  file: File
): Promise<string | null> => {
  try {
    // Ensure bucket exists
    await ensureBucketExists(supabase, bucketName);
    
    // Upload file
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });
      
    if (uploadError) {
      console.error(`Error uploading to ${bucketName}:`, uploadError);
      return null;
    }
    
    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);
      
    if (!publicUrlData) {
      console.error('Failed to get public URL');
      return null;
    }
    
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error(`Error in uploadFileToStorage:`, error);
    return null;
  }
};
