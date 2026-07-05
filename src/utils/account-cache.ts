import { queryKeys } from "@/api/queryKeys";
import type { QueryClient } from "@tanstack/react-query";

export function invalidateAccountSummaryCache(
  queryClient: QueryClient,
  accountId?: string | null,
) {
  if (!accountId) {
    return;
  }

  void queryClient.invalidateQueries({
    queryKey: queryKeys.accounts.summary(accountId),
  });
}
