import React from "react";
import { Box, Button, Container, Stack, Typography } from "@mui/material";

interface DashboardProps {
  darkMode: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ darkMode }) => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack spacing={4}>
        {/* Stats Section */}
        <Box
          sx={{
            p: 3,
            backgroundColor: darkMode ? "#000000" : "#FFFFFF",
            border: `1px solid ${darkMode ? "#1A1A1A" : "#FAFAFB"}`,
            borderRadius: "8px",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontSize: "16px",
              fontWeight: 500,
              color: darkMode ? "#FFFFFF" : "#000000",
              mb: 3,
            }}
          >
            Overview
          </Typography>

          <Stack direction="row" spacing={4}>
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontSize: "24px",
                  fontWeight: 500,
                  color: darkMode ? "#FFFFFF" : "#000000",
                }}
              >
                0
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: "14px",
                  fontWeight: 400,
                  color: darkMode ? "#FAFAFB" : "#1A1A1A",
                }}
              >
                Projects
              </Typography>
            </Box>

            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontSize: "24px",
                  fontWeight: 500,
                  color: darkMode ? "#FFFFFF" : "#000000",
                }}
              >
                0
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: "14px",
                  fontWeight: 400,
                  color: darkMode ? "#FAFAFB" : "#1A1A1A",
                }}
              >
                Deployments
              </Typography>
            </Box>

            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontSize: "24px",
                  fontWeight: 500,
                  color: darkMode ? "#FFFFFF" : "#000000",
                }}
              >
                0
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: "14px",
                  fontWeight: 400,
                  color: darkMode ? "#FAFAFB" : "#1A1A1A",
                }}
              >
                Alerts sent
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Empty State */}
        <Box
          sx={{
            p: 6,
            textAlign: "center",
            backgroundColor: darkMode ? "#000000" : "#FFFFFF",
            border: `1px solid ${darkMode ? "#1A1A1A" : "#FAFAFB"}`,
            borderRadius: "8px",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontSize: "16px",
              fontWeight: 500,
              color: darkMode ? "#FFFFFF" : "#000000",
              mb: 2,
            }}
          >
            Connect your first project
          </Typography>

          <Typography
            variant="body1"
            sx={{
              fontSize: "14px",
              fontWeight: 400,
              color: darkMode ? "#FAFAFB" : "#1A1A1A",
              mb: 3,
              maxWidth: "400px",
              mx: "auto",
            }}
          >
            Add your Appwrite project to start monitoring deployments and get
            instant notifications when things go wrong.
          </Typography>

          <Button
            variant="contained"
            sx={{
              fontSize: "14px",
              fontWeight: 500,
              px: 3,
              py: 1.5,
              backgroundColor: darkMode ? "#FFFFFF" : "#000000",
              color: darkMode ? "#000000" : "#FFFFFF",
              "&:hover": {
                backgroundColor: darkMode ? "#FAFAFB" : "#1A1A1A",
                boxShadow: "none",
              },
              boxShadow: "none",
            }}
          >
            Add project
          </Button>
        </Box>
      </Stack>
    </Container>
  );
};

export default Dashboard;
