import { useState, useEffect } from "react";
import { authService, User } from "@/lib/auth";

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
    } catch (error) {
      console.error("Auth init error:", error);
      setUser(null);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  };

  const loginWithGitHub = async () => {
    try {
      await authService.loginWithGitHub();
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
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
          const user = await authService.handleOAuthCallback(userId, secret);
          setUser(user);

          // Clean up URL
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
        } catch (error) {
          console.error("OAuth callback failed:", error);
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
