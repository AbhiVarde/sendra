import React from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  CircularProgress,
} from "@mui/material";
import { Github } from "lucide-react";

interface HeroSectionProps {
  darkMode: boolean;
  onSignIn: () => void;
  loading?: boolean;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  darkMode,
  onSignIn,
  loading = false,
}) => {
  return (
    <Box
      sx={{
        pt: { xs: "20px", sm: "30px", md: "40px" },
        pb: { xs: "40px", sm: "60px", md: "80px" },
        px: { xs: "20px", sm: "40px", md: "0px" },
        textAlign: "center",
      }}
    >
      <Container maxWidth="md">
        <Typography
          variant="h3"
          sx={{
            fontWeight: 300,
            lineHeight: 1.2,
            color: darkMode ? "#FFFFFF" : "#000000",
            mb: "16px",
            fontSize: { xs: "28px", sm: "36px", md: "48px" },
          }}
        >
          Monitor deployments.
          <br />
          <Typography
            variant="h3"
            component="span"
            sx={{
              fontWeight: 500,
              lineHeight: 1.2,
              fontStyle: "italic",
              color: darkMode ? "#FAFAFB" : "#333333",
              fontSize: { xs: "28px", sm: "36px", md: "48px" },
            }}
          >
            Ship with confidence.
          </Typography>
        </Typography>

        <Typography
          variant="body1"
          sx={{
            fontWeight: 400,
            color: darkMode ? "#FAFAFB" : "#1A1A1A",
            lineHeight: 1.5,
            mb: "24px",
            maxWidth: { xs: "100%", sm: "450px", md: "500px" },
            mx: "auto",
            fontSize: { xs: "14px", sm: "16px", md: "16px" },
          }}
        >
          Monitor your Appwrite Sites deployments and receive instant email
          notifications whenever a deployment fails. Never miss a failure again.
        </Typography>

        <Button
          variant="contained"
          onClick={onSignIn}
          disabled={loading}
          startIcon={
            loading ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <Github size={18} />
            )
          }
          sx={{
            fontSize: { xs: "12px", sm: "14px" },
            fontWeight: 400,
            py: { xs: 0.5, sm: 0.5 },
            px: { xs: 1.5, sm: 2 },
            borderRadius: 3,
            backgroundColor: darkMode ? "#FFFFFF" : "#000000",
            color: darkMode ? "#000000" : "#FFFFFF",
            textTransform: "none",
            boxShadow: "none",
            "&:hover": {
              boxShadow: "none",
              backgroundColor: darkMode ? "#FAFAFB" : "#1A1A1A",
            },
            "&:disabled": {
              backgroundColor: darkMode
                ? "rgba(255,255,255,0.5)"
                : "rgba(0,0,0,0.5)",
              color: darkMode ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.5)",
            },
          }}
        >
          {loading ? "Signing in..." : "Sign in with GitHub"}
        </Button>
      </Container>
    </Box>
  );
};

export default HeroSection;
