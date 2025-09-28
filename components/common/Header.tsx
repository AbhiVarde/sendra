import React, { useState, useEffect } from "react";
import { Box, Stack, Typography, IconButton } from "@mui/material";
import { Sun, Moon, Mail, LogOut, Github } from "lucide-react";

interface HeaderProps {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  isLoggedIn: boolean;
  onSignOut: () => void;
}

const Header: React.FC<HeaderProps> = ({
  darkMode,
  setDarkMode,
  isLoggedIn,
  onSignOut,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
      }}
    >
      {/* Announcement Bar */}
      <Box
        sx={{
          width: "100%",
          backgroundColor: darkMode ? "#000000" : "#FFFFFF",
          color: darkMode ? "#FFFFFF" : "#000000",
          borderBottom: `1px solid ${
            darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"
          }`,
          fontSize: { xs: "12px", sm: "14px" },
          overflow: "hidden",
          py: 0.5,
        }}
      >
        <Box
          sx={{
            display: "inline-block",
            whiteSpace: "nowrap",
            animation: "marquee 30s linear infinite",
            animationPlayState: paused ? "paused" : "running",
            "@keyframes marquee": {
              "0%": { transform: "translateX(100%)" },
              "100%": { transform: "translateX(-100%)" },
            },
          }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <Typography component="span" sx={{ mx: 4, fontSize: "inherit" }}>
            🚀{" "}
            <Box component="span" sx={{ fontWeight: 500 }}>
              Idea Tracker
            </Box>{" "}
            (Appwrite Project of the Month) →{" "}
            <a
              href="https://idea-tracker-v2.appwrite.network"
              target="_blank"
              rel="noopener noreferrer"
            >
              idea-tracker-v2.appwrite.network
            </a>
          </Typography>

          <Typography component="span" sx={{ mx: 4, fontSize: "inherit" }}>
            ⚡{" "}
            <Box component="span" sx={{ fontWeight: 500 }}>
              Sync UI
            </Box>{" "}
            (75+ GitHub stars, used in 70+ countries) →{" "}
            <a
              href="https://syncui.design"
              target="_blank"
              rel="noopener noreferrer"
            >
              syncui.design
            </a>
          </Typography>

          <Typography component="span" sx={{ mx: 4, fontSize: "inherit" }}>
            🧩{" "}
            <Box component="span" sx={{ fontWeight: 500 }}>
              ErrExplain
            </Box>{" "}
            (hackathon project with Vercel AI SDK + Appwrite) →{" "}
            <a
              href="https://errexplain.appwrite.network"
              target="_blank"
              rel="noopener noreferrer"
            >
              errexplain.appwrite.network
            </a>
          </Typography>
        </Box>
      </Box>

      {/* Main Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          px: 2,
          pt: 2,
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: 600,
            borderRadius: 4,
            px: 1.5,
            py: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            transition: "all 0.3s ease",
            backgroundColor: isScrolled
              ? darkMode
                ? "rgba(0, 0, 0, 0.8)"
                : "rgba(255, 255, 255, 0.8)"
              : darkMode
              ? "rgba(0, 0, 0, 0.6)"
              : "rgba(255, 255, 255, 0.6)",
            backdropFilter: "blur(16px)",
            border: `1px solid ${
              darkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)"
            }`,
            boxShadow: isScrolled
              ? darkMode
                ? "0 4px 20px rgba(0,0,0,0.4)"
                : "0 4px 20px rgba(0,0,0,0.1)"
              : "0 2px 10px rgba(0,0,0,0.05)",
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.2}>
            <Mail size={20} color={darkMode ? "#fff" : "#000"} />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 500,
                color: darkMode ? "#fff" : "#000",
              }}
            >
              Sendra
            </Typography>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={0.5}>
            <IconButton
              onClick={() => setDarkMode(!darkMode)}
              disableRipple
              sx={{
                color: darkMode ? "#fff" : "#000",
                width: 36,
                height: 36,
                borderRadius: "12px",
                "&:hover": {
                  backgroundColor: darkMode
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(0,0,0,0.08)",
                },
                "&:focus": { outline: "none" },
              }}
            >
              {darkMode ? <Sun size={14} /> : <Moon size={14} />}
            </IconButton>

            <IconButton
              component="a"
              href="https://github.com/AbhiVarde/sendra"
              target="_blank"
              rel="noopener noreferrer"
              disableRipple
              sx={{
                color: darkMode ? "#fff" : "#000",
                width: 36,
                height: 36,
                borderRadius: "12px",
                "&:hover": {
                  backgroundColor: darkMode
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(0,0,0,0.08)",
                },
                "&:focus": { outline: "none" },
              }}
            >
              <Github size={14} />
            </IconButton>

            {isLoggedIn && (
              <IconButton
                onClick={onSignOut}
                disableRipple
                sx={{
                  color: darkMode ? "#fff" : "#000",
                  width: 36,
                  height: 36,
                  borderRadius: "12px",
                  "&:hover": {
                    backgroundColor: darkMode
                      ? "rgba(255,255,255,0.1)"
                      : "rgba(0,0,0,0.08)",
                  },
                  "&:focus": { outline: "none" },
                }}
              >
                <LogOut size={14} />
              </IconButton>
            )}
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

export default Header;
