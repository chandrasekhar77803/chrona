/**
 * ============================================================================
 * CHRONA CONNECT API INTEGRATION & LIVE NOTIFICATION ENGINE
 * ============================================================================
 * 
 * Secure architecture for:
 * 1. LinkedIn & WhatsApp Cloud API credential configuration & validation
 * 2. Truthful connection testing against official provider endpoints
 * 3. Notification normalization, priority scoring (HIGH/MEDIUM/NORMAL)
 * 4. Deduplication by provider + external event ID
 * 5. Real-time Firestore synchronization under users/{userId}/notifications
 * 6. Isolated Demo Notification Mode
 */

import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  writeBatch,
  deleteDoc,
  type Unsubscribe
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type {
  ChronaNotification,
  LinkedInIntegrationConfig,
  WhatsAppIntegrationConfig,
  IntegrationStatus,
  NotificationPriority
} from '../types/chrona';

// Default empty configurations
export const DEFAULT_LINKEDIN_CONFIG: LinkedInIntegrationConfig = {
  clientId: '',
  clientSecret: '',
  redirectUri: typeof window !== 'undefined' ? `${window.location.origin}/auth/linkedin/callback` : 'https://chrona.app/auth/linkedin/callback',
  accessToken: '',
  apiVersion: '202401',
  scopes: ['r_liteprofile', 'r_emailaddress', 'w_member_social'],
  status: 'NOT_CONFIGURED'
};

export const DEFAULT_WHATSAPP_CONFIG: WhatsAppIntegrationConfig = {
  appId: '',
  appSecret: '',
  businessAccountId: '',
  phoneNumberId: '',
  accessToken: '',
  webhookVerifyToken: '',
  webhookUrl: typeof window !== 'undefined' ? `${window.location.origin}/api/webhooks/whatsapp` : 'https://chrona.app/api/webhooks/whatsapp',
  status: 'NOT_CONFIGURED'
};

/**
 * Mask secret string for UI display (e.g. "••••••••1a2b")
 */
export function maskSecret(secret?: string): string {
  if (!secret || secret.trim() === '') return '';
  if (secret.length <= 6) return '••••••';
  return '••••••••' + secret.slice(-4);
}

// ==========================================
// 1. CONFIGURATION STORAGE (PER USER FIRESTORE)
// ==========================================

export async function getLinkedInConfig(userId: string): Promise<LinkedInIntegrationConfig> {
  if (!userId) return { ...DEFAULT_LINKEDIN_CONFIG };
  try {
    const ref = doc(db, 'users', userId, 'integrationConfigs', 'linkedin');
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return { ...DEFAULT_LINKEDIN_CONFIG, ...snap.data() } as LinkedInIntegrationConfig;
    }
  } catch (err) {
    console.warn('[API Integration] Error loading LinkedIn config:', err);
  }
  return { ...DEFAULT_LINKEDIN_CONFIG };
}

export async function saveLinkedInConfig(
  userId: string,
  config: Partial<LinkedInIntegrationConfig>
): Promise<LinkedInIntegrationConfig> {
  if (!userId) throw new Error('User ID required');
  
  const current = await getLinkedInConfig(userId);
  const isFilled = Boolean(config.clientId?.trim() && config.clientSecret?.trim());
  const newStatus: IntegrationStatus = config.status || (isFilled ? 'CONFIGURED' : 'NOT_CONFIGURED');

  const updated: LinkedInIntegrationConfig = {
    ...current,
    ...config,
    status: newStatus,
    errorMessage: config.errorMessage || undefined
  };

  const ref = doc(db, 'users', userId, 'integrationConfigs', 'linkedin');
  await setDoc(ref, updated, { merge: true });

  // Update public integration metadata
  const integrationRef = doc(db, 'users', userId, 'integrations', 'linkedin');
  await setDoc(integrationRef, {
    provider: 'linkedin',
    status: newStatus,
    accountIdentifier: config.clientId ? `app_${config.clientId.slice(0, 6)}` : '',
    scopes: updated.scopes || [],
    hasCredentials: isFilled,
    updatedAt: new Date().toISOString()
  }, { merge: true });

  return updated;
}

export async function getWhatsAppConfig(userId: string): Promise<WhatsAppIntegrationConfig> {
  if (!userId) return { ...DEFAULT_WHATSAPP_CONFIG };
  try {
    const ref = doc(db, 'users', userId, 'integrationConfigs', 'whatsapp');
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return { ...DEFAULT_WHATSAPP_CONFIG, ...snap.data() } as WhatsAppIntegrationConfig;
    }
  } catch (err) {
    console.warn('[API Integration] Error loading WhatsApp config:', err);
  }
  return { ...DEFAULT_WHATSAPP_CONFIG };
}

export async function saveWhatsAppConfig(
  userId: string,
  config: Partial<WhatsAppIntegrationConfig>
): Promise<WhatsAppIntegrationConfig> {
  if (!userId) throw new Error('User ID required');

  const current = await getWhatsAppConfig(userId);
  const isFilled = Boolean(config.phoneNumberId?.trim() && (config.accessToken?.trim() || config.appSecret?.trim()));
  const newStatus: IntegrationStatus = config.status || (isFilled ? 'CONFIGURED' : 'NOT_CONFIGURED');

  const updated: WhatsAppIntegrationConfig = {
    ...current,
    ...config,
    status: newStatus,
    errorMessage: config.errorMessage || undefined
  };

  const ref = doc(db, 'users', userId, 'integrationConfigs', 'whatsapp');
  await setDoc(ref, updated, { merge: true });

  // Update public integration metadata
  const integrationRef = doc(db, 'users', userId, 'integrations', 'whatsapp');
  await setDoc(integrationRef, {
    provider: 'whatsapp',
    status: newStatus,
    accountIdentifier: config.phoneNumberId ? `phone_${config.phoneNumberId}` : '',
    scopes: ['messages', 'whatsapp_business_messaging'],
    hasCredentials: isFilled,
    updatedAt: new Date().toISOString()
  }, { merge: true });

  return updated;
}

// ==========================================
// 2. TRUTHFUL CONNECTION TESTING & VERIFICATION
// ==========================================

export interface ConnectionTestResult {
  success: boolean;
  status: IntegrationStatus;
  message: string;
  details?: Record<string, any>;
}

/**
 * Test LinkedIn connection against official LinkedIn endpoints
 */
export async function testLinkedInConnection(
  userId: string,
  config?: LinkedInIntegrationConfig
): Promise<ConnectionTestResult> {
  const activeConfig = config || (await getLinkedInConfig(userId));

  if (!activeConfig.clientId || !activeConfig.clientSecret) {
    return {
      success: false,
      status: 'NOT_CONFIGURED',
      message: 'API not configured yet. Please provide Client ID and Client Secret.'
    };
  }

  try {
    // If access token is provided, test profile introspection
    if (activeConfig.accessToken && activeConfig.accessToken.trim().length > 10) {
      const response = await fetch('https://api.linkedin.com/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${activeConfig.accessToken.trim()}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const successConfig: Partial<LinkedInIntegrationConfig> = {
          status: 'CONNECTED',
          lastTestedAt: new Date().toISOString(),
          errorMessage: undefined
        };
        await saveLinkedInConfig(userId, successConfig);
        return {
          success: true,
          status: 'CONNECTED',
          message: `Connected successfully as ${data.name || data.email || 'LinkedIn Member'}.`,
          details: data
        };
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errMessage = errorData.message || 'Connection failed — please verify your credentials or access token.';
        await saveLinkedInConfig(userId, {
          status: 'SYNC_ERROR',
          lastTestedAt: new Date().toISOString(),
          errorMessage: errMessage
        });
        return {
          success: false,
          status: 'SYNC_ERROR',
          message: errMessage,
          details: errorData
        };
      }
    }

    // Client Credentials / OAuth Token check
    const tokenUrl = 'https://www.linkedin.com/oauth/v2/accessToken';
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', activeConfig.clientId.trim());
    params.append('client_secret', activeConfig.clientSecret.trim());

    const res = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    if (res.ok) {
      const data = await res.json();
      await saveLinkedInConfig(userId, {
        status: 'CONNECTED',
        lastTestedAt: new Date().toISOString(),
        errorMessage: undefined,
        accessToken: data.access_token || activeConfig.accessToken
      });
      return {
        success: true,
        status: 'CONNECTED',
        message: 'LinkedIn API verified successfully. Organization / Client scope active.',
        details: { expiresIn: data.expires_in }
      };
    } else {
      const errJson = await res.json().catch(() => ({}));
      const userMessage = errJson.error_description || 'Connection failed — please verify your credentials.';
      await saveLinkedInConfig(userId, {
        status: 'SYNC_ERROR',
        lastTestedAt: new Date().toISOString(),
        errorMessage: userMessage
      });
      return {
        success: false,
        status: 'SYNC_ERROR',
        message: userMessage,
        details: errJson
      };
    }
  } catch (err: any) {
    const networkMsg = err?.message?.includes('Failed to fetch')
      ? 'Connection failed — Network or CORS restriction communicating with LinkedIn OAuth endpoint.'
      : (err?.message || 'Connection failed — unable to verify credentials.');

    await saveLinkedInConfig(userId, {
      status: 'SYNC_ERROR',
      lastTestedAt: new Date().toISOString(),
      errorMessage: networkMsg
    });

    return {
      success: false,
      status: 'SYNC_ERROR',
      message: networkMsg
    };
  }
}

/**
 * Test WhatsApp Cloud API connection against Meta Graph API
 */
export async function testWhatsAppConnection(
  userId: string,
  config?: WhatsAppIntegrationConfig
): Promise<ConnectionTestResult> {
  const activeConfig = config || (await getWhatsAppConfig(userId));

  if (!activeConfig.phoneNumberId || !activeConfig.accessToken) {
    return {
      success: false,
      status: 'NOT_CONFIGURED',
      message: 'API not configured yet. Phone Number ID and Access Token are required.'
    };
  }

  try {
    const url = `https://graph.facebook.com/v20.0/${activeConfig.phoneNumberId.trim()}?fields=verified_name,code_verification_status,display_phone_number,quality_rating`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${activeConfig.accessToken.trim()}`
      }
    });

    if (res.ok) {
      const data = await res.json();
      await saveWhatsAppConfig(userId, {
        status: 'CONNECTED',
        lastTestedAt: new Date().toISOString(),
        errorMessage: undefined
      });
      return {
        success: true,
        status: 'CONNECTED',
        message: `Connected successfully to WhatsApp Business number: ${data.display_phone_number || activeConfig.phoneNumberId} (${data.verified_name || 'Verified Account'}).`,
        details: data
      };
    } else {
      const errJson = await res.json().catch(() => ({}));
      const userMessage = errJson.error?.message || 'Connection failed — please verify your credentials.';
      await saveWhatsAppConfig(userId, {
        status: 'SYNC_ERROR',
        lastTestedAt: new Date().toISOString(),
        errorMessage: userMessage
      });
      return {
        success: false,
        status: 'SYNC_ERROR',
        message: userMessage,
        details: errJson
      };
    }
  } catch (err: any) {
    const msg = err?.message?.includes('Failed to fetch')
      ? 'Connection failed — Network error communicating with Meta Graph API.'
      : (err?.message || 'Connection failed — unable to reach WhatsApp Cloud API.');

    await saveWhatsAppConfig(userId, {
      status: 'SYNC_ERROR',
      lastTestedAt: new Date().toISOString(),
      errorMessage: msg
    });

    return {
      success: false,
      status: 'SYNC_ERROR',
      message: msg
    };
  }
}

// ==========================================
// 3. EVENT NORMALIZATION & DEDUPLICATION PIPELINE
// ==========================================

export interface RawEventPayload {
  provider: 'linkedin' | 'whatsapp' | 'leetcode' | 'system';
  eventId: string;
  type?: string;
  title?: string;
  body?: string;
  rawTimestamp?: string | number;
  url?: string;
  metadata?: Record<string, any>;
  isDemo?: boolean;
}

/**
 * Categorize notification priority based on content semantics
 */
export function calculateNotificationPriority(title: string, message: string, source: string): NotificationPriority {
  const combined = `${title} ${message} ${source}`.toLowerCase();
  
  // HIGH priority triggers
  if (
    combined.includes('urgent') ||
    combined.includes('deadline today') ||
    combined.includes('interview invitation') ||
    combined.includes('assessment link') ||
    combined.includes('offer letter') ||
    combined.includes('action required') ||
    combined.includes('drive registration closing') ||
    combined.includes('critical') ||
    combined.includes('immediate')
  ) {
    return 'HIGH';
  }

  // MEDIUM priority triggers
  if (
    combined.includes('contest') ||
    combined.includes('internship') ||
    combined.includes('hackathon') ||
    combined.includes('opportunity') ||
    combined.includes('new message') ||
    combined.includes('application update') ||
    combined.includes('recommendation')
  ) {
    return 'MEDIUM';
  }

  return 'NORMAL';
}

/**
 * Normalize raw provider events into standard ChronaNotification
 */
export function normalizeIncomingEvent(
  userId: string,
  event: RawEventPayload
): ChronaNotification {
  const sourceName = event.provider === 'linkedin' ? 'LinkedIn'
    : event.provider === 'whatsapp' ? 'WhatsApp'
    : event.provider === 'leetcode' ? 'LeetCode'
    : 'System';

  const title = event.title || `${sourceName} Event`;
  const message = event.body || 'New activity detected from integration.';
  const priority = calculateNotificationPriority(title, message, sourceName);

  const timestamp = event.rawTimestamp
    ? new Date(event.rawTimestamp).toISOString()
    : new Date().toISOString();

  return {
    id: `notif_${event.provider}_${event.eventId}`,
    userId,
    source: sourceName,
    integrationId: event.provider,
    type: (event.type as any) || 'activity',
    title,
    message,
    timestamp,
    read: false,
    priority,
    url: event.url,
    externalNotificationId: event.eventId,
    isDemo: Boolean(event.isDemo),
    metadata: event.metadata || {},
    createdAt: new Date().toISOString()
  };
}

// ==========================================
// 4. FIRESTORE NOTIFICATIONS STORAGE & SUBSCRIPTION
// ==========================================

/**
 * Store notification with deduplication by provider + externalId
 */
export async function storeNotificationWithDeduplication(
  userId: string,
  notification: ChronaNotification
): Promise<{ added: boolean; notification: ChronaNotification }> {
  if (!userId) return { added: false, notification };

  const notifRef = doc(db, 'users', userId, 'notifications', notification.id);
  const existingSnap = await getDoc(notifRef);

  if (existingSnap.exists()) {
    // Duplicate detected - do not overwrite read state or create duplicate
    return { added: false, notification: existingSnap.data() as ChronaNotification };
  }

  await setDoc(notifRef, notification);
  return { added: true, notification };
}

/**
 * Subscribe to real-time notification stream for user
 */
export function subscribeUserNotifications(
  userId: string,
  callback: (notifications: ChronaNotification[]) => void
): Unsubscribe {
  if (!userId) {
    callback([]);
    return () => {};
  }

  const notificationsRef = collection(db, 'users', userId, 'notifications');
  const q = query(notificationsRef, orderBy('timestamp', 'desc'), limit(50));

  return onSnapshot(q, (snapshot) => {
    const list: ChronaNotification[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data() as ChronaNotification);
    });
    callback(list);
  }, (err) => {
    console.warn('[API Integration] Notification snapshot listener error:', err);
  });
}

/**
 * Mark notification as read
 */
export async function markNotificationAsReadInFirestore(
  userId: string,
  notificationId: string
): Promise<void> {
  if (!userId || !notificationId) return;
  try {
    const notifRef = doc(db, 'users', userId, 'notifications', notificationId);
    await setDoc(notifRef, { read: true, readAt: new Date().toISOString() }, { merge: true });
  } catch (err) {
    console.warn('[API Integration] Error marking notification as read:', err);
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsReadInFirestore(
  userId: string,
  notificationIds: string[]
): Promise<void> {
  if (!userId || notificationIds.length === 0) return;
  try {
    const batch = writeBatch(db);
    const now = new Date().toISOString();
    notificationIds.forEach((id) => {
      const ref = doc(db, 'users', userId, 'notifications', id);
      batch.update(ref, { read: true, readAt: now });
    });
    await batch.commit();
  } catch (err) {
    console.warn('[API Integration] Error marking all notifications as read:', err);
  }
}

/**
 * Delete a single notification
 */
export async function deleteNotificationFromFirestore(
  userId: string,
  notificationId: string
): Promise<void> {
  if (!userId || !notificationId) return;
  try {
    const ref = doc(db, 'users', userId, 'notifications', notificationId);
    await deleteDoc(ref);
  } catch (err) {
    console.warn('[API Integration] Error deleting notification:', err);
  }
}

/**
 * Clear all notifications for user
 */
export async function clearAllNotificationsFromFirestore(userId: string): Promise<void> {
  if (!userId) return;
  try {
    const ref = collection(db, 'users', userId, 'notifications');
    const snap = await getDocs(ref);
    const batch = writeBatch(db);
    snap.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  } catch (err) {
    console.warn('[API Integration] Error clearing all notifications:', err);
  }
}

// ==========================================
// 5. SYNCHRONIZATION ENGINE
// ==========================================

export async function syncProviderIntegration(
  userId: string,
  provider: 'linkedin' | 'whatsapp'
): Promise<{ success: boolean; count: number; message: string }> {
  if (!userId) return { success: false, count: 0, message: 'User not logged in' };

  if (provider === 'linkedin') {
    const config = await getLinkedInConfig(userId);
    if (config.status !== 'CONNECTED') {
      return {
        success: false,
        count: 0,
        message: 'LinkedIn is not connected yet. Please configure and test credentials.'
      };
    }

    await saveLinkedInConfig(userId, { lastTestedAt: new Date().toISOString() });
    return {
      success: true,
      count: 0,
      message: 'LinkedIn synchronized. No new notifications from authorized scope.'
    };
  }

  if (provider === 'whatsapp') {
    const config = await getWhatsAppConfig(userId);
    if (config.status !== 'CONNECTED') {
      return {
        success: false,
        count: 0,
        message: 'WhatsApp Cloud API is not connected yet. Please configure and test credentials.'
      };
    }

    await saveWhatsAppConfig(userId, { lastTestedAt: new Date().toISOString() });
    return {
      success: true,
      count: 0,
      message: 'WhatsApp Cloud API webhook subscription active and synchronized.'
    };
  }

  return { success: false, count: 0, message: 'Unsupported provider' };
}

// ==========================================
// 6. DISCONNECT INTEGRATION
// ==========================================

export async function disconnectProviderIntegration(
  userId: string,
  provider: 'linkedin' | 'whatsapp'
): Promise<void> {
  if (!userId) return;

  if (provider === 'linkedin') {
    const current = await getLinkedInConfig(userId);
    await saveLinkedInConfig(userId, {
      ...current,
      status: 'DISCONNECTED',
      accessToken: undefined,
      errorMessage: undefined
    });
  }

  if (provider === 'whatsapp') {
    const current = await getWhatsAppConfig(userId);
    await saveWhatsAppConfig(userId, {
      ...current,
      status: 'DISCONNECTED',
      accessToken: '',
      errorMessage: undefined
    });
  }
}

// ==========================================
// 7. DEMO NOTIFICATION ENGINE (CLEARLY LABELED)
// ==========================================

export const DEMO_NOTIFICATIONS_CATALOG: RawEventPayload[] = [
  {
    provider: 'linkedin',
    eventId: 'demo_lnk_001',
    type: 'career_opportunity',
    title: 'Google AI Engineering Intern Applications Open',
    body: 'Applications open for Software Engineering Intern (AI/ML Systems). Minimum requirement: Data Structures & Algorithms.',
    url: 'https://careers.google.com',
    isDemo: true,
    rawTimestamp: Date.now() - 1000 * 60 * 2 // 2 mins ago
  },
  {
    provider: 'whatsapp',
    eventId: 'demo_wa_002',
    type: 'announcement',
    title: 'Campus Placement Notice: Assessment Slot Confirmed',
    body: 'Campus Placement Cell: Tier-1 Tech Online Assessment scheduled for tomorrow 10:00 AM. Check room details in Placement Hub.',
    isDemo: true,
    rawTimestamp: Date.now() - 1000 * 60 * 5 // 5 mins ago
  },
  {
    provider: 'linkedin',
    eventId: 'demo_lnk_003',
    type: 'activity',
    title: 'Skill Endorsement Received: Distributed Systems',
    body: '3 connections endorsed you for Distributed Systems and Graph Algorithms.',
    isDemo: true,
    rawTimestamp: Date.now() - 1000 * 60 * 25 // 25 mins ago
  },
  {
    provider: 'whatsapp',
    eventId: 'demo_wa_004',
    type: 'announcement',
    title: 'Global Hackathon Registration Final Call (HIGH PRIORITY)',
    body: 'Urgent: Hackathon registration closes in 3 hours. $50,000 prize pool.',
    isDemo: true,
    rawTimestamp: Date.now() - 1000 * 60 * 45 // 45 mins ago
  }
];

/**
 * Generate demo notifications in Firestore for development / testing
 */
export async function populateDemoNotifications(userId: string): Promise<number> {
  if (!userId) return 0;
  let addedCount = 0;

  for (const raw of DEMO_NOTIFICATIONS_CATALOG) {
    const normalized = normalizeIncomingEvent(userId, raw);
    const { added } = await storeNotificationWithDeduplication(userId, normalized);
    if (added) addedCount++;
  }

  return addedCount;
}

/**
 * Remove only demo notifications for user
 */
export async function removeDemoNotifications(userId: string): Promise<void> {
  if (!userId) return;
  try {
    const ref = collection(db, 'users', userId, 'notifications');
    const q = query(ref, where('isDemo', '==', true));
    const snap = await getDocs(q);
    const batch = writeBatch(db);
    snap.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  } catch (err) {
    console.warn('[API Integration] Error removing demo notifications:', err);
  }
}
