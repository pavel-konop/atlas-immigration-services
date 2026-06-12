export const languageConfig = {
  defaultLocale: "en",
  supportedLocales: [
    { code: "en", label: "English", enabled: true },
    { code: "zh-Hans", label: "Simplified Chinese", enabled: false },
    { code: "ja", label: "Japanese", enabled: false }
  ],
  contentFallbackLocale: "en"
} as const;
