import React, { ReactElement, useContext } from 'react';
import { Alert, Snackbar } from '@mui/material';
import MessageContext from '../../context/MessageContext';

const MessageBar = (): ReactElement => {
  const { message, setOpen, open } = useContext(MessageContext);

  const closeMessage = (): void => {
    setOpen(false);
  };

  return (
    <div className="message-bar">
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={closeMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        sx={{ right: 'unset' }}
      >
        <Alert
          elevation={6}
          variant="filled"
          onClose={closeMessage}
          severity={message?.type}
          icon={false}
        >
          {message?.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default MessageBar;
