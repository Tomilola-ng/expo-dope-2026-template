import { queryKeys } from "@/api/queryKeys";
import { ApiError } from "@/api/errors";
import {
  getCurrentUser,
  login as loginRequest,
  loginWithAppleToken as loginWithAppleTokenRequest,
  loginWithGoogleToken as loginWithGoogleTokenRequest,
  logoutRequest,
  register as registerRequest,
} from "@/api/auth";
import type {
  AuthUser,
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  UserProfile,
} from "@/api/types";
import type { AppleTokenPayload } from "@/features/auth/apple-sign-in";
import type { GoogleTokenPayload } from "@/features/auth/google-sign-in";
import { setUnauthorizedHandler } from "@/api/client";
import { unregisterPushDeviceToken } from "@/services/push-token-lifecycle";
import {
  clearTokens,
  getStoredTokens,
  saveTokens,
} from "@/services/secure-storage";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type AuthStatus = "initializing" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  status: AuthStatus;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  authNotice: string | null;
  login: (payload: LoginPayload) => Promise<void>;
  loginWithApple: (payload: AppleTokenPayload) => Promise<LoginResponse>;
  loginWithGoogle: (payload: GoogleTokenPayload) => Promise<LoginResponse>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  signOut: (notice?: string) => Promise<void>;
  endSession: (notice?: string) => Promise<void>;
  clearAuthNotice: () => void;
  updateUserProfile: (profile: UserProfile) => void;
  refreshCurrentUser: () => Promise<AuthUser | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const LOGOUT_REQUEST_TIMEOUT_MS = 8000;
const HYDRATE_REQUEST_TIMEOUT_MS = 8000;

function withTimeout<T>(promise: Promise<T>, timeoutMs: number) {
  return new Promise<T>((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error("auth_hydration_timeout")),
      timeoutMs,
    );
    promise.then(
      (value) => {
        clearTimeout(timeout);
        resolve(value);
      },
      (error) => {
        clearTimeout(timeout);
        reject(error);
      },
    );
  });
}

function isTransientAuthError(error: unknown) {
  return (
    error instanceof ApiError &&
    (error.code === "network" || error.code === "config" || error.status === 0)
  );
}

function isInvalidSessionError(error: unknown) {
  if (error instanceof ApiError) {
    if (isTransientAuthError(error)) return false;
    return (
      error.status === 401 ||
      error.apiCode === "invalid_token" ||
      /invalid token|token expired|session expired or revoked/i.test(error.message)
    );
  }

  if (error && typeof error === "object") {
    const status =
      "status" in error && typeof error.status === "number"
        ? error.status
        : undefined;
    const code =
      "code" in error && typeof error.code === "string"
        ? error.code
        : undefined;
    const apiCode =
      "apiCode" in error && typeof error.apiCode === "string"
        ? error.apiCode
        : undefined;
    const message =
      "message" in error && typeof error.message === "string"
        ? error.message
        : "";

    return (
      status === 401 ||
      apiCode === "invalid_token" ||
      code === "invalid_token" ||
      /invalid token|token expired|session expired or revoked/i.test(message)
    );
  }

  return false;
}

function isQueryCancellation(error: unknown) {
  return error instanceof Error && error.name === "CancelledError";
}

async function revokeSessionOnServer() {
  try {
    await Promise.race([
      logoutRequest(),
      new Promise<never>((_, reject) => {
        setTimeout(
          () => reject(new Error("Logout request timed out.")),
          LOGOUT_REQUEST_TIMEOUT_MS,
        );
      }),
    ]);
  } catch {
    // Local sign-out still succeeds when server logout fails or times out.
  }
}

export function AuthProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<AuthStatus>("initializing");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authNotice, setAuthNotice] = useState<string | null>(null);
  const statusRef = useRef<AuthStatus>("initializing");

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const clearSession = useCallback(
    async (notice?: string, options?: { navigate?: boolean }) => {
      setUser(null);
      setStatus("unauthenticated");
      setAuthNotice(notice ?? null);
      queryClient.clear();

      try {
        await clearTokens();
      } catch {
        // Continue even if secure storage cleanup fails.
      }

      void unregisterPushDeviceToken();
      void import("@/services/revenuecat").then(({ logoutRevenueCatUser }) =>
        logoutRevenueCatUser(),
      );

      if (options?.navigate) {
        router.replace({
          pathname: "/(public)/login",
          params: notice ? { signedOut: "1" } : {},
        });
      }
    },
    [queryClient],
  );

  const signOut = useCallback(
    async (notice?: string) => {
      const hadSession =
        statusRef.current === "authenticated" ||
        Boolean(await getStoredTokens().then(({ accessToken }) => accessToken));

      if (hadSession) {
        void revokeSessionOnServer();
      }

      await clearSession(notice, { navigate: true });
    },
    [clearSession],
  );

  const hydrateSession = useCallback(async () => {
    try {
      const { accessToken } = await getStoredTokens();

      if (!accessToken) {
        setStatus("unauthenticated");
        return;
      }

      // A stored access token is enough to unblock routing. Validation happens
      // immediately, but a slow/offline backend must not turn a cold start into
      // a logout.
      setStatus("authenticated");
      try {
        const currentUser = await withTimeout(
          queryClient.fetchQuery({
            queryKey: queryKeys.auth.me,
            queryFn: getCurrentUser,
          }),
          HYDRATE_REQUEST_TIMEOUT_MS,
        );
        setUser(currentUser);
      } catch (error) {
        if (isInvalidSessionError(error)) {
          await clearSession("Your session expired. Please log in again.", {
            navigate: true,
          });
          return;
        }
        if (__DEV__) console.warn("Auth validation deferred", error);
      }
    } catch (error) {
      if (isQueryCancellation(error)) {
        const { accessToken } = await getStoredTokens();
        setStatus(accessToken ? "authenticated" : "unauthenticated");
        return;
      }

      if (isInvalidSessionError(error)) {
        await clearSession("Your session expired. Please log in again.", {
          navigate: true,
        });
        return;
      }

      const { accessToken } = await getStoredTokens();
      if (accessToken) {
        setStatus("authenticated");
        if (__DEV__) console.warn("Auth hydration deferred", error);
        return;
      }

      if (__DEV__) {
        console.error("Auth hydration failed", error);
      }
      setStatus("unauthenticated");
    }
  }, [clearSession, queryClient]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      void hydrateSession();
    }, 0);

    return () => clearTimeout(timeout);
  }, [hydrateSession]);

  useEffect(() => {
    setUnauthorizedHandler(async () => {
      await signOut("Your session expired. Please log in again.");
    });
  }, [signOut]);

  const applyAuthenticatedSession = useCallback(
    async (response: LoginResponse) => {
      await saveTokens(
        response.access || response.access_token || "",
        response.refresh || response.refresh_token,
      );
      queryClient.setQueryData(queryKeys.auth.me, response.user);
      setUser(response.user);
      setStatus("authenticated");
      setAuthNotice(null);
    },
    [queryClient],
  );

  const login = useCallback(
    async (payload: LoginPayload) => {
      const response = await loginRequest(payload);
      await applyAuthenticatedSession(response);
    },
    [applyAuthenticatedSession],
  );

  const loginWithApple = useCallback(
    async (payload: AppleTokenPayload) => {
      const response = await loginWithAppleTokenRequest(payload);
      await applyAuthenticatedSession(response);
      return response;
    },
    [applyAuthenticatedSession],
  );

  const loginWithGoogle = useCallback(
    async (payload: GoogleTokenPayload) => {
      const response = await loginWithGoogleTokenRequest(payload);
      await applyAuthenticatedSession(response);
      return response;
    },
    [applyAuthenticatedSession],
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      await registerRequest(payload);

      await clearTokens();
      queryClient.removeQueries({ queryKey: queryKeys.auth.me });
      setUser(null);
      setStatus("unauthenticated");
      setAuthNotice(null);
    },
    [queryClient],
  );

  const logout = useCallback(async () => {
    await signOut();
  }, [signOut]);

  const refreshCurrentUser = useCallback(async () => {
    try {
      const currentUser = await queryClient.fetchQuery({
        queryKey: queryKeys.auth.me,
        queryFn: getCurrentUser,
      });

      setUser(currentUser);
      setStatus("authenticated");
      return currentUser;
    } catch (error) {
      if (isTransientAuthError(error)) throw error;
      if (isInvalidSessionError(error)) {
        await signOut("Your session expired. Please log in again.");
        return null;
      }

      throw error;
    }
  }, [queryClient, signOut]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      isAuthenticated: status === "authenticated",
      isInitializing: status === "initializing",
      authNotice,
      login,
      loginWithApple,
      loginWithGoogle,
      register,
      logout,
      signOut,
      endSession: (notice?: string) => signOut(notice),
      clearAuthNotice: () => setAuthNotice(null),
      updateUserProfile: (profile) =>
        setUser((currentUser) =>
          currentUser
            ? {
                ...currentUser,
                profile,
              }
            : currentUser,
        ),
      refreshCurrentUser,
    }),
    [
      authNotice,
      login,
      loginWithApple,
      loginWithGoogle,
      logout,
      refreshCurrentUser,
      register,
      signOut,
      status,
      user,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
}
