import React, { forwardRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Slide,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";

const Transition = forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export interface DeleteDialogProps {
  open: boolean;
  darkMode: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const DeleteDialog: React.FC<DeleteDialogProps> = ({
  open,
  darkMode,
  onCancel,
  onConfirm,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      TransitionComponent={Transition}
      transitionDuration={300}
      keepMounted
      PaperProps={{
        sx: {
          borderRadius: 4,
          backgroundColor: darkMode ? "#000000" : "#FFFFFF",
          border: "1px solid",
          borderColor: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)",
          boxShadow: darkMode
            ? "0 4px 20px rgba(0,0,0,0.4)"
            : "0 4px 20px rgba(0,0,0,0.1)",
        },
      }}
      BackdropProps={{
        sx: {
          backgroundColor: "rgba(0,0,0,0.5)",
        },
      }}
    >
      <DialogTitle
        sx={{
          color: darkMode ? "#ffffff" : "#000000",
          fontSize: "18px",
          fontWeight: 500,
          p: 2,
          pb: 1,
        }}
      >
        Delete deployment
      </DialogTitle>

      <DialogContent sx={{ px: 2, pb: 1.5 }}>
        <Typography
          sx={{
            color: darkMode ? "#b0b0b0" : "#666666",
            fontSize: "14px",
          }}
        >
          Are you sure you want to delete this deployment?
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 2, pb: 2, gap: -1 }}>
        <Button
          onClick={onCancel}
          sx={{
            fontSize: "14px",
            textTransform: "none",
            borderRadius: 4,
            px: 2.5,
            py: 0.4,
            color: darkMode ? "#ffffff" : "#000000",
            border: "1px solid",
            borderColor: darkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)",
            "&:hover": {
              borderColor: darkMode ? "#ffffff" : "#000000",
              backgroundColor: darkMode
                ? "rgba(255,255,255,0.05)"
                : "rgba(0,0,0,0.04)",
            },
          }}
          variant="outlined"
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          sx={{
            fontSize: "14px",
            textTransform: "none",
            borderRadius: 4,
            px: 2.5,
            py: 0.4,
            backgroundColor: "#dc2626",
            color: "#ffffff",
            "&:hover": {
              backgroundColor: "#b91c1c",
            },
          }}
          variant="contained"
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteDialog;
