export type AppStatus = 'Active' | 'Development' | 'Testing' | 'Maintenance' | 'Archived' | 'Idea';
export type AppType = 'Web App' | 'Desktop App' | 'Mobile App' | 'API' | 'Script/Automation' | 'Microservice' | 'Other';
export type AppPriority = 'High' | 'Medium' | 'Low';

export interface AppItem {
  id: string;
  name: string;
  description: string;
  type: AppType;
  status: AppStatus;
  platform: string;
  version: string;
  repoUrl: string;
  prodUrl: string;
  owner: string;
  notes: string;
  priority: AppPriority;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export type ResourceCategory = 'Database' | 'Storage' | 'API' | 'Hosting' | 'Authentication' | 'Repository' | 'SaaS' | 'Monitoring' | 'Other';
export type ResourceStatus = 'Active' | 'Inactive' | 'Deprecated' | 'Maintenance';

export interface ResourceItem {
  id: string;
  name: string;
  category: ResourceCategory;
  provider: string;
  status: ResourceStatus;
  url: string;
  purpose: string;
  credLocation: string;
  tier: string;
  costMonthly: number;
  createdAt: string;
  updatedAt: string;
}

export type EnvironmentName = 'All' | 'Production' | 'Staging' | 'Development' | 'QA' | 'Sandbox';

export interface ConnectionItem {
  id: string;
  appId: string;
  resourceId: string;
  relationship: string;
  environment: EnvironmentName;
  createdAt: string;
}

export type DependencyType = 'Framework' | 'Library' | 'SDK' | 'Database Driver' | 'DevDependency' | 'External API';
export type DependencyStatus = 'Up to date' | 'Update available' | 'Breaking changes' | 'Deprecated';

export interface DependencyItem {
  id: string;
  appId: string;
  name: string;
  type: DependencyType;
  version: string;
  latestVersion?: string;
  status: DependencyStatus;
}

export interface EnvironmentItem {
  id: string;
  appId: string;
  name: EnvironmentName;
  url: string;
  status: 'Healthy' | 'Degraded' | 'Down' | 'Maintenance';
  lastChecked: string;
}

export type ActionType = 'created' | 'updated' | 'deleted' | 'connected' | 'disconnected' | 'synced' | 'imported' | 'system';
export type EntityType = 'Application' | 'Resource' | 'Connection' | 'Dependency' | 'Environment' | 'GoogleSheets' | 'System';

export interface ActivityItem {
  id: string;
  timestamp: string;
  action: ActionType;
  entityType: EntityType;
  entityId: string;
  description: string;
}

export interface SheetsConfig {
  webAppUrl: string;
  autoSyncEnabled: boolean;
  pollIntervalSeconds: number;
  lastSyncTime: string | null;
  lastSyncStatus: 'idle' | 'syncing' | 'success' | 'error';
  errorMessage: string | null;
  sheetNameApps: string;
  sheetNameResources: string;
  sheetNameConnections: string;
  sheetNameDependencies: string;
  sheetNameActivity: string;
}

export interface AppVaultData {
  apps: AppItem[];
  resources: ResourceItem[];
  connections: ConnectionItem[];
  dependencies: DependencyItem[];
  environments: EnvironmentItem[];
  activity: ActivityItem[];
  sheetsConfig?: Partial<SheetsConfig>;
}
