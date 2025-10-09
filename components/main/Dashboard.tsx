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
  MenuItem,
  Tooltip,
} from "@mui/material";
import {
  Plus,
  Activity,
  RefreshCw,
  Trash2,
  ChevronDown,
  ExternalLink,
} from "lucide-react";
import { databases, functions } from "@/lib/appwrite";
import { ID, Query } from "appwrite";
import { toast } from "sonner";
import DeleteDialog from "../dialogs/DeleteDialog";

interface DashboardProps {
  darkMode: boolean;
  user: any;
  showFormProp?: boolean;
  onToggleForm?: (value: boolean) => void;
}

interface Project {
  $id?: string;
  userId: string;
  projectId: string;
  email: string;
  isActive: boolean;
  deployments?: number;
  apiKey: string;
  region: string;
}

interface FormData {
  projectId: string;
  email: string;
  apiKey: string;
  region: string;
}

interface Deployment {
  $id: string;
  resourceId: string;
  status: string;
  siteName: string;
  buildDuration: number;
  buildSize: number;
  totalSize: number;
  $createdAt: string;
  type: string;
  siteId?: string;
}

interface DeploymentResponse {
  error: string;
  success: boolean;
  deployments: Deployment[];
  total: number;
  isExpired?: boolean;
}
type StatusFilter = "all" | "ready" | "failed";

const MAX_PROJECTS = 3;
const DEPLOYMENTS_PER_PAGE = 5;

const Dashboard: React.FC<DashboardProps> = ({
  darkMode,
  user,
  showFormProp,
  onToggleForm,
}) => {
  const [showForm, setShowForm] = useState(showFormProp ?? false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [projectDeployments, setProjectDeployments] = useState<
    Record<string, DeploymentResponse>
  >({});
  const [deploymentLoading, setDeploymentLoading] = useState<
    Record<string, boolean>
  >({});
  const [formData, setFormData] = useState<FormData>({
    projectId: "",
    email: user?.email || "",
    apiKey: "",
    region: "fra",
  });
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteConfirmProject, setDeleteConfirmProject] =
    useState<Project | null>(null);
  const [currentPage, setCurrentPage] = useState<Record<string, number>>({});
  const [statusFilter, setStatusFilter] = useState<
    Record<string, StatusFilter>
  >({});
  const [expiredProjects, setExpiredProjects] = useState<Set<string>>(
    new Set()
  );
  const [editingApiKey, setEditingApiKey] = useState<string | null>(null);
  const [newApiKey, setNewApiKey] = useState("");

  const hasReachedLimit = projects.length >= MAX_PROJECTS;

  useEffect(() => {
    if (showFormProp !== undefined) {
      setShowForm(showFormProp);
    }
  }, [showFormProp]);

  useEffect(() => {
    if (!user) {
      setProjects([]);
      setProjectDeployments({});
      setDeploymentLoading({});
      setInitialLoading(false);
    }
  }, [user]);

  const encodeApiKey = useCallback(async (apiKey: string): Promise<string> => {
    const SECRET_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_SECRET || "";

    const encoder = new TextEncoder();
    const data = encoder.encode(apiKey);

    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(SECRET_KEY.substring(0, 32)),
      { name: "AES-CBC", length: 256 },
      false,
      ["encrypt"]
    );

    const iv = crypto.getRandomValues(new Uint8Array(16));

    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-CBC", iv },
      key,
      data
    );

    const ivHex = Array.from(iv)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    const encryptedHex = Array.from(new Uint8Array(encrypted))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return `${ivHex}:${encryptedHex}`;
  }, []);

  const resetForm = useCallback(() => {
    setFormData({
      projectId: "",
      email: user?.email || "",
      apiKey: "",
      region: "fra",
    });
  }, [user?.email]);

  const formatDuration = useCallback((seconds: number) => {
    return seconds > 60
      ? `${Math.floor(seconds / 60)}m ${seconds % 60}s`
      : `${seconds}s`;
  }, []);

  const getConsoleLink = useCallback(
    (deployment: Deployment, projectId: string, region: string) => {
      const siteId = deployment.siteId || deployment.resourceId.split("/")[0];
      const deploymentId = deployment.$id;
      return `https://cloud.appwrite.io/console/project-${region}-${projectId}/sites/site-${siteId}/deployments/deployment-${deploymentId}`;
    },
    []
  );

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

  const getFilteredDeployments = useCallback(
    (projectId: string, deployments: Deployment[]) => {
      const filter = statusFilter[projectId] || "all";

      if (filter === "all") {
        return deployments;
      } else if (filter === "ready") {
        return deployments.filter((d) => d.status === "ready");
      } else if (filter === "failed") {
        return deployments.filter((d) => d.status === "failed");
      }

      return deployments;
    },
    [statusFilter]
  );

  const getPaginatedDeployments = useCallback(
    (projectId: string, deployments: Deployment[]) => {
      const filteredDeployments = getFilteredDeployments(
        projectId,
        deployments
      );
      const page = currentPage[projectId] || 1;
      const startIndex = (page - 1) * DEPLOYMENTS_PER_PAGE;
      return filteredDeployments.slice(
        startIndex,
        startIndex + DEPLOYMENTS_PER_PAGE
      );
    },
    [currentPage, getFilteredDeployments]
  );

  const getTotalPages = useCallback((total: number) => {
    return Math.ceil(total / DEPLOYMENTS_PER_PAGE);
  }, []);

  const handleStatusFilterClick = useCallback(
    (projectId: string, filter: StatusFilter) => {
      setStatusFilter((prev) => ({
        ...prev,
        [projectId]: filter,
      }));
      setCurrentPage((prev) => ({
        ...prev,
        [projectId]: 1,
      }));
    },
    []
  );
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

      let result: any = null;

      try {
        result = await functions.createExecution(
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
          if (response.isExpired) {
            setExpiredProjects((prev) => new Set(prev).add(documentId));
            if (!forceRefresh) {
              toast.error(`API key expired. Click update to renew.`);
            }
            return;
          }
          throw new Error(response.error || "Failed to fetch deployments");
        }
      } catch (error: any) {
        console.error(`Failed to fetch deployments:`, error);

        if (result?.responseBody) {
          try {
            const errorBody = JSON.parse(result.responseBody);
            if (errorBody.isExpired) {
              setExpiredProjects((prev) => new Set(prev).add(documentId));
              if (!forceRefresh) {
                toast.error(`API key expired. Click update to renew.`);
              }
              return;
            }
          } catch (parseError) {
            // Ignore parse errors
          }
        }

        if (!forceRefresh) {
          toast.error(`Failed to fetch deployments: ${error.message}`);
        }
      } finally {
        setDeploymentLoading((prev) => ({ ...prev, [documentId]: false }));
      }
    },
    [deploymentLoading, projectDeployments, projects]
  );

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

  const handleDeleteClick = useCallback((project: Project) => {
    setDeleteConfirmProject(project);
    setDeleteConfirmOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteConfirmProject?.$id) return;

    setDeleting(deleteConfirmProject.$id);
    setDeleteConfirmOpen(false);

    try {
      await databases.deleteDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID!,
        deleteConfirmProject.$id
      );

      setProjects((prev) =>
        prev.filter((p) => p.$id !== deleteConfirmProject.$id)
      );
      setProjectDeployments((prev) => {
        const newState = { ...prev };
        delete newState[deleteConfirmProject.$id!];
        return newState;
      });
      setDeploymentLoading((prev) => {
        const newState = { ...prev };
        delete newState[deleteConfirmProject.$id!];
        return newState;
      });
      setStatusFilter((prev) => {
        const newState = { ...prev };
        delete newState[deleteConfirmProject.$id!];
        return newState;
      });

      toast.success(`Project "${deleteConfirmProject.projectId}" deleted`);
    } catch (error: any) {
      console.error("Failed to delete project:", error);
      toast.error("Failed to delete project");
    } finally {
      setDeleting(null);
      setDeleteConfirmProject(null);
    }
  }, [deleteConfirmProject]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteConfirmOpen(false);
    setDeleteConfirmProject(null);
  }, []);

  const handleUpdateApiKey = useCallback(
    async (projectId: string, documentId: string) => {
      if (!newApiKey.trim()) {
        toast.error("Please enter a valid API key");
        return;
      }

      setLoading(true);
      try {
        const encodedApiKey = await encodeApiKey(newApiKey.trim());

        await databases.updateDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID!,
          documentId,
          { apiKey: encodedApiKey }
        );

        setProjects((prev) =>
          prev.map((p) =>
            p.$id === documentId ? { ...p, apiKey: encodedApiKey } : p
          )
        );

        setExpiredProjects((prev) => {
          const newSet = new Set(prev);
          newSet.delete(documentId);
          return newSet;
        });

        await fetchProjectDeployments(
          documentId,
          projectId,
          encodedApiKey,
          true
        );

        setEditingApiKey(null);
        setNewApiKey("");
        toast.success("API key updated successfully");
      } catch (error: any) {
        console.error("Failed to update API key:", error);
        toast.error("Failed to update API key");
      } finally {
        setLoading(false);
      }
    },
    [newApiKey, encodeApiKey, fetchProjectDeployments]
  );

  useEffect(() => {
    if (user?.$id && projects.length === 0) {
      fetchProjects();
    }
  }, [user?.$id, fetchProjects, projects.length]);

  useEffect(() => {
    if (!user?.$id || projects.length === 0) return;

    const interval = setInterval(() => {
      projects.forEach((project) => {
        if (project.$id && project.apiKey && project.projectId) {
          fetchProjectDeployments(
            project.$id,
            project.projectId,
            project.apiKey,
            true
          );
        }
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [user?.$id, projects, fetchProjectDeployments]);

  const handleInputChange = useCallback(
    (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    },
    []
  );

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
        const encodedApiKey = await encodeApiKey(formData.apiKey.trim());

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
            region: formData.region,
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
        onToggleForm?.(false);
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
                  onClick={() => onToggleForm?.(true)}
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
                onClick={() => onToggleForm?.(true)}
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
                Connect Project
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  mb: 3,
                  fontSize: "14px",
                  color: darkMode ? "#888888" : "#666666",
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
                    helperText="Ensure your API key includes the 'sites.read' scope."
                    FormHelperTextProps={{
                      sx: {
                        fontSize: "12px",
                        color: darkMode ? "#666666" : "#888888",
                      },
                    }}
                  />
                  <TextField
                    select
                    value={formData.region}
                    onChange={handleInputChange("region")}
                    required
                    fullWidth
                    size="small"
                    sx={{
                      ...textFieldStyle,
                      "& .MuiSelect-select": {
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        color: darkMode ? "#FFFFFF" : "#000000",
                        fontSize: "14px",
                        padding: "10px 12px",
                      },
                    }}
                    SelectProps={{
                      IconComponent: (props) => (
                        <ChevronDown
                          {...props}
                          size={18}
                          style={{
                            color: darkMode ? "#FFFFFF" : "#000000",
                            pointerEvents: "none",
                          }}
                        />
                      ),
                      MenuProps: {
                        PaperProps: {
                          sx: {
                            mt: 0.5,
                            borderRadius: "12px",
                            boxShadow: "none",
                            border: darkMode
                              ? "1px solid rgba(255,255,255,0.1)"
                              : "1px solid rgba(0,0,0,0.1)",
                            bgcolor: darkMode ? "#121212" : "#FFFFFF",
                            "& .MuiMenuItem-root": {
                              fontSize: "14px",
                              padding: "10px 12px",
                              color: darkMode ? "#FFFFFF" : "#000000",
                              "&:hover": {
                                bgcolor: darkMode
                                  ? "rgba(255,255,255,0.08)"
                                  : "rgba(0,0,0,0.05)",
                              },
                            },
                          },
                        },
                      },
                    }}
                    disabled={hasReachedLimit}
                    helperText="Select your Appwrite Cloud region"
                    FormHelperTextProps={{
                      sx: {
                        fontSize: "12px",
                        color: darkMode ? "#666666" : "#888888",
                      },
                    }}
                  >
                    <MenuItem value="fra">🇩🇪 Frankfurt (FRA)</MenuItem>
                    <MenuItem value="nyc">🇺🇸 New York (NYC)</MenuItem>
                    <MenuItem value="syd">🇦🇺 Sydney (SYD)</MenuItem>
                    <MenuItem value="sfo">🇺🇸 San Francisco (SFO)</MenuItem>
                  </TextField>
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
                        onToggleForm?.(false);
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
                const allDeployments = deploymentData?.deployments || [];
                const currentFilter = statusFilter[project.$id || ""] || "all";
                const filteredDeployments = getFilteredDeployments(
                  project.$id || "",
                  allDeployments
                );
                const paginatedDeployments = getPaginatedDeployments(
                  project.$id || "",
                  allDeployments
                );
                const totalPages = getTotalPages(filteredDeployments.length);
                const currentProjectPage = currentPage[project.$id || ""] || 1;

                const totalCount = deploymentData?.total || 0;
                const successCount =
                  deploymentData?.deployments?.filter(
                    (d) => d.status === "ready"
                  ).length || 0;
                const failedCount =
                  deploymentData?.deployments?.filter(
                    (d) => d.status === "failed"
                  ).length || 0;

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
                            onClick={() => handleDeleteClick(project)}
                            disabled={deleting === project.$id}
                          >
                            <Trash2 size={16} />
                          </IconButton>
                        </Box>

                        {/* Update API Key UI */}
                        {expiredProjects.has(project.$id || "") && (
                          <Box
                            sx={{
                              p: 2,
                              backgroundColor: darkMode
                                ? "rgba(251, 191, 36, 0.1)"
                                : "rgba(217, 119, 6, 0.1)",
                              borderBottom: "1px solid",
                              borderColor: darkMode
                                ? "rgba(255,255,255,0.1)"
                                : "rgba(0,0,0,0.06)",
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                color: darkMode ? "#fbbf24" : "#d97706",
                                mb: 1,
                                fontSize: "13px",
                                fontWeight: 500,
                              }}
                            >
                              ⚠️ API key expired or invalid. Update to continue
                              monitoring.
                            </Typography>

                            {editingApiKey === project.$id ? (
                              <Stack direction="row" spacing={1}>
                                <TextField
                                  type="password"
                                  placeholder="Enter new API key"
                                  value={newApiKey}
                                  onChange={(e) => setNewApiKey(e.target.value)}
                                  size="small"
                                  fullWidth
                                  sx={textFieldStyle}
                                />
                                <Button
                                  size="small"
                                  onClick={() =>
                                    handleUpdateApiKey(
                                      project.projectId,
                                      project.$id!
                                    )
                                  }
                                  disabled={loading}
                                  sx={{
                                    ...buttonStyle,
                                    backgroundColor: darkMode
                                      ? "#FFFFFF"
                                      : "#000000",
                                    color: darkMode ? "#000000" : "#FFFFFF",
                                    "&:hover": {
                                      backgroundColor: darkMode
                                        ? "#f5f5f5"
                                        : "#1a1a1a",
                                    },
                                  }}
                                >
                                  Save
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => {
                                    setEditingApiKey(null);
                                    setNewApiKey("");
                                  }}
                                  sx={{
                                    ...buttonStyle,
                                    borderColor: darkMode
                                      ? "rgba(255,255,255,0.2)"
                                      : "rgba(0,0,0,0.2)",
                                    color: darkMode ? "#FFFFFF" : "#000000",
                                  }}
                                >
                                  Cancel
                                </Button>
                              </Stack>
                            ) : (
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() =>
                                  setEditingApiKey(project.$id || "")
                                }
                                sx={{
                                  ...buttonStyle,
                                  borderColor: darkMode ? "#fbbf24" : "#d97706",
                                  color: darkMode ? "#fbbf24" : "#d97706",
                                  "&:hover": {
                                    borderColor: darkMode
                                      ? "#fbbf24"
                                      : "#d97706",
                                  },
                                }}
                              >
                                Update API Key
                              </Button>
                            )}
                          </Box>
                        )}

                        <Box sx={{ display: "flex", gap: 3 }}>
                          {[
                            {
                              label: "Total",
                              value: totalCount,
                              color: darkMode ? "#60a5fa" : "#2563eb",
                              filter: "all" as StatusFilter,
                            },
                            {
                              label: "Success",
                              value: successCount,
                              color: darkMode ? "#4ade80" : "#16a34a",
                              filter: "ready" as StatusFilter,
                            },
                            {
                              label: "Failed",
                              value: failedCount,
                              color: darkMode ? "#f87171" : "#dc2626",
                              filter: "failed" as StatusFilter,
                            },
                          ].map(({ label, value, color, filter }) => (
                            <Box
                              key={label}
                              onClick={() =>
                                handleStatusFilterClick(
                                  project.$id || "",
                                  filter
                                )
                              }
                              sx={{
                                cursor: "pointer",
                                transition: "all 0.2s",
                                padding: "4px 8px",
                                borderRadius: "6px",
                                opacity: currentFilter === filter ? 1 : 0.4,
                                "&:hover": {
                                  opacity: currentFilter === filter ? 1 : 0.6,
                                },
                              }}
                            >
                              <Typography
                                variant="body1"
                                sx={{
                                  fontWeight: 600,
                                  color,
                                }}
                              >
                                {value}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: darkMode ? "#9ca3af" : "#6b7280",
                                }}
                              >
                                {label}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    </Box>

                    {isLoadingDeployments &&
                    !projectDeployments[project.$id || ""] ? (
                      <Box sx={{ p: 3, textAlign: "center" }}>
                        <Typography
                          variant="body1"
                          sx={{
                            color: darkMode ? "#FFFFFF" : "#000000",
                            fontWeight: 500,
                          }}
                        >
                          Loading deployments...
                        </Typography>
                      </Box>
                    ) : paginatedDeployments.length > 0 ? (
                      <TableContainer
                        sx={{
                          width: "100%",
                          overflowX: "auto",
                          scrollbarWidth: "none",
                          msOverflowStyle: "none",
                          "&::-webkit-scrollbar": {
                            display: "none",
                          },
                        }}
                      >
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              {[
                                "ID",
                                "Status",
                                "Site",
                                "Duration",
                                "Build Size",
                                "Total Size",
                                "Created",
                                "Actions",
                              ].map((header) => (
                                <TableCell
                                  key={header}
                                  sx={{
                                    color: darkMode ? "#888888" : "#666666",
                                    fontSize: "13px",
                                    fontWeight: 500,
                                    py: 1,
                                    px: 1.5,
                                    backgroundColor: darkMode
                                      ? "rgba(255,255,255,0.02)"
                                      : "rgba(0,0,0,0.02)",
                                    border: "none",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {header}
                                </TableCell>
                              ))}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {paginatedDeployments.map((deployment) => (
                              <TableRow key={deployment.$id}>
                                <TableCell
                                  sx={{
                                    fontFamily: "monospace",
                                    color: darkMode ? "#FFFFFF" : "#000000",
                                    fontSize: "12.5px",
                                    p: 1,
                                    border: "none",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    maxWidth: 140,
                                  }}
                                  title={deployment.resourceId}
                                >
                                  {deployment.resourceId}
                                </TableCell>

                                <TableCell sx={{ p: 1, border: "none" }}>
                                  <Chip
                                    label={deployment.status}
                                    size="small"
                                    sx={{
                                      backgroundColor: `${getStatusColor(
                                        deployment.status
                                      )}20`,
                                      color: getStatusColor(deployment.status),
                                      fontSize: "12px",
                                      textTransform: "capitalize",
                                      height: 20,
                                    }}
                                  />
                                </TableCell>

                                <TableCell
                                  sx={{
                                    color: darkMode ? "#FFFFFF" : "#000000",
                                    fontSize: "13px",
                                    p: 1,
                                    border: "none",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    maxWidth: 180,
                                  }}
                                >
                                  {deployment.siteName}
                                </TableCell>

                                <TableCell
                                  sx={{
                                    color: darkMode ? "#888888" : "#666666",
                                    fontSize: "13px",
                                    p: 1,
                                    border: "none",
                                  }}
                                >
                                  {formatDuration(deployment.buildDuration)}
                                </TableCell>

                                <TableCell
                                  sx={{
                                    color: darkMode ? "#888888" : "#666666",
                                    fontSize: "13px",
                                    p: 1,
                                    border: "none",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {deployment.buildSize > 0
                                    ? `${(
                                        deployment.buildSize /
                                        1024 /
                                        1024
                                      ).toFixed(2)} MB`
                                    : "N/A"}
                                </TableCell>

                                <TableCell
                                  sx={{
                                    color: darkMode ? "#888888" : "#666666",
                                    fontSize: "13px",
                                    p: 1,
                                    border: "none",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {deployment.totalSize > 0
                                    ? `${(
                                        deployment.totalSize /
                                        1024 /
                                        1024
                                      ).toFixed(2)} MB`
                                    : "N/A"}
                                </TableCell>

                                <TableCell
                                  sx={{
                                    color: darkMode ? "#888888" : "#666666",
                                    fontSize: "12.5px",
                                    p: 1,
                                    border: "none",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {new Date(
                                    deployment.$createdAt
                                  ).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </TableCell>

                                <TableCell
                                  align="center"
                                  sx={{
                                    p: 1,
                                    border: "none",
                                    width: "1%",
                                  }}
                                >
                                  <Tooltip
                                    title="View in Console"
                                    arrow
                                    placement="top"
                                    slotProps={{
                                      popper: {
                                        sx: {
                                          "& .MuiTooltip-tooltip": {
                                            bgcolor: darkMode ? "#FFF" : "#000",
                                            color: darkMode ? "#000" : "#FFF",
                                            border: `1px solid ${
                                              darkMode ? "#333" : "#ddd"
                                            }`,
                                            borderRadius: "8px",
                                            fontSize: "12px",
                                            padding: "4px 8px",
                                            fontWeight: "500",
                                          },
                                          "& .MuiTooltip-arrow": {
                                            color: darkMode ? "#FFF" : "#000",
                                          },
                                        },
                                      },
                                    }}
                                  >
                                    <IconButton
                                      size="small"
                                      onClick={() => {
                                        const link = getConsoleLink(
                                          deployment,
                                          project.projectId,
                                          project.region
                                        );
                                        window.open(link, "_blank");
                                      }}
                                      sx={{
                                        color: darkMode ? "#60a5fa" : "#2563eb",
                                        p: "4px",
                                        "&:hover": {
                                          backgroundColor: darkMode
                                            ? "rgba(96, 165, 250, 0.1)"
                                            : "rgba(37, 99, 235, 0.1)",
                                        },
                                      }}
                                    >
                                      <ExternalLink
                                        size={15}
                                        strokeWidth={1.5}
                                      />
                                    </IconButton>
                                  </Tooltip>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : null}

                    {filteredDeployments.length > DEPLOYMENTS_PER_PAGE && (
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          gap: 2,
                          p: 2,
                          borderTop: "1px solid",
                          borderColor: darkMode
                            ? "rgba(255,255,255,0.1)"
                            : "rgba(0,0,0,0.06)",
                        }}
                      >
                        <Button
                          size="small"
                          onClick={() =>
                            setCurrentPage((prev) => ({
                              ...prev,
                              [project.$id || ""]: Math.max(
                                1,
                                currentProjectPage - 1
                              ),
                            }))
                          }
                          disabled={currentProjectPage === 1}
                          sx={{
                            ...buttonStyle,
                            minWidth: "80px",
                            color: darkMode ? "#FFFFFF" : "#000000",
                            borderColor: darkMode
                              ? "rgba(255,255,255,0.2)"
                              : "rgba(0,0,0,0.2)",
                            "&.Mui-disabled": {
                              color: darkMode ? "#666666" : "#999999",
                            },
                            "&:hover, &:focus, &:active": {
                              outline: "none",
                              boxShadow: "none",
                              borderColor: darkMode
                                ? "rgba(255,255,255,0.2)"
                                : "rgba(0,0,0,0.2)",
                              backgroundColor: "transparent",
                            },
                          }}
                        >
                          Previous
                        </Button>

                        <Typography
                          variant="body2"
                          sx={{
                            color: darkMode ? "#888888" : "#666666",
                          }}
                        >
                          Page {currentProjectPage} of {totalPages}
                        </Typography>

                        <Button
                          size="small"
                          onClick={() =>
                            setCurrentPage((prev) => ({
                              ...prev,
                              [project.$id || ""]: Math.min(
                                totalPages,
                                currentProjectPage + 1
                              ),
                            }))
                          }
                          disabled={currentProjectPage === totalPages}
                          sx={{
                            ...buttonStyle,
                            minWidth: "80px",
                            color: darkMode ? "#FFFFFF" : "#000000",
                            borderColor: darkMode
                              ? "rgba(255,255,255,0.2)"
                              : "rgba(0,0,0,0.2)",
                            "&.Mui-disabled": {
                              color: darkMode ? "#666666" : "#999999",
                            },
                            "&:hover, &:focus, &:active": {
                              outline: "none",
                              boxShadow: "none",
                              borderColor: darkMode
                                ? "rgba(255,255,255,0.2)"
                                : "rgba(0,0,0,0.2)",
                              backgroundColor: "transparent",
                            },
                          }}
                        >
                          Next
                        </Button>
                      </Box>
                    )}

                    {!isLoadingDeployments &&
                      deploymentData &&
                      filteredDeployments.length === 0 &&
                      allDeployments.length > 0 && (
                        <Box sx={{ p: 3, textAlign: "center" }}>
                          <Typography
                            variant="body2"
                            sx={{ color: darkMode ? "#888888" : "#666666" }}
                          >
                            No{" "}
                            {currentFilter === "ready"
                              ? "successful"
                              : "failed"}{" "}
                            deployments found
                          </Typography>
                        </Box>
                      )}

                    {!isLoadingDeployments &&
                      deploymentData &&
                      allDeployments.length === 0 && (
                        <Box sx={{ p: 3, textAlign: "center" }}>
                          <Typography
                            variant="body2"
                            sx={{ color: darkMode ? "#888888" : "#666666" }}
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

      <DeleteDialog
        open={deleteConfirmOpen}
        darkMode={darkMode}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
      />

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
