import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";


import { alpha, styled } from "@mui/material/styles";
type Props = {
  isOpen: boolean;
  children: React.ReactNode;
  close: () => void;
};

const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    position: "absolute",
    bottom: 0,
    left: 0,
    padding: "20px",
    borderRadius: "20px",
    maxWidth: "318px",
    width: "100%",
    boxShadow: "0px 0px 20px rgba(0, 0, 0, 0.01)",
    //end
  },
}));

export default function Modal({ isOpen, children, close }: Props) {
  const [open, setOpen] = React.useState(false);

  const handleCloseTrue = () => {
    setOpen(false);
  };

  const handleClose = () => {
    setOpen(false);
    close();
  };

  React.useEffect(() => {
    setOpen(isOpen);
  }, [isOpen]);

  return (
    <div>
      {/* <Button variant="outlined" onClick={handleClickOpen}>
        Open alert dialog
      </Button> */}
      <StyledDialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        sx={{
          bottom: 0,
          position: "absolute",
        }}
      >
        {children}
      </StyledDialog>
    </div>
  );
}
