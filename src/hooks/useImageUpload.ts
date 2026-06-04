// src/hooks/useImageUpload.ts
// Synapse — Phase 6: Reusable hook for pick → upload → save URL flow

import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { uploadImage, StorageBucket } from '../lib/storage';

interface PickAndUploadOptions {
  aspect?: [number, number];
  quality?: number;
}

interface UseImageUploadReturn {
  uploading: boolean;
  pickAndUpload: (
    bucket: StorageBucket,
    path: string,
    options?: PickAndUploadOptions,
  ) => Promise<string | null>;
}

export function useImageUpload(): UseImageUploadReturn {
  const [uploading, setUploading] = useState(false);

  const pickAndUpload = async (
    bucket: StorageBucket,
    path: string,
    options: PickAndUploadOptions = {},
  ): Promise<string | null> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      console.warn('[useImageUpload] media library permission denied');
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'] as any,
      allowsEditing: true,
      aspect: options.aspect ?? [1, 1],
      quality: options.quality ?? 0.85,
    });

    if (result.canceled || result.assets.length === 0) return null;

    const asset = result.assets[0];

    setUploading(true);
    try {
      const mimeType = asset.mimeType ?? 'image/jpeg';
      const { publicUrl, error } = await uploadImage(bucket, path, asset.uri, mimeType);
      if (error) {
        console.error('[useImageUpload] upload error:', error);
        return null;
      }
      return publicUrl;
    } finally {
      setUploading(false);
    }
  };

  return { uploading, pickAndUpload };
}
