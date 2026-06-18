import React, { useState, useEffect } from 'react';
import {
  Snackbar,
  Alert,
  Box,
} from '@mui/material';
import { useCocktail } from '../contexts/CocktailContext';

const ErrorMessage = () => {
  const { state, clearErrors } = useCocktail();
  const [open, setOpen] = useState(false);

  // Abrir Snackbar quando houver erro da API
  useEffect(() => {
    if (state.error) {
      setOpen(true);
    }
  }, [state.error]);

  // Fechar Snackbar
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setOpen(false);
    clearErrors();
  };

  return (
    <>
      {/* Snackbar para erro da API (DEPOIS do envio) */}
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleClose}
          severity="error"
          variant="filled"
          sx={{
            backgroundColor: '#d32f2f',
            color: '#fff',
            fontSize: '14px',
            '& .MuiAlert-icon': {
              color: '#fff',
            },
          }}
        >
          {state.error}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ErrorMessage;
