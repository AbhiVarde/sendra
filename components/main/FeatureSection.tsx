import React from "react";
import { Box, Container, Typography } from "@mui/material";
import {
  Database,
  Activity,
  Mail,
  Brain,
  BarChart3,
  Shield,
} from "lucide-react";

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
      icon: Brain,
      title: "AI-powered Failure Analysis",
      description:
        "Provides suggestions and insights for fixing deployment errors.",
    },
    {
      icon: BarChart3,
      title: "Dashboard Overview",
      description:
        "View recent deployments with status, branch, time, and error analysis.",
    },
    {
      icon: Shield,
      title: "Secure API Storage",
      description:
        "Your Appwrite API keys are safely encrypted in the database.",
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
        {/* Simple Header */}
        <Box
          sx={{
            textAlign: "center",
            mb: { xs: "24px", sm: "32px", md: "40px" },
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

        {/* Features Layout */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: { xs: "8px", sm: "12px", md: "16px" },
          }}
        >
          {/* Row 1: 3 Equal Cards */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: { xs: "8px", sm: "12px", md: "16px" },
            }}
          >
            {features.slice(0, 3).map((feature, index) => (
              <Box
                key={index}
                sx={{
                  flex: 1,
                  backgroundColor: darkMode ? "#000000" : "#FFFFFF",
                  border: "1px solid",
                  borderColor: darkMode
                    ? "rgba(255,255,255,0.2)"
                    : "rgba(0,0,0,0.06)",
                  borderRadius: 5,
                  p: { xs: "12px", sm: "14px", md: "16px" },
                  minHeight: { xs: "120px", sm: "140px", md: "160px" },
                }}
              >
                <feature.icon
                  size={16}
                  color={darkMode ? "#FAFAFB" : "#333333"}
                  style={{ marginBottom: "8px" }}
                />
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 400,
                    color: darkMode ? "#FFFFFF" : "#000000",
                    mb: "4px",
                    fontSize: { xs: "13px", sm: "14px", md: "15px" },
                    lineHeight: 1.3,
                  }}
                >
                  {feature.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 400,
                    color: darkMode ? "#FAFAFB" : "#333333",
                    lineHeight: 1.4,
                    fontSize: { xs: "11px", sm: "12px", md: "13px" },
                  }}
                >
                  {feature.description}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Row 2: 1 Large + 2 Stacked Small */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: { xs: "8px", sm: "12px", md: "16px" },
            }}
          >
            {/* Large Card */}
            <Box
              sx={{
                flex: { xs: 1, sm: 2 },
                backgroundColor: darkMode ? "#000000" : "#FFFFFF",
                border: "1px solid",
                borderColor: darkMode
                  ? "rgba(255,255,255,0.2)"
                  : "rgba(0,0,0,0.06)",
                borderRadius: 5,
                p: { xs: "12px", sm: "14px", md: "16px" },
                minHeight: { xs: "120px", sm: "200px", md: "220px" },
              }}
            >
              <Brain
                size={16}
                color={darkMode ? "#FAFAFB" : "#333333"}
                style={{ marginBottom: "8px" }}
              />
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 400,
                  color: darkMode ? "#FFFFFF" : "#000000",
                  mb: "4px",
                  fontSize: { xs: "13px", sm: "14px", md: "15px" },
                  lineHeight: 1.3,
                }}
              >
                {features[3].title}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 400,
                  color: darkMode ? "#FAFAFB" : "#333333",
                  lineHeight: 1.4,
                  fontSize: { xs: "11px", sm: "12px", md: "13px" },
                }}
              >
                {features[3].description}
              </Typography>
            </Box>

            {/* Right Column - 2 Stacked Cards */}
            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: { xs: "8px", sm: "12px", md: "16px" },
              }}
            >
              {features.slice(4).map((feature, index) => (
                <Box
                  key={index + 4}
                  sx={{
                    flex: 1,
                    backgroundColor: darkMode ? "#000000" : "#FFFFFF",
                    border: "1px solid",
                    borderColor: darkMode
                      ? "rgba(255,255,255,0.2)"
                      : "rgba(0,0,0,0.06)",
                    borderRadius: 5,
                    p: { xs: "10px", sm: "12px", md: "14px" },
                    minHeight: { xs: "100px", sm: "94px", md: "100px" },
                  }}
                >
                  <feature.icon
                    size={16}
                    color={darkMode ? "#FAFAFB" : "#333333"}
                    style={{ marginBottom: "6px" }}
                  />
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 400,
                      color: darkMode ? "#FFFFFF" : "#000000",
                      mb: "3px",
                      fontSize: { xs: "12px", sm: "13px", md: "14px" },
                      lineHeight: 1.3,
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 400,
                      color: darkMode ? "#FAFAFB" : "#333333",
                      lineHeight: 1.4,
                      fontSize: { xs: "10px", sm: "11px", md: "12px" },
                    }}
                  >
                    {feature.description}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default FeatureSection;
