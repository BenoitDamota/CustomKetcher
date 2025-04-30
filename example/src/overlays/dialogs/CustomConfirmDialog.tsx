import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';

interface CustomConfirmDialogProps {
  open: boolean;
  title: string;
  content: string;
  onClose: (confirmed: boolean) => void;
}

export default function CustomConfirmDialog({
  open,
  title,
  content,
  onClose,
}: CustomConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={() => onClose(false)} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography>{content}</Typography>
      </DialogContent>
      <DialogActions>
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => onClose(false)}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => onClose(true)}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}
