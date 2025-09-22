"use client";

import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Stack,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { Send, CheckCircle, XCircle } from "lucide-react";
import Image from "next/image";

export default function Home() {
  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 8 }}>
      {/* Hero Section */}
      <Box textAlign="center" mb={6}>
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          🚀 Sendra
        </Typography>
        <Typography variant="h6" color="text.secondary" mb={4}>
          Never miss a failed deployment. Get AI-powered error analysis and
          email notifications.
        </Typography>
        <Stack direction="row" spacing={2} justifyContent="center">
          <Button variant="contained" startIcon={<Send />} size="large">
            Get Started
          </Button>
          <Button variant="outlined" size="large">
            View Demo
          </Button>
        </Stack>
      </Box>

      {/* Add Project Form */}
      <Paper sx={{ p: 4, mb: 6 }}>
        <Typography variant="h6" mb={3}>
          Connect your Appwrite Project
        </Typography>
        <Stack spacing={2}>
          <TextField label="Project ID" fullWidth />
          <TextField label="API Key" type="password" fullWidth />
          <TextField label="Email for notifications" type="email" fullWidth />
          <Button variant="contained" startIcon={<Send />}>
            Connect Project
          </Button>
        </Stack>
      </Paper>

      {/* Deployment Table */}
      <Typography variant="h6" mb={2}>
        Recent Deployments
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Branch</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>AI Analysis</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>main</TableCell>
              <TableCell>
                <CheckCircle color="green" size={18} /> Success
              </TableCell>
              <TableCell>2h ago</TableCell>
              <TableCell>Build OK</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>feature-x</TableCell>
              <TableCell>
                <XCircle color="red" size={18} /> Failed
              </TableCell>
              <TableCell>5h ago</TableCell>
              <TableCell>Missing NODE_ENV</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}
