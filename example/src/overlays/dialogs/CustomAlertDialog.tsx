import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';

interface CustomAlertDialogProps {
  open: boolean;
  title: string;
  content: string;
  onClose: () => void;
}

export default function CustomAlertDialog({
  open,
  title,
  content,
  onClose,
}: CustomAlertDialogProps) {
  const formattedContent = content.split('\n').map((line, index) => (
    <span key={index}>
      {line}
      <br />
    </span>
  ));

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography>{formattedContent}</Typography>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" color="primary" onClick={onClose}>
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
}
