import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { CommandPalette } from './components/CommandPalette';
import { DashboardView } from './components/DashboardView';
import { ApplicationsView } from './components/ApplicationsView';
import { ApplicationDetailView } from './components/ApplicationDetailView';
import { ResourcesView } from './components/ResourcesView';
import { ConnectionsView } from './components/ConnectionsView';
import { ArchitectureView } from './components/ArchitectureView';
import { DependenciesView } from './components/DependenciesView';
import { EnvironmentsView } from './components/EnvironmentsView';
import { ActivityView } from './components/ActivityView';
import { GoogleSheetsView } from './components/GoogleSheetsView';
import { SettingsView } from './components/SettingsView';
import {
  AppFormModal,
  ResourceFormModal,
  ConnectResourceModal,
} from './components/Modals';
import { appStore } from './lib/store';
import { AppItem, ResourceItem, EnvironmentName } from './types';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState<boolean>(false);

  // Data State from Store
  const [apps, setApps] = useState<AppItem[]>(appStore.getApps());
  const [resources, setResources] = useState<ResourceItem[]>(appStore.getResources());
  const [connections, setConnections] = useState(appStore.getConnections());
  const [dependencies, setDependencies] = useState(appStore.getDependencies());
  const [environments, setEnvironments] = useState(appStore.getEnvironments());
  const [activities, setActivities] = useState(appStore.getActivity());

  // Toast Notification State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Modal States
  const [appModalOpen, setAppModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<AppItem | null>(null);

  const [resourceModalOpen, setResourceModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<ResourceItem | null>(null);

  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [connectPreselectedAppId, setConnectPreselectedAppId] = useState<string | undefined>(undefined);

  // Subscribe to store updates
  useEffect(() => {
    const unsubscribe = appStore.subscribe(() => {
      setApps(appStore.getApps());
      setResources(appStore.getResources());
      setConnections(appStore.getConnections());
      setDependencies(appStore.getDependencies());
      setEnvironments(appStore.getEnvironments());
      setActivities(appStore.getActivity());
    });
    return unsubscribe;
  }, []);

  // Handle Hash Changes / Router
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.slice(1) || 'dashboard';
      const [view, id] = hash.split('/');

      setCurrentView(view || 'dashboard');
      // Clear the selection when the hash carries no id, otherwise a stale app
      // stays selected after navigating away from the detail view.
      setSelectedAppId(id || null);
    };

    window.addEventListener('hashchange', handleHash);
    handleHash();
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Global ⌘K / Ctrl+K to open the command palette (the palette itself only
  // handles closing, since it is unmounted while hidden).
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((open) => !open);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const navigateTo = (view: string, entityId?: string) => {
    setCurrentView(view);
    if (entityId) {
      setSelectedAppId(entityId);
      window.location.hash = `#${view}/${entityId}`;
    } else {
      window.location.hash = `#${view}`;
    }
  };

  // --- HANDLERS ---
  const handleSaveApp = (data: Partial<AppItem> & { name: string }) => {
    const saved = appStore.saveApp(data);
    showToast(`Application "${saved.name}" saved successfully.`);
  };

  const handleDeleteApp = (id: string) => {
    const target = apps.find((a) => a.id === id);
    if (window.confirm(`Are you sure you want to delete application "${target?.name || ''}"?`)) {
      appStore.deleteApp(id);
      showToast('Application deleted.');
      if (currentView === 'app-detail') {
        navigateTo('applications');
      }
    }
  };

  const handleSaveResource = (data: Partial<ResourceItem> & { name: string; category: ResourceItem['category'] }) => {
    const saved = appStore.saveResource(data);
    showToast(`Resource "${saved.name}" saved successfully.`);
  };

  const handleDeleteResource = (id: string) => {
    const target = resources.find((r) => r.id === id);
    if (window.confirm(`Delete infrastructure resource "${target?.name || ''}"?`)) {
      appStore.deleteResource(id);
      showToast('Resource deleted.');
    }
  };

  const handleConnectResource = (
    appId: string,
    resourceId: string,
    relationship: string,
    environment: EnvironmentName
  ) => {
    appStore.saveConnection({
      appId,
      resourceId,
      relationship,
      environment,
    });
    showToast('Infrastructure linked to application.');
  };

  const handleDeleteConnection = (connId: string) => {
    appStore.deleteConnection(connId);
    showToast('Resource link removed.');
  };

  const handleAddDependency = (appId: string) => {
    const name = window.prompt('Dependency Name (e.g. React, Express, Tailwind):');
    if (!name) return;
    const version = window.prompt('Version (e.g. 19.0.0):') || '1.0.0';
    appStore.saveDependency({
      appId,
      name,
      type: 'Library',
      version,
      status: 'Up to date',
    });
    showToast('Dependency added.');
  };

  const handleDeleteDependency = (depId: string) => {
    appStore.deleteDependency(depId);
    showToast('Dependency removed.');
  };

  const handleAddEnvironment = (appId: string) => {
    const name = window.prompt('Environment Name (e.g., Staging, QA, Sandbox):');
    if (!name) return;
    const url = window.prompt('Target URL:') || 'https://stage.example.org';
    appStore.saveEnvironment({
      appId,
      name: name as EnvironmentName,
      url,
      status: 'Healthy',
    });
    showToast('Environment target added.');
  };

  const handleDeleteEnvironment = (envId: string) => {
    appStore.deleteEnvironment(envId);
    showToast('Environment removed.');
  };

  // Map view titles
  const viewTitles: Record<string, string> = {
    dashboard: 'Dashboard',
    applications: 'Applications Catalog',
    'app-detail': 'Application Details',
    resources: 'Infrastructure Resources',
    connections: 'Resource Links',
    dependencies: 'Package Dependencies',
    environments: 'Deployment Targets',
    architecture: 'System Topology Map',
    activity: 'Audit Activity Log',
    sheets: 'Google Sheets Database Sync',
    settings: 'AppVault Settings',
  };

  // Usage map for resources
  const connectionsCountByResource: Record<string, number> = {};
  connections.forEach((c) => {
    connectionsCountByResource[c.resourceId] = (connectionsCountByResource[c.resourceId] || 0) + 1;
  });

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col md:flex-row transition-colors selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        onNavigate={navigateTo}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          currentViewTitle={viewTitles[currentView] || 'AppVault'}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onOpenCreateAppModal={() => {
            setEditingApp(null);
            setAppModalOpen(true);
          }}
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          onNavigate={navigateTo}
        />

        {/* Scrollable View Canvas */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl w-full mx-auto">
          {currentView === 'dashboard' && (
            <DashboardView
              apps={apps}
              resources={resources}
              connectionsCount={connections.length}
              activities={activities}
              onNavigate={navigateTo}
              onOpenCreateAppModal={() => {
                setEditingApp(null);
                setAppModalOpen(true);
              }}
              onOpenCreateResourceModal={() => {
                setEditingResource(null);
                setResourceModalOpen(true);
              }}
            />
          )}

          {currentView === 'applications' && (
            <ApplicationsView
              apps={apps}
              onNavigate={navigateTo}
              onOpenCreateAppModal={() => {
                setEditingApp(null);
                setAppModalOpen(true);
              }}
              onOpenEditAppModal={(app) => {
                setEditingApp(app);
                setAppModalOpen(true);
              }}
              onDeleteApp={handleDeleteApp}
            />
          )}

          {currentView === 'app-detail' && selectedAppId && (
            (() => {
              const currentApp = apps.find((a) => a.id === selectedAppId);
              if (!currentApp) {
                return (
                  <div className="py-12 text-center text-slate-400">
                    Application not found.
                  </div>
                );
              }
              const appConnections = connections.filter((c) => c.appId === selectedAppId);
              const appDeps = dependencies.filter((d) => d.appId === selectedAppId);
              const appEnvs = environments.filter((e) => e.appId === selectedAppId);

              return (
                <ApplicationDetailView
                  app={currentApp}
                  allResources={resources}
                  connections={appConnections}
                  dependencies={appDeps}
                  environments={appEnvs}
                  onBack={() => navigateTo('applications')}
                  onOpenEditAppModal={(a) => {
                    setEditingApp(a);
                    setAppModalOpen(true);
                  }}
                  onOpenConnectResourceModal={(appId) => {
                    setConnectPreselectedAppId(appId);
                    setConnectModalOpen(true);
                  }}
                  onDeleteConnection={handleDeleteConnection}
                  onOpenAddDependencyModal={handleAddDependency}
                  onDeleteDependency={handleDeleteDependency}
                  onOpenAddEnvironmentModal={handleAddEnvironment}
                  onDeleteEnvironment={handleDeleteEnvironment}
                />
              );
            })()
          )}

          {currentView === 'resources' && (
            <ResourcesView
              resources={resources}
              connectionsCountByResourceId={connectionsCountByResource}
              onOpenCreateResourceModal={() => {
                setEditingResource(null);
                setResourceModalOpen(true);
              }}
              onOpenEditResourceModal={(r) => {
                setEditingResource(r);
                setResourceModalOpen(true);
              }}
              onDeleteResource={handleDeleteResource}
            />
          )}

          {currentView === 'connections' && (
            <ConnectionsView
              connections={connections}
              apps={apps}
              resources={resources}
              onOpenConnectModal={() => {
                setConnectPreselectedAppId(undefined);
                setConnectModalOpen(true);
              }}
              onDeleteConnection={handleDeleteConnection}
              onNavigateApp={(id) => navigateTo('app-detail', id)}
            />
          )}

          {currentView === 'dependencies' && (
            <DependenciesView
              dependencies={dependencies}
              apps={apps}
              onOpenAddDependencyModal={() => {
                if (apps[0]) handleAddDependency(apps[0].id);
              }}
              onNavigateApp={(id) => navigateTo('app-detail', id)}
            />
          )}

          {currentView === 'environments' && (
            <EnvironmentsView
              environments={environments}
              apps={apps}
              onOpenAddEnvironmentModal={() => {
                if (apps[0]) handleAddEnvironment(apps[0].id);
              }}
              onNavigateApp={(id) => navigateTo('app-detail', id)}
            />
          )}

          {currentView === 'architecture' && (
            <ArchitectureView
              apps={apps}
              resources={resources}
              connections={connections}
              onNavigateApp={(id) => navigateTo('app-detail', id)}
            />
          )}

          {currentView === 'activity' && <ActivityView activities={activities} />}

          {currentView === 'sheets' && <GoogleSheetsView />}

          {currentView === 'settings' && <SettingsView onShowToast={showToast} />}
        </main>
      </div>

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onNavigate={navigateTo}
        onOpenCreateAppModal={() => {
          setEditingApp(null);
          setAppModalOpen(true);
        }}
      />

      {/* Modals */}
      <AppFormModal
        isOpen={appModalOpen}
        onClose={() => setAppModalOpen(false)}
        onSubmit={handleSaveApp}
        initialData={editingApp}
      />

      <ResourceFormModal
        isOpen={resourceModalOpen}
        onClose={() => setResourceModalOpen(false)}
        onSubmit={handleSaveResource}
        initialData={editingResource}
      />

      <ConnectResourceModal
        isOpen={connectModalOpen}
        onClose={() => setConnectModalOpen(false)}
        onSubmit={handleConnectResource}
        apps={apps}
        resources={resources}
        preselectedAppId={connectPreselectedAppId}
      />

      {/* Toast Notification Container */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-2.5 text-xs font-semibold ${
              toast.type === 'success'
                ? 'bg-slate-900 text-white border-slate-800'
                : 'bg-rose-600 text-white border-rose-500'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-200" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
