import { useState, useEffect } from "react";
import { authService, User } from "@/lib/auth";
import { toast } from "sonner";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const init = async () => {
    if (initialized) return;

    try {
      setLoading(true);
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);

      if (currentUser) {
        toast.success(`Welcome back, ${currentUser.name}!`);
      }
    } catch (error) {
      console.error("Auth init error:", error);
      setUser(null);
      toast.error("Failed to initialize authentication");
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  };

  const loginWithGitHub = async () => {
    try {
      toast.loading("Signing in with GitHub...", { id: "auth-loading" });
      await authService.loginWithGitHub();
    } catch (error) {
      console.error("Login error:", error);
      toast.dismiss("auth-loading");
      toast.error("Failed to sign in with GitHub. Please try again.");
      throw error;
    }
  };

  const logout = async () => {
    try {
      toast.loading("Signing out...", { id: "logout-loading" });

      setUser(null);

      await authService.logout();

      toast.dismiss("logout-loading");
      toast.success("Signed out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      toast.dismiss("logout-loading");
      toast.error("Failed to sign out. Please try again.");

      setUser(null);
    }
  };

  // Handle OAuth callback
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const userId = params.get("userId");
      const secret = params.get("secret");

      if (userId && secret) {
        try {
          setLoading(true);
          toast.dismiss("auth-loading");
          toast.loading("Completing sign in...", { id: "oauth-callback" });

          const user = await authService.handleOAuthCallback(userId, secret);
          setUser(user);

          // Clean up URL
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );

          toast.dismiss("oauth-callback");
          toast.success(`Welcome, ${user.name}! You're now signed in.`);
        } catch (error) {
          console.error("OAuth callback failed:", error);
          toast.dismiss("oauth-callback");
          toast.error("Sign in failed. Please try again.");
          setUser(null);
        } finally {
          setLoading(false);
        }
      }
    };

    if (initialized && !loading) {
      handleOAuthCallback();
    }
  }, [initialized, loading]);

  useEffect(() => {
    const recheckAuth = async () => {
      // Only recheck if we think we should be authenticated but user is null
      const params = new URLSearchParams(window.location.search);
      const hasOAuthParams = params.get("userId") && params.get("secret");

      if (hasOAuthParams && initialized && !loading && !user) {
        console.log("Rechecking authentication after OAuth callback...");
        try {
          const currentUser = await authService.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
            toast.success(
              `Authentication successful! Welcome, ${currentUser.name}!`
            );
          } else {
            toast.error("Authentication failed. Please try signing in again.");
          }
        } catch (error) {
          console.error("Recheck auth error:", error);
          toast.error(
            "Authentication verification failed. Please try signing in again."
          );
        }
      }
    };

    const timer = setTimeout(recheckAuth, 1000);
    return () => clearTimeout(timer);
  }, [initialized, loading, user]);

  useEffect(() => {
    init();
  }, []);

  return {
    user,
    loading,
    initialized,
    loginWithGitHub,
    logout,
    isLoggedIn: !!user,
  };
}
