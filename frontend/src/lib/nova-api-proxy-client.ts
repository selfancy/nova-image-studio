'use client';

import type { ProviderProtocol } from '@/lib/nova-models';

interface OpenAiResponsesProxyInput {
  apiKey: string;
  body: unknown;
  stream?: boolean;
  signal?: AbortSignal;
}

interface GoogleGenerateContentProxyInput {
  apiKey: string;
  model: string;
  body: unknown;
  signal?: AbortSignal;
}

export interface ModelCheckProxyInput {
  id: string;
  name: string;
  kind: 'image' | 'text';
  protocol: ProviderProtocol;
  apiKey: string;
  modelId: string;
}

export function fetchOpenAiResponsesViaProxy(input: OpenAiResponsesProxyInput): Promise<Response> {
  return fetch('/api/nova/proxy/openai/responses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      apiKey: input.apiKey,
      body: input.body,
      stream: input.stream,
    }),
    signal: input.signal,
  });
}

export function fetchGoogleStreamGenerateContentViaProxy(input: GoogleGenerateContentProxyInput): Promise<Response> {
  return fetch('/api/nova/proxy/google/stream-generate-content', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      apiKey: input.apiKey,
      model: input.model,
      body: input.body,
    }),
    signal: input.signal,
  });
}

export function checkModelsViaProxy(models: ModelCheckProxyInput[], signal?: AbortSignal): Promise<Response> {
  return fetch('/api/nova/proxy/models/check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ models }),
    signal,
  });
}
