import React from "react";
import { Box, Stack, Typography, Link, Divider } from "@mui/material";
import { X } from "lucide-react";

interface FooterProps {
  darkMode: boolean;
}

const Footer: React.FC<FooterProps> = ({ darkMode }) => {
  return (
    <Box
      component="footer"
      sx={{
        width: "100%",
        py: { xs: 4, sm: 6 },
        mt: 6,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 700, px: { xs: 2, sm: 3 } }}>
        {/* Custom gradient divider */}
        <Box
          sx={{
            width: "100%",
            maxWidth: 800,
            height: "0.5px",
            mx: "auto",
            mb: 3,
            background: darkMode
              ? "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 20%, rgba(255,255,255,0.6) 40%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0.6) 60%, rgba(255,255,255,0.1) 80%, transparent 100%)"
              : "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.05) 20%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.05) 80%, transparent 100%)",
          }}
        />

        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "center", sm: "center" }}
          spacing={{ xs: 2, sm: 1 }}
          mb={2}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{
              flexWrap: "wrap",
              justifyContent: { xs: "center", sm: "flex-start" },
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: darkMode ? "#fff" : "rgba(0,0,0,0.6)",
                fontSize: "13px",
                fontWeight: 400,
              }}
            >
              Powered by
            </Typography>

            <Stack
              direction="row"
              alignItems="center"
              spacing={0.5}
              sx={{ flexWrap: "wrap" }}
            >
              <Link
                href="https://appwrite.io"
                target="_blank"
                rel="noopener"
                underline="none"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  color: darkMode ? "#fff" : "rgba(0,0,0,0.8)",
                  fontSize: "13px",
                  fontWeight: 500,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    color: darkMode ? "#fff" : "#000",
                    transform: "translateY(-1px)",
                  },
                }}
              >
                <Box
                  component="img"
                  src="https://appwrite.io/images/logos/logo.svg"
                  alt="Appwrite"
                  sx={{
                    height: 16,
                    width: "auto",
                    filter: "none",
                  }}
                />
                Appwrite
              </Link>

              <X
                size={12}
                color={darkMode ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)"}
              />

              <Link
                href="https://resend.com"
                target="_blank"
                rel="noopener"
                underline="none"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  color: darkMode ? "#fff" : "rgba(0,0,0,0.8)",
                  fontSize: "13px",
                  fontWeight: 500,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    color: darkMode ? "#fff" : "#000",
                    transform: "translateY(-1px)",
                  },
                }}
              >
                <Box
                  component="img"
                  src="https://resend.com/static/favicons/favicon.ico?v=1"
                  alt="Resend"
                  sx={{ height: 16, width: 16, borderRadius: "2px" }}
                />
                Resend
              </Link>
            </Stack>
          </Stack>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems="center"
            spacing={0.5}
            sx={{ textAlign: { xs: "center", sm: "right" }, fontSize: "12px" }}
          >
            <Typography
              variant="body2"
              sx={{
                color: darkMode ? "#fff" : "rgba(0,0,0,0.6)",
                fontSize: "12px",
                fontWeight: 400,
                whiteSpace: "nowrap",
              }}
            >
              Built by{" "}
              <Link
                href="https://abhivarde.in"
                target="_blank"
                rel="noopener"
                underline="none"
                sx={{
                  color: darkMode ? "#fff" : "rgba(0,0,0,0.8)",
                  fontWeight: 500,
                  "&:hover": { color: darkMode ? "#fff" : "#000" },
                }}
              >
                Abhi Varde
              </Link>
            </Typography>

            <Box
              sx={{
                display: { xs: "none", sm: "block" },
                color: darkMode ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)",
                fontSize: "12px",
              }}
            >
              •
            </Box>

            <Link
              href="https://github.com/AbhiVarde/sendra"
              target="_blank"
              rel="noopener"
              underline="none"
              sx={{
                color: darkMode ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)",
                fontSize: "12px",
                fontWeight: 400,
                "&:hover": {
                  color: darkMode ? "#fff" : "rgba(0,0,0,0.8)",
                },
                whiteSpace: "nowrap",
              }}
            >
              Source code on GitHub
            </Link>
          </Stack>
        </Stack>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "center", sm: "center" }}
          spacing={{ xs: 1, sm: 0 }}
          mt={2}
        >
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Typography
              variant="body2"
              sx={{
                color: darkMode ? "#fff" : "rgba(0,0,0,0.6)",
                fontSize: "12px",
                fontWeight: 400,
              }}
            >
              Deployed by
            </Typography>
            <Link
              href="https://vercel.com"
              target="_blank"
              rel="noopener"
              underline="none"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                color: darkMode ? "#fff" : "rgba(0,0,0,0.8)",
                fontWeight: 500,
                fontSize: "12px",
                "&:hover": { color: darkMode ? "#fff" : "#000" },
              }}
            >
              <Box
                component="img"
                src="https://vercel.com/favicon.ico"
                alt="Vercel"
                sx={{ height: 16, width: 16 }}
              />
              Vercel
            </Link>
          </Stack>

          <Box
            sx={{
              textAlign: { xs: "center", sm: "right" },
              mt: { xs: 1, sm: 0 },
            }}
          >
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                px: 2,
                py: "6px",
                borderRadius: "16px",
                background: darkMode
                  ? "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)"
                  : "linear-gradient(135deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.04) 100%)",
                border: `1px solid ${
                  darkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.08)"
                }`,
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: darkMode ? "#fff" : "rgba(0,0,0,0.7)",
                  fontSize: "11px",
                  fontWeight: 500,
                  letterSpacing: "0.3px",
                }}
              >
                Built for #ResendMCPHackathon
              </Typography>
            </Box>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
};

export default Footer;
