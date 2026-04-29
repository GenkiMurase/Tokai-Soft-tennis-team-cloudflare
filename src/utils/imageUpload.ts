import { compressImage } from './imageCompression';
import { apiRequest } from '../lib/api';

export async function uploadImage(file: File): Promise<string | null> {
  try {
    let uploadFile = file;

    if (file.type.startsWith('image/')) {
      try {
        uploadFile = await compressImage(file, 1200, 1200, 0.85);
      } catch (error) {
        console.warn('Image compression failed, using original:', error);
      }
    }

    const formData = new FormData();
    formData.append('file', uploadFile, uploadFile.name);

    const result = await apiRequest<{ url: string }>('/api/images/upload', {
      method: 'POST',
      body: formData,
    });

    return result.url;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
}
