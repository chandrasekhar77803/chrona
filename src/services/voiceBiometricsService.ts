/**
 * VOICE BIOMETRICS & SPEAKER IDENTIFICATION SERVICE
 *
 * Provides acoustic spectral feature extraction, reference profile enrolment,
 * and real-time speaker verification using Web Audio API and cosine similarity scoring.
 * Enforces per-user voice profile storage under Firestore `users/{uid}/voiceBiometrics`.
 */

import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { VoiceBiometricsProfile } from '../types/chrona';

export interface VerificationResult {
  isVerified: boolean;
  status: 'verified' | 'unrecognized' | 'not_enrolled';
  confidenceScore: number;
  message: string;
}

/**
 * Extract 6-dimensional acoustic spectral feature vector from raw audio sample buffer
 */
export function extractSpectralFeatures(samples: Float32Array, _sampleRate: number = 44100): number[] {
  if (!samples || samples.length === 0) {
    return [0.5, 0.5, 0.5, 0.33, 0.33, 0.34];
  }

  // 1. RMS Energy
  let sumSquares = 0;
  let zeroCrossings = 0;

  for (let i = 0; i < samples.length; i++) {
    const s = samples[i];
    sumSquares += s * s;
    if (i > 0 && ((samples[i - 1] >= 0 && s < 0) || (samples[i - 1] < 0 && s >= 0))) {
      zeroCrossings++;
    }
  }

  const rmsEnergy = Math.sqrt(sumSquares / samples.length);
  const zcr = zeroCrossings / samples.length;

  // 2. Simple Spectral Energy Bands (Low, Mid, High simulation via DFT / autocorrelation)
  let lowEnergy = 0;
  let midEnergy = 0;
  let highEnergy = 0;

  // Downsample-based band estimation
  const step = Math.max(1, Math.floor(samples.length / 1024));
  for (let i = 0; i < samples.length - step; i += step) {
    const diff = Math.abs(samples[i + step] - samples[i]);
    if (diff < 0.05) lowEnergy += 1;
    else if (diff < 0.2) midEnergy += 1;
    else highEnergy += 1;
  }

  const totalBands = (lowEnergy + midEnergy + highEnergy) || 1;
  const lowRatio = lowEnergy / totalBands;
  const midRatio = midEnergy / totalBands;
  const highRatio = highEnergy / totalBands;

  // 3. Spectral Centroid proxy
  const centroid = (lowRatio * 200 + midRatio * 1500 + highRatio * 4000) / 4000;

  return [
    parseFloat(centroid.toFixed(4)),
    parseFloat(rmsEnergy.toFixed(4)),
    parseFloat(zcr.toFixed(4)),
    parseFloat(lowRatio.toFixed(4)),
    parseFloat(midRatio.toFixed(4)),
    parseFloat(highRatio.toFixed(4))
  ];
}

/**
 * Calculate Cosine Similarity Score (0 - 100%) between two spectral feature vectors
 */
export function calculateVoiceSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  const scorePercentage = Math.min(100, Math.max(0, Math.round(similarity * 100)));
  return scorePercentage;
}

/**
 * Save user voice enrolment profile to Firestore
 */
export async function enrollVoiceProfile(
  userId: string,
  passphrase: string,
  featureVector: number[]
): Promise<VoiceBiometricsProfile> {
  const profile: VoiceBiometricsProfile = {
    userId,
    enrolled: true,
    passphrase,
    audioFingerprint: featureVector,
    enrolledAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  try {
    const docRef = doc(db, 'users', userId, 'voiceBiometrics', 'profile');
    await setDoc(docRef, profile);
  } catch (err) {
    console.warn('[VoiceBiometrics] Firestore enrollment write error:', err);
  }

  return profile;
}

/**
 * Fetch enrolled voice profile from Firestore
 */
export async function getVoiceProfile(userId: string): Promise<VoiceBiometricsProfile | null> {
  try {
    const docRef = doc(db, 'users', userId, 'voiceBiometrics', 'profile');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as VoiceBiometricsProfile;
    }
  } catch (err) {
    console.warn('[VoiceBiometrics] Firestore profile read error:', err);
  }
  return null;
}

/**
 * Reset / Delete enrolled voice profile
 */
export async function resetVoiceProfile(userId: string): Promise<void> {
  try {
    const docRef = doc(db, 'users', userId, 'voiceBiometrics', 'profile');
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('[VoiceBiometrics] Firestore profile delete error:', err);
  }
}

/**
 * Verify incoming voice sample against stored user voice profile
 */
export async function verifySpeakerVoice(
  userId: string,
  incomingVector: number[],
  storedProfile?: VoiceBiometricsProfile | null
): Promise<VerificationResult> {
  const profile = storedProfile !== undefined ? storedProfile : await getVoiceProfile(userId);

  if (!profile || !profile.enrolled) {
    return {
      isVerified: false,
      status: 'not_enrolled',
      confidenceScore: 0,
      message: 'No voice profile enrolled for this user. Click "Enrol Voice" to create your biometrics.'
    };
  }

  const score = calculateVoiceSimilarity(incomingVector, profile.audioFingerprint);
  // Verification threshold score >= 80%
  const isVerified = score >= 80;

  return {
    isVerified,
    status: isVerified ? 'verified' : 'unrecognized',
    confidenceScore: score,
    message: isVerified
      ? `🟢 Voice Verified (${score}% Match)`
      : `⚠️ Voice not recognized (${score}% Match). Please speak using your registered voice profile to receive personalized responses.`
  };
}
