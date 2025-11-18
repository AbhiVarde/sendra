import React from "react";
import { Box, Container, Typography } from "@mui/material";
import { Database, Activity, Mail, BarChart3, Shield, MessageSquare, Sparkles } from "lucide-react";

interface FeatureSectionProps {
  darkMode: boolean;
}

const FeatureSection: React.FC<FeatureSectionProps> = ({ darkMode }) => {
  const features = [
    {
      icon: Database,
      title: "Connect Projects",
      description:
        "Link your Appwrite projects with API keys to start monitoring instantly.",
    },
    {
      icon: Activity,
      title: "Real-time Monitoring",
      description:
        "Track deployment status for Sites and Functions automatically.",
    },
    {
      icon: Mail,
      title: "Email Alerts",
      description:
        "Get instant notifications when deployments fail with direct console links.",
    },

    {
      icon: MessageSquare,
      title: "Command Interface",
      description:
        "Reply with /overview, /failed, or /help to get deployment insights.",
    },
    {
      icon: Sparkles,
      title: "AI Analysis",
      description:
        "Receive intelligent failure analysis and fix recommendations.",
    },
    {
      icon: BarChart3,
      title: "Dashboard",
      description: "View deployment history with status and analytics.",
    },
    {
      icon: Shield,
      title: "Secure Storage",
      description: "API keys encrypted with industry-standard security.",
    },
  ];

  return (
    <Box
      sx={{
        pt: { xs: "20px", sm: "30px", md: "40px" },
        px: { xs: "20px", sm: "40px", md: "0px" },
        backgroundColor: darkMode ? "#000000" : "#FFFFFF",
      }}
    >
      <Container maxWidth="md">
        <Box
          sx={{
            textAlign: "center",
            mb: { xs: "32px", sm: "40px", md: "48px" },
            maxWidth: { xs: "100%", sm: "600px", md: "700px" },
            mx: "auto",
            px: { xs: 2, sm: 0 },
          }}
        >
          <Typography
            variant="h3"
            sx={{
              fontWeight: 300,
              color: darkMode ? "#FFFFFF" : "#000000",
              fontSize: { xs: "24px", sm: "28px", md: "32px" },
              lineHeight: 1.2,
            }}
          >
            Everything you need to{" "}
            <Typography
              variant="h3"
              component="span"
              sx={{
                display: { xs: "inline", sm: "block" },
                fontWeight: 500,
                fontStyle: "italic",
                color: darkMode ? "#FAFAFB" : "#333333",
                fontSize: { xs: "24px", sm: "28px", md: "32px" },
                mt: { xs: 0, sm: 1 },
              }}
            >
              monitor Sites & Functions deployments
            </Typography>
          </Typography>
        </Box>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
            },
            gap: 2,
            maxWidth: "1200px",
            mx: "auto",

            // Desktop layout exactly like your screenshot
            "& > *:nth-of-type(1)": {
              md: { gridColumn: "1 / 2", gridRow: "1" },
            },
            "& > *:nth-of-type(2)": {
              md: { gridColumn: "2 / 3", gridRow: "1" },
            },
            "& > *:nth-of-type(3)": {
              md: { gridColumn: "3 / 4", gridRow: "1" },
            },

            "& > *:nth-of-type(4)": {
              md: { gridColumn: "1 / 3", gridRow: "2" },
            }, // Wide card

            "& > *:nth-of-type(5)": {
              md: { gridColumn: "3 / 4", gridRow: "2" },
            },

            "& > *:nth-of-type(6)": {
              md: { gridColumn: "1 / 2", gridRow: "3" },
            },

            "& > *:nth-of-type(7)": {
              md: { gridColumn: "2 / 4", gridRow: "3" },
            }, // Wide card
          }}
        >
          {features.map((feature, index) => (
            <Box
              key={index}
              sx={{
                backgroundColor: darkMode ? "#000000" : "#FFFFFF",
                border: "1px solid",
                borderColor: darkMode
                  ? "rgba(255,255,255,0.15)"
                  : "rgba(0,0,0,0.08)",
                borderRadius: { xs: 4, sm: 5 },
                p: { xs: "16px", sm: "18px", md: "20px" },
                minHeight: { xs: "140px", sm: "160px", md: "180px" },
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  borderColor: darkMode
                    ? "rgba(255,255,255,0.25)"
                    : "rgba(0,0,0,0.12)",
                  transform: "translateY(-1px)",
                },
              }}
            >
              <feature.icon
                size={18}
                color={darkMode ? "#FAFAFB" : "#333333"}
                style={{ marginBottom: "12px" }}
              />
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 500,
                  color: darkMode ? "#FFFFFF" : "#000000",
                  mb: "8px",
                  fontSize: { xs: "14px", sm: "15px", md: "16px" },
                  lineHeight: 1.3,
                }}
              >
                {feature.title}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 400,
                  color: darkMode ? "#B0B0B0" : "#666666",
                  lineHeight: 1.5,
                  fontSize: { xs: "12px", sm: "13px", md: "14px" },
                }}
              >
                {feature.description}
              </Typography>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default FeatureSection;
