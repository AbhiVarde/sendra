import React from "react";
import { Box, Container, Typography, Button } from "@mui/material";
import { Github } from "lucide-react";

interface HeroSectionProps {
  darkMode: boolean;
  onSignIn: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ darkMode, onSignIn }) => {
  return (
    <Box
      sx={{
        py: 8,
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
            mb: 1,
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
            mb: 2,
            maxWidth: "500px",
            mx: "auto",
          }}
        >
          This project monitors your Appwrite deployments in real time. It
          alerts you instantly when issues arise, helping you resolve them
          quickly and confidently.
        </Typography>

        <Button
          variant="contained"
          onClick={onSignIn}
          startIcon={<Github size={18} />}
          sx={{
            fontSize: "14px",
            fontWeight: 400,
            py: 0.5,
            px: 2,
            borderRadius: 3,
            backgroundColor: darkMode ? "#FFFFFF" : "#000000",
            color: darkMode ? "#000000" : "#FFFFFF",
            textTransform: "none",
            boxShadow: "none",
            "&:hover": {
              boxShadow: "none",
              backgroundColor: darkMode ? "#FAFAFB" : "#1A1A1A",
            },
          }}
        >
          Sign in with GitHub
        </Button>
      </Container>
    </Box>
  );
};

export default HeroSection;
