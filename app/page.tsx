"use client";

import React, { useState } from "react";
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
  const [darkMode, setDarkMode] = useState(true);
  const { user, loading, loginWithGitHub, logout, isLoggedIn } = useAuth();

  const handleSignIn = async () => {
    try {
      await loginWithGitHub();
    } catch (error) {
      console.error("Sign in failed:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  // Show loading while initializing
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          backgroundColor: darkMode ? "#000000" : "#FFFFFF",
          color: darkMode ? "#FFFFFF" : "#000000",
        }}
      >
        <PulsatingRing />
      </Box>
    );
  }

  return (
    <>
      {/* Sonner Toaster */}
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
        />

        <Box sx={{ flexGrow: 1, pt: 10 }}>
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
            <Dashboard darkMode={darkMode} user={user} />
          )}
        </Box>

        <Footer darkMode={darkMode} />
      </Box>
    </>
  );
}
