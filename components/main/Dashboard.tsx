"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Avatar,
  Box,
  Button,
  Container,
  Stack,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Alert,
} from "@mui/material";
import { Plus, Activity, RefreshCw, Trash2 } from "lucide-react";
import { databases, functions } from "@/lib/appwrite";
import { ID, Query } from "appwrite";
import { toast } from "sonner";

interface DashboardProps {
  darkMode: boolean;
  user: any;
}

interface Project {
  $id?: string;
  userId: string;
  projectId: string;
  email: string;
  isActive: boolean;
  deployments?: number;
  apiKey: string;
}

interface FormData {
  projectId: string;
  email: string;
  apiKey: string;
}

interface Deployment {
  $id: string;
  resourceId: string;
  status: string;
  siteName: string;
  buildDuration: number;
}

interface DeploymentResponse {
  error: string;
  success: boolean;
  deployments: Deployment[];
  total: number;
}

const MAX_PROJECTS = 3;

const Dashboard: React.FC<DashboardProps> = ({ darkMode, user }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [projectDeployments, setProjectDeployments] = useState<
    Record<string, DeploymentResponse>
  >({});
  const [deploymentLoading, setDeploymentLoading] = useState<
    Record<string, boolean>
  >({});
  const [deleting, setDeleting] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    projectId: "",
    email: user?.email || "",
    apiKey: "",
  });

  const hasReachedLimit = projects.length >= MAX_PROJECTS;

  useEffect(() => {
    if (!user) {
      setProjects([]);
      setProjectDeployments({});
      setDeploymentLoading({});
      setInitialLoading(false);
    }
  }, [user]);

  // Encode API key
  const encodeApiKey = useCallback((apiKey: string): string => {
    return btoa(apiKey);
  }, []);

  // Reset form data
  const resetForm = useCallback(() => {
    setFormData({
      projectId: "",
      email: user?.email || "",
      apiKey: "",
    });
  }, [user?.email]);

  // Fetch project deployments
  const fetchProjectDeployments = useCallback(
    async (
      documentId: string,
      projectId: string,
      encodedApiKey: string,
      forceRefresh = false
    ) => {
      if (
        !forceRefresh &&
        (deploymentLoading[documentId] || projectDeployments[documentId])
      ) {
        return;
      }

      setDeploymentLoading((prev) => ({ ...prev, [documentId]: true }));

      try {
        const result = await functions.createExecution(
          process.env.NEXT_PUBLIC_FETCH_DEPLOYMENTS_FUNCTION_ID!,
          JSON.stringify({ projectId, apiKey: encodedApiKey }),
          false
        );

        const response: DeploymentResponse = JSON.parse(result.responseBody);

        if (response.success) {
          setProjectDeployments((prev) => ({
            ...prev,
            [documentId]: response,
          }));

          const currentProject = projects.find((p) => p.$id === documentId);
          if (currentProject && currentProject.deployments !== response.total) {
            await databases.updateDocument(
              process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
              process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID!,
              documentId,
              { deployments: response.total }
            );

            setProjects((prev) =>
              prev.map((p) =>
                p.$id === documentId ? { ...p, deployments: response.total } : p
              )
            );
          }
        } else {
          throw new Error(response.error || "Failed to fetch deployments");
        }
      } catch (error: any) {
        console.error(`Failed to fetch deployments:`, error);
        if (!forceRefresh) {
          toast.error(`Failed to fetch deployments: ${error.message}`);
        }
      } finally {
        setDeploymentLoading((prev) => ({ ...prev, [documentId]: false }));
      }
    },
    [deploymentLoading, projectDeployments, projects]
  );

  // Fetch all projects
  const fetchProjects = useCallback(
    async (showToast = false) => {
      if (!user?.$id) return;

      try {
        const response = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID!,
          [Query.equal("userId", user.$id), Query.orderDesc("$createdAt")]
        );

        const projectsData = response.documents as unknown as Project[];
        setProjects(projectsData);

        projectsData.forEach((project) => {
          if (
            project.$id &&
            project.apiKey &&
            project.projectId &&
            !projectDeployments[project.$id]
          ) {
            fetchProjectDeployments(
              project.$id,
              project.projectId,
              project.apiKey
            );
          }
        });

        if (showToast) toast.success("Projects refreshed");
      } catch (error: any) {
        console.error("Failed to fetch projects:", error);
        if (error.code !== 401 && showToast) {
          toast.error("Failed to load projects");
        }
      } finally {
        setInitialLoading(false);
      }
    },
    [user?.$id, projectDeployments, fetchProjectDeployments]
  );

  // Refresh projects and deployments
  const refreshProjects = useCallback(async () => {
    setLoading(true);
    await fetchProjects(true);

    const refreshPromises = projects.map((project) => {
      if (project.$id && project.apiKey && project.projectId) {
        return fetchProjectDeployments(
          project.$id,
          project.projectId,
          project.apiKey,
          true
        );
      }
    });

    await Promise.all(refreshPromises);
    setLoading(false);
  }, [fetchProjects, projects, fetchProjectDeployments]);

  // Delete project
  const handleDeleteProject = useCallback(async (project: Project) => {
    if (!project?.$id) return;

    setDeleting(project.$id);

    try {
      await databases.deleteDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID!,
        project.$id
      );

      setProjects((prev) => prev.filter((p) => p.$id !== project.$id));
      setProjectDeployments((prev) => {
        const newState = { ...prev };
        delete newState[project.$id!];
        return newState;
      });
      setDeploymentLoading((prev) => {
        const newState = { ...prev };
        delete newState[project.$id!];
        return newState;
      });

      toast.success(`Project "${project.projectId}" deleted`);
    } catch (error: any) {
      console.error("Failed to delete project:", error);
      toast.error("Failed to delete project");
    } finally {
      setDeleting(null);
    }
  }, []);

  useEffect(() => {
    if (user?.$id && projects.length === 0) {
      fetchProjects();
    }
  }, [user?.$id, fetchProjects, projects.length]);

  // Handle form input change
  const handleInputChange = useCallback(
    (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    },
    []
  );

  // Validate form data
  const validateForm = useCallback((): string => {
    if (!formData.projectId.trim()) return "Project ID is required";
    if (!formData.apiKey.trim()) return "API Key is required";
    if (formData.email?.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        return "Invalid email address";
      }
    }
    if (projects.some((p) => p.projectId === formData.projectId.trim())) {
      return "Project already connected";
    }
    if (hasReachedLimit) {
      return `Maximum ${MAX_PROJECTS} projects allowed`;
    }
    return "";
  }, [formData, projects, hasReachedLimit]);

  // Handle form submission
  const handleFormSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const validationError = validateForm();
      if (validationError) {
        toast.error(validationError);
        return;
      }

      setLoading(true);

      try {
        const encodedApiKey = encodeApiKey(formData.apiKey.trim());

        const newProject = await databases.createDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID!,
          ID.unique(),
          {
            userId: user.$id,
            projectId: formData.projectId.trim(),
            email: (formData.email?.trim() || user?.email || "").toLowerCase(),
            isActive: true,
            deployments: 0,
            alerts: 0,
            apiKey: encodedApiKey,
          }
        );

        const projectData = newProject as unknown as Project;
        setProjects((prev) => [projectData, ...prev]);

        toast.success("Project connected securely");

        await fetchProjectDeployments(
          projectData.$id!,
          formData.projectId.trim(),
          encodedApiKey
        );

        resetForm();
        setShowForm(false);
      } catch (err: any) {
        console.error("Project creation error:", err);
        if (err.code === 409) {
          toast.error("Project ID already exists");
        } else {
          toast.error("Failed to connect project");
        }
      } finally {
        setLoading(false);
      }
    },
    [
      validateForm,
      formData,
      user,
      fetchProjectDeployments,
      resetForm,
      encodeApiKey,
    ]
  );

  // Calculate stats
  const stats = useMemo(() => {
    const totalDeployments = Object.values(projectDeployments).reduce(
      (acc, response) => acc + (response?.total || 0),
      0
    );

    return {
      projects: projects.length,
      deployments: totalDeployments,
      active: projects.filter((p) => p.isActive).length,
    };
  }, [projects, projectDeployments]);

  // Format duration
  const formatDuration = useCallback((seconds: number) => {
    return seconds > 60
      ? `${Math.floor(seconds / 60)}m ${seconds % 60}s`
      : `${seconds}s`;
  }, []);

  // Get status color
  const getStatusColor = useCallback(
    (status: string) => {
      switch (status.toLowerCase()) {
        case "ready":
          return darkMode ? "#4ade80" : "#16a34a";
        case "failed":
          return darkMode ? "#f87171" : "#dc2626";
        default:
          return darkMode ? "#fbbf24" : "#d97706";
      }
    },
    [darkMode]
  );

  // Styles
  const containerStyle = {
    pt: 6,
    backgroundColor: darkMode ? "#000000" : "#FFFFFF",
  };

  const cardStyle = {
    p: 2,
    backgroundColor: darkMode ? "#000000" : "#FFFFFF",
    border: "1px solid",
    borderColor: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)",
    borderRadius: 4,
  };

  const textFieldStyle = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 3,
      backgroundColor: darkMode ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
      "& fieldset": {
        borderColor: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
      },
      "&:hover fieldset": {
        borderColor: darkMode ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)",
      },
      "&.Mui-focused fieldset": {
        borderColor: darkMode ? "#FFFFFF" : "#000000",
        borderWidth: "1px",
      },
    },
    "& .MuiInputBase-input": {
      color: darkMode ? "#FFFFFF" : "#000000",
      fontSize: "14px",
      padding: "10px 12px",
    },
  };

  const buttonStyle = {
    px: 2,
    py: 0.5,
    borderRadius: 3,
    fontSize: "14px",
    textTransform: "none",
  };

  if (initialLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          pt: 8,
        }}
      >
        <Typography
          variant="body1"
          sx={{ color: darkMode ? "#FFFFFF" : "#000000", fontWeight: 500 }}
        >
          Loading...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={containerStyle}>
      <Container maxWidth="md">
        <Stack spacing={3}>
          {projects.length > 0 && (
            <Box sx={cardStyle}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 1,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    minWidth: 0,
                  }}
                >
                  <Avatar
                    alt={user?.name || "User"}
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                      user?.name || "User"
                    )}&background=random`}
                    sx={{ width: 40, height: 40 }}
                  />
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 500,
                        color: darkMode ? "#FFFFFF" : "#000000",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {user?.name || "User"}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: darkMode ? "#888888" : "#666666",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {user?.email || ""}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Activity
                    size={16}
                    color={darkMode ? "#4ade80" : "#16a34a"}
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={refreshProjects}
                    disabled={loading}
                    sx={{
                      ...buttonStyle,
                      borderColor: darkMode
                        ? "rgba(255,255,255,0.2)"
                        : "rgba(0,0,0,0.2)",
                      color: darkMode ? "#FFFFFF" : "#000000",
                      "&:hover": {
                        borderColor: darkMode ? "#FFFFFF" : "#000000",
                      },
                      "&.Mui-disabled": {
                        borderColor: darkMode
                          ? "rgba(255,255,255,0.2)"
                          : "rgba(0,0,0,0.2)",
                        color: darkMode ? "#FFFFFF" : "#000000",
                        opacity: 1,
                      },
                    }}
                  >
                    <RefreshCw
                      size={14}
                      style={{
                        marginRight: 8,
                        animation: loading ? "spin 1s linear infinite" : "none",
                      }}
                    />
                    Refresh
                  </Button>
                </Box>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mt: 2,
                  gap: 1,
                  flexWrap: "wrap",
                }}
              >
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                  {[
                    {
                      label: "Projects",
                      value: stats.projects,
                      color: darkMode ? "#60a5fa" : "#2563eb",
                    },
                    {
                      label: "Deployments",
                      value: stats.deployments,
                      color: darkMode ? "#4ade80" : "#16a34a",
                    },
                    {
                      label: "Active",
                      value: stats.active,
                      color: darkMode ? "#fbbf24" : "#d97706",
                    },
                  ].map(({ label, value, color }) => (
                    <Box key={label}>
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: 600, color }}
                      >
                        {value}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: darkMode ? "#888888" : "#666666" }}
                      >
                        {label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
                <Button
                  variant="outlined"
                  startIcon={<Plus size={14} />}
                  onClick={() => setShowForm(true)}
                  disabled={hasReachedLimit}
                  sx={{
                    ...buttonStyle,
                    borderColor: darkMode
                      ? "rgba(255,255,255,0.2)"
                      : "rgba(0,0,0,0.2)",
                    color: darkMode ? "#FFFFFF" : "#000000",
                    "&:hover": {
                      borderColor: darkMode ? "#FFFFFF" : "#000000",
                    },
                    "&.Mui-disabled": {
                      borderColor: darkMode
                        ? "rgba(255,255,255,0.1)"
                        : "rgba(0,0,0,0.1)",
                      color: darkMode ? "#666666" : "#999999",
                      opacity: 1,
                    },
                  }}
                >
                  Add Project{" "}
                  {hasReachedLimit && `(${projects.length}/${MAX_PROJECTS})`}
                </Button>
              </Box>
            </Box>
          )}

          {hasReachedLimit && showForm && (
            <Alert
              severity="warning"
              sx={{
                backgroundColor: darkMode
                  ? "rgba(251, 191, 36, 0.1)"
                  : "rgba(217, 119, 6, 0.1)",
                color: darkMode ? "#fbbf24" : "#d97706",
                "& .MuiAlert-icon": {
                  color: darkMode ? "#fbbf24" : "#d97706",
                },
              }}
            >
              You've reached the maximum limit of {MAX_PROJECTS} projects.
              Delete a project to add a new one.
            </Alert>
          )}

          {projects.length === 0 && !showForm && (
            <Box sx={{ ...cardStyle, p: 4, textAlign: "center" }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 500,
                  mb: 1,
                  color: darkMode ? "#FFFFFF" : "#000000",
                  fontSize: "18px",
                }}
              >
                Connect Your Project
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  mb: 2,
                  maxWidth: "400px",
                  mx: "auto",
                  color: darkMode ? "#888888" : "#666666",
                  fontSize: "13px",
                }}
              >
                Connect your first Appwrite project to start tracking
                deployments with secure API storage. (Max {MAX_PROJECTS}{" "}
                projects)
              </Typography>
              <Button
                variant="contained"
                startIcon={<Plus size={16} />}
                onClick={() => setShowForm(true)}
                sx={{
                  ...buttonStyle,
                  backgroundColor: darkMode ? "#FFFFFF" : "#000000",
                  color: darkMode ? "#000000" : "#FFFFFF",
                  fontSize: "13px",
                  fontWeight: 500,
                  boxShadow: "none",
                  "&:hover": {
                    backgroundColor: darkMode ? "#f5f5f5" : "#1a1a1a",
                    boxShadow: "none",
                  },
                }}
              >
                Get Started
              </Button>
            </Box>
          )}

          {showForm && (
            <Box sx={{ ...cardStyle, p: 4 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 500,
                  mb: 1,
                  color: darkMode ? "#FFFFFF" : "#000000",
                  fontSize: "16px",
                  textAlign: "center",
                }}
              >
                Connect Project ({projects.length}/{MAX_PROJECTS})
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  mb: 3,
                  color: darkMode ? "#888888" : "#666666",
                  fontSize: "12px",
                  textAlign: "center",
                }}
              >
                Your API keys are securely encoded and stored safely
              </Typography>

              <Box component="form" onSubmit={handleFormSubmit}>
                <Stack spacing={2}>
                  <TextField
                    placeholder="Project ID"
                    value={formData.projectId}
                    onChange={handleInputChange("projectId")}
                    required
                    fullWidth
                    size="small"
                    sx={textFieldStyle}
                    disabled={hasReachedLimit}
                  />
                  <TextField
                    placeholder="API Key"
                    type="password"
                    value={formData.apiKey}
                    onChange={handleInputChange("apiKey")}
                    required
                    fullWidth
                    size="small"
                    sx={textFieldStyle}
                    disabled={hasReachedLimit}
                    helperText="Ensure your API key includes the 'sites.read' scope for proper functionality."
                    FormHelperTextProps={{
                      sx: {
                        fontSize: "11px",
                        color: darkMode ? "#666666" : "#888888",
                      },
                    }}
                  />
                  <TextField
                    placeholder="Email (optional)"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange("email")}
                    fullWidth
                    size="small"
                    sx={textFieldStyle}
                    disabled={hasReachedLimit}
                  />

                  <Stack direction="row" spacing={2}>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={loading || hasReachedLimit}
                      sx={{
                        flex: 1,
                        minHeight: "40px",
                        borderRadius: 3,
                        backgroundColor: darkMode ? "#FFFFFF" : "#000000",
                        color: darkMode ? "#000000" : "#FFFFFF",
                        fontSize: "13px",
                        textTransform: "none",
                        boxShadow: "none",
                        "&:hover": {
                          boxShadow: "none",
                          backgroundColor: darkMode ? "#f5f5f5" : "#1a1a1a",
                        },
                        "&.Mui-disabled": {
                          backgroundColor: darkMode
                            ? "rgba(255,255,255,0.3)"
                            : "rgba(0,0,0,0.3)",
                          color: darkMode
                            ? "rgba(0,0,0,0.5)"
                            : "rgba(255,255,255,0.5)",
                        },
                      }}
                    >
                      {loading
                        ? "Connecting..."
                        : hasReachedLimit
                        ? "Limit Reached"
                        : "Connect"}
                    </Button>

                    <Button
                      type="button"
                      variant="outlined"
                      onClick={() => {
                        setShowForm(false);
                        resetForm();
                      }}
                      disabled={loading}
                      sx={{
                        flex: 1,
                        minHeight: "40px",
                        borderRadius: 3,
                        borderColor: darkMode
                          ? "rgba(255,255,255,0.2)"
                          : "rgba(0,0,0,0.2)",
                        color: darkMode ? "#FFFFFF" : "#000000",
                        fontSize: "13px",
                        textTransform: "none",
                        "&:hover": {
                          borderColor: darkMode ? "#FFFFFF" : "#000000",
                        },
                      }}
                    >
                      Cancel
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            </Box>
          )}

          {projects.length > 0 && (
            <Stack spacing={2}>
              {projects.map((project) => {
                const deploymentData = projectDeployments[project.$id || ""];
                const isLoadingDeployments =
                  deploymentLoading[project.$id || ""];
                const recentDeployments =
                  deploymentData?.deployments?.slice(0, 5) || [];

                return (
                  <Box
                    key={project.$id}
                    sx={{ ...cardStyle, p: 0, overflow: "hidden" }}
                  >
                    <Box sx={{ p: 2 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: 2,
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            minWidth: 0,
                          }}
                        >
                          <Typography
                            variant="subtitle1"
                            noWrap
                            sx={{
                              fontWeight: 600,
                              color: darkMode ? "#FFFFFF" : "#111827",
                              fontFamily: "monospace",
                            }}
                          >
                            {project.projectId}
                          </Typography>

                          <Chip
                            label={project.isActive ? "Active" : "Inactive"}
                            size="small"
                            sx={{
                              fontSize: "14px",
                              fontWeight: 500,
                              backgroundColor: project.isActive
                                ? darkMode
                                  ? "rgba(74, 222, 128, 0.1)"
                                  : "rgba(22, 163, 74, 0.1)"
                                : darkMode
                                ? "rgba(107, 114, 128, 0.1)"
                                : "rgba(156, 163, 175, 0.1)",
                              color: project.isActive
                                ? darkMode
                                  ? "#4ade80"
                                  : "#16a34a"
                                : darkMode
                                ? "#9ca3af"
                                : "#6b7280",
                            }}
                          />

                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteProject(project)}
                            disabled={deleting === project.$id}
                          >
                            <Trash2 size={16} />
                          </IconButton>
                        </Box>

                        <Box sx={{ display: "flex", gap: 3 }}>
                          {[
                            {
                              label: "Total",
                              value: deploymentData?.total || 0,
                              color: darkMode ? "#60a5fa" : "#2563eb",
                            },
                            {
                              label: "Success",
                              value:
                                deploymentData?.deployments?.filter(
                                  (d) => d.status === "ready"
                                ).length || 0,
                              color: darkMode ? "#4ade80" : "#16a34a",
                            },
                            {
                              label: "Failed",
                              value:
                                deploymentData?.deployments?.filter(
                                  (d) => d.status === "failed"
                                ).length || 0,
                              color: darkMode ? "#f87171" : "#dc2626",
                            },
                          ].map(({ label, value, color }) => (
                            <Box key={label}>
                              <Typography
                                variant="body1"
                                sx={{ fontWeight: 600, color }}
                              >
                                {value}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ color: darkMode ? "#9ca3af" : "#6b7280" }}
                              >
                                {label}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    </Box>

                    {recentDeployments.length > 0 && (
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              {["ID", "Status", "Site", "Duration"].map(
                                (header) => (
                                  <TableCell
                                    key={header}
                                    sx={{
                                      color: darkMode ? "#888888" : "#666666",
                                      fontSize: "14px",
                                      fontWeight: 500,
                                      py: 1.5,
                                      backgroundColor: darkMode
                                        ? "rgba(255,255,255,0.02)"
                                        : "rgba(0,0,0,0.02)",
                                      border: "none",
                                    }}
                                  >
                                    {header}
                                  </TableCell>
                                )
                              )}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {recentDeployments.map((deployment) => (
                              <TableRow key={deployment.$id}>
                                <TableCell
                                  sx={{
                                    fontFamily: "monospace",
                                    color: darkMode ? "#FFFFFF" : "#000000",
                                    fontSize: "13px",
                                    py: 1.5,
                                    border: "none",
                                    maxWidth: 160,
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                >
                                  {deployment.resourceId}
                                </TableCell>

                                <TableCell sx={{ py: 1.5, border: "none" }}>
                                  <Chip
                                    label={deployment.status}
                                    size="small"
                                    sx={{
                                      backgroundColor: `${getStatusColor(
                                        deployment.status
                                      )}20`,
                                      color: getStatusColor(deployment.status),
                                      fontSize: "14px",
                                      textTransform: "capitalize",
                                    }}
                                  />
                                </TableCell>

                                <TableCell
                                  sx={{
                                    color: darkMode ? "#FFFFFF" : "#000000",
                                    fontSize: "14px",
                                    py: 1.5,
                                    border: "none",
                                  }}
                                >
                                  {deployment.siteName}
                                </TableCell>

                                <TableCell
                                  sx={{
                                    color: darkMode ? "#888888" : "#666666",
                                    fontSize: "14px",
                                    py: 1.5,
                                    border: "none",
                                  }}
                                >
                                  {formatDuration(deployment.buildDuration)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}

                    {!isLoadingDeployments &&
                      deploymentData &&
                      recentDeployments.length === 0 && (
                        <Box sx={{ p: 3, textAlign: "center" }}>
                          <Typography
                            variant="body2"
                            sx={{
                              color: darkMode ? "#888888" : "#666666",
                              fontSize: "11px",
                            }}
                          >
                            No deployments found
                          </Typography>
                        </Box>
                      )}
                  </Box>
                );
              })}
            </Stack>
          )}
        </Stack>
      </Container>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </Box>
  );
};

export default Dashboard;
