'use client';

export interface NovaServerConfig {
  promptGalleryMode: '1' | '2' | '3';
  promptGalleryPasswordEnabled: boolean;
  novaApiBaseUrl: string;
  novaApiBaseUrlLocked: boolean;
}

const DEFAULT_SERVER_CONFIG: NovaServerConfig = {
  promptGalleryMode: '2',
  promptGalleryPasswordEnabled: false,
  novaApiBaseUrl: '',
  novaApiBaseUrlLocked: false,
};

let cachedServerConfig: NovaServerConfig | null = null;
let pendingServerConfig: Promise<NovaServerConfig> | null = null;

function normalizeBaseUrl(value: unknown): string {
  return String(value || '').trim().replace(/\/+$/, '');
}

function normalizeServerConfig(data: unknown): NovaServerConfig {
  const record = data && typeof data === 'object' ? data as Record<string, unknown> : {};
  const rawMode = record.promptGalleryMode;
  const promptGalleryMode = rawMode === '1' || rawMode === '3' ? rawMode : '2';
  const novaApiBaseUrl = normalizeBaseUrl(record.novaApiBaseUrl);
  return {
    promptGalleryMode,
    promptGalleryPasswordEnabled: Boolean(record.promptGalleryPasswordEnabled),
    novaApiBaseUrl,
    novaApiBaseUrlLocked: novaApiBaseUrl.length > 0 && record.novaApiBaseUrlLocked === true,
  };
}

export function getCachedNovaServerConfig(): NovaServerConfig {
  return cachedServerConfig || DEFAULT_SERVER_CONFIG;
}

export function getNovaApiBaseUrlOverride(): string {
  return getCachedNovaServerConfig().novaApiBaseUrl;
}

export function hasNovaApiBaseUrlOverride(): boolean {
  return getNovaApiBaseUrlOverride().length > 0;
}

export async function loadNovaServerConfig(): Promise<NovaServerConfig> {
  if (!pendingServerConfig) {
    pendingServerConfig = fetch('/api/nova/config', { cache: 'no-store' })
      .then(res => res.json())
      .then((data) => {
        cachedServerConfig = normalizeServerConfig(data);
        return cachedServerConfig;
      })
      .catch(() => DEFAULT_SERVER_CONFIG)
      .finally(() => {
        pendingServerConfig = null;
      });
  }
  return pendingServerConfig;
}

export async function resolveNovaApiBaseUrl(baseUrl: string): Promise<string> {
  const config = await loadNovaServerConfig();
  return config.novaApiBaseUrl || baseUrl;
}
