import React from "react";
import { Box, Container, Typography } from "@mui/material";
import { Database, Activity, Mail, BarChart3, Shield } from "lucide-react";

interface FeatureSectionProps {
  darkMode: boolean;
}

const FeatureSection: React.FC<FeatureSectionProps> = ({ darkMode }) => {
  const features = [
    {
      icon: Database,
      title: "Connect Appwrite Projects",
      description:
        "Add your Appwrite Project ID and API Key to start monitoring deployments.",
    },
    {
      icon: Activity,
      title: "Real-time Deployment Monitoring",
      description:
        "Automatically checks deployment status and logs updates every few minutes.",
    },
    {
      icon: Mail,
      title: "Email Notifications",
      description:
        "Instantly alerts you via Resend MCP when a deployment fails.",
    },
    {
      icon: BarChart3,
      title: "Dashboard Overview",
      description:
        "View recent deployments with status, branch, time, and detailed analytics.",
    },
    {
      icon: Shield,
      title: "Secure API Storage",
      description:
        "Your Appwrite API keys are safely encrypted and stored in the database.",
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
            Everything you need to
            <Typography
              variant="h3"
              component="span"
              sx={{
                fontWeight: 500,
                fontStyle: "italic",
                color: darkMode ? "#FAFAFB" : "#333333",
                fontSize: { xs: "24px", sm: "28px", md: "32px" },
              }}
            >
              {" "}
              monitor deployments
            </Typography>
          </Typography>
        </Box>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(6, 1fr)",
            },
            gap: 2,
            justifyContent: "center",
            maxWidth: "1200px",
            mx: "auto",
            "& > *:nth-of-type(1)": {
              gridColumn: {
                lg: "1 / 3",
              },
            },
            "& > *:nth-of-type(2)": {
              gridColumn: {
                lg: "3 / 5",
              },
            },
            "& > *:nth-of-type(3)": {
              gridColumn: {
                lg: "5 / 7",
              },
            },
            "& > *:nth-of-type(4)": {
              gridColumn: {
                lg: "2 / 4",
              },
            },
            "& > *:nth-of-type(5)": {
              gridColumn: {
                lg: "4 / 6",
              },
            },
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
