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
  Tabs,
  Tab,
} from "@mui/material";
import {
  Plus,
  Activity,
  RefreshCw,
  Trash2,
  ChevronDown,
  ExternalLink,
  QrCode,
} from "lucide-react";
import { databases, functions } from "@/lib/appwrite";
import { ID, Query } from "appwrite";
import { toast } from "sonner";
import { getCleanAvatar, getRegionFlag, getProjectQR } from "@/lib/avatarUtils";
import DeleteDialog from "../dialogs/DeleteDialog";
import QrDialog from "../dialogs/QrDialog";

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
  siteName?: string;
  functionName?: string;
  buildDuration: number;
  buildSize: number;
  totalSize: number;
  $createdAt: string;
  type: string;
  siteId?: string;
  functionId?: string;
}

interface SiteDeploymentsResponse {
  deployments: Deployment[];
  total: number;
  latestDeployment: Deployment | null;
  sitesCount: number;
}

interface FunctionDeploymentsResponse {
  deployments: Deployment[];
  total: number;
  latestDeployment: Deployment | null;
  functionsCount: number;
}

interface DeploymentResponse {
  error?: string;
  success: boolean;
  sites: SiteDeploymentsResponse;
  functions: FunctionDeploymentsResponse;
  isExpired?: boolean;
}

type StatusFilter = "all" | "ready" | "failed";
type DeploymentTab = "sites" | "functions";

const MAX_PROJECTS = 3;
const DEPLOYMENTS_PER_PAGE = 5;

const Dashboard: React.FC<DashboardProps> = ({
  darkMode,
  user,
  showFormProp,
  onToggleForm,
}) => {
  const [showForm, setShowForm] = useState(showFormProp ?? false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [qrProjectId, setQrProjectId] = useState<string>("");
  const [qrRegion, setQrRegion] = useState<string>("");

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [formData, setFormData] = useState<FormData>({
    projectId: "",
    email: user?.email || "",
    apiKey: "",
    region: "fra",
  });
  const [editingApiKey, setEditingApiKey] = useState<string | null>(null);
  const [newApiKey, setNewApiKey] = useState("");

  const [projectSiteDeployments, setProjectSiteDeployments] = useState<
    Record<string, SiteDeploymentsResponse>
  >({});
  const [projectFunctionDeployments, setProjectFunctionDeployments] = useState<
    Record<string, FunctionDeploymentsResponse>
  >({});
  const [deploymentLoading, setDeploymentLoading] = useState<
    Record<string, boolean>
  >({});
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
  const [activeTab, setActiveTab] = useState<Record<string, DeploymentTab>>({});
  const [resourceFilter, setResourceFilter] = useState<Record<string, string>>(
    {}
  );

  const hasReachedLimit = projects.length >= MAX_PROJECTS;

  useEffect(() => {
    if (showFormProp !== undefined) {
      setShowForm(showFormProp);
    }
  }, [showFormProp]);

  useEffect(() => {
    if (!user) {
      setProjects([]);
      setProjectSiteDeployments({});
      setProjectFunctionDeployments({});
      setDeploymentLoading({});
      setInitialLoading(false);
    }
  }, [user]);

  const encodeApiKey = useCallback(async (apiKey: string): Promise<string> => {
    const SECRET_KEY = process.env.NEXT_PUBLIC_APPWRITE_ENCRYPTION_SECRET || "";

    // Make sure key is exactly 32 bytes
    const encoder = new TextEncoder();
    const secretBytes = encoder.encode(SECRET_KEY);
    const keyBytes = new Uint8Array(32);

    // Copy secret into 32-byte array
    for (let i = 0; i < 32; i++) {
      keyBytes[i] = i < secretBytes.length ? secretBytes[i] : 0;
    }

    const data = encoder.encode(apiKey);

    const key = await crypto.subtle.importKey(
      "raw",
      keyBytes,
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
    (
      deployment: Deployment,
      projectId: string,
      region: string,
      type: DeploymentTab
    ) => {
      console.log("Getting console link for deployment:", deployment);
      if (type === "functions") {
        const functionId =
          deployment.functionId || deployment.resourceId.split("/")[0];
        const deploymentId = deployment.$id;
        return `https://cloud.appwrite.io/console/project-${region}-${projectId}/functions/function-${functionId}/deployment-${deploymentId}`;
      } else {
        const siteId = deployment.siteId || deployment.resourceId.split("/")[0];
        const deploymentId = deployment.$id;
        return `https://cloud.appwrite.io/console/project-${region}-${projectId}/sites/site-${siteId}/deployments/deployment-${deploymentId}`;
      }
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
    (projectId: string, deployments: Deployment[], tab: DeploymentTab) => {
      const filterKey = `${projectId}-${tab}`;
      const filter = statusFilter[filterKey] || "all";
      const resourceFilterKey = `${projectId}-${tab}`;
      const selectedResource = resourceFilter[resourceFilterKey] || "all";

      let filtered = deployments;

      // Filter by status
      if (filter === "ready") {
        filtered = filtered.filter((d) => d.status === "ready");
      } else if (filter === "failed") {
        filtered = filtered.filter((d) => d.status === "failed");
      }

      // Filter by resource
      if (selectedResource !== "all") {
        filtered = filtered.filter((d) => {
          const resourceName = tab === "sites" ? d.siteName : d.functionName;
          return resourceName === selectedResource;
        });
      }

      return filtered;
    },
    [statusFilter, resourceFilter]
  );

  const getPaginatedDeployments = useCallback(
    (projectId: string, deployments: Deployment[], tab: DeploymentTab) => {
      const filteredDeployments = getFilteredDeployments(
        projectId,
        deployments,
        tab
      );
      const pageKey = `${projectId}-${tab}`;
      const page = currentPage[pageKey] || 1;
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
    (projectId: string, filter: StatusFilter, tab: DeploymentTab) => {
      const filterKey = `${projectId}-${tab}`;
      setStatusFilter((prev) => ({
        ...prev,
        [filterKey]: filter,
      }));
      setCurrentPage((prev) => ({
        ...prev,
        [filterKey]: 1,
      }));
    },
    []
  );

  const handleTabChange = useCallback(
    (projectId: string, newTab: DeploymentTab) => {
      setActiveTab((prev) => ({
        ...prev,
        [projectId]: newTab,
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
        (deploymentLoading[documentId] ||
          (projectSiteDeployments[documentId] &&
            projectFunctionDeployments[documentId]))
      ) {
        return;
      }

      setDeploymentLoading((prev) => ({ ...prev, [documentId]: true }));

      let result: any = null;

      try {
        result = await functions.createExecution(
          process.env.NEXT_PUBLIC_APPWRITE_FETCH_DEPLOYMENTS_FUNCTION_ID!,
          JSON.stringify({ projectId, apiKey: encodedApiKey }),
          false
        );

        const response: DeploymentResponse = JSON.parse(result.responseBody);

        if (response.success) {
          // Store site deployments
          setProjectSiteDeployments((prev) => ({
            ...prev,
            [documentId]: response.sites,
          }));

          // Store function deployments
          setProjectFunctionDeployments((prev) => ({
            ...prev,
            [documentId]: response.functions,
          }));

          // Total deployment count (sites + functions)
          const totalDeployments =
            response.sites.total + response.functions.total;
          const currentProject = projects.find((p) => p.$id === documentId);

          if (
            currentProject &&
            currentProject.deployments !== totalDeployments
          ) {
            await databases.updateDocument(
              process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
              process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID!,
              documentId,
              { deployments: totalDeployments }
            );

            setProjects((prev) =>
              prev.map((p) =>
                p.$id === documentId
                  ? { ...p, deployments: totalDeployments }
                  : p
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
        setIsSubmitting(false);
      }
    },
    [
      deploymentLoading,
      projectSiteDeployments,
      projectFunctionDeployments,
      projects,
    ]
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
            !projectSiteDeployments[project.$id] &&
            !projectFunctionDeployments[project.$id]
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
    [
      user?.$id,
      projectSiteDeployments,
      projectFunctionDeployments,
      fetchProjectDeployments,
    ]
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
      setProjectSiteDeployments((prev) => {
        const newState = { ...prev };
        delete newState[deleteConfirmProject.$id!];
        return newState;
      });
      setProjectFunctionDeployments((prev) => {
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
        delete newState[`${deleteConfirmProject.$id!}-sites`];
        delete newState[`${deleteConfirmProject.$id!}-functions`];
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

  const getUniqueResources = useCallback(
    (deployments: Deployment[], tab: DeploymentTab) => {
      const resources = new Set<string>();
      deployments.forEach((d) => {
        const name = tab === "sites" ? d.siteName : d.functionName;
        if (name) resources.add(name);
      });
      return Array.from(resources).sort();
    },
    []
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
      setIsSubmitting(true);

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

        try {
          await functions.createExecution(
            process.env.NEXT_PUBLIC_APPWRITE_FETCH_DEPLOYMENTS_FUNCTION_ID!,
            JSON.stringify({
              projectId: formData.projectId.trim(),
              apiKey: encodedApiKey,
              checkFailures: true,
            }),
            false
          );
        } catch (monitorError) {
          console.error("Initial failure check failed:", monitorError);
        }

        await fetchProjectDeployments(
          projectData.$id!,
          formData.projectId.trim(),
          encodedApiKey
        );

        resetForm();
        onToggleForm?.(false);
        setShowForm(false);
      } catch (err: any) {
        console.error("Project creation error:", err);
        if (err.code === 409) {
          toast.error("Project ID already exists");
        } else {
          toast.error("Failed to connect project");
        }
        setIsSubmitting(false);
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
    const totalSiteDeployments = Object.values(projectSiteDeployments).reduce(
      (acc, response) => acc + (response?.total || 0),
      0
    );
    const totalFunctionDeployments = Object.values(
      projectFunctionDeployments
    ).reduce((acc, response) => acc + (response?.total || 0), 0);

    return {
      projects: projects.length,
      deployments: totalSiteDeployments + totalFunctionDeployments,
      active: projects.filter((p) => p.isActive).length,
    };
  }, [projects, projectSiteDeployments, projectFunctionDeployments]);

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
                    src={getCleanAvatar(user?.name || "User", darkMode, 80)}
                    sx={{
                      width: 40,
                      height: 40,
                      border: `1px solid ${
                        darkMode ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)"
                      }`,
                    }}
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

          {projects.length === 0 && !showForm && !isSubmitting && (
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

          {/* FORM SECTION */}
          {showForm && (
            <Box
              sx={{
                p: 2,
                backgroundColor: darkMode ? "#000000" : "#FFFFFF",
                border: "1px solid",
                borderColor: darkMode
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(0,0,0,0.06)",
                borderRadius: 4,
                padding: 4,
              }}
            >
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
                    helperText="Ensure your API key includes 'sites.read' and 'functions.read' scopes."
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
                    <MenuItem value="sgp">🇸🇬 Singapore (SGP)</MenuItem>
                    <MenuItem value="tor">🇨🇦 Toronto (TOR)</MenuItem>
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

          {isSubmitting && projects.length > 0 && (
            <Box sx={cardStyle}>
              <Box sx={{ p: 4, textAlign: "center" }}>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 500,
                    mb: 1,
                    color: darkMode ? "#FFFFFF" : "#000000",
                    fontSize: "16px",
                  }}
                >
                  Loading project deployments...
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: darkMode ? "#888888" : "#666666",
                    fontSize: "14px",
                  }}
                >
                  Please wait while we fetch your deployment data
                </Typography>
              </Box>
            </Box>
          )}

          {projects.length > 0 && !isSubmitting && (
            <Stack spacing={2}>
              {projects.map((project) => {
                const currentTab = activeTab[project.$id || ""] || "sites";
                const siteData = projectSiteDeployments[project.$id || ""];
                const functionData =
                  projectFunctionDeployments[project.$id || ""];
                const isLoadingDeployments =
                  deploymentLoading[project.$id || ""];

                const allSiteDeployments = siteData?.deployments || [];
                const allFunctionDeployments = functionData?.deployments || [];

                const currentDeployments =
                  currentTab === "sites"
                    ? allSiteDeployments
                    : allFunctionDeployments;
                const currentFilter =
                  statusFilter[`${project.$id}-${currentTab}`] || "all";
                const filteredDeployments = getFilteredDeployments(
                  project.$id || "",
                  currentDeployments,
                  currentTab
                );
                const paginatedDeployments = getPaginatedDeployments(
                  project.$id || "",
                  currentDeployments,
                  currentTab
                );
                const totalPages = getTotalPages(filteredDeployments.length);
                const pageKey = `${project.$id}-${currentTab}`;
                const currentProjectPage = currentPage[pageKey] || 1;

                const siteTotalCount = siteData?.total || 0;
                const siteSuccessCount =
                  siteData?.deployments?.filter((d) => d.status === "ready")
                    .length || 0;
                const siteFailedCount =
                  siteData?.deployments?.filter((d) => d.status === "failed")
                    .length || 0;

                const functionTotalCount = functionData?.total || 0;
                const functionSuccessCount =
                  functionData?.deployments?.filter((d) => d.status === "ready")
                    .length || 0;
                const functionFailedCount =
                  functionData?.deployments?.filter(
                    (d) => d.status === "failed"
                  ).length || 0;

                const totalCount =
                  currentTab === "sites" ? siteTotalCount : functionTotalCount;
                const successCount =
                  currentTab === "sites"
                    ? siteSuccessCount
                    : functionSuccessCount;
                const failedCount =
                  currentTab === "sites"
                    ? siteFailedCount
                    : functionFailedCount;

                return (
                  <Box
                    key={project.$id}
                    sx={{
                      p: 0,
                      backgroundColor: darkMode ? "#000000" : "#FFFFFF",
                      border: "1px solid",
                      borderColor: darkMode
                        ? "rgba(255,255,255,0.1)"
                        : "rgba(0,0,0,0.06)",
                      borderRadius: 4,
                      overflow: "hidden",
                    }}
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
                            gap: 0.75,
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
                              fontSize: "12px",
                              fontWeight: 500,
                              height: 22,
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

                          <Tooltip
                            title={`Region: ${project.region.toUpperCase()}`}
                            arrow
                            placement="top"
                            slotProps={{
                              tooltip: {
                                sx: {
                                  backgroundColor: darkMode
                                    ? "#FFFFFF"
                                    : "#000000",
                                  color: darkMode ? "#000000" : "#FFFFFF",
                                  fontSize: "11px",
                                  borderRadius: "6px",
                                  border: darkMode
                                    ? "1px solid rgba(0,0,0,0.1)"
                                    : "1px solid rgba(255,255,255,0.1)",
                                  boxShadow: darkMode
                                    ? "0 2px 8px rgba(0,0,0,0.25)"
                                    : "0 2px 8px rgba(0,0,0,0.15)",
                                  padding: "6px 10px",
                                },
                              },
                              arrow: {
                                sx: {
                                  color: darkMode ? "#FFFFFF" : "#000000",
                                },
                              },
                            }}
                          >
                            <Box
                              component="img"
                              src={getRegionFlag(project.region, 24, 24)}
                              alt={project.region}
                              sx={{
                                width: 18,
                                height: 18,
                                borderRadius: "3px",
                                objectFit: "cover",
                                border: `1px solid ${
                                  darkMode
                                    ? "rgba(255,255,255,0.15)"
                                    : "rgba(0,0,0,0.15)"
                                }`,
                              }}
                            />
                          </Tooltip>

                          <Box sx={{ display: "flex", gap: 0.5, ml: 0.5 }}>
                            <Tooltip
                              title="Share QR Code"
                              arrow
                              placement="top"
                              slotProps={{
                                tooltip: {
                                  sx: {
                                    backgroundColor: darkMode
                                      ? "#FFFFFF"
                                      : "#000000",
                                    color: darkMode ? "#000000" : "#FFFFFF",
                                    fontSize: "11px",
                                    borderRadius: "6px",
                                    border: darkMode
                                      ? "1px solid rgba(0,0,0,0.1)"
                                      : "1px solid rgba(255,255,255,0.1)",
                                    boxShadow: darkMode
                                      ? "0 2px 8px rgba(0,0,0,0.25)"
                                      : "0 2px 8px rgba(0,0,0,0.15)",
                                    padding: "6px 10px",
                                  },
                                },
                                arrow: {
                                  sx: {
                                    color: darkMode ? "#FFFFFF" : "#000000",
                                  },
                                },
                              }}
                            >
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setQrProjectId(project.projectId);
                                  setQrRegion(project.region);
                                  setQrDialogOpen(true);
                                }}
                                sx={{
                                  width: 28,
                                  height: 28,
                                  color: darkMode ? "#60a5fa" : "#2563eb",
                                  "&:hover": {
                                    backgroundColor: darkMode
                                      ? "rgba(96, 165, 250, 0.1)"
                                      : "rgba(37, 99, 235, 0.1)",
                                  },
                                }}
                              >
                                <QrCode size={14} />
                              </IconButton>
                            </Tooltip>

                            <IconButton
                              size="small"
                              onClick={() => handleDeleteClick(project)}
                              disabled={deleting === project.$id}
                              sx={{
                                width: 28,
                                height: 28,
                                color: darkMode ? "#f87171" : "#dc2626",
                                "&:hover": {
                                  backgroundColor: darkMode
                                    ? "rgba(248, 113, 113, 0.1)"
                                    : "rgba(220, 38, 38, 0.1)",
                                },
                                "&.Mui-disabled": {
                                  color: darkMode ? "#666666" : "#999999",
                                },
                              }}
                            >
                              <Trash2 size={14} />
                            </IconButton>
                          </Box>
                        </Box>

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
                                  filter,
                                  currentTab
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

                    {/* API Key Expired Warning */}
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
                            onClick={() => setEditingApiKey(project.$id || "")}
                            sx={{
                              ...buttonStyle,
                              borderColor: darkMode ? "#fbbf24" : "#d97706",
                              color: darkMode ? "#fbbf24" : "#d97706",
                              "&:hover": {
                                borderColor: darkMode ? "#fbbf24" : "#d97706",
                              },
                            }}
                          >
                            Update API Key
                          </Button>
                        )}
                      </Box>
                    )}

                    {/* TABS AND FILTER */}
                    <Box
                      sx={{
                        borderBottom: 1,
                        borderColor: darkMode
                          ? "rgba(255,255,255,0.1)"
                          : "rgba(0,0,0,0.06)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        px: 2,
                        flexWrap: "wrap",
                        gap: 1,
                      }}
                    >
                      <Tabs
                        value={currentTab}
                        onChange={(e, newValue) => {
                          handleTabChange(project.$id || "", newValue);
                          const filterKey = `${project.$id}-${newValue}`;
                          setResourceFilter((prev) => ({
                            ...prev,
                            [filterKey]: "all",
                          }));
                        }}
                        sx={{
                          minHeight: "40px",
                          "& .MuiTabs-indicator": {
                            backgroundColor: darkMode ? "#FFFFFF" : "#000000",
                          },
                          "& .MuiTabs-flexContainer": {
                            flexWrap: "wrap",
                          },
                        }}
                        TabIndicatorProps={{
                          style: { transition: "none" },
                        }}
                      >
                        <Tab
                          disableRipple
                          label={`Sites (${siteTotalCount})`}
                          value="sites"
                          sx={{
                            minHeight: "40px",
                            textTransform: "none",
                            fontSize: { xs: "12px", sm: "13px" },
                            fontWeight: 500,
                            color: darkMode ? "#888888" : "#666666",
                            "&.Mui-selected": {
                              color: darkMode ? "#FFFFFF" : "#000000",
                            },
                            "&:focus": {
                              outline: "none",
                            },
                          }}
                        />
                        <Tab
                          disableRipple
                          label={`Functions (${functionTotalCount})`}
                          value="functions"
                          sx={{
                            minHeight: "40px",
                            textTransform: "none",
                            fontSize: { xs: "12px", sm: "13px" },
                            fontWeight: 500,
                            color: darkMode ? "#888888" : "#666666",
                            "&.Mui-selected": {
                              color: darkMode ? "#FFFFFF" : "#000000",
                            },
                            "&:focus": {
                              outline: "none",
                            },
                          }}
                        />
                      </Tabs>

                      <TextField
                        select
                        size="small"
                        value={
                          resourceFilter[`${project.$id}-${currentTab}`] ||
                          "all"
                        }
                        onChange={(e) => {
                          const filterKey = `${project.$id}-${currentTab}`;
                          setResourceFilter((prev) => ({
                            ...prev,
                            [filterKey]: e.target.value,
                          }));
                          setCurrentPage((prev) => ({
                            ...prev,
                            [filterKey]: 1,
                          }));
                        }}
                        sx={{
                          ...textFieldStyle,
                          minWidth: { xs: "100%", sm: 180 },
                          mb: { xs: 1, sm: 0.5 },
                          "& .MuiSelect-select": {
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            color: darkMode ? "#FFFFFF" : "#000000",
                            fontSize: "13px",
                            padding: "6px 12px",
                            transition: "all 0.2s ease",
                          },
                        }}
                        SelectProps={{
                          IconComponent: (props) => (
                            <ChevronDown
                              {...props}
                              size={16}
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
                                boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
                                border: darkMode
                                  ? "1px solid rgba(255,255,255,0.1)"
                                  : "1px solid rgba(0,0,0,0.1)",
                                bgcolor: darkMode ? "#111111" : "#FFFFFF",
                                maxHeight: 300,
                                overflowY: "auto",
                                "& .MuiMenuItem-root": {
                                  fontSize: "13px",
                                  padding: "8px 12px",
                                  color: darkMode ? "#FFFFFF" : "#000000",
                                  transition: "background-color 0.2s ease",
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
                      >
                        <MenuItem value="all">
                          All {currentTab === "sites" ? "Sites" : "Functions"}
                        </MenuItem>
                        {getUniqueResources(currentDeployments, currentTab).map(
                          (resource) => (
                            <MenuItem key={resource} value={resource}>
                              {resource}
                            </MenuItem>
                          )
                        )}
                      </TextField>
                    </Box>

                    {/* DEPLOYMENTS TABLE */}
                    {isLoadingDeployments && !siteData && !functionData ? (
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
                                currentTab === "sites" ? "Site" : "Function",
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
                                  {currentTab === "sites"
                                    ? deployment.siteName
                                    : deployment.functionName}
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
                                  sx={{ p: 1, border: "none", width: "1%" }}
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
                                          project.region,
                                          currentTab
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

                    {/* PAGINATION */}
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
                              [pageKey]: Math.max(1, currentProjectPage - 1),
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
                              [pageKey]: Math.min(
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
                          }}
                        >
                          Next
                        </Button>
                      </Box>
                    )}

                    {/* NO DEPLOYMENTS MESSAGES */}
                    {!isLoadingDeployments &&
                      (currentTab === "sites" ? siteData : functionData) &&
                      filteredDeployments.length === 0 &&
                      currentDeployments.length > 0 && (
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
                      (currentTab === "sites" ? siteData : functionData) &&
                      currentDeployments.length === 0 && (
                        <Box sx={{ p: 3, textAlign: "center" }}>
                          <Typography
                            variant="body2"
                            sx={{ color: darkMode ? "#888888" : "#666666" }}
                          >
                            No {currentTab === "sites" ? "site" : "function"}{" "}
                            deployments found
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

      <QrDialog
        open={qrDialogOpen}
        darkMode={darkMode}
        qrProjectId={qrProjectId}
        qrRegion={qrRegion}
        onClose={() => setQrDialogOpen(false)}
        getProjectQR={getProjectQR}
      />

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
