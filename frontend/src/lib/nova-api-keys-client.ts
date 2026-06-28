'use client';

export interface NovaApiKeyOption {
  id: string;
  key: string;
  name: string;
  groupName: string;
  platform: string;
  status: string;
  groupStatus: string;
  label: string;
}

function getObjectProperty(data: unknown, key: string): unknown {
  return typeof data === 'object' && data !== null && key in data
    ? (data as Record<string, unknown>)[key]
    : undefined;
}

function normalizeApiKeyPlatform(value: unknown): string {
  const platform = String(value || '').trim().toLowerCase();
  return platform === 'google' ? 'gemini' : platform;
}

function normalizeApiKeyOption(raw: unknown): NovaApiKeyOption | null {
  if (!raw || typeof raw !== 'object') return null;
  const record = raw as Partial<NovaApiKeyOption>;
  const id = String(record.id || '').trim();
  const key = String(record.key || '').trim();
  if (!id || !key) return null;
  return {
    id,
    key,
    name: String(record.name || '').trim(),
    groupName: String(record.groupName || '').trim(),
    platform: normalizeApiKeyPlatform(record.platform),
    status: String(record.status || '').trim(),
    groupStatus: String(record.groupStatus || '').trim(),
    label: String(record.label || '').trim() || `${String(record.groupName || '未分组').trim()} | ${String(record.name || '未命名密钥').trim()}`,
  };
}

export function getNovaUrlToken(): string {
  if (typeof window === 'undefined') return '';
  return new URLSearchParams(window.location.search).get('token')?.trim() || '';
}

export async function loadNovaApiKeys(signal?: AbortSignal): Promise<NovaApiKeyOption[]> {
  const token = getNovaUrlToken();
  if (!token) return [];

  const response = await fetch('/api/nova/proxy/keys', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
    signal,
  });
  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const error = getObjectProperty(data, 'error');
    throw new Error(typeof error === 'string' && error.trim() ? error : `密钥列表加载失败: ${response.status}`);
  }
  return Array.isArray(data)
    ? data.map(normalizeApiKeyOption).filter((item): item is NovaApiKeyOption => Boolean(item))
    : [];
}
