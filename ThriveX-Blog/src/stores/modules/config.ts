import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Other, Theme, Web } from '@/types/app/config';

interface ConfigState {
  // 是否暗黑模式
  isDark: boolean;
  setIsDark: (status: boolean) => void;

  // 网站配置
  web: Web;
  setWeb: (data: Web) => void;

  // 主题配置
  theme: Theme;
  setTheme: (data: Theme) => void;

  // 其他配置
  other: Other;
  setOther: (data: Other) => void;
}

export default create<ConfigState>()(
  persist(
    (set) => ({
      isDark: false,
      setIsDark: (status: boolean) => set(() => ({ isDark: status })),

      web: {} as Web,
      setWeb: (data: Web) => set(() => ({ web: data })),

      theme: {} as Theme,
      setTheme: (data: Theme) => set(() => ({ theme: data })),

      other: {} as Other,
      setOther: (data: Other) => set(() => ({ other: data }))
    }),
    {
      name: 'config_storage',
      storage: createJSONStorage(() => localStorage),
      version: 2,
      migrate: (persistedState: unknown, version: number) => {
        // 旧版本包含 web/theme/other 缓存，需要清除
        if (version < 2) {
          return { isDark: false };
        }
        return persistedState as ConfigState;
      },
      partialize: (state) => ({ isDark: state.isDark }),
    }
  )
)