import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authClient } from "../lib/auth-client.js";

export const SESSION_QUERY_KEY = ["session"];

/**
 * Hook to retrieve current session and user data via TanStack Query
 */
export function useSession() {
  return useQuery({
    queryKey: SESSION_QUERY_KEY,
    queryFn: async () => {
      const res = await authClient.getSession();
      if (res?.error) {
        throw new Error(res.error.message || "Failed to fetch session");
      }
      return res?.data ?? null;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });
}

/**
 * Mutation hook for email & password login
 */
export function useSignIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ email, password }) => {
      const res = await authClient.signIn.email({
        email,
        password,
      });

      if (res?.error) {
        throw new Error(res.error.message || "Invalid email or password");
      }

      return res?.data;
    },
    onSuccess: async (data) => {
      if (data?.user) {
        queryClient.setQueryData(SESSION_QUERY_KEY, data);
      }
      await queryClient.refetchQueries({ queryKey: SESSION_QUERY_KEY });
    },
  });
}

/**
 * Mutation hook for user registration with name, email, and password
 */
export function useSignUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, email, password }) => {
      const res = await authClient.signUp.email({
        name,
        email,
        password,
      });

      if (res?.error) {
        throw new Error(res.error.message || "Failed to create account");
      }

      return res?.data;
    },
    onSuccess: async (data) => {
      if (data?.user) {
        queryClient.setQueryData(SESSION_QUERY_KEY, data);
      }
      await queryClient.refetchQueries({ queryKey: SESSION_QUERY_KEY });
    },
  });
}

/**
 * Mutation hook for OAuth social login (Google & Microsoft)
 */
export function useSocialSignIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ provider }) => {
      const callbackURL = `${window.location.origin}/dashboard`;
      const errorCallbackURL = `${window.location.origin}/login`;

      const res = await authClient.signIn.social({
        provider,
        callbackURL,
        newUserCallbackURL: callbackURL,
        errorCallbackURL,
      });

      if (res?.error) {
        throw new Error(res.error.message || `Failed to sign in with ${provider}`);
      }

      // If the client returns a URL rather than auto-redirecting
      if (res?.data?.url) {
        window.location.href = res.data.url;
      }

      return res?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY });
    },
  });
}

/**
 * Mutation hook for user sign out
 */
export function useSignOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await authClient.signOut();
      if (res?.error) {
        throw new Error(res.error.message || "Failed to sign out");
      }
      return res?.data;
    },
    onSuccess: () => {
      queryClient.setQueryData(SESSION_QUERY_KEY, null);
      queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY });
      queryClient.clear();
    },
  });
}
