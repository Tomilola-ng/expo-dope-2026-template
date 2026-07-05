import { getMyProfile } from "@/api/profile";
import { queryKeys } from "@/api/queryKeys";
import { useQuery } from "@tanstack/react-query";

export function useProfile() {
  return useQuery({
    queryKey: queryKeys.profile.me,
    queryFn: ({ signal }) => getMyProfile(signal),
  });
}
