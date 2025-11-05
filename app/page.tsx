"use client";

import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import HeroSection from "@/components/main/HeroSection";
import Dashboard from "@/components/main/Dashboard";
import FeatureSection from "@/components/main/FeatureSection";
import PulsatingRing from "@/components/common/PulsatingRing";
import { Toaster } from "sonner";

export default function SendraApp() {
  const [darkMode, setDarkMode] = useState<boolean | null>(null);
  const { user, loading, loginWithGitHub, logout, isLoggedIn, initialized } =
    useAuth();
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    console.log(
      "%c                          .___              \n" +
        "  ______ ____   ____    __| _/___________   \n" +
        " /  ___// __ \\ /    \\  / __ |\\_  __ \\__  \\  \n" +
        " \\___ \\\\  ___/|   |  \\/ /_/ | |  | \\/ __ \\_\n" +
        "/____  >\\___  >___|  /\\____ | |__|  (____  /\n" +
        "     \\/     \\/     \\/      \\/            \\/\n",
      "color: #FFFFFF; font-family: monospace; font-size: 12px; font-weight: bold;"
    );

    console.log(
      "%c🤖 Sendra → Monitor your Appwrite Sites and Functions deployments\n" +
        "⚠️ Receive instant email notifications whenever a deployment fails\n" +
        "⚙️ Powered by Resend + Appwrite + Vercel AI SDK\n",
      "color: #FFFFFF; font-family: monospace; font-size: 12px;"
    );

    console.log(
      "%c👋 Hi, I'm Abhi Varde  Product & Frontend Engineer\n" +
        "🚀 Explore more open-source projects → https://github.com/AbhiVarde\n" +
        "🤍 If you like this project, drop a ⭐ and let me know!\n",
      "color: #FFFFFF; font-family: monospace; font-size: 12px; font-weight: bold;"
    );
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setDarkMode(savedTheme === "dark");
    } else {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (darkMode === null) return;
    if (darkMode) {
      document.documentElement.style.setProperty("--selection-bg", "#ffffff");
      document.documentElement.style.setProperty(
        "--selection-color",
        "#000000"
      );
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.style.setProperty("--selection-bg", "#000000");
      document.documentElement.style.setProperty(
        "--selection-color",
        "#ffffff"
      );
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  useEffect(() => {
    console.log("Auth state:", { user, loading, isLoggedIn, initialized });
  }, [user, loading, isLoggedIn, initialized]);

  const handleSignIn = async () => {
    try {
      await loginWithGitHub();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error(error);
    }
  };

  if (darkMode === null || !initialized || loading) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          backgroundColor: darkMode !== false ? "#000000" : "#FFFFFF",
          color: darkMode !== false ? "#FFFFFF" : "#000000",
        }}
      >
        <PulsatingRing />
      </Box>
    );
  }

  return (
    <>
      <Toaster
        theme={darkMode ? "dark" : "light"}
        position="bottom-center"
        richColors
        expand={false}
        visibleToasts={3}
        toastOptions={{
          style: {
            background: darkMode ? "#1c1c1c" : "#ffffff",
            color: darkMode ? "#ffffff" : "#000000",
            border: `1px solid ${
              darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"
            }`,
          },
        }}
      />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          backgroundColor: darkMode ? "#000000" : "#FFFFFF",
          color: darkMode ? "#FFFFFF" : "#000000",
        }}
      >
        <Header
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          isLoggedIn={isLoggedIn}
          onSignOut={handleSignOut}
          onLogoClick={isLoggedIn ? () => setShowForm(false) : undefined}
        />
        <Box sx={{ flexGrow: 1, pt: 12 }}>
          {!isLoggedIn ? (
            <>
              <HeroSection
                darkMode={darkMode}
                onSignIn={handleSignIn}
                loading={loading}
              />
              <FeatureSection darkMode={darkMode} />
            </>
          ) : (
            <Dashboard
              darkMode={darkMode}
              user={user}
              showFormProp={showForm}
              onToggleForm={setShowForm}
            />
          )}
        </Box>
        <Footer darkMode={darkMode} />
      </Box>
    </>
  );
}
