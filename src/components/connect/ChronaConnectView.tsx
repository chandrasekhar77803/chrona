import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChrona } from '../../context/ChronaContext';
import {
  Link2,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  RefreshCw,
  Shield,
  X,
  User,
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  Check,
  AlertTriangle,
  ExternalLink,
  Layers,
  Globe,
  Settings,
  MessageSquare
} from 'lucide-react';
import { FeatureRatingBadge } from '../common/FeatureRatingBadge';
import { maskSecret } from '../../services/apiIntegrationService';
import type { IntegrationStatus } from '../../types/chrona';

export interface PlatformConfig {
  id: string;
  name: string;
  category: 'Competitive Coding' | 'Professional' | 'Developer' | 'Calendar & Email' | 'Notification Assistant';
  iconName: string;
  description: string;
  availablePermissions: string[];
  supportsGroups?: boolean;
}

export const ChronaConnectView: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    studentProfile,
    addCustomMission,
    userIntegrations,
    connectUserIntegration,
    disconnectUserIntegration,
    notifications,
    isDemoNotificationMode,
    toggleDemoNotificationMode,
    linkedInConfig,
    whatsAppConfig,
    gitHubConfig,
    hackerRankConfig,
    saveLinkedInSettings,
    saveWhatsAppSettings,
    saveGitHubSettings,
    saveHackerRankSettings,
    testLinkedIn,
    testWhatsApp,
    testGitHub,
    testHackerRank,
    disconnectProvider,
    markNotificationAsRead,
    syncIntegrationNotifications
  } = useChrona();

  const [activeTab, setActiveTab] = useState<'platforms' | 'config' | 'hub' | 'privacy'>('platforms');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncingProviderId, setSyncingProviderId] = useState<string | null>(null);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Time formatter
  const formatTimeAgo = (dateStr?: string) => {
    if (!dateStr) return 'Just now';
    try {
      const d = new Date(dateStr);
      const diffMs = Date.now() - d.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      if (diffSec < 60) return 'Just now';
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHr = Math.floor(diffMin / 60);
      if (diffHr < 24) return `${diffHr}h ago`;
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  const handleSyncPlatform = async (platformId: string) => {
    setSyncingProviderId(platformId);
    setSyncFeedback(null);
    try {
      const res = await syncIntegrationNotifications(platformId);
      setSyncFeedback(res.message);
      setTimeout(() => setSyncFeedback(null), 4000);
    } catch (err: any) {
      setSyncFeedback(err?.message || 'Sync failed');
      setTimeout(() => setSyncFeedback(null), 4000);
    } finally {
      setSyncingProviderId(null);
    }
  };

  // Permission & Account Linking Modal State
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformConfig | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [accountInput, setAccountInput] = useState<string>('');
  const [monitoredGroups, setMonitoredGroups] = useState<string[]>(['Placement Group', 'Hackathon Group']);

  // Notification Hub State
  const [selectedHubCategory, setSelectedHubCategory] = useState<string>('All');

  // Copy to clipboard helpers
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // ── LINKEDIN CONFIGURATION FORM STATE ──
  const [liClientId, setLiClientId] = useState<string>('');
  const [liClientSecret, setLiClientSecret] = useState<string>('');
  const [liRedirectUri, setLiRedirectUri] = useState<string>('');
  const [liAccessToken, setLiAccessToken] = useState<string>('');
  const [liApiVersion, setLiApiVersion] = useState<string>('202401');
  const [showLiSecret, setShowLiSecret] = useState<boolean>(false);
  const [showLiToken, setShowLiToken] = useState<boolean>(false);
  const [isTestingLinkedIn, setIsTestingLinkedIn] = useState<boolean>(false);
  const [isSavingLinkedIn, setIsSavingLinkedIn] = useState<boolean>(false);
  const [liFeedback, setLiFeedback] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // ── WHATSAPP CONFIGURATION FORM STATE ──
  const [waAppId, setWaAppId] = useState<string>('');
  const [waAppSecret, setWaAppSecret] = useState<string>('');
  const [waBusinessAccountId, setWaBusinessAccountId] = useState<string>('');
  const [waPhoneNumberId, setWaPhoneNumberId] = useState<string>('');
  const [waAccessToken, setWaAccessToken] = useState<string>('');
  const [waWebhookVerifyToken, setWaWebhookVerifyToken] = useState<string>('');
  const [waWebhookUrl, setWaWebhookUrl] = useState<string>('');
  const [showWaSecret, setShowWaSecret] = useState<boolean>(false);
  const [showWaToken, setShowWaToken] = useState<boolean>(false);
  const [showWaVerifyToken, setShowWaVerifyToken] = useState<boolean>(false);
  const [isTestingWhatsApp, setIsTestingWhatsApp] = useState<boolean>(false);
  const [isSavingWhatsApp, setIsSavingWhatsApp] = useState<boolean>(false);
  const [waFeedback, setWaFeedback] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // ── GITHUB CONFIGURATION FORM STATE ──
  const [ghToken, setGhToken] = useState<string>('');
  const [ghUsername, setGhUsername] = useState<string>('');
  const [showGhToken, setShowGhToken] = useState<boolean>(false);
  const [isTestingGitHub, setIsTestingGitHub] = useState<boolean>(false);
  const [isSavingGitHub, setIsSavingGitHub] = useState<boolean>(false);
  const [ghFeedback, setGhFeedback] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // ── HACKERRANK CONFIGURATION FORM STATE ──
  const [hrUsername, setHrUsername] = useState<string>('');
  const [isTestingHackerRank, setIsTestingHackerRank] = useState<boolean>(false);
  const [isSavingHackerRank, setIsSavingHackerRank] = useState<boolean>(false);
  const [hrFeedback, setHrFeedback] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Sync state from context configs
  useEffect(() => {
    if (linkedInConfig) {
      setLiClientId(linkedInConfig.clientId || '');
      setLiClientSecret(linkedInConfig.clientSecret || '');
      setLiRedirectUri(linkedInConfig.redirectUri || `${window.location.origin}/auth/linkedin/callback`);
      setLiAccessToken(linkedInConfig.accessToken || '');
      setLiApiVersion(linkedInConfig.apiVersion || '202401');
    }
  }, [linkedInConfig]);

  useEffect(() => {
    if (whatsAppConfig) {
      setWaAppId(whatsAppConfig.appId || '');
      setWaAppSecret(whatsAppConfig.appSecret || '');
      setWaBusinessAccountId(whatsAppConfig.businessAccountId || '');
      setWaPhoneNumberId(whatsAppConfig.phoneNumberId || '');
      setWaAccessToken(whatsAppConfig.accessToken || '');
      setWaWebhookVerifyToken(whatsAppConfig.webhookVerifyToken || '');
      setWaWebhookUrl(whatsAppConfig.webhookUrl || `${window.location.origin}/api/webhooks/whatsapp`);
    }
  }, [whatsAppConfig]);

  useEffect(() => {
    if (gitHubConfig) {
      setGhToken(gitHubConfig.personalAccessToken || '');
      setGhUsername(gitHubConfig.username || '');
    }
  }, [gitHubConfig]);

  useEffect(() => {
    if (hackerRankConfig) {
      setHrUsername(hackerRankConfig.username || '');
    }
  }, [hackerRankConfig]);

  // Supported Platforms Registry
  const platformsList: PlatformConfig[] = [
    {
      id: 'linkedin',
      name: 'LinkedIn',
      category: 'Professional',
      iconName: 'Linkedin',
      description: 'Import verified skills, certifications, and experience to enhance Career GPS recommendations.',
      availablePermissions: [
        'Read Profile Skills & Endorsements',
        'Read Work Experience & Education History',
        'Read Profile Certifications',
        'Sync Career Preferences with Career GPS Engine'
      ]
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp Notification Assistant',
      category: 'Notification Assistant',
      iconName: 'MessageSquare',
      description: 'Permission-based assistant for placement & college groups. Zero access to private chats!',
      supportsGroups: true,
      availablePermissions: [
        'Monitor Selected Placement & College Notice Groups Only',
        'Extract Hackathon, Internship & Drive Announcements',
        'Strictly ZERO Access to Private Chats or Personal Messages'
      ]
    },
    {
      id: 'leetcode',
      name: 'LeetCode',
      category: 'Competitive Coding',
      iconName: 'Code2',
      description: 'Sync solved problem metrics (Easy/Medium/Hard), contest rating, and Placement Readiness Score.',
      availablePermissions: [
        'Read Solved Problem Metrics (Easy/Medium/Hard)',
        'Read Contest Rating & World Ranking',
        'Read Daily Streak & Topics Covered',
        'Sync Progress with Career GPS Placement Readiness'
      ]
    },
    {
      id: 'github',
      name: 'GitHub',
      category: 'Developer',
      iconName: 'Github',
      description: 'Synchronize repository projects, language breakdown, and contribution graph.',
      availablePermissions: [
        'Read Public Repositories & Starred Projects',
        'Read Primary Programming Languages',
        'Read Contribution Activity Graph',
        'Sync Pinned Repositories to Career GPS Portfolio'
      ]
    },
    {
      id: 'hackerrank',
      name: 'HackerRank',
      category: 'Competitive Coding',
      iconName: 'Terminal',
      description: 'Import domain stars, verified skill badges, and problem solving ranks.',
      availablePermissions: [
        'Read Domain Badges & Stars',
        'Read Verified Skills Certificates',
        'Read Problem Solving Leaderboard Rank'
      ]
    },
    {
      id: 'codechef',
      name: 'CodeChef',
      category: 'Competitive Coding',
      iconName: 'Code2',
      description: 'Sync CodeChef star rating, contest division, and competitive progress.',
      availablePermissions: [
        'Read CodeChef Star Rating (e.g. 4-Star)',
        'Read Global & Country Rank',
        'Read Solved Contest Problems'
      ]
    },
    {
      id: 'codeforces',
      name: 'Codeforces',
      category: 'Competitive Coding',
      iconName: 'Terminal',
      description: 'Import Codeforces max rating, rank title, and problem archive progress.',
      availablePermissions: [
        'Read Current & Max Rating (e.g. Specialist)',
        'Read Solved Problem Archive Count',
        'Read Contest Participation History'
      ]
    },
    {
      id: 'gmail',
      name: 'Gmail',
      category: 'Calendar & Email',
      iconName: 'Mail',
      description: 'Scan authorized interview invites, test schedules, and placement updates.',
      availablePermissions: [
        'Scan Interview Invites & Assessment Links',
        'Extract Test Deadlines to AI Calendar',
        'Strictly Ignore Personal/Private Emails'
      ]
    },
    {
      id: 'gcalendar',
      name: 'Google Calendar',
      category: 'Calendar & Email',
      iconName: 'Calendar',
      description: 'Synchronize academic deadlines, hackathon dates, and contest reminders.',
      availablePermissions: [
        'Read Academic & Exam Events',
        'Sync Chrona Master Calendar Events'
      ]
    },
    {
      id: 'outlook',
      name: 'Microsoft Outlook',
      category: 'Calendar & Email',
      iconName: 'Mail',
      description: 'Import campus drive schedules and university portal notifications.',
      availablePermissions: [
        'Read University Placement Drives',
        'Read Corporate Assessment Invites'
      ]
    },
    {
      id: 'telegram',
      name: 'Telegram Notification Assistant',
      category: 'Notification Assistant',
      iconName: 'Send',
      description: 'Monitor authorized internship & coding club channels for career opportunities.',
      supportsGroups: true,
      availablePermissions: [
        'Monitor Selected Career & Hackathon Channels',
        'Extract Event Deadlines to AI Notification Hub',
        'Strictly ZERO Access to Private Messages'
      ]
    }
  ];

  // ── SAVE & TEST ACTIONS FOR LINKEDIN ──
  const handleSaveLinkedIn = async () => {
    setIsSavingLinkedIn(true);
    setLiFeedback(null);
    try {
      const updated = await saveLinkedInSettings({
        clientId: liClientId.trim(),
        clientSecret: liClientSecret.trim(),
        redirectUri: liRedirectUri.trim(),
        accessToken: liAccessToken.trim() || undefined,
        apiVersion: liApiVersion.trim() || '202401'
      });
      setLiFeedback({
        type: 'success',
        text: `Configuration saved (${updated.status === 'CONFIGURED' ? 'Configured' : 'Saved'}).`
      });
    } catch (err: any) {
      setLiFeedback({
        type: 'error',
        text: err?.message || 'Failed to save LinkedIn configuration.'
      });
    } finally {
      setIsSavingLinkedIn(false);
    }
  };

  const handleTestLinkedIn = async () => {
    setIsTestingLinkedIn(true);
    setLiFeedback(null);
    try {
      const result = await testLinkedIn({
        clientId: liClientId.trim(),
        clientSecret: liClientSecret.trim(),
        redirectUri: liRedirectUri.trim(),
        accessToken: liAccessToken.trim() || undefined,
        apiVersion: liApiVersion.trim() || '202401',
        status: linkedInConfig.status
      });

      if (result.success) {
        setLiFeedback({ type: 'success', text: `✅ ${result.message}` });
      } else {
        setLiFeedback({ type: 'error', text: `❌ ${result.message}` });
      }
    } catch (err: any) {
      setLiFeedback({
        type: 'error',
        text: 'Connection failed — please verify your credentials.'
      });
    } finally {
      setIsTestingLinkedIn(false);
    }
  };

  const handleDisconnectLinkedIn = async () => {
    await saveLinkedInSettings({
      status: 'DISCONNECTED',
      accessToken: undefined,
      errorMessage: undefined
    });
    setLiFeedback({ type: 'info', text: 'LinkedIn integration disconnected.' });
  };

  // ── SAVE & TEST ACTIONS FOR WHATSAPP ──
  const handleSaveWhatsApp = async () => {
    setIsSavingWhatsApp(true);
    setWaFeedback(null);
    try {
      const updated = await saveWhatsAppSettings({
        appId: waAppId.trim(),
        appSecret: waAppSecret.trim(),
        businessAccountId: waBusinessAccountId.trim(),
        phoneNumberId: waPhoneNumberId.trim(),
        accessToken: waAccessToken.trim(),
        webhookVerifyToken: waWebhookVerifyToken.trim(),
        webhookUrl: waWebhookUrl.trim()
      });
      setWaFeedback({
        type: 'success',
        text: `Configuration saved (${updated.status === 'CONFIGURED' ? 'Configured' : 'Saved'}).`
      });
    } catch (err: any) {
      setWaFeedback({
        type: 'error',
        text: err?.message || 'Failed to save WhatsApp configuration.'
      });
    } finally {
      setIsSavingWhatsApp(false);
    }
  };

  const handleTestWhatsApp = async () => {
    setIsTestingWhatsApp(true);
    setWaFeedback(null);
    try {
      const result = await testWhatsApp({
        appId: waAppId.trim(),
        appSecret: waAppSecret.trim(),
        businessAccountId: waBusinessAccountId.trim(),
        phoneNumberId: waPhoneNumberId.trim(),
        accessToken: waAccessToken.trim(),
        webhookVerifyToken: waWebhookVerifyToken.trim(),
        webhookUrl: waWebhookUrl.trim(),
        status: whatsAppConfig.status
      });

      if (result.success) {
        setWaFeedback({ type: 'success', text: `✅ ${result.message}` });
      } else {
        setWaFeedback({ type: 'error', text: `❌ ${result.message}` });
      }
    } catch (err: any) {
      setWaFeedback({
        type: 'error',
        text: 'Connection failed — please verify your credentials.'
      });
    } finally {
      setIsTestingWhatsApp(false);
    }
  };

  const handleDisconnectWhatsApp = async () => {
    await saveWhatsAppSettings({
      status: 'DISCONNECTED',
      accessToken: '',
      errorMessage: undefined
    });
    setWaFeedback({ type: 'info', text: 'WhatsApp integration disconnected.' });
  };

  // ── SAVE & TEST ACTIONS FOR GITHUB ──
  const handleSaveGitHub = async () => {
    setIsSavingGitHub(true);
    setGhFeedback(null);
    try {
      const updated = await saveGitHubSettings({
        personalAccessToken: ghToken.trim(),
        username: ghUsername.trim()
      });
      setGhFeedback({
        type: 'success',
        text: `GitHub configuration saved (${updated.status === 'CONFIGURED' ? 'Configured' : 'Saved'}).`
      });
    } catch (err: any) {
      setGhFeedback({
        type: 'error',
        text: err?.message || 'Failed to save GitHub configuration.'
      });
    } finally {
      setIsSavingGitHub(false);
    }
  };

  const handleTestGitHub = async () => {
    setIsTestingGitHub(true);
    setGhFeedback(null);
    try {
      const token = ghToken.trim().replace(/^["']|["']$/g, '');
      const user = ghUsername.trim();

      if (!token && !user) {
        setGhFeedback({ type: 'error', text: 'Please enter your GitHub Personal Access Token or GitHub Username.' });
        setIsTestingGitHub(false);
        return;
      }

      const result = await testGitHub({
        personalAccessToken: token,
        username: user,
        status: gitHubConfig.status
      });

      if (result.success) {
        setGhFeedback({ type: 'success', text: `✅ ${result.message}` });
        if (result.details?.login) {
          setGhUsername(result.details.login);
        }
      } else {
        setGhFeedback({ type: 'error', text: `❌ ${result.message}` });
      }
    } catch (err: any) {
      console.error('[ChronaConnect] GitHub Test Error:', err);
      setGhFeedback({
        type: 'error',
        text: `Connection failed: ${err?.message || 'Please check your GitHub token or network connection.'}`
      });
    } finally {
      setIsTestingGitHub(false);
    }
  };

  const handleDisconnectGitHub = async () => {
    await disconnectProvider('github');
    setGhToken('');
    setGhFeedback({ type: 'info', text: 'GitHub integration disconnected.' });
  };

  // ── SAVE & TEST ACTIONS FOR HACKERRANK ──
  const handleSaveHackerRank = async () => {
    setIsSavingHackerRank(true);
    setHrFeedback(null);
    try {
      const updated = await saveHackerRankSettings({
        username: hrUsername.trim()
      });
      setHrFeedback({
        type: 'success',
        text: `HackerRank configuration saved (${updated.status === 'CONNECTED' ? 'Connected' : updated.status === 'CONFIGURED' ? 'Configured' : 'Saved'}).`
      });
    } catch (err: any) {
      setHrFeedback({
        type: 'error',
        text: err?.message || 'Failed to save HackerRank configuration.'
      });
    } finally {
      setIsSavingHackerRank(false);
    }
  };

  const handleTestHackerRank = async () => {
    setIsTestingHackerRank(true);
    setHrFeedback(null);
    try {
      const user = hrUsername.trim().replace(/^@/, '');

      if (!user) {
        setHrFeedback({ type: 'error', text: 'Please enter your HackerRank Username.' });
        setIsTestingHackerRank(false);
        return;
      }

      const result = await testHackerRank({
        username: user,
        status: hackerRankConfig.status
      });

      if (result.success) {
        setHrFeedback({ type: 'success', text: `✅ ${result.message}` });
        if (result.details?.username) {
          setHrUsername(result.details.username);
        }
      } else {
        setHrFeedback({ type: 'error', text: `❌ ${result.message}` });
      }
    } catch (err: any) {
      console.error('[ChronaConnect] HackerRank Test Error:', err);
      setHrFeedback({
        type: 'error',
        text: `Connection failed: ${err?.message || 'Please check your HackerRank username or connection.'}`
      });
    } finally {
      setIsTestingHackerRank(false);
    }
  };

  const handleDisconnectHackerRank = async () => {
    await disconnectProvider('hackerrank');
    setHrUsername('');
    setHrFeedback({ type: 'info', text: 'HackerRank integration disconnected.' });
  };

  // Status Badge Renderer
  const renderStatusBadge = (status?: IntegrationStatus | 'connected' | 'disconnected' | string) => {
    switch (status) {
      case 'CONNECTED':
      case 'SYNCED':
      case 'connected':
        return (
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-xs font-mono font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            CONNECTED
          </span>
        );
      case 'CONFIGURED':
        return (
          <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-400 text-indigo-300 text-xs font-mono font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            CONFIGURED
          </span>
        );
      case 'CONNECTING':
      case 'SYNCING':
        return (
          <span className="px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 text-xs font-mono font-bold flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            TESTING...
          </span>
        );
      case 'SYNC_ERROR':
        return (
          <span className="px-2.5 py-1 rounded-full bg-rose-500/20 border border-rose-500 text-rose-300 text-xs font-mono font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            CONNECTION ERROR
          </span>
        );
      case 'DISCONNECTED':
        return (
          <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-xs font-mono font-bold">
            DISCONNECTED
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full bg-slate-900 text-slate-400 border border-slate-800 text-xs font-mono font-bold">
            NOT CONFIGURED
          </span>
        );
    }
  };

  // Open Permission Modal
  const openPermissionModal = (platform: PlatformConfig) => {
    if (platform.id === 'linkedin' || platform.id === 'whatsapp' || platform.id === 'github' || platform.id === 'hackerrank') {
      setActiveTab('config');
      return;
    }

    setSelectedPlatform(platform);
    setSelectedPermissions([...platform.availablePermissions]);
    
    const existingRec = userIntegrations[platform.id];
    if (existingRec && existingRec.accountIdentifier) {
      setAccountInput(existingRec.accountIdentifier);
    } else if (platform.id === 'leetcode') {
      setAccountInput(studentProfile.leetcodeUsername || 'lee215');
    } else {
      setAccountInput((studentProfile.name || 'alex').toLowerCase().replace(/\s+/g, '_'));
    }
  };

  const togglePermission = (perm: string) => {
    setSelectedPermissions(prev =>
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
    );
  };

  const handleConnectPlatform = async () => {
    if (!selectedPlatform || !currentUser) return;
    if (!accountInput.trim()) return;

    setIsSyncing(true);
    await connectUserIntegration(
      selectedPlatform.id,
      accountInput.trim(),
      selectedPermissions
    );
    setIsSyncing(false);
    setSelectedPlatform(null);
  };

  const handleDisconnect = async (platformId: string) => {
    if (!currentUser) return;
    await disconnectUserIntegration(platformId);
  };

  const handlePushToTodayMission = (taskTitle: string) => {
    addCustomMission(
      taskTitle,
      'Chrona Connect',
      60,
      'Critical',
      `Auto-suggested from Chrona Connect opportunity notification`
    );
  };

  const connectedCount = Object.values(userIntegrations).filter(rec => rec.status === 'connected').length +
    (linkedInConfig.status === 'CONNECTED' ? 1 : 0) +
    (whatsAppConfig.status === 'CONNECTED' ? 1 : 0) +
    (gitHubConfig.status === 'CONNECTED' ? 1 : 0) +
    (hackerRankConfig.status === 'CONNECTED' ? 1 : 0);

  const filteredNotifications = notifications.filter(n => {
    if (selectedHubCategory === 'All') return true;
    if (selectedHubCategory === 'HackerRank') return n.source.toLowerCase().includes('hackerrank');
    if (selectedHubCategory === 'GitHub') return n.source.toLowerCase().includes('github');
    if (selectedHubCategory === 'LinkedIn') return n.source.toLowerCase().includes('linkedin');
    if (selectedHubCategory === 'WhatsApp') return n.source.toLowerCase().includes('whatsapp');
    if (selectedHubCategory === 'High Priority') return n.priority === 'HIGH';
    if (selectedHubCategory === 'Unread') return !n.read;
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* HEADER BAR */}
      <div className="glass-panel p-6 rounded-3xl border border-indigo-500/20 bg-slate-950/80 space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs font-semibold mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>LIVE API CONFIGURATION & UNIFIED NOTIFICATION ENGINE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span>🌐 Chrona Connect: Ecosystem Integration</span>
              <FeatureRatingBadge featureId="chrona-connect" variant="standard" />
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Securely connect LinkedIn OAuth, Meta WhatsApp Cloud API, and competitive platforms to stream real-time career opportunities.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveTab('platforms')}
              className={`px-4 py-2 rounded-xl text-xs font-bold font-mono cursor-pointer transition-all ${
                activeTab === 'platforms' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              🔗 Platforms ({connectedCount})
            </button>

            <button
              onClick={() => setActiveTab('config')}
              className={`px-4 py-2 rounded-xl text-xs font-bold font-mono cursor-pointer transition-all flex items-center gap-1.5 ${
                activeTab === 'config' ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-md shadow-sky-600/30' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Integration Configuration</span>
            </button>

            <button
              onClick={() => setActiveTab('hub')}
              className={`px-4 py-2 rounded-xl text-xs font-bold font-mono cursor-pointer transition-all ${
                activeTab === 'hub' ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              🔔 Opportunity Hub ({notifications.length})
            </button>

            <button
              onClick={() => setActiveTab('privacy')}
              className={`px-4 py-2 rounded-xl text-xs font-bold font-mono cursor-pointer transition-all ${
                activeTab === 'privacy' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              🛡️ Security & Privacy
            </button>
          </div>
        </div>
      </div>

      {/* PRIVACY & USER CONTEXT BAR */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs font-mono text-slate-300">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>Chrona User Scoped Isolation: <strong className="text-indigo-300">{currentUser?.id || 'Guest'}</strong></span>
        </div>
        <div className="flex items-center gap-2">
          {isDemoNotificationMode && (
            <span className="text-[10px] text-purple-300 font-bold px-2 py-0.5 rounded-full bg-purple-950/80 border border-purple-500/40">
              DEMO NOTIFICATIONS ACTIVE
            </span>
          )}
          <span className="text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30">
            PER-USER SECURE FIRESTORE ✓
          </span>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* TAB 1: PLATFORMS OVERVIEW                                            */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'platforms' && (
        <div className="space-y-6">
          {syncFeedback && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-xs font-mono font-bold flex items-center gap-2 animate-fadeIn shadow-md shadow-emerald-950/30">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{syncFeedback}</span>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {platformsList.map(platform => {
              const isConfiguredProvider = platform.id === 'linkedin' || platform.id === 'whatsapp' || platform.id === 'github' || platform.id === 'hackerrank';
              const configStatus = platform.id === 'linkedin' ? linkedInConfig.status
                : platform.id === 'whatsapp' ? whatsAppConfig.status
                : platform.id === 'github' ? gitHubConfig.status
                : platform.id === 'hackerrank' ? hackerRankConfig.status
                : userIntegrations[platform.id]?.status;

              const isConnected = configStatus === 'CONNECTED' || configStatus === 'connected';

              return (
                <div
                  key={platform.id}
                  className={`p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-4 ${
                    isConnected
                      ? 'bg-slate-900/90 border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                          {platform.id === 'whatsapp' ? <MessageSquare className="w-5 h-5 text-emerald-400" /> : <Link2 className="w-5 h-5" />}
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-sm">{platform.name}</h3>
                          <span className="text-[10px] font-mono text-slate-400">{platform.category}</span>
                        </div>
                      </div>

                      {renderStatusBadge(configStatus || 'NOT_CONFIGURED')}
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {platform.description}
                    </p>

                    {/* METADATA PREVIEW */}
                    {isConfiguredProvider ? (
                      <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800/80 text-[10px] font-mono text-slate-400 flex items-center justify-between">
                        <span>API Security:</span>
                        <span className="text-emerald-400 font-bold">Zero-Plaintext Storage</span>
                      </div>
                    ) : isConnected && (
                      <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800/80 text-[10px] font-mono text-slate-400 flex items-center justify-between">
                        <span>Sync Status:</span>
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>{userIntegrations[platform.id]?.lastSyncAt ? `Synced (${formatTimeAgo(userIntegrations[platform.id]?.lastSyncAt)})` : 'Notifications Synced'}</span>
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    {isConfiguredProvider ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setActiveTab('config')}
                          className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-mono font-bold cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-sky-600/20"
                        >
                          <Settings className="w-3.5 h-3.5" />
                          <span>Configure API</span>
                        </button>
                      </div>
                    ) : isConnected ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSyncPlatform(platform.id)}
                          disabled={syncingProviderId === platform.id}
                          className="p-2.5 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-500/40 text-indigo-300 hover:text-white cursor-pointer transition-colors"
                          title="Sync Notifications Now"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${syncingProviderId === platform.id ? 'animate-spin text-indigo-400' : ''}`} />
                        </button>
                        <button
                          onClick={() => openPermissionModal(platform)}
                          className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold cursor-pointer"
                        >
                          Permissions
                        </button>
                        <button
                          onClick={() => handleDisconnect(platform.id)}
                          className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800 text-rose-400 cursor-pointer"
                          title="Disconnect Platform"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => openPermissionModal(platform)}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-mono text-xs font-bold cursor-pointer shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2"
                      >
                        <Link2 className="w-3.5 h-3.5" />
                        <span>Connect {platform.name}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* TAB 2: INTEGRATION CONFIGURATION (LINKEDIN & WHATSAPP)                 */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'config' && (
        <div className="space-y-6 animate-fadeIn">
          {/* NOTICE BANNER */}
          <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 flex items-start gap-3 text-xs">
            <KeyRound className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-white font-mono">Secure Integration Layer & Placeholders</h4>
              <p className="text-slate-300">
                Enter your LinkedIn OAuth, Meta WhatsApp Cloud API, GitHub PAT, or HackerRank username below. Credentials and tokens are securely isolated in your private Firestore record.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ──────────────────────────────────────────────────────────── */}
            {/* CARD A: LINKEDIN CONFIGURATION                               */}
            {/* ──────────────────────────────────────────────────────────── */}
            <div className="glass-panel p-6 rounded-3xl border border-sky-500/30 bg-slate-950/90 space-y-5 flex flex-col justify-between shadow-xl">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-sky-950/70 border border-sky-500/40 flex items-center justify-center text-sky-400 font-black">
                      in
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-white">LinkedIn API Configuration</h3>
                      <span className="text-[11px] font-mono text-slate-400">OAuth 2.0 & Member Profile Sync</span>
                    </div>
                  </div>

                  {renderStatusBadge(linkedInConfig.status)}
                </div>

                {/* Feedback Message */}
                {liFeedback && (
                  <div
                    className={`p-3 rounded-2xl text-xs font-mono flex items-center gap-2 ${
                      liFeedback.type === 'success'
                        ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
                        : liFeedback.type === 'error'
                        ? 'bg-rose-950/60 border border-rose-500/40 text-rose-300'
                        : 'bg-indigo-950/60 border border-indigo-500/40 text-indigo-300'
                    }`}
                  >
                    <span>{liFeedback.text}</span>
                  </div>
                )}

                {/* Field 1: Client ID */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-mono text-slate-300 font-bold">Client ID</label>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950/80 text-rose-300 border border-rose-500/30">
                      Required
                    </span>
                  </div>
                  <input
                    type="text"
                    value={liClientId}
                    onChange={e => setLiClientId(e.target.value)}
                    placeholder="e.g. 78xxxxxxxxxxxx"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-sky-400 text-white font-mono text-xs focus:outline-none transition-colors"
                  />
                </div>

                {/* Field 2: Client Secret */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-mono text-slate-300 font-bold">Client Secret</label>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950/80 text-rose-300 border border-rose-500/30">
                      Required
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type={showLiSecret ? 'text' : 'password'}
                      value={liClientSecret}
                      onChange={e => setLiClientSecret(e.target.value)}
                      placeholder={linkedInConfig.clientSecret ? maskSecret(linkedInConfig.clientSecret) : 'Enter Client Secret'}
                      className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-sky-400 text-white font-mono text-xs focus:outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLiSecret(!showLiSecret)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-white cursor-pointer"
                    >
                      {showLiSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Field 3: Redirect URI (Callback) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-mono text-slate-300 font-bold">Authorized Redirect URI</label>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-950/80 text-indigo-300 border border-indigo-500/30">
                      Generated / Callback
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={liRedirectUri}
                      readOnly
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300 font-mono text-xs focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => copyToClipboard(liRedirectUri, 'li_uri')}
                      className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors cursor-pointer"
                      title="Copy Redirect URI"
                    >
                      {copiedField === 'li_uri' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Field 4: Access Token / OAuth (Optional) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-mono text-slate-300 font-bold">Access Token / Bearer Token</label>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700">
                      Optional
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type={showLiToken ? 'text' : 'password'}
                      value={liAccessToken}
                      onChange={e => setLiAccessToken(e.target.value)}
                      placeholder={linkedInConfig.accessToken ? maskSecret(linkedInConfig.accessToken) : 'OAuth Bearer Token (optional override)'}
                      className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-sky-400 text-white font-mono text-xs focus:outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLiToken(!showLiToken)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-white cursor-pointer"
                    >
                      {showLiToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Field 5: API Version */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-mono text-slate-300 font-bold">API Version</label>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700">
                      Optional
                    </span>
                  </div>
                  <input
                    type="text"
                    value={liApiVersion}
                    onChange={e => setLiApiVersion(e.target.value)}
                    placeholder="202401"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-sky-400 text-white font-mono text-xs focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-800/80 space-y-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSaveLinkedIn}
                    disabled={isSavingLinkedIn}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-bold cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                  >
                    {isSavingLinkedIn ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    <span>Save Configuration</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleTestLinkedIn}
                    disabled={isTestingLinkedIn}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-mono text-xs font-bold cursor-pointer transition-all shadow-md shadow-sky-500/20 flex items-center justify-center gap-1.5"
                  >
                    {isTestingLinkedIn ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5" />}
                    <span>Test Connection</span>
                  </button>
                </div>

                {linkedInConfig.status === 'CONNECTED' && (
                  <button
                    type="button"
                    onClick={handleDisconnectLinkedIn}
                    className="w-full py-2 rounded-xl bg-rose-950/30 hover:bg-rose-950/60 border border-rose-800/60 text-rose-400 text-xs font-mono font-bold cursor-pointer transition-colors"
                  >
                    Disconnect LinkedIn
                  </button>
                )}
              </div>
            </div>

            {/* ──────────────────────────────────────────────────────────── */}
            {/* CARD B: WHATSAPP CLOUD API CONFIGURATION                     */}
            {/* ──────────────────────────────────────────────────────────── */}
            <div className="glass-panel p-6 rounded-3xl border border-emerald-500/30 bg-slate-950/90 space-y-5 flex flex-col justify-between shadow-xl">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-black">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-white">WhatsApp Cloud API (Meta)</h3>
                      <span className="text-[11px] font-mono text-slate-400">Business Platform & Placement Webhooks</span>
                    </div>
                  </div>

                  {renderStatusBadge(whatsAppConfig.status)}
                </div>

                {/* Feedback Message */}
                {waFeedback && (
                  <div
                    className={`p-3 rounded-2xl text-xs font-mono flex items-center gap-2 ${
                      waFeedback.type === 'success'
                        ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
                        : waFeedback.type === 'error'
                        ? 'bg-rose-950/60 border border-rose-500/40 text-rose-300'
                        : 'bg-indigo-950/60 border border-indigo-500/40 text-indigo-300'
                    }`}
                  >
                    <span>{waFeedback.text}</span>
                  </div>
                )}

                {/* Field 1: Phone Number ID */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-mono text-slate-300 font-bold">Phone Number ID</label>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950/80 text-rose-300 border border-rose-500/30">
                      Required
                    </span>
                  </div>
                  <input
                    type="text"
                    value={waPhoneNumberId}
                    onChange={e => setWaPhoneNumberId(e.target.value)}
                    placeholder="e.g. 104928374928374"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-emerald-400 text-white font-mono text-xs focus:outline-none transition-colors"
                  />
                </div>

                {/* Field 2: Permanent Access Token */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-mono text-slate-300 font-bold">Access Token (System User / User Token)</label>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950/80 text-rose-300 border border-rose-500/30">
                      Required
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type={showWaToken ? 'text' : 'password'}
                      value={waAccessToken}
                      onChange={e => setWaAccessToken(e.target.value)}
                      placeholder={whatsAppConfig.accessToken ? maskSecret(whatsAppConfig.accessToken) : 'Enter Meta Graph API Token (EAAG...)'}
                      className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-emerald-400 text-white font-mono text-xs focus:outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowWaToken(!showWaToken)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-white cursor-pointer"
                    >
                      {showWaToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Field 3: WhatsApp Business Account ID */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-mono text-slate-300 font-bold">Business Account ID (WABA)</label>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700">
                      Optional
                    </span>
                  </div>
                  <input
                    type="text"
                    value={waBusinessAccountId}
                    onChange={e => setWaBusinessAccountId(e.target.value)}
                    placeholder="e.g. 192837465019283"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-emerald-400 text-white font-mono text-xs focus:outline-none transition-colors"
                  />
                </div>

                {/* Field 4: Meta App ID & App Secret */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-mono text-slate-300 font-bold">Meta App ID</label>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono text-slate-400 bg-slate-800">
                        Optional
                      </span>
                    </div>
                    <input
                      type="text"
                      value={waAppId}
                      onChange={e => setWaAppId(e.target.value)}
                      placeholder="e.g. 849201948201"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 focus:border-emerald-400 text-white font-mono text-xs focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-mono text-slate-300 font-bold">App Secret</label>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono text-slate-400 bg-slate-800">
                        Optional
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type={showWaSecret ? 'text' : 'password'}
                        value={waAppSecret}
                        onChange={e => setWaAppSecret(e.target.value)}
                        placeholder="App Secret"
                        className="w-full pl-3 pr-8 py-2 rounded-xl bg-slate-900 border border-slate-800 focus:border-emerald-400 text-white font-mono text-xs focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowWaSecret(!showWaSecret)}
                        className="absolute right-2 top-2 text-slate-400 hover:text-white cursor-pointer"
                      >
                        {showWaSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Field 5: Webhook Callback URL & Verify Token */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-mono text-slate-300 font-bold">Webhook Callback URL</label>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-950/80 text-indigo-300 border border-indigo-500/30">
                      Generated / Callback
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={waWebhookUrl}
                      readOnly
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300 font-mono text-xs focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => copyToClipboard(waWebhookUrl, 'wa_url')}
                      className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors cursor-pointer"
                      title="Copy Webhook URL"
                    >
                      {copiedField === 'wa_url' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-mono text-slate-300 font-bold">Webhook Verify Token</label>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700">
                      Optional
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type={showWaVerifyToken ? 'text' : 'password'}
                      value={waWebhookVerifyToken}
                      onChange={e => setWaWebhookVerifyToken(e.target.value)}
                      placeholder="e.g. chrona_verify_token_2026"
                      className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-emerald-400 text-white font-mono text-xs focus:outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowWaVerifyToken(!showWaVerifyToken)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-white cursor-pointer"
                    >
                      {showWaVerifyToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-800/80 space-y-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSaveWhatsApp}
                    disabled={isSavingWhatsApp}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-bold cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                  >
                    {isSavingWhatsApp ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    <span>Save Configuration</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleTestWhatsApp}
                    disabled={isTestingWhatsApp}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono text-xs font-bold cursor-pointer transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5"
                  >
                    {isTestingWhatsApp ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5" />}
                    <span>Test Connection</span>
                  </button>
                </div>

                {whatsAppConfig.status === 'CONNECTED' && (
                  <button
                    type="button"
                    onClick={handleDisconnectWhatsApp}
                    className="w-full py-2 rounded-xl bg-rose-950/30 hover:bg-rose-950/60 border border-rose-800/60 text-rose-400 text-xs font-mono font-bold cursor-pointer transition-colors"
                  >
                    Disconnect WhatsApp
                  </button>
                )}
              </div>
            </div>

            {/* ──────────────────────────────────────────────────────────── */}
            {/* CARD C: GITHUB DEVELOPER & PAT CONFIGURATION                 */}
            {/* ──────────────────────────────────────────────────────────── */}
            <div className="glass-panel p-6 rounded-3xl border border-purple-500/30 bg-slate-950/90 space-y-5 flex flex-col justify-between shadow-xl">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-purple-950/70 border border-purple-500/40 flex items-center justify-center text-purple-300 font-bold">
                      <Link2 className="w-5 h-5 text-purple-300" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-white">GitHub API & PAT</h3>
                      <span className="text-[11px] font-mono text-slate-400">Personal Access Token & Repo Sync</span>
                    </div>
                  </div>

                  {renderStatusBadge(gitHubConfig.status)}
                </div>

                {/* Feedback Message */}
                {ghFeedback && (
                  <div
                    className={`p-3 rounded-2xl text-xs font-mono flex items-center gap-2 ${
                      ghFeedback.type === 'success'
                        ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
                        : ghFeedback.type === 'error'
                        ? 'bg-rose-950/60 border border-rose-500/40 text-rose-300'
                        : 'bg-indigo-950/60 border border-indigo-500/40 text-indigo-300'
                    }`}
                  >
                    <span>{ghFeedback.text}</span>
                  </div>
                )}

                {/* Field 1: GitHub Personal Access Token */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-mono text-slate-300 font-bold">Personal Access Token (PAT)</label>
                    <a
                      href="https://github.com/settings/tokens"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-mono text-indigo-400 hover:text-indigo-300 underline flex items-center gap-1"
                    >
                      <span>Generate Token</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      type={showGhToken ? 'text' : 'password'}
                      value={ghToken}
                      onChange={e => setGhToken(e.target.value)}
                      placeholder={gitHubConfig.personalAccessToken ? maskSecret(gitHubConfig.personalAccessToken) : 'github_pat_... or ghp_...'}
                      className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-purple-400 text-white font-mono text-xs focus:outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowGhToken(!showGhToken)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-white cursor-pointer"
                    >
                      {showGhToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] font-mono text-slate-400">
                    Required Scopes: <code className="text-purple-300">read:user</code>, <code className="text-purple-300">repo</code> (or public repo access).
                  </p>
                </div>

                {/* Field 2: GitHub Username */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-mono text-slate-300 font-bold">GitHub Username (Optional / Auto-detected)</label>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700">
                      Auto-detected
                    </span>
                  </div>
                  <input
                    type="text"
                    value={ghUsername}
                    onChange={e => setGhUsername(e.target.value)}
                    placeholder="e.g. chandrasekharveerla71-cell"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-purple-400 text-white font-mono text-xs focus:outline-none transition-colors"
                  />
                </div>

                {/* Synced Stats Preview Card if Connected */}
                {gitHubConfig.status === 'CONNECTED' && gitHubConfig.username && (
                  <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-purple-500/30 space-y-2.5">
                    <div className="flex items-center gap-3">
                      {gitHubConfig.avatarUrl ? (
                        <img
                          src={gitHubConfig.avatarUrl}
                          alt={gitHubConfig.username}
                          className="w-9 h-9 rounded-full border border-purple-400"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-purple-600/30 flex items-center justify-center font-bold text-white text-xs">
                          GH
                        </div>
                      )}
                      <div>
                        <span className="text-xs font-bold text-white block">{gitHubConfig.profileName || gitHubConfig.username}</span>
                        <a
                          href={`https://github.com/${gitHubConfig.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-mono text-purple-400 hover:underline flex items-center gap-1"
                        >
                          <span>@{gitHubConfig.username}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-mono pt-1">
                      <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">Repos</span>
                        <span className="font-bold text-white">{gitHubConfig.publicReposCount || 0}</span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">Stars</span>
                        <span className="font-bold text-amber-400">★ {gitHubConfig.totalStars || 0}</span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">Followers</span>
                        <span className="font-bold text-emerald-400">{gitHubConfig.followersCount || 0}</span>
                      </div>
                    </div>

                    {gitHubConfig.topLanguages && gitHubConfig.topLanguages.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {gitHubConfig.topLanguages.slice(0, 4).map((l, lIdx) => (
                          <span
                            key={lIdx}
                            className="px-2 py-0.5 rounded-full bg-purple-950/80 border border-purple-500/30 text-[10px] font-mono text-purple-300 font-bold"
                          >
                            {l.language} ({l.percentage}%)
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-800/80 space-y-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSaveGitHub}
                    disabled={isSavingGitHub}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-bold cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                  >
                    {isSavingGitHub ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    <span>Save Token</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleTestGitHub}
                    disabled={isTestingGitHub || (!ghToken.trim() && !ghUsername.trim())}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono text-xs font-bold cursor-pointer transition-all shadow-md shadow-purple-500/20 flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {isTestingGitHub ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5" />}
                    <span>Test & Sync Repos</span>
                  </button>
                </div>

                {gitHubConfig.status === 'CONNECTED' && (
                  <button
                    type="button"
                    onClick={handleDisconnectGitHub}
                    className="w-full py-2 rounded-xl bg-rose-950/30 hover:bg-rose-950/60 border border-rose-800/60 text-rose-400 text-xs font-mono font-bold cursor-pointer transition-colors"
                  >
                    Disconnect GitHub
                  </button>
                )}
              </div>
            </div>

            {/* ──────────────────────────────────────────────────────────── */}
            {/* CARD D: HACKERRANK COMPETITIVE CODING & BADGES CONFIGURATION */}
            {/* ──────────────────────────────────────────────────────────── */}
            <div className="glass-panel p-6 rounded-3xl border border-emerald-500/30 bg-slate-950/90 space-y-5 flex flex-col justify-between shadow-xl">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-black text-lg">
                      H
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-white">HackerRank Configuration</h3>
                      <span className="text-[11px] font-mono text-slate-400">Domain Badges & Skill Certificates</span>
                    </div>
                  </div>

                  {renderStatusBadge(hackerRankConfig.status)}
                </div>

                {/* Feedback Message */}
                {hrFeedback && (
                  <div
                    className={`p-3 rounded-2xl text-xs font-mono flex items-center gap-2 ${
                      hrFeedback.type === 'success'
                        ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
                        : hrFeedback.type === 'error'
                        ? 'bg-rose-950/60 border border-rose-500/40 text-rose-300'
                        : 'bg-indigo-950/60 border border-indigo-500/40 text-indigo-300'
                    }`}
                  >
                    <span>{hrFeedback.text}</span>
                  </div>
                )}

                {/* Field 1: HackerRank Username */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-mono text-slate-300 font-bold">HackerRank Username</label>
                    <a
                      href="https://www.hackerrank.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-mono text-emerald-400 hover:text-emerald-300 underline flex items-center gap-1"
                    >
                      <span>HackerRank Profile</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <input
                    type="text"
                    value={hrUsername}
                    onChange={e => setHrUsername(e.target.value)}
                    placeholder="e.g. chandrasekhar_778 or alex_coder"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-emerald-400 text-white font-mono text-xs focus:outline-none transition-colors"
                  />
                  <p className="text-[10px] font-mono text-slate-400">
                    Live verification against HackerRank domain badges & certifications. Zero password needed.
                  </p>
                </div>

                {/* Synced Badges & Certificate Preview if Connected */}
                {hackerRankConfig.status === 'CONNECTED' && (
                  <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-emerald-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center font-bold text-emerald-300 text-xs">
                          ★
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block">@{hackerRankConfig.username || hrUsername}</span>
                          <span className="text-[10px] font-mono text-emerald-400">Verified HackerRank Account</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-bold">
                        +{hackerRankConfig.solvedCount || 65} Challenges Solved
                      </span>
                    </div>

                    {/* Domain Badges */}
                    {hackerRankConfig.domainBadges && hackerRankConfig.domainBadges.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] font-mono text-slate-400 block font-bold">Verified Domain Badges:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {hackerRankConfig.domainBadges.map((badge, bIdx) => (
                            <span
                              key={bIdx}
                              className="px-2.5 py-1 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-[10px] font-mono text-emerald-300 font-bold flex items-center gap-1 shadow-sm"
                            >
                              <span className="text-amber-400">{'★'.repeat(badge.stars)}</span>
                              <span>{badge.badgeName}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Skill Certificates */}
                    {hackerRankConfig.certificates && hackerRankConfig.certificates.length > 0 && (
                      <div className="space-y-1.5 pt-1 border-t border-slate-800">
                        <span className="text-[10px] font-mono text-slate-400 block font-bold">Certificates & Assessments:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {hackerRankConfig.certificates.map((cert, cIdx) => (
                            <a
                              key={cIdx}
                              href={cert.certificateUrl || `https://www.hackerrank.com/certificates`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-emerald-500/50 text-[10px] font-mono text-slate-300 hover:text-emerald-300 flex items-center gap-1 transition-colors"
                            >
                              <span>🏆 {cert.title}</span>
                              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-800/80 space-y-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSaveHackerRank}
                    disabled={isSavingHackerRank}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-bold cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                  >
                    {isSavingHackerRank ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    <span>Save Profile</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleTestHackerRank}
                    disabled={isTestingHackerRank || !hrUsername.trim()}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono text-xs font-bold cursor-pointer transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {isTestingHackerRank ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5" />}
                    <span>Test & Sync Badges</span>
                  </button>
                </div>

                {hackerRankConfig.status === 'CONNECTED' && (
                  <button
                    type="button"
                    onClick={handleDisconnectHackerRank}
                    className="w-full py-2 rounded-xl bg-rose-950/30 hover:bg-rose-950/60 border border-rose-800/60 text-rose-400 text-xs font-mono font-bold cursor-pointer transition-colors"
                  >
                    Disconnect HackerRank
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* TAB 3: OPPORTUNITY HUB (LIVE NOTIFICATIONS STREAM)                    */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'hub' && (
        <div className="space-y-4 animate-fadeIn">
          {/* TOP CONTROLS & DEMO SWITCH */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-3xl bg-slate-950/80 border border-purple-500/30">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 font-mono text-xs">
              {['All', 'High Priority', 'Unread', 'HackerRank', 'GitHub', 'LinkedIn', 'WhatsApp'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedHubCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl cursor-pointer font-bold whitespace-nowrap transition-all ${
                    selectedHubCategory === cat ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-slate-400">Demo Data:</span>
              <button
                onClick={() => toggleDemoNotificationMode(!isDemoNotificationMode)}
                className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer border transition-all ${
                  isDemoNotificationMode
                    ? 'bg-purple-600 text-white border-purple-400 shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800'
                }`}
              >
                {isDemoNotificationMode ? 'DEMO MODE ACTIVE' : 'ENABLE DEMO MODE'}
              </button>
            </div>
          </div>

          {/* NOTIFICATION CARDS */}
          {filteredNotifications.length === 0 ? (
            <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-3 bg-slate-950/60">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-white text-base">No Notifications In Selected Category</h3>
              <p className="text-xs font-mono text-slate-400 max-w-md mx-auto">
                Connect external providers in Integration Configuration or enable Demo Mode to stream sample events.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredNotifications.map(notif => {
                const isHigh = notif.priority === 'HIGH';
                const isUnread = !notif.read;

                return (
                  <div
                    key={notif.id}
                    className={`p-5 rounded-3xl glass-panel border space-y-3 flex flex-col justify-between transition-all ${
                      isHigh
                        ? 'border-rose-500/50 bg-gradient-to-br from-rose-950/20 via-slate-950/90 to-slate-950/90 shadow-lg shadow-rose-950/20'
                        : isUnread
                        ? 'border-indigo-500/40 bg-slate-950/90 shadow-md shadow-indigo-500/10'
                        : 'border-slate-800 bg-slate-950/60 opacity-85 hover:opacity-100'
                    }`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2.5 py-0.5 rounded-full bg-purple-950/80 border border-purple-400 text-purple-300 text-[10px] font-mono font-bold">
                            {notif.source}
                          </span>
                          {notif.isDemo && (
                            <span className="px-2 py-0.5 rounded bg-purple-900/60 text-purple-200 border border-purple-400/40 text-[9px] font-mono font-bold">
                              DEMO
                            </span>
                          )}
                          {isHigh && (
                            <span className="px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-500/50 text-[10px] font-mono font-bold animate-pulse">
                              HIGH PRIORITY
                            </span>
                          )}
                        </div>

                        <span className="text-[10px] font-mono text-slate-400">
                          {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <h3 className={`font-bold text-base leading-snug ${isUnread ? 'text-white' : 'text-slate-300'}`}>
                        {notif.title}
                      </h3>
                      <p className="text-xs text-slate-300 leading-relaxed">{notif.message}</p>
                    </div>

                    <div className="pt-3 flex items-center justify-between gap-3 border-t border-slate-800/80">
                      <button
                        onClick={() => markNotificationAsRead(notif.id)}
                        className={`text-[11px] font-mono font-bold cursor-pointer ${isUnread ? 'text-indigo-400 hover:text-indigo-300' : 'text-slate-500'}`}
                      >
                        {isUnread ? '✓ Mark as Read' : 'Read'}
                      </button>

                      <div className="flex items-center gap-2">
                        {notif.url && (
                          <button
                            onClick={() => window.open(notif.url, '_blank', 'noopener,noreferrer')}
                            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-mono text-xs font-bold border border-slate-800 cursor-pointer flex items-center gap-1"
                          >
                            <span>Open Link</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        )}
                        <button
                          onClick={() => handlePushToTodayMission(notif.title)}
                          className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold cursor-pointer shadow-sm shadow-indigo-600/30"
                        >
                          + Add to Mission
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* TAB 4: SECURITY & PRIVACY                                            */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'privacy' && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-emerald-500/30 bg-slate-950/90 space-y-6">
          <div className="flex items-center gap-3 text-emerald-400">
            <ShieldCheck className="w-8 h-8" />
            <div>
              <h2 className="text-xl font-bold text-white">Zero-Knowledge & Explicit Authorization Protocol</h2>
              <span className="text-xs font-mono text-slate-400">User UID Scoped Security Architecture</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <h4 className="font-bold text-white font-mono">✅ WHAT CHRONA ACCESSES</h4>
              <ul className="space-y-1.5 text-slate-300 font-mono">
                <li>• Public competitive coding metrics (Solved count, rank)</li>
                <li>• Explicitly granted profile skills and experience</li>
                <li>• Authorized placement notice board announcements</li>
                <li>• Verified phone number & authorized WhatsApp webhooks</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <h4 className="font-bold text-rose-400 font-mono">❌ WHAT CHRONA NEVER ACCESSES</h4>
              <ul className="space-y-1.5 text-slate-300 font-mono">
                <li>• Passwords or sensitive external authentication keys</li>
                <li>• Personal/private WhatsApp/Telegram chats</li>
                <li>• Personal emails or non-career private messages</li>
                <li>• Secret keys are never sent in plaintext to frontend clients</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* EXPLICIT PERMISSION & ACCOUNT LINKING MODAL (FOR LEETCODE, GITHUB, ETC.) */}
      {selectedPlatform && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-xl glass-panel p-6 sm:p-8 rounded-3xl border border-indigo-500/40 bg-slate-950/95 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Connect {selectedPlatform.name}</h3>
                  <span className="text-xs font-mono text-emerald-400">Explicit Consent & Identifier Linking</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedPlatform(null)}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* ACCOUNT IDENTIFIER INPUT */}
            <div className="space-y-1.5 text-xs">
              <label className="font-mono text-slate-300 font-bold flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-400" />
                <span>{selectedPlatform.name} Username / Account Handle:</span>
              </label>
              <input
                id="connect-account-input"
                type="text"
                value={accountInput}
                onChange={(e) => setAccountInput(e.target.value)}
                placeholder={`Enter ${selectedPlatform.name} handle (e.g. alex_vance)`}
                className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-indigo-500/40 text-white font-mono text-xs focus:outline-none focus:border-indigo-400"
              />
              <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5 pt-0.5">
                <KeyRound className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Public profile & API integration only. Zero passwords collected or required.</span>
              </p>
            </div>

            {/* PERMISSION CHECKBOXES */}
            <div className="space-y-3 text-xs">
              <span className="font-mono text-slate-400 block font-bold">
                Select permissions to grant Chrona:
              </span>

              <div className="space-y-2">
                {selectedPlatform.availablePermissions.map((perm, idx) => {
                  const isChecked = selectedPermissions.includes(perm);
                  return (
                    <div
                      key={idx}
                      onClick={() => togglePermission(perm)}
                      className={`p-3 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-indigo-950/50 border-indigo-500 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${isChecked ? 'bg-indigo-600 border-indigo-400 text-white' : 'border-slate-700'}`}>
                        {isChecked && <CheckCircle2 className="w-3 h-3" />}
                      </div>
                      <span className="font-mono font-medium">{perm}</span>
                    </div>
                  );
                })}
              </div>

              {/* GROUPS CONFIGURATION */}
              {selectedPlatform.supportsGroups && (
                <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/40 space-y-3 pt-3">
                  <span className="font-mono text-purple-300 font-bold block">
                    Monitored Groups & Categories (Explicit Choice):
                  </span>
                  <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
                    {['Placement Group', 'College Notices', 'Hackathon Group', 'Internship Group', 'Coding Club'].map(g => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => {
                          setMonitoredGroups(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);
                        }}
                        className={`px-2.5 py-1 rounded-lg border font-bold ${
                          monitoredGroups.includes(g) ? 'bg-purple-600 text-white border-purple-400' : 'bg-slate-900 text-slate-400 border-slate-800'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedPlatform(null)}
                className="flex-1 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-mono text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConnectPlatform}
                disabled={isSyncing || selectedPermissions.length === 0 || !accountInput.trim()}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs cursor-pointer shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Connecting Platform...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Grant Permission & Connect</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
