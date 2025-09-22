"use client";
import React, { useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Container,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Plus } from "lucide-react";

interface DashboardProps {
  darkMode: boolean;
  user: any;
}

interface Project {
  name: string;
  deployments: number;
  alerts: number;
}

const Dashboard: React.FC<DashboardProps> = ({ darkMode, user }) => {
  const [projects, setProjects] = useState<Project[]>([]); // All projects
  const [showForm, setShowForm] = useState(false); // Show add project form
  const [newProjectName, setNewProjectName] = useState(""); // Form input

  const handleAddProjectClick = () => {
    setShowForm(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName) return;

    const newProject: Project = {
      name: newProjectName,
      deployments: 0,
      alerts: 0,
    };

    setProjects([...projects, newProject]);
    setNewProjectName("");
    setShowForm(false);
  };

  return (
    <Box
      sx={{
        pt: { xs: "20px", sm: "30px", md: "40px" },
        px: { xs: "20px", sm: "40px", md: "0px" },
        backgroundColor: darkMode ? "#000000" : "#FFFFFF",
      }}
    >
      <Container maxWidth="md">
        <Stack spacing={{ xs: 2, sm: 3, md: 4 }}>
          {/* User Header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              p: { xs: "12px", sm: "14px", md: "16px" },
              backgroundColor: darkMode ? "#000000" : "#FFFFFF",
              border: "1px solid",
              borderColor: darkMode
                ? "rgba(255,255,255,0.2)"
                : "rgba(0,0,0,0.06)",
              borderRadius: 5,
            }}
          >
            <Avatar
              alt={user?.name || "User"}
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                user?.name || "User"
              )}&background=random`}
              sx={{ width: 40, height: 40 }}
            />
            <Box>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 500,
                  color: darkMode ? "#FFFFFF" : "#000000",
                  fontSize: { xs: "13px", sm: "14px", md: "15px" },
                }}
              >
                {user?.name || "Guest User"}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: darkMode ? "#FAFAFB" : "#333333",
                  fontSize: { xs: "11px", sm: "12px", md: "13px" },
                }}
              >
                {user?.email || ""}
              </Typography>
            </Box>
          </Box>

          {/* Conditional Rendering */}
          {projects.length === 0 && !showForm && (
            /* Empty State Card */
            <Box
              sx={{
                p: { xs: "14px", sm: "16px", md: "20px" },
                backgroundColor: darkMode ? "#000000" : "#FFFFFF",
                border: "1px solid",
                borderColor: darkMode
                  ? "rgba(255,255,255,0.2)"
                  : "rgba(0,0,0,0.06)",
                borderRadius: 5,
                textAlign: "center",
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 500,
                  mb: 1,
                  color: darkMode ? "#FFFFFF" : "#000000",
                  fontSize: { xs: "14px", sm: "15px", md: "16px" },
                }}
              >
                No projects connected
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  mb: 2,
                  maxWidth: "300px",
                  mx: "auto",
                  color: darkMode ? "#FAFAFB" : "#333333",
                  fontSize: { xs: "11px", sm: "12px", md: "13px" },
                  lineHeight: 1.5,
                }}
              >
                Connect your first Appwrite project to start tracking
                deployments and receiving alerts.
              </Typography>

              <Button
                variant="contained"
                startIcon={<Plus size={14} />}
                onClick={handleAddProjectClick}
                sx={{
                  fontSize: { xs: "12px", sm: "14px" },
                  fontWeight: 400,
                  py: 0.5,
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
                }}
              >
                Add Project
              </Button>
            </Box>
          )}

          {showForm && (
            /* Add Project Form */
            <Box
              sx={{
                p: { xs: "14px", sm: "16px", md: "20px" },
                backgroundColor: darkMode ? "#000000" : "#FFFFFF",
                border: "1px solid",
                borderColor: darkMode
                  ? "rgba(255,255,255,0.2)"
                  : "rgba(0,0,0,0.06)",
                borderRadius: 5,
              }}
            >
              <form onSubmit={handleFormSubmit}>
                <Stack spacing={2}>
                  <TextField
                    label="Project Name"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    fullWidth
                    size="small"
                    sx={{
                      input: { color: darkMode ? "#FFFFFF" : "#000000" },
                      label: { color: darkMode ? "#FAFAFB" : "#333333" },
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: darkMode
                            ? "rgba(255,255,255,0.2)"
                            : "rgba(0,0,0,0.06)",
                        },
                      },
                    }}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    sx={{
                      backgroundColor: darkMode ? "#FFFFFF" : "#000000",
                      color: darkMode ? "#000000" : "#FFFFFF",
                      "&:hover": {
                        backgroundColor: darkMode ? "#FAFAFB" : "#1A1A1A",
                      },
                    }}
                  >
                    Create Project
                  </Button>
                </Stack>
              </form>
            </Box>
          )}

          {projects.length > 0 && (
            /* Stats Card */
            <Box
              sx={{
                p: { xs: "14px", sm: "16px", md: "20px" },
                backgroundColor: darkMode ? "#000000" : "#FFFFFF",
                border: "1px solid",
                borderColor: darkMode
                  ? "rgba(255,255,255,0.2)"
                  : "rgba(0,0,0,0.06)",
                borderRadius: 5,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-around",
                  mb: 2,
                }}
              >
                {[
                  {
                    label: "Projects",
                    value: projects.length,
                  },
                  {
                    label: "Deployments",
                    value: projects.reduce((acc, p) => acc + p.deployments, 0),
                  },
                  {
                    label: "Alerts Sent",
                    value: projects.reduce((acc, p) => acc + p.alerts, 0),
                  },
                ].map((stat) => (
                  <Box key={stat.label} textAlign="center">
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 500,
                        color: darkMode ? "#FFFFFF" : "#000000",
                        fontSize: { xs: "14px", sm: "15px", md: "16px" },
                      }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: darkMode ? "#FAFAFB" : "#333333",
                        fontSize: { xs: "11px", sm: "12px", md: "13px" },
                      }}
                    >
                      {stat.label}
                    </Typography>
                  </Box>
                ))}
              </Box>

              <Divider
                sx={{
                  mb: 2,
                  borderColor: darkMode
                    ? "rgba(255,255,255,0.2)"
                    : "rgba(0,0,0,0.06)",
                }}
              />

              <Typography
                variant="body1"
                sx={{
                  fontWeight: 500,
                  mb: 1,
                  color: darkMode ? "#FFFFFF" : "#000000",
                  fontSize: { xs: "14px", sm: "15px", md: "16px" },
                }}
              >
                {projects[0].name} {/* Example: showing first project */}
              </Typography>
            </Box>
          )}
        </Stack>
      </Container>
    </Box>
  );
};

export default Dashboard;
