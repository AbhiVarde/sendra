import React, { useState, useEffect } from "react";
import { Box, Stack, Typography, IconButton } from "@mui/material";
import { Sun, Moon, Mail, LogOut, Github } from "lucide-react";
import { useMotionValue, animate, motion } from "framer-motion";
import useMeasure from "react-use-measure";

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
  const [currentSpeed, setCurrentSpeed] = useState(50);
  const [ref, { width }] = useMeasure();
  const translation = useMotionValue(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    let controls;
    const gap = 0;
    const contentSize = width + gap;
    const from = 0;
    const to = -contentSize / 2;
    const distanceToTravel = Math.abs(to - from);
    const duration = distanceToTravel / currentSpeed;

    if (isTransitioning) {
      const remainingDistance = Math.abs(translation.get() - to);
      const transitionDuration = remainingDistance / currentSpeed;
      controls = animate(translation, [translation.get(), to], {
        ease: "linear",
        duration: transitionDuration,
        onComplete: () => {
          setIsTransitioning(false);
          setKey((prevKey) => prevKey + 1);
        },
      });
    } else {
      controls = animate(translation, [from, to], {
        ease: "linear",
        duration: duration,
        repeat: Infinity,
        repeatType: "loop",
        repeatDelay: 0,
        onRepeat: () => {
          translation.set(from);
        },
      });
    }

    return controls?.stop;
  }, [key, translation, currentSpeed, width, isTransitioning]);

  const announcements = (
    <>
      <Typography
        component="span"
        sx={{
          mx: { xs: 2, sm: 3, md: 4 },
          fontSize: { xs: "11px", sm: "12px", md: "13px", lg: "14px" },
        }}
      >
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

      <Typography
        component="span"
        sx={{
          mx: { xs: 2, sm: 3, md: 4 },
          fontSize: { xs: "11px", sm: "12px", md: "13px", lg: "14px" },
        }}
      >
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

      <Typography
        component="span"
        sx={{
          mx: { xs: 2, sm: 3, md: 4 },
          fontSize: { xs: "11px", sm: "12px", md: "13px", lg: "14px" },
        }}
      >
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
    </>
  );

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
          fontSize: { xs: "11px", sm: "12px", md: "13px", lg: "14px" },
          overflow: "hidden",
          py: 0.5,
        }}
      >
        <motion.div
          style={{
            x: translation,
            display: "flex",
            width: "max-content",
            gap: 0,
          }}
          ref={ref}
          onHoverStart={() => {
            setIsTransitioning(true);
            setCurrentSpeed(20);
          }}
          onHoverEnd={() => {
            setIsTransitioning(true);
            setCurrentSpeed(50);
          }}
        >
          <Box sx={{ whiteSpace: "nowrap", display: "inline-block" }}>
            {announcements}
          </Box>
          <Box sx={{ whiteSpace: "nowrap", display: "inline-block" }}>
            {announcements}
          </Box>
        </motion.div>
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
