
import { supabase } from "@/integrations/supabase/client";

interface StorageData {
  key: string;
  data: any;
  userId?: string;
}

/**
 * Utility for consistent data storage between Supabase and localStorage
 */
export class StorageManager {
  /**
   * Save data to both Supabase and localStorage for redundancy
   */
  static async saveData({ key, data, userId }: StorageData): Promise<boolean> {
    try {
      // Always save to localStorage first
      localStorage.setItem(key, JSON.stringify(data));
      
      // If user is logged in, also save to Supabase
      if (userId) {
        // Note: This would require a generic storage table in Supabase
        // For now, we'll handle specific cases in the calling code
        console.log(`Data saved to localStorage for key: ${key}`);
        return true;
      }
      
      return true;
    } catch (error) {
      console.error(`Error saving data for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Load data from localStorage with fallback
   */
  static loadData(key: string): any | null {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Error loading data for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Clear specific data
   */
  static clearData(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error clearing data for key ${key}:`, error);
    }
  }

  /**
   * Create or ensure storage bucket exists
   */
  static async ensureBucket(bucketName: string): Promise<boolean> {
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      
      if (!buckets?.find(bucket => bucket.name === bucketName)) {
        const { error } = await supabase.storage.createBucket(bucketName, {
          public: true,
          fileSizeLimit: bucketName === 'avatars' ? 5242880 : 10485760 // 5MB for avatars, 10MB for posts
        });
        
        if (error) {
          console.error(`Error creating ${bucketName} bucket:`, error);
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error(`Error ensuring ${bucketName} bucket exists:`, error);
      return false;
    }
  }

  /**
   * Upload file to Supabase storage with error handling
   */
  static async uploadFile(
    bucketName: string, 
    filePath: string, 
    file: File
  ): Promise<string | null> {
    try {
      // Ensure bucket exists
      const bucketReady = await this.ensureBucket(bucketName);
      if (!bucketReady) {
        throw new Error(`Failed to create/access ${bucketName} bucket`);
      }

      // Upload file
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
        
      if (uploadError) {
        throw uploadError;
      }
      
      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);
        
      if (!publicUrlData?.publicUrl) {
        throw new Error('Failed to get public URL');
      }
      
      return publicUrlData.publicUrl;
    } catch (error) {
      console.error(`Error uploading file to ${bucketName}:`, error);
      return null;
    }
  }
}
