import { getAccountSummary } from "@/api/accounts";
import { queryKeys } from "@/api/queryKeys";
import { useQuery } from "@tanstack/react-query";

export function useAccountSummary(accountId?: string) {
  return useQuery({
    queryKey: accountId
      ? queryKeys.accounts.summary(accountId)
      : ["accounts", "summary", "missing"],
    queryFn: ({ signal }) => getAccountSummary(accountId ?? "", signal),
    enabled: Boolean(accountId),
  });
}
