import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ChronaProvider, useChrona } from './context/ChronaContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { AuthView } from './components/auth/AuthView';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { WhyModal } from './components/common/WhyModal';
import { GlobalAssistant } from './components/assistant/GlobalAssistant';

import { GlobalSearchBar } from './components/common/GlobalSearchBar';

import { ChronaMentorView } from './components/mentor/ChronaMentorView';
import { HomeView } from './components/home/HomeView';
import { CareerGpsView } from './components/career-gps/CareerGpsView';
import { PlacementHubView } from './components/placement/PlacementHubView';
import { CareerSetupWizardPage } from './components/career-gps/CareerSetupWizardPage';
import { StudyCompanionView } from './components/study-companion/StudyCompanionView';
import { SmartNotesView } from './components/smart-notes/SmartNotesView';
import { MockInterviewsView } from './components/mock-interviews/MockInterviewsView';
import { FocusBubbleView } from './components/focus-bubble/FocusBubbleView';
import { GoalsView } from './components/goals/GoalsView';
import { CalendarView } from './components/calendar/CalendarView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { ProfileView } from './components/profile/ProfileView';
import { SettingsView } from './components/settings/SettingsView';
import { FutureModulesView } from './components/future-modules/FutureModulesView';
import { ChronaConnectView } from './components/connect/ChronaConnectView';
import { AchievementsView } from './components/achievements/AchievementsView';
import { ChronaProductTourModal } from './components/onboarding/ChronaProductTourModal';

const MainContent: React.FC = () => {
  const { activeSection, isProductTourOpen, closeProductTour, studentProfile, careerSetupCompleted } = useChrona();
  const { currentUser } = useAuth();

  const [isFirstTimeModalOpen, setIsFirstTimeModalOpen] = React.useState<boolean>(false);

  // Check first-time intro requirement
  React.useEffect(() => {
    if (currentUser) {
      const localSeen = localStorage.getItem(`chrona_intro_seen_${currentUser.id}`);
      if (!localSeen && !studentProfile?.hasSeenIntro) {
        setIsFirstTimeModalOpen(true);
      }
    }
  }, [currentUser, studentProfile]);

  const handleCloseIntro = () => {
    setIsFirstTimeModalOpen(false);
    closeProductTour();
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'home':
        return <HomeView />;
      case 'chrona-mentor':
        return <ChronaMentorView />;
      case 'achievements':
        return <AchievementsView />;
      case 'chrona-connect':
        return <ChronaConnectView />;
      case 'career-gps':
        return careerSetupCompleted ? <CareerGpsView /> : <CareerSetupWizardPage />;
      case 'placement-hub':
        return <PlacementHubView />;
      case 'study-companion':
        return <StudyCompanionView />;
      case 'smart-notes':
        return <SmartNotesView />;
      case 'mock-interviews':
        return <MockInterviewsView />;
      case 'focus-bubble':
        return <FocusBubbleView />;
      case 'goals':
        return <GoalsView />;
      case 'calendar':
        return <CalendarView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'profile':
        return <ProfileView />;
      case 'settings':
        return <SettingsView />;
      case 'future-modules':
        return <FutureModulesView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 font-sans selection:bg-indigo-500 selection:text-white relative overflow-x-hidden">
      {/* Background Glowing Orbs */}
      <div className="glow-orb-primary -top-40 -left-40" />
      <div className="glow-orb-secondary top-1/2 -right-40" />

      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Top Header Bar */}
      <Header />

      {/* Main Content Area */}
      <main className="pl-64 pt-20 pr-6 min-h-screen">
        <div className="max-w-7xl mx-auto py-6 space-y-6">
          {/* 🔍 GLOBAL SEARCH BAR (RENDERED ABOVE ALL DASHBOARD CONTENT) */}
          <GlobalSearchBar />

          {/* DYNAMIC DASHBOARD CONTENT */}
          {renderSection()}
        </div>
      </main>

      {/* Universal Explainability Modal */}
      <WhyModal />

      {/* Global Floating AI Assistant */}
      <GlobalAssistant />

      {/* First-Time Welcome & Cinematic Product Tour Modal */}
      <ChronaProductTourModal
        isOpen={isFirstTimeModalOpen || isProductTourOpen}
        onClose={handleCloseIntro}
        autoLaunchTour={isProductTourOpen}
      />
    </div>
  );
};

const AuthenticatedApp: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <AuthView />;
  }

  return (
    <ChronaProvider>
      <MainContent />
    </ChronaProvider>
  );
};

export function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AuthenticatedApp />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
