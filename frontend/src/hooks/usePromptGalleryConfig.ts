'use client';

import { useEffect, useState } from 'react';
import { loadNovaServerConfig } from '@/lib/nova-server-config';

// 1 = 常驻（直接显示） 2 = 私密（需密码） 3 = 关闭（完全隐藏）
export type PromptGalleryMode = '1' | '2' | '3';

export function usePromptGalleryConfig() {
  const [mode, setMode] = useState<PromptGalleryMode>('2'); // 默认私密
  const [passwordEnabled, setPasswordEnabled] = useState(false);

  useEffect(() => {
    let cancelled = false;

    loadNovaServerConfig()
      .then((data) => {
        if (cancelled) return;
        setMode(data.promptGalleryMode);
        setPasswordEnabled(data.promptGalleryPasswordEnabled);
      })
      .catch(() => {
        // 网络失败时保持默认值 '2'
      });

    return () => { cancelled = true; };
  }, []);

  return { mode, passwordEnabled };
}
