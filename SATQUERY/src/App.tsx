import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HeroSection } from './components/home/HeroSection';
import { WorkflowShowcase } from './components/home/WorkflowShowcase';
import { DomainCards } from './components/home/DomainCards';
import { QuickLaunch } from './components/home/QuickLaunch';
import { SingleImageAnalysis } from './components/analysis/SingleImageAnalysis';
import { TimeLens } from './components/timelens/TimeLens';
import { FusionCore } from './components/fusion/FusionCore';
import { CompareLab } from './components/compare/CompareLab';
import { EarthExplorer } from './components/explorer/EarthExplorer';
import { SatelliteCatalog } from './components/catalog/SatelliteCatalog';
import { KnowledgeAssistant } from './components/catalog/KnowledgeAssistant';
import { GeoWatch } from './components/geowatch/GeoWatch';
import { ReportGenerator } from './components/reports/ReportGenerator';
import { MissionHistory } from './components/history/MissionHistory';

import { Mission, DomainCategory, GeoWatchTask } from './types/mission';
import { DEMO_MISSIONS } from './data/demoMissions';
import { MissionEngineService } from './services/missionEngine';
import { StorageService } from './services/storageService';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [activeMission, setActiveMission] = useState<Mission>(DEMO_MISSIONS['demo-urban-expansion']);
  const [missionsHistory, setMissionsHistory] = useState<Mission[]>([]);
  const [isExecutingMission, setIsExecutingMission] = useState(false);

  // Initialize mission history
  useEffect(() => {
    const history = StorageService.getMissionsHistory();
    setMissionsHistory(history);
  }, []);

  // Launch a new mission from text query
  const handleStartMission = async (query: string, customImage?: string) => {
    setIsExecutingMission(true);
    const newMission = MissionEngineService.planMission(query, customImage);
    setActiveMission(newMission);
    setActiveTab('mission');

    // Simulate animated step-by-step execution for roadmap
    await MissionEngineService.executeMissionStepByStep(newMission, (nodeId, status, progress) => {
      setActiveMission(prev => {
        const updatedNodes = prev.nodes.map(n => n.id === nodeId ? { ...n, status, progress } : n);
        return { ...prev, nodes: updatedNodes, activeNodeId: nodeId };
      });
    });

    // Save to history
    StorageService.saveMission(newMission);
    setMissionsHistory(StorageService.getMissionsHistory());
    setIsExecutingMission(false);
  };

  // Select a curated demo mission
  const handleSelectDemoMission = (demoId: string) => {
    const demo = DEMO_MISSIONS[demoId];
    if (demo) {
      setActiveMission(demo);
      setActiveTab('mission');
      StorageService.saveMission(demo);
      setMissionsHistory(StorageService.getMissionsHistory());
    }
  };

  // Handle follow up question in VQA panel
  const handleAskFollowUp = (question: string) => {
    setActiveMission(prev => {
      return {
        ...prev,
        vqaAnswer: `Grounded RS Query: "${question}" — Satellite radiometry confirms consistent spatial indices across the target coordinates. Surface reflectance values align with the primary mission findings without anomalous variance.`,
        vqaConfidence: 0.95
      };
    });
  };

  // Handle recommendation branch
  const handleSelectRecommendedQuery = (query: string, type: string) => {
    if (type === 'fusion') {
      setActiveTab('fusion');
    } else if (type === 'timelens' || type === 'water') {
      setActiveTab('timelens');
    } else if (type === 'geowatch') {
      setActiveTab('geowatch');
    } else if (type === 'report') {
      setActiveTab('reports');
    } else {
      handleStartMission(query);
    }
  };

  // Handle location selection from Earth Explorer
  const handleLaunchLocationMission = (locationName: string, coords: [number, number], query: string) => {
    handleStartMission(query);
  };

  // Handle GeoWatch inspection
  const handleInspectGeoWatchTask = (task: GeoWatchTask) => {
    handleStartMission(`Inspect satellite anomaly evidence for ${task.title} at ${task.location}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-space-950 text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Main Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSelectDemoMission={handleSelectDemoMission}
        onStartNewMission={() => {
          setActiveTab('mission');
          handleStartMission('Analyze land cover and infrastructure dynamics.');
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* HOME / LANDING VIEW */}
        {activeTab === 'home' && (
          <div className="space-y-6">
            <HeroSection
              onStartMission={(q) => handleStartMission(q)}
              onNavigate={(tab) => setActiveTab(tab)}
              onSelectDemo={handleSelectDemoMission}
            />
            <QuickLaunch onSelectDemo={handleSelectDemoMission} />
            <WorkflowShowcase onTryFlow={() => handleSelectDemoMission('demo-urban-expansion')} />
            <DomainCards onSelectDomainPreset={(_, query) => handleStartMission(query)} />
          </div>
        )}

        {/* MISSION WORKSPACE VIEW */}
        {activeTab === 'mission' && (
          <SingleImageAnalysis
            mission={activeMission}
            onAskFollowUp={handleAskFollowUp}
            onNavigateToTab={(tab) => setActiveTab(tab)}
            onSelectRecommendedQuery={handleSelectRecommendedQuery}
            onReExecuteMission={() => handleStartMission(activeMission.query)}
          />
        )}

        {/* TIMELENS MULTITEMPORAL CHANGE VIEW */}
        {activeTab === 'timelens' && (
          <TimeLens
            multitemporal={activeMission.multitemporal}
            locationName={activeMission.locationName}
          />
        )}

        {/* FUSIONCORE OPTICAL + SAR VIEW */}
        {activeTab === 'fusion' && (
          <FusionCore
            fusion={activeMission.fusion}
            locationName={activeMission.locationName}
          />
        )}

        {/* COMPARE LAB VIEW */}
        {activeTab === 'compare' && (
          <CompareLab />
        )}

        {/* EARTH EXPLORER VIEW */}
        {activeTab === 'explorer' && (
          <EarthExplorer
            onLaunchMissionForLocation={handleLaunchLocationMission}
          />
        )}

        {/* SATELLITE CATALOG VIEW */}
        {activeTab === 'catalog' && (
          <SatelliteCatalog
            onLaunchWithSensor={(sensor) => handleStartMission(`Execute multi-spectral analysis using ${sensor} satellite sensor.`)}
          />
        )}

        {/* KNOWLEDGE ASSISTANT VIEW */}
        {activeTab === 'knowledge' && (
          <KnowledgeAssistant
            onTryItMission={(query, demoId) => {
              if (demoId && DEMO_MISSIONS[demoId]) {
                handleSelectDemoMission(demoId);
              } else {
                handleStartMission(query);
              }
            }}
          />
        )}

        {/* GEOWATCH SURVEILLANCE VIEW */}
        {activeTab === 'geowatch' && (
          <GeoWatch
            onInspectTaskEvidence={handleInspectGeoWatchTask}
          />
        )}

        {/* REPORT GENERATOR VIEW */}
        {activeTab === 'reports' && (
          <ReportGenerator
            mission={activeMission}
          />
        )}

        {/* MISSION HISTORY VIEW */}
        {activeTab === 'history' && (
          <MissionHistory
            missions={missionsHistory}
            onSelectMission={(m) => {
              setActiveMission(m);
              setActiveTab('mission');
            }}
          />
        )}
      </main>

      {/* Global Footer */}
      <Footer onNavigate={(tab) => setActiveTab(tab)} />
    </div>
  );
};
