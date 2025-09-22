import React, { useState, useEffect } from "react";
import { Box, Stack, Typography, IconButton } from "@mui/material";
import { Sun, Moon, Mail, LogOut } from "lucide-react";

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

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <Box
      sx={{
        position: "fixed",
        top: 16,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1000,
        width: "calc(100% - 32px)",
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
            ? "rgba(0, 0, 0, 0.1)"
            : "rgba(255, 255, 255, 0.1)"
          : darkMode
          ? "rgba(0, 0, 0, 0.1)"
          : "rgba(255, 255, 255, 0.1)",
        backdropFilter: isScrolled ? "blur(16px)" : "none",
        border: `1px solid ${
          darkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.06)"
        }`,
        boxShadow: isScrolled
          ? darkMode
            ? "0 4px 20px rgba(0,0,0,0.4)"
            : "0 4px 20px rgba(0,0,0,0.1)"
          : "none",
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1.2}>
        <Box
          sx={{
            width: 28,
            height: 28,
            backgroundColor: darkMode ? "#fff" : "#000",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Mail size={16} color={darkMode ? "#000" : "#fff"} />
        </Box>
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
  );
};

export default Header;
