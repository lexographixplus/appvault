import {
  AppItem,
  ResourceItem,
  ConnectionItem,
  DependencyItem,
  EnvironmentItem,
  ActivityItem,
  SheetsConfig,
  AppVaultData,
} from '../types';
import {
  INITIAL_APPS,
  INITIAL_RESOURCES,
  INITIAL_CONNECTIONS,
  INITIAL_DEPENDENCIES,
  INITIAL_ENVIRONMENTS,
  INITIAL_ACTIVITIES,
} from './demoData';

const PREFIX = 'appvault_v2_';

// Injected at build time. Empty means the app starts in local-only mode until
// the user saves their own Web App URL from the Google Sheets tab.
const DEFAULT_WEB_APP_URL = (import.meta.env.VITE_SHEETS_WEB_APP_URL ?? '').trim();

// Keys that make up a syncable snapshot, in a fixed order so local and remote
// payloads can be compared as strings.
const SYNC_KEYS = [
  'apps',
  'resources',
  'connections',
  'dependencies',
  'environments',
  'activity',
] as const;

const DEFAULT_SHEETS_CONFIG: SheetsConfig = {
  webAppUrl: DEFAULT_WEB_APP_URL,
  autoSyncEnabled: true,
  pollIntervalSeconds: 15,
  lastSyncTime: null,
  lastSyncStatus: 'idle',
  errorMessage: null,
  sheetNameApps: 'Apps',
  sheetNameResources: 'Resources',
  sheetNameConnections: 'Connections',
  sheetNameDependencies: 'Dependencies',
  sheetNameActivity: 'Activity',
};

class Store {
  private listeners: Set<() => void> = new Set();
  private syncTimer: any = null;
  private pollTimer: any = null;
  private lastSyncHash: string = '';

  constructor() {
    this.init();
  }

  public init() {
    // Purge previous mock data stored in browser localStorage
    if (!localStorage.getItem(PREFIX + 'v3_production_init')) {
      localStorage.removeItem(PREFIX + 'apps');
      localStorage.removeItem(PREFIX + 'resources');
      localStorage.removeItem(PREFIX + 'connections');
      localStorage.removeItem(PREFIX + 'dependencies');
      localStorage.removeItem(PREFIX + 'environments');
      localStorage.removeItem(PREFIX + 'activity');
      localStorage.setItem(PREFIX + 'v3_production_init', 'true');
    }

    if (!localStorage.getItem(PREFIX + 'apps')) {
      this.resetToDemoData();
    }

    // Seed the endpoint from the build-time default only when nothing is saved.
    // Overwriting unconditionally would discard a URL entered in the Sheets tab
    // on every page load.
    const currentConfig = this.getSheetsConfig();
    if (!currentConfig.webAppUrl && DEFAULT_WEB_APP_URL) {
      this.writeSheetsConfig({ webAppUrl: DEFAULT_WEB_APP_URL }, { silent: true });
    }

    this.startAutoSync();

    // Pull immediately so a fresh browser sees live data instead of empty seeds.
    if (this.getSheetsConfig().webAppUrl) {
      this.pullFromSheets(true);
    }
  }

  /** Returns an unsubscribe function safe to use directly as a useEffect cleanup. */
  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  private getItem<T>(key: string, defaultValue: T): T {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return defaultValue;
    try {
      return JSON.parse(raw);
    } catch {
      return defaultValue;
    }
  }

  private setItem<T>(key: string, value: T) {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
    this.notify();
    this.triggerBackgroundPush();
  }

  // Helper ID generator
  public generateId(prefix: string): string {
    return `${prefix}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  }

  // --- GETTERS ---
  public getApps(): AppItem[] {
    return this.getItem<AppItem[]>('apps', []);
  }

  public getApp(id: string): AppItem | undefined {
    return this.getApps().find((a) => a.id === id);
  }

  public getResources(): ResourceItem[] {
    return this.getItem<ResourceItem[]>('resources', []);
  }

  public getResource(id: string): ResourceItem | undefined {
    return this.getResources().find((r) => r.id === id);
  }

  public getConnections(): ConnectionItem[] {
    return this.getItem<ConnectionItem[]>('connections', []);
  }

  public getConnectionsForApp(appId: string): ConnectionItem[] {
    return this.getConnections().filter((c) => c.appId === appId);
  }

  public getDependencies(): DependencyItem[] {
    return this.getItem<DependencyItem[]>('dependencies', []);
  }

  public getDependenciesForApp(appId: string): DependencyItem[] {
    return this.getDependencies().filter((d) => d.appId === appId);
  }

  public getEnvironments(): EnvironmentItem[] {
    return this.getItem<EnvironmentItem[]>('environments', []);
  }

  public getEnvironmentsForApp(appId: string): EnvironmentItem[] {
    return this.getEnvironments().filter((e) => e.appId === appId);
  }

  public getActivity(): ActivityItem[] {
    return this.getItem<ActivityItem[]>('activity', []).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  public getSheetsConfig(): SheetsConfig {
    return this.getItem<SheetsConfig>('sheetsConfig', DEFAULT_SHEETS_CONFIG);
  }

  // --- SETTERS & MUTATIONS ---
  public saveApp(data: Partial<AppItem> & { name: string }): AppItem {
    const apps = this.getApps();
    const now = new Date().toISOString();
    let savedApp: AppItem;

    if (!data.id) {
      savedApp = {
        id: this.generateId('APP'),
        name: data.name,
        description: data.description || '',
        type: data.type || 'Web App',
        status: data.status || 'Active',
        platform: data.platform || '',
        version: data.version || '1.0.0',
        repoUrl: data.repoUrl || '',
        prodUrl: data.prodUrl || '',
        owner: data.owner || '',
        notes: data.notes || '',
        priority: data.priority || 'Medium',
        tags: data.tags || [],
        createdAt: now,
        updatedAt: now,
      };
      apps.unshift(savedApp);
      this.logActivity('created', 'Application', savedApp.id, `Created application "${savedApp.name}"`);
    } else {
      const index = apps.findIndex((a) => a.id === data.id);
      if (index === -1) throw new Error('App not found');

      savedApp = {
        ...apps[index],
        ...data,
        updatedAt: now,
      };
      apps[index] = savedApp;
      this.logActivity('updated', 'Application', savedApp.id, `Updated application "${savedApp.name}"`);
    }

    this.setItem('apps', apps);
    return savedApp;
  }

  public deleteApp(id: string) {
    let apps = this.getApps();
    const target = apps.find((a) => a.id === id);
    if (!target) return;

    apps = apps.filter((a) => a.id !== id);
    this.setItem('apps', apps);

    // Cascade delete connections, dependencies, environments
    const conns = this.getConnections().filter((c) => c.appId !== id);
    localStorage.setItem(PREFIX + 'connections', JSON.stringify(conns));

    const deps = this.getDependencies().filter((d) => d.appId !== id);
    localStorage.setItem(PREFIX + 'dependencies', JSON.stringify(deps));

    const envs = this.getEnvironments().filter((e) => e.appId !== id);
    localStorage.setItem(PREFIX + 'environments', JSON.stringify(envs));

    this.logActivity('deleted', 'Application', id, `Deleted application "${target.name}" and removed associated links.`);
    this.notify();
  }

  public saveResource(data: Partial<ResourceItem> & { name: string; category: ResourceItem['category'] }): ResourceItem {
    const resList = this.getResources();
    const now = new Date().toISOString();
    let savedRes: ResourceItem;

    if (!data.id) {
      savedRes = {
        id: this.generateId('RES'),
        name: data.name,
        category: data.category,
        provider: data.provider || 'Custom',
        status: data.status || 'Active',
        url: data.url || '',
        purpose: data.purpose || '',
        credLocation: data.credLocation || '',
        tier: data.tier || 'Free',
        costMonthly: Number(data.costMonthly) || 0,
        createdAt: now,
        updatedAt: now,
      };
      resList.unshift(savedRes);
      this.logActivity('created', 'Resource', savedRes.id, `Created infrastructure resource "${savedRes.name}" (${savedRes.category})`);
    } else {
      const idx = resList.findIndex((r) => r.id === data.id);
      if (idx === -1) throw new Error('Resource not found');

      savedRes = {
        ...resList[idx],
        ...data,
        updatedAt: now,
      };
      resList[idx] = savedRes;
      this.logActivity('updated', 'Resource', savedRes.id, `Updated resource "${savedRes.name}"`);
    }

    this.setItem('resources', resList);
    return savedRes;
  }

  public deleteResource(id: string) {
    let resList = this.getResources();
    const target = resList.find((r) => r.id === id);
    if (!target) return;

    resList = resList.filter((r) => r.id !== id);
    this.setItem('resources', resList);

    // Remove connections to this resource
    const conns = this.getConnections().filter((c) => c.resourceId !== id);
    localStorage.setItem(PREFIX + 'connections', JSON.stringify(conns));

    this.logActivity('deleted', 'Resource', id, `Deleted resource "${target.name}"`);
    this.notify();
  }

  public saveConnection(data: Omit<ConnectionItem, 'id' | 'createdAt'> & { id?: string }): ConnectionItem {
    const conns = this.getConnections();
    let conn: ConnectionItem;

    if (!data.id) {
      conn = {
        ...data,
        id: this.generateId('CON'),
        createdAt: new Date().toISOString(),
      };
      conns.push(conn);

      const app = this.getApp(data.appId);
      const res = this.getResource(data.resourceId);
      this.logActivity(
        'connected',
        'Connection',
        conn.id,
        `Linked ${app ? app.name : 'App'} to ${res ? res.name : 'Resource'} (${data.relationship || 'Link'})`
      );
    } else {
      const idx = conns.findIndex((c) => c.id === data.id);
      if (idx !== -1) {
        conns[idx] = { ...conns[idx], ...data };
        conn = conns[idx];
      } else {
        conn = { ...data, id: this.generateId('CON'), createdAt: new Date().toISOString() };
        conns.push(conn);
      }
    }

    this.setItem('connections', conns);
    return conn;
  }

  public deleteConnection(id: string) {
    let conns = this.getConnections();
    const conn = conns.find((c) => c.id === id);
    conns = conns.filter((c) => c.id !== id);
    this.setItem('connections', conns);

    if (conn) {
      const app = this.getApp(conn.appId);
      const res = this.getResource(conn.resourceId);
      this.logActivity(
        'disconnected',
        'Connection',
        id,
        `Disconnected link between ${app ? app.name : 'App'} and ${res ? res.name : 'Resource'}`
      );
    }
  }

  public saveDependency(dep: Omit<DependencyItem, 'id'> & { id?: string }): DependencyItem {
    const deps = this.getDependencies();
    let item: DependencyItem;

    if (!dep.id) {
      item = { ...dep, id: this.generateId('DEP') };
      deps.push(item);
    } else {
      const idx = deps.findIndex((d) => d.id === dep.id);
      if (idx !== -1) {
        deps[idx] = { ...deps[idx], ...dep };
        item = deps[idx];
      } else {
        item = { ...dep, id: this.generateId('DEP') };
        deps.push(item);
      }
    }

    this.setItem('dependencies', deps);
    return item;
  }

  public deleteDependency(id: string) {
    const deps = this.getDependencies().filter((d) => d.id !== id);
    this.setItem('dependencies', deps);
  }

  public saveEnvironment(env: Omit<EnvironmentItem, 'id' | 'lastChecked'> & { id?: string }): EnvironmentItem {
    const envs = this.getEnvironments();
    let item: EnvironmentItem;

    if (!env.id) {
      item = { ...env, id: this.generateId('ENV'), lastChecked: new Date().toISOString() };
      envs.push(item);
    } else {
      const idx = envs.findIndex((e) => e.id === env.id);
      if (idx !== -1) {
        envs[idx] = { ...envs[idx], ...env, lastChecked: new Date().toISOString() };
        item = envs[idx];
      } else {
        item = { ...env, id: this.generateId('ENV'), lastChecked: new Date().toISOString() };
        envs.push(item);
      }
    }

    this.setItem('environments', envs);
    return item;
  }

  public deleteEnvironment(id: string) {
    const envs = this.getEnvironments().filter((e) => e.id !== id);
    this.setItem('environments', envs);
  }

  public logActivity(
    action: ActivityItem['action'],
    entityType: ActivityItem['entityType'],
    entityId: string,
    description: string
  ) {
    const acts = this.getActivity();
    const newAct: ActivityItem = {
      id: this.generateId('ACT'),
      timestamp: new Date().toISOString(),
      action,
      entityType,
      entityId,
      description,
    };
    acts.unshift(newAct);
    if (acts.length > 200) acts.pop();
    localStorage.setItem(PREFIX + 'activity', JSON.stringify(acts));
    this.notify();
  }

  public updateSheetsConfig(config: Partial<SheetsConfig>) {
    this.writeSheetsConfig(config);
  }

  /**
   * Persists config changes. Restarts the poll timer only when a field that
   * actually affects polling changed — otherwise every successful background
   * sync would reset its own interval. `silent` skips the re-render, used for
   * background bookkeeping (timestamps) that no view is waiting on.
   */
  private writeSheetsConfig(config: Partial<SheetsConfig>, opts: { silent?: boolean } = {}) {
    const current = this.getSheetsConfig();
    const updated = { ...current, ...config };
    localStorage.setItem(PREFIX + 'sheetsConfig', JSON.stringify(updated));

    if (!opts.silent) this.notify();

    const pollingChanged =
      updated.webAppUrl !== current.webAppUrl ||
      updated.autoSyncEnabled !== current.autoSyncEnabled ||
      updated.pollIntervalSeconds !== current.pollIntervalSeconds;

    if (pollingChanged) this.startAutoSync();
  }

  /** Stable string form of the syncable dataset, for change detection. */
  private snapshot(source: Partial<AppVaultData>): string {
    const normalized: Record<string, unknown> = {};
    SYNC_KEYS.forEach((key) => {
      const value = source[key];
      normalized[key] = Array.isArray(value) ? value : [];
    });
    return JSON.stringify(normalized);
  }

  private localSnapshot(): string {
    return this.snapshot({
      apps: this.getApps(),
      resources: this.getResources(),
      connections: this.getConnections(),
      dependencies: this.getDependencies(),
      environments: this.getEnvironments(),
      activity: this.getActivity(),
    });
  }

  public resetToDemoData() {
    localStorage.setItem(PREFIX + 'apps', JSON.stringify(INITIAL_APPS));
    localStorage.setItem(PREFIX + 'resources', JSON.stringify(INITIAL_RESOURCES));
    localStorage.setItem(PREFIX + 'connections', JSON.stringify(INITIAL_CONNECTIONS));
    localStorage.setItem(PREFIX + 'dependencies', JSON.stringify(INITIAL_DEPENDENCIES));
    localStorage.setItem(PREFIX + 'environments', JSON.stringify(INITIAL_ENVIRONMENTS));
    localStorage.setItem(PREFIX + 'activity', JSON.stringify(INITIAL_ACTIVITIES));
    localStorage.setItem(PREFIX + 'sheetsConfig', JSON.stringify(DEFAULT_SHEETS_CONFIG));
    this.notify();
  }

  public exportFullJson(): string {
    const data: AppVaultData = {
      apps: this.getApps(),
      resources: this.getResources(),
      connections: this.getConnections(),
      dependencies: this.getDependencies(),
      environments: this.getEnvironments(),
      activity: this.getActivity(),
      sheetsConfig: this.getSheetsConfig(),
    };
    return JSON.stringify(data, null, 2);
  }

  public importFullJson(jsonStr: string) {
    try {
      const parsed: AppVaultData = JSON.parse(jsonStr);
      if (Array.isArray(parsed.apps)) localStorage.setItem(PREFIX + 'apps', JSON.stringify(parsed.apps));
      if (Array.isArray(parsed.resources)) localStorage.setItem(PREFIX + 'resources', JSON.stringify(parsed.resources));
      if (Array.isArray(parsed.connections)) localStorage.setItem(PREFIX + 'connections', JSON.stringify(parsed.connections));
      if (Array.isArray(parsed.dependencies)) localStorage.setItem(PREFIX + 'dependencies', JSON.stringify(parsed.dependencies));
      if (Array.isArray(parsed.environments)) localStorage.setItem(PREFIX + 'environments', JSON.stringify(parsed.environments));
      if (Array.isArray(parsed.activity)) localStorage.setItem(PREFIX + 'activity', JSON.stringify(parsed.activity));
      if (parsed.sheetsConfig) localStorage.setItem(PREFIX + 'sheetsConfig', JSON.stringify({ ...DEFAULT_SHEETS_CONFIG, ...parsed.sheetsConfig }));

      this.logActivity('imported', 'System', 'SYS-IMPORT', 'Imported complete database backup file.');
      this.notify();
      return true;
    } catch (err) {
      console.error('Import error:', err);
      return false;
    }
  }

  // --- GOOGLE SHEETS CLOUD SYNC ENGINE ---
  private triggerBackgroundPush() {
    clearTimeout(this.syncTimer);
    const config = this.getSheetsConfig();
    if (!config.webAppUrl || !config.autoSyncEnabled) return;

    this.syncTimer = setTimeout(() => {
      this.pushToSheets(true);
    }, 2000);
  }

  public startAutoSync() {
    clearInterval(this.pollTimer);
    const config = this.getSheetsConfig();
    if (!config.webAppUrl || !config.autoSyncEnabled) return;

    const intervalMs = Math.max(5, config.pollIntervalSeconds || 15) * 1000;
    this.pollTimer = setInterval(() => {
      this.pullFromSheets(true);
    }, intervalMs);
  }

  public async testSheetsConnection(urlOverride?: string): Promise<{ success: boolean; message: string; latencyMs?: number }> {
    const url = (urlOverride || this.getSheetsConfig().webAppUrl).trim();
    if (!url) {
      return { success: false, message: 'Google Apps Script Web App URL is empty.' };
    }

    const start = Date.now();
    try {
      const res = await fetch(url, { method: 'GET' });
      const duration = Date.now() - start;

      if (!res.ok) {
        return { success: false, message: `HTTP Error ${res.status}: ${res.statusText}` };
      }

      const json = await res.json();
      if (json && typeof json === 'object') {
        return {
          success: true,
          message: 'Successfully connected to Google Sheets backend!',
          latencyMs: duration,
        };
      } else {
        return { success: false, message: 'Response was received but invalid JSON format returned.' };
      }
    } catch (err: any) {
      return { success: false, message: `Connection failed: ${err.message || 'Network/CORS error'}` };
    }
  }

  public async pushToSheets(isBackground = false): Promise<{ success: boolean; message: string }> {
    const config = this.getSheetsConfig();
    const url = config.webAppUrl?.trim();
    if (!url) {
      if (!isBackground) this.updateSheetsConfig({ lastSyncStatus: 'error', errorMessage: 'No Web App URL provided.' });
      return { success: false, message: 'Please configure Google Apps Script Web App URL first.' };
    }

    const payloadStr = this.localSnapshot();
    if (isBackground && this.lastSyncHash === payloadStr) {
      return { success: true, message: 'Data unchanged, skipped background sync.' };
    }

    if (!isBackground) {
      this.updateSheetsConfig({ lastSyncStatus: 'syncing', errorMessage: null });
    }

    try {
      const res = await fetch(url, {
        method: 'POST',
        body: payloadStr,
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

      this.lastSyncHash = payloadStr;
      const now = new Date().toISOString();
      this.writeSheetsConfig(
        {
          lastSyncTime: now,
          lastSyncStatus: 'success',
          errorMessage: null,
        },
        { silent: isBackground }
      );

      if (!isBackground) {
        this.logActivity('synced', 'GoogleSheets', 'SHEET-SYNC', 'Successfully pushed local database state to Google Sheets.');
      }

      return { success: true, message: 'Database successfully synced to Google Sheets!' };
    } catch (err: any) {
      const msg = err.message || 'Sync error';
      this.updateSheetsConfig({ lastSyncStatus: 'error', errorMessage: msg });
      return { success: false, message: `Push failed: ${msg}` };
    }
  }

  public async pullFromSheets(isBackground = false): Promise<{ success: boolean; message: string }> {
    const config = this.getSheetsConfig();
    const url = config.webAppUrl?.trim();
    if (!url) {
      return { success: false, message: 'Please configure Google Apps Script Web App URL first.' };
    }

    if (!isBackground) {
      this.updateSheetsConfig({ lastSyncStatus: 'syncing', errorMessage: null });
    }

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data: AppVaultData = await res.json();
      if (!data || typeof data !== 'object') {
        throw new Error('Received invalid format from Google Sheets script.');
      }

      // Compare normalized snapshots: the remote payload may carry extra keys
      // or a different key order, which would otherwise register as a change
      // on every single poll.
      const remoteStr = this.snapshot(data);
      const changed = remoteStr !== this.localSnapshot();

      if (changed) {
        SYNC_KEYS.forEach((key) => {
          const value = data[key];
          if (Array.isArray(value)) localStorage.setItem(PREFIX + key, JSON.stringify(value));
        });
        this.lastSyncHash = remoteStr;
      }

      const now = new Date().toISOString();
      this.writeSheetsConfig(
        {
          lastSyncTime: now,
          lastSyncStatus: 'success',
          errorMessage: null,
        },
        // Stay quiet on background polls that brought nothing new, otherwise
        // the whole app re-renders on every tick.
        { silent: isBackground && !changed }
      );

      if (!isBackground) {
        this.logActivity('synced', 'GoogleSheets', 'SHEET-PULL', 'Pulled fresh dataset from Google Sheets.');
      }

      return { success: true, message: 'Data updated from Google Sheets.' };
    } catch (err: any) {
      const msg = err.message || 'Pull error';
      this.updateSheetsConfig({ lastSyncStatus: 'error', errorMessage: msg });
      return { success: false, message: `Pull failed: ${msg}` };
    }
  }
}

export const appStore = new Store();
