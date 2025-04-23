
/**
 * Utility functions for image handling
 */
import { Capacitor } from '@capacitor/core';

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

/**
 * Determines if the app is running as a native mobile app
 * @returns boolean indicating if running in native app context
 */
export const isNativePlatform = (): boolean => {
  return Capacitor.isNativePlatform();
};

/**
 * Gets the current platform (web, android, ios)
 * @returns string representing the current platform
 */
export const getCurrentPlatform = (): string => {
  return Capacitor.getPlatform();
};

/**
 * Creates an optimized version of an image for mobile devices
 * @param file The image file to optimize
 * @returns Promise resolving to the optimized file
 */
export const optimizeImageForMobile = async (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      resolve(file);
      return;
    }
    
    img.onload = () => {
      // Set maximum dimensions
      const MAX_WIDTH = 1200;
      const MAX_HEIGHT = 1200;
      
      let width = img.width;
      let height = img.height;
      
      // Resize if needed
      if (width > MAX_WIDTH || height > MAX_HEIGHT) {
        if (width > height) {
          height = Math.round(height * (MAX_WIDTH / width));
          width = MAX_WIDTH;
        } else {
          width = Math.round(width * (MAX_HEIGHT / height));
          height = MAX_HEIGHT;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw image on canvas
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to file with reduced quality
      canvas.toBlob((blob) => {
        if (blob) {
          const optimizedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          resolve(optimizedFile);
        } else {
          resolve(file);
        }
      }, 'image/jpeg', 0.8);
    };
    
    img.onerror = () => resolve(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        img.src = e.target.result as string;
      } else {
        resolve(file);
      }
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Creates app icons if they don't exist
 * This would normally be done during the build process
 */
export const createAppIcons = async (): Promise<void> => {
  // In a real app, this would generate app icons
  // For now, we'll just log that this would be implemented
  console.log('App icon generation would be implemented here');
  // This would typically use a library like sharp to generate icons
  // of different sizes from a source image
};
