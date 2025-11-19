import React, { useState, useEffect } from "react";
import { Box, Stack, Typography, IconButton } from "@mui/material";
import { Sun, Moon, Mail, LogOut, Github, BookOpen } from "lucide-react";
import { useMotionValue, animate, motion } from "framer-motion";
import useMeasure from "react-use-measure";

interface HeaderProps {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  isLoggedIn: boolean;
  onSignOut: () => void;
  onLogoClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  darkMode,
  setDarkMode,
  isLoggedIn,
  onSignOut,
  onLogoClick,
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
    const contentSize = width;
    const from = 0;
    const to = -contentSize / 2;
    const distance = Math.abs(to - from);
    const duration = distance / currentSpeed;

    if (isTransitioning) {
      const remaining = Math.abs(translation.get() - to);
      const remainingDuration = remaining / currentSpeed;
      controls = animate(translation, [translation.get(), to], {
        ease: "linear",
        duration: remainingDuration,
        onComplete: () => {
          setIsTransitioning(false);
          setKey((k) => k + 1);
        },
      });
    } else {
      controls = animate(translation, [from, to], {
        ease: "linear",
        duration,
        repeat: Infinity,
        repeatType: "loop",
        onRepeat: () => translation.set(from),
      });
    }

    return controls?.stop;
  }, [key, translation, currentSpeed, width, isTransitioning]);

  const textStyle = {
    mx: { xs: 1.2, sm: 2, md: 3 },
    fontSize: { xs: "11px", sm: "12px", md: "13px", lg: "14px" },
    whiteSpace: "nowrap" as const,
    lineHeight: 1.6,
    display: "inline-flex",
    alignItems: "center",
  };

  const linkStyle = {
    marginLeft: "6px",
  };

  const announcements = (
    <>
      <Typography component="span" sx={textStyle}>
        ⚡{" "}
        <Box component="span" sx={{ fontWeight: 500, mx: 0.4 }}>
          Sync UI
        </Box>
        (85+ GitHub stars, used in 90+ countries) →
        <a
          href="https://syncui.design"
          target="_blank"
          rel="noopener noreferrer"
          style={linkStyle}
        >
          syncui.design
        </a>
      </Typography>

      <Typography component="span" sx={textStyle}>
        🚀{" "}
        <Box component="span" sx={{ fontWeight: 500, mx: 0.4 }}>
          Idea Tracker
        </Box>
        (Appwrite Project of the Month) →
        <a
          href="https://idea-tracker-v2.appwrite.network"
          target="_blank"
          rel="noopener noreferrer"
          style={linkStyle}
        >
          idea-tracker-v2.appwrite.network
        </a>
      </Typography>

      <Typography component="span" sx={textStyle}>
        🧩{" "}
        <Box component="span" sx={{ fontWeight: 500, mx: 0.4 }}>
          ErrExplain
        </Box>
        (Hackathon project with Vercel AI SDK + Appwrite) →
        <a
          href="https://errexplain.appwrite.network"
          target="_blank"
          rel="noopener noreferrer"
          style={linkStyle}
        >
          errexplain.appwrite.network
        </a>
      </Typography>
    </>
  );

  return (
    <Box sx={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000 }}>
      <Box
        sx={{
          width: "100%",
          backgroundColor: darkMode ? "#000" : "#fff",
          color: darkMode ? "#fff" : "#000",
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
          <Box sx={{ display: "inline-flex" }}>{announcements}</Box>
          <Box sx={{ display: "inline-flex" }}>{announcements}</Box>
        </motion.div>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "center", px: 2, pt: 2 }}>
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
          <Stack
            direction="row"
            alignItems="center"
            spacing={1.2}
            onClick={onLogoClick}
            sx={{
              cursor: onLogoClick ? "pointer" : "default",
              "&:hover": onLogoClick ? { opacity: 0.8 } : {},
            }}
          >
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
              component="a"
              href="https://dev.to/abhivarde/sendra-monitoring-appwrite-sites-deployments-with-nextjs-vercel-resend-5g3g"
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
              }}
              title="Read ErrExplain Blog"
            >
              <BookOpen size={14} />
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
              }}
            >
              <Github size={14} />
            </IconButton>

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
              }}
            >
              {darkMode ? <Sun size={14} /> : <Moon size={14} />}
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
