export const CACHE_CONFIG = {
  revalidate: {
    public: 300, // 5 minutes for public routes
    protected: 60, // 1 minute for protected routes
    dynamic: 30, // 30 seconds for frequently changing data
    static: 3600, // 1 hour for static data
  },
  cache: {
    public: "force-cache" as const,
    protected: "default" as const,
    dynamic: "no-cache" as const,
  },
} as const;
