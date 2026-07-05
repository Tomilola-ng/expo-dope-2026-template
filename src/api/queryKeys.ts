export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  profile: {
    me: ["profile", "me"] as const,
  },
  accounts: {
    summary: (accountId: string) => ["accounts", accountId, "summary"] as const,
  },
  notifications: {
    preview: ["notifications", "preview"] as const,
    list: (filters: { unreadOnly?: boolean; pageSize?: number }) =>
      ["notifications", filters] as const,
  },
  settings: {
    account: ["settings", "account"] as const,
  },
} as const;
