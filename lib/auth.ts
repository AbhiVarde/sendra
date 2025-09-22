import { account } from "./appwrite";
import { OAuthProvider } from "appwrite";

export interface User {
  $id: string;
  name: string;
  email: string;
  prefs: {
    authMethod?: string;
  };
}

export class AuthService {
  async getCurrentUser(): Promise<User | null> {
    try {
      return await account.get();
    } catch {
      return null;
    }
  }

  async loginWithGitHub(): Promise<void> {
    try {
      await account.createOAuth2Session(
        OAuthProvider.Github,
        `${window.location.origin}/`,
        `${window.location.origin}/`
      );
    } catch (error) {
      console.error("GitHub login error:", error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await account.deleteSession("current");
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  async handleOAuthCallback(userId: string, secret: string): Promise<User> {
    try {
      await account.createSession(userId, secret);
      const user = await account.get();

      // Mark as OAuth user
      await account.updatePrefs({
        ...user.prefs,
        authMethod: "github",
      });

      return await account.get();
    } catch (error) {
      console.error("OAuth callback error:", error);
      throw error;
    }
  }
}

export const authService = new AuthService();
