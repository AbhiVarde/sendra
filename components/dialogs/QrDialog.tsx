import React, { forwardRef } from "react";
import { Dialog, Button, Typography, Slide, Box } from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";

const Transition = forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export interface QrDialogProps {
  open: boolean;
  darkMode: boolean;
  qrProjectId: string;
  qrRegion: string;
  onClose: () => void;
  getProjectQR: (projectId: string, region: string, size: number) => string;
}

const QrDialog: React.FC<QrDialogProps> = ({
  open,
  darkMode,
  qrProjectId,
  qrRegion,
  onClose,
  getProjectQR,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      transitionDuration={300}
      PaperProps={{
        sx: {
          borderRadius: 4,
          backgroundColor: darkMode ? "#000000" : "#FFFFFF",
          border: "1px solid",
          borderColor: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)",
          boxShadow: darkMode
            ? "0 4px 20px rgba(0,0,0,0.4)"
            : "0 4px 20px rgba(0,0,0,0.1)",
          p: 2.5,
        },
      }}
      BackdropProps={{
        sx: { backgroundColor: "rgba(0,0,0,0.5)" },
      }}
    >
      <Box sx={{ textAlign: "center" }}>
        <Typography
          variant="h6"
          sx={{
            color: darkMode ? "#FFFFFF" : "#000000",
            fontSize: "15px",
            fontWeight: 500,
            mb: 2,
          }}
        >
          Open on another device
        </Typography>

        <Box
          component="img"
          src={getProjectQR(qrProjectId, qrRegion, 220)}
          alt="QR Code"
          sx={{
            width: 220,
            height: 220,
            border: `1px solid ${
              darkMode ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)"
            }`,
            borderRadius: "8px",
            mb: 2,
          }}
        />

        <Typography
          variant="body2"
          sx={{
            color: darkMode ? "#888888" : "#666666",
            fontSize: "12px",
            mb: 2,
          }}
        >
          Scan to open your project on another device
        </Typography>

        <Button
          variant="outlined"
          onClick={onClose}
          sx={{
            width: "100%",
            height: 32,
            borderRadius: 3,
            textTransform: "none",
            fontSize: "13px",
            fontWeight: 500,
            color: darkMode ? "#ffffff" : "#000000",
            borderColor: darkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)",
            "&:hover": {
              borderColor: darkMode ? "#ffffff" : "#000000",
            },
          }}
        >
          Close
        </Button>
      </Box>
    </Dialog>
  );
};

export default QrDialog;
