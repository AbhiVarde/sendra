"use client";

import React, { useState } from "react";
import { Box } from "@mui/material";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import HeroSection from "@/components/main/HeroSection";
import Dashboard from "@/components/main/Dashboard";

export default function SendraApp() {
  const [darkMode, setDarkMode] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleSignIn = () => setIsLoggedIn(true);
  const handleSignOut = () => setIsLoggedIn(false);

  return (
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
          <HeroSection darkMode={darkMode} onSignIn={handleSignIn} />
        ) : (
          <Dashboard darkMode={darkMode} />
        )}
      </Box>

      <Footer darkMode={darkMode} />
    </Box>
  );
}
