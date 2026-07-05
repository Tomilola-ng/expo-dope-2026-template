import {
  getNotifications,
  getNotificationsPreview,
  markNotificationAsRead,
} from "@/api/notifications";
import { queryKeys } from "@/api/queryKeys";
import { useAppAlert } from "@/providers/AlertProvider";
import {
  markNotificationReadInCache,
  upsertNotificationInCache,
} from "@/utils/notification-cache";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const DEFAULT_PAGE_SIZE = 20;

export function useNotificationsPreview() {
  return useQuery({
    queryKey: queryKeys.notifications.preview,
    queryFn: ({ signal }) => getNotificationsPreview(signal),
    staleTime: 1000 * 30,
  });
}

export function useNotificationsList(pageSize = DEFAULT_PAGE_SIZE, unreadOnly = false) {
  return useInfiniteQuery({
    queryKey: queryKeys.notifications.list({ pageSize, unreadOnly }),
    queryFn: ({ pageParam, signal }) =>
      getNotifications({ page: pageParam, pageSize, unreadOnly }, signal),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.has_next ? lastPage.meta.page + 1 : undefined,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  const { showAlert } = useAppAlert();

  return useMutation({
    mutationFn: (notificationId: string) => markNotificationAsRead(notificationId),
    onMutate: async (notificationId) => {
      markNotificationReadInCache(queryClient, notificationId);
      return { notificationId };
    },
    onError: (error, notificationId) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.preview });
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
      showAlert({
        title: "Notification not updated",
        message:
          error instanceof Error
            ? error.message
            : `We could not mark notification ${notificationId} as read.`,
      });
    },
    onSuccess: (updatedNotification) => {
      upsertNotificationInCache(queryClient, updatedNotification);
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.preview });
    },
  });
}
