import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

type Props = {
  question: string;
  trueAction: any;
  falseAction: any;
  isOpen: boolean;
};

export default function AlertDialog({
  question,
  trueAction,
  falseAction,
  isOpen,
}: Props) {
  const [open, setOpen] = React.useState(false);

  const handleCloseTrue = () => {
    setOpen(false);
    trueAction();
  };

  const handleClose = () => {
    setOpen(false);
    falseAction();
  };

  React.useEffect(() => {
    setOpen(isOpen);
  }, [isOpen]);

  return (
    <div>
      {/* <Button variant="outlined" onClick={handleClickOpen}>
        Open alert dialog
      </Button> */}
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{question}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description"></DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>No</Button>
          <Button onClick={handleCloseTrue} autoFocus>
            Si
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
