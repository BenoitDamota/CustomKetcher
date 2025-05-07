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
  htmlContent?: React.ReactNode;
}

export default function CustomConfirmDialog({
  open,
  title,
  content,
  onClose,
  htmlContent,
}: CustomConfirmDialogProps) {
  const formattedContent = content.split('\n').map((line, index) => (
    <span key={index}>
      {line}
      <br />
    </span>
  ));
  return (
    <Dialog open={open} onClose={() => onClose(false)} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {content && <Typography>{formattedContent}</Typography>}
        {htmlContent}
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
