// src/lib/storage.ts
// Synapse — Phase 6: Supabase Storage helpers

import { supabase } from './supabase';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';

// ─── Types ────────────────────────────────────────────────────────────────────

export type StorageBucket = 'avatars' | 'banners' | 'portfolio' | 'gallery';

export interface UploadResult {
  publicUrl: string | null;
  error: string | null;
}

// ─── Core: upload a local URI to a Supabase Storage bucket ───────────────────

export async function uploadImage(
  bucket: StorageBucket,
  path: string,
  localUri: string,
  mimeType = 'image/jpeg',
): Promise<UploadResult> {
  try {
    // Use string literal 'base64' instead of FileSystem.EncodingType.Base64
    // to avoid undefined reference on some Expo versions
    const base64 = await FileSystem.readAsStringAsync(localUri, {
      encoding: 'base64' as any,
    });

    // Decode base64 → Uint8Array
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, bytes, {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadError) {
      console.error(`[storage] upload error (${bucket}/${path}):`, uploadError.message);
      return { publicUrl: null, error: uploadError.message };
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return { publicUrl: data.publicUrl, error: null };
  } catch (err: any) {
    console.error(`[storage] unexpected error:`, err?.message ?? err);
    return { publicUrl: null, error: err?.message ?? 'Upload failed' };
  }
}

// ─── Get public URL for an existing file ─────────────────────────────────────

export function getPublicUrl(bucket: StorageBucket, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

// ─── Delete a file from a bucket ─────────────────────────────────────────────

export async function deleteImage(
  bucket: StorageBucket,
  path: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  return { error: error?.message ?? null };
}

// ─── Path builders ────────────────────────────────────────────────────────────

export function avatarPath(userId: string): string {
  return `${userId}/avatar.jpg`;
}

export function bannerPath(userId: string): string {
  return `${userId}/banner.jpg`;
}

export function heroImagePath(userId: string, itemId: string): string {
  return `${userId}/items/${itemId}/hero.jpg`;
}

export function proofImagePath(userId: string, itemId: string, proofId: string): string {
  return `${userId}/items/${itemId}/proof_${proofId}.jpg`;
}

export function galleryImagePath(userId: string, galleryItemId: string): string {
  return `${userId}/${galleryItemId}.jpg`;
}

// ─── Image picker helpers ─────────────────────────────────────────────────────

export async function pickImage(): Promise<ImagePicker.ImagePickerAsset | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    console.warn('[storage] media library permission not granted');
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'] as any,
    allowsEditing: true,
    quality: 0.85,
  });

  if (result.canceled || result.assets.length === 0) return null;
  return result.assets[0];
}

export async function captureImage(): Promise<ImagePicker.ImagePickerAsset | null> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    console.warn('[storage] camera permission not granted');
    return null;
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'] as any,
    allowsEditing: true,
    quality: 0.85,
  });

  if (result.canceled || result.assets.length === 0) return null;
  return result.assets[0];
}
