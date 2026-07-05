// Shared API types for the template app (auth, profile, settings, notifications).

export type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data: T;
  errors?: Record<string, string[] | string>;
  detail?: string | string[];
};

export type ApiFieldErrors = Record<string, string[]>;

// --- Profile & accounts ---

export type UserProfile = {
  id: string;
  display_name?: string | null;
  username?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  avatar?: string | null;
};

export type PublicAccountSummary = {
  id: string;
  display_name: string;
  username?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  is_me?: boolean;
};

export type UpdateProfilePayload = {
  display_name?: string | null;
  username?: string | null;
  bio?: string | null;
  avatar_file_id?: number | string | null;
};

export type FileUpload = {
  id: number | string;
  url: string;
  key?: string | null;
  alt_text?: string | null;
  original_filename?: string | null;
  content_type?: string | null;
  file_size?: number | null;
  purpose?: string | null;
  status?: string | null;
  filename?: string | null;
  mime_type?: string | null;
  size?: number | null;
};

// --- Auth ---

export type AuthUser = {
  id: string;
  email: string;
  full_name: string;
  display_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  role?: string | null;
  status?: string | null;
  avatar?: string | null;
  profile?: UserProfile | null;
};

export type AuthTokens = {
  access?: string;
  refresh?: string | null;
  access_token?: string;
  refresh_token?: string | null;
};

export type LoginResponse = AuthTokens & {
  user: AuthUser;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  email: string;
  password: string;
  full_name: string;
  ip_address?: string;
};

export type VerificationOtpPayload = {
  email: string;
  otp_code: string;
};

export type ResetPasswordOtpVerifyPayload = {
  email: string;
  otp_code: string;
};

export type ChangePasswordPayload = {
  old_password: string;
  new_password: string;
  confirm_password: string;
};

// --- Settings ---

export type ProfileVisibility = "public" | "private";
export type DmPrivacy = "everyone" | "followers_only" | "nobody";

/** Shape returned by GET /settings — extra fields may come from the backend. */
export type AccountSettings = {
  profile_visibility?: ProfileVisibility;
  dm_privacy?: DmPrivacy;
  push_enabled: boolean;
  notify_account_followed: boolean;
  notify_pet_owner_added?: boolean;
  notify_post_liked?: boolean;
  notify_post_commented?: boolean;
  notify_pet_subscribed?: boolean;
  notify_direct_message?: boolean;
  notify_user_tagged?: boolean;
  updated_at: string | null;
};

export type UpdateAccountSettingsPayload = Partial<
  Pick<
    AccountSettings,
    | "profile_visibility"
    | "dm_privacy"
    | "push_enabled"
    | "notify_account_followed"
    | "notify_pet_owner_added"
    | "notify_post_liked"
    | "notify_post_commented"
    | "notify_pet_subscribed"
    | "notify_direct_message"
    | "notify_user_tagged"
  >
>;

export type DeleteAccountPayload = {
  otp_code: string;
};

// --- HTTP client ---

export type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  path: string;
  body?: unknown;
  auth?: boolean;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

export type UploadRequestOptions = Omit<RequestOptions, "body" | "headers"> & {
  body: FormData;
  headers?: Record<string, string>;
};

// --- Pagination ---

export type PaginationMeta = {
  page: number;
  page_size: number;
  has_next: boolean;
  has_previous?: boolean;
  total_items?: number | null;
  total_pages?: number | null;
  next_page?: number | null;
  previous_page?: number | null;
};

export type PaginatedResponse<T> = {
  items: T[];
  meta: PaginationMeta;
};

// --- Notifications ---

export type NotificationType =
  | "account_followed"
  | "info"
  | "success"
  | "warning"
  | "error"
  | "system"
  | string;

export type NotificationMetadata = {
  actor_account_id?: string | null;
  account_id?: string | null;
  event_type?: string | null;
  [key: string]: string | number | boolean | null | undefined;
};

export type NotificationEntityRef = {
  id: string;
  type?: string | null;
};

export type NotificationSummary = {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  actor_id?: string | null;
  actor_account_id?: string | null;
  channel?: string | null;
  action_url?: string | null;
  created_at: string;
  updated_at?: string | null;
  sent_at?: string | null;
  read_at?: string | null;
  sequence_id?: number | null;
  metadata?: NotificationMetadata | null;
  entity?: NotificationEntityRef | null;
};

export type MarkNotificationReadResponse = NotificationSummary;

export type PushDevicePlatform = "ios" | "android";

export type PushDeviceTokenPayload = {
  token: string;
  platform: PushDevicePlatform;
};

export type PushDeviceTokenRecord = {
  id: string;
  token: string;
  platform: PushDevicePlatform;
  created_at?: string | null;
  updated_at?: string | null;
};

export type NotificationStreamPayload = {
  sequence?: number;
  sequence_id?: number;
  notification?: NotificationSummary | null;
  type?: string;
  heartbeat?: boolean;
};
