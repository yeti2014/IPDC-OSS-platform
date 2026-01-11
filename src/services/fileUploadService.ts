// src/services/fileUploadService.ts
import { ref, uploadBytesResumable, getDownloadURL, deleteObject, UploadTaskSnapshot } from 'firebase/storage';
import { storage } from '../config/firebase';

export interface UploadProgress {
  progress: number;
  bytesTransferred: number;
  totalBytes: number;
  state: 'running' | 'paused' | 'success' | 'error';
}

export interface UploadResult {
  url: string;
  fileName: string;
  size: number;
  type: string;
  path: string;
}

class FileUploadService {
  // Maximum file size: 10MB
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024;

  // Allowed file types
  private readonly ALLOWED_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv'
  ];

  /**
   * Upload a file to Firebase Storage (with Base64 fallback for demo)
   *
   * DEMO MODE: Uses Base64 encoding to store files directly in Firestore
   * PRODUCTION MODE: Uses Firebase Storage (requires Blaze plan)
   *
   * To switch to production mode:
   * 1. Upgrade Firebase to Blaze plan
   * 2. Set VITE_USE_BASE64_STORAGE=false in .env
   * 3. Configure Firebase Storage CORS and Security Rules
   */
  async uploadFile(
    file: File,
    path: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    // Validate file
    this.validateFile(file);

    // Create unique filename
    const timestamp = Date.now();
    const sanitizedName = this.sanitizeFileName(file.name);
    const fileName = `${timestamp}_${sanitizedName}`;
    const fullPath = `${path}/${fileName}`;

    // Check if we should use Base64 storage (demo mode)
    const useBase64 = import.meta.env.VITE_USE_BASE64_STORAGE === 'true';

    if (useBase64) {
      console.log('📦 Demo mode enabled: Using Base64 storage');

      // Simulate progress for better UX
      if (onProgress) {
        onProgress({
          progress: 50,
          bytesTransferred: file.size / 2,
          totalBytes: file.size,
          state: 'running'
        });
      }

      const result = await this.uploadFileAsBase64(file, fileName);

      if (onProgress) {
        onProgress({
          progress: 100,
          bytesTransferred: file.size,
          totalBytes: file.size,
          state: 'success'
        });
      }

      return result;
    }

    // Production mode: Use Firebase Storage
    try {
      console.log('☁️ Production mode: Using Firebase Storage');
      const storageRef = ref(storage, fullPath);
      const uploadTask = uploadBytesResumable(storageRef, file);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot: UploadTaskSnapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

            if (onProgress) {
              onProgress({
                progress,
                bytesTransferred: snapshot.bytesTransferred,
                totalBytes: snapshot.totalBytes,
                state: snapshot.state as any
              });
            }

            console.log(`Upload is ${progress.toFixed(2)}% done`);
          },
          async (error) => {
            console.error('Firebase Storage upload error:', error);
            console.log('📦 Falling back to Base64 storage');

            // Fallback to Base64 encoding if Firebase Storage fails
            try {
              const base64Result = await this.uploadFileAsBase64(file, fileName);
              resolve(base64Result);
            } catch (base64Error) {
              reject(base64Error);
            }
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

              const result: UploadResult = {
                url: downloadURL,
                fileName: sanitizedName,
                size: file.size,
                type: file.type,
                path: fullPath
              };

              console.log('✅ File uploaded to Firebase Storage');
              resolve(result);
            } catch (error) {
              reject(error);
            }
          }
        );
      });
    } catch (error) {
      // If Firebase Storage is not available, use Base64 fallback
      console.log('📦 Firebase Storage not available, using Base64 storage');
      return this.uploadFileAsBase64(file, fileName);
    }
  }

  /**
   * Upload file as Base64 string (fallback for demo mode)
   */
  private async uploadFileAsBase64(file: File, fileName: string): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const base64String = reader.result as string;

        const result: UploadResult = {
          url: base64String, // Base64 data URL
          fileName: file.name,
          size: file.size,
          type: file.type,
          path: `base64:${fileName}`
        };

        console.log('✅ File converted to Base64 (demo mode)');
        resolve(result);
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsDataURL(file);
    });
  }

  /**
   * Upload multiple files
   */
  async uploadMultipleFiles(
    files: File[],
    path: string,
    onProgress?: (fileIndex: number, progress: UploadProgress) => void
  ): Promise<UploadResult[]> {
    const uploadPromises = files.map((file, index) =>
      this.uploadFile(file, path, (progress) => {
        if (onProgress) {
          onProgress(index, progress);
        }
      })
    );

    return Promise.all(uploadPromises);
  }

  /**
   * Delete a file from Firebase Storage
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      // Skip deletion for Base64 files (demo mode)
      if (filePath.startsWith('base64:')) {
        console.log('📦 Skipping deletion for Base64 file (demo mode):', filePath);
        return;
      }

      const fileRef = ref(storage, filePath);
      await deleteObject(fileRef);
      console.log('File deleted successfully:', filePath);
    } catch (error) {
      console.error('Error deleting file:', error);
      // Don't throw error for demo mode
      console.log('⚠️ Deletion failed (demo mode), continuing...');
    }
  }

  /**
   * Delete multiple files
   */
  async deleteMultipleFiles(filePaths: string[]): Promise<void> {
    const deletePromises = filePaths.map(path => this.deleteFile(path));
    await Promise.all(deletePromises);
  }

  /**
   * Validate file before upload
   */
  private validateFile(file: File): void {
    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error(
        `File size exceeds maximum allowed size of ${this.MAX_FILE_SIZE / (1024 * 1024)}MB`
      );
    }

    // Check file type
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      throw new Error(
        `File type "${file.type}" is not allowed. Allowed types: ${this.getAllowedExtensions()}`
      );
    }
  }

  /**
   * Sanitize filename to remove special characters
   */
  private sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_')
      .toLowerCase();
  }

  /**
   * Get allowed file extensions for display
   */
  getAllowedExtensions(): string {
    const extensions = [
      '.jpg',
      '.jpeg',
      '.png',
      '.gif',
      '.webp',
      '.pdf',
      '.doc',
      '.docx',
      '.xls',
      '.xlsx',
      '.txt',
      '.csv'
    ];
    return extensions.join(', ');
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Get file icon based on type
   */
  getFileIcon(fileType: string): string {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word')) return '📝';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
    if (fileType.includes('text')) return '📃';
    return '📎';
  }
}

export const fileUploadService = new FileUploadService();
export default fileUploadService;
