"use client";

import React from "react";
import { Box, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  const router = useRouter();
  const [darkMode, setDarkMode] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    setDarkMode(savedTheme === "dark");
  }, []);

  if (darkMode === null) {
    return null;
  }

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: darkMode ? "#000000" : "#FFFFFF",
        color: darkMode ? "#FFFFFF" : "#000000",
        px: 2,
      }}
    >
      <Box
        sx={{
          maxWidth: "480px",
          textAlign: "center",
        }}
      >
        <Typography
          sx={{
            fontSize: { xs: "48px", sm: "64px" },
            fontWeight: 600,
            mb: 2,
            letterSpacing: "-0.02em",
          }}
        >
          404
        </Typography>

        <Typography
          sx={{
            fontSize: { xs: "18px", sm: "20px" },
            fontWeight: 500,
            mb: 1.5,
            letterSpacing: "-0.01em",
          }}
        >
          Deployment not found
        </Typography>

        <Typography
          sx={{
            fontSize: "15px",
            opacity: 0.5,
            mb: 4,
            lineHeight: 1.6,
          }}
        >
          This page went offline!
          <br /> No alerts sent... probably because it never existed.
        </Typography>

        <button
          onClick={() => router.push("/")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 20px",
            backgroundColor: "transparent",
            color: darkMode ? "#FFFFFF" : "#000000",
            border: `1px solid ${
              darkMode ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)"
            }`,
            borderRadius: "24px",
            fontSize: "14px",
            fontWeight: 500,
            cursor: "pointer",
            transition: "border-color 0.2s",
            outline: "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = darkMode
              ? "rgba(255,255,255,0.3)"
              : "rgba(0,0,0,0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = darkMode
              ? "rgba(255,255,255,0.15)"
              : "rgba(0,0,0,0.15)";
          }}
          onFocus={(e) => {
            e.currentTarget.style.outline = "none";
          }}
        >
          <ArrowLeft size={16} />
          Back to dashboard
        </button>
      </Box>
    </Box>
  );
}
