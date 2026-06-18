import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  CssBaseline,
  Container,
  Box,
  Typography,
} from '@mui/material';
import { CocktailProvider } from '../contexts/CocktailContext';
import SearchBar from './SearchBar';
import CocktailList from './CocktailList';
import ErrorMessage from './ErrorMessage';

// Tema customizado (Mantido o original)
const theme = createTheme({
  palette: {
    primary: { main: '#333333', light: '#666666', dark: '#000000' },
    secondary: { main: '#999999', light: '#cccccc', dark: '#666666' },
    background: { default: '#ffffff', paper: '#f8f8f8' },
    text: { primary: '#222222', secondary: '#666666' },
    error: { main: '#d32f2f' },
    success: { main: '#388e3c' },
    warning: { main: '#f57c00' },
    info: { main: '#1976d2' },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontSize: '32px', fontWeight: 600, color: '#222222', marginBottom: '8px' },
    h5: { fontSize: '24px', fontWeight: 600, color: '#222222' },
    h6: { fontSize: '18px', fontWeight: 600, color: '#222222' },
    body1: { fontSize: '16px', color: '#333333', lineHeight: '1.5' },
    body2: { fontSize: '14px', color: '#666666', lineHeight: '1.4' },
    caption: { fontSize: '12px', color: '#999999' },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 500, borderRadius: '4px' },
        contained: { boxShadow: 'none', '&:hover': { boxShadow: 'none' } },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: { '& .MuiOutlinedInput-root': { borderRadius: '4px' } },
      },
    },
    MuiPaper: {
      styleOverrides: { root: { borderRadius: '4px' } },
    },
    MuiCard: {
      styleOverrides: { root: { borderRadius: '4px' } },
    },
    MuiAlert: {
      styleOverrides: { root: { borderRadius: '4px' } },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <CocktailProvider>
        <Box
          sx={{
            minHeight: '100vh',
            backgroundColor: '#ffffff',
            paddingTop: '40px',
            paddingBottom: '40px',
          }}
        >
          <Container maxWidth="lg">
            {/* Header */}
            <Box
              sx={{
                marginBottom: '40px',
                borderBottom: '1px solid #e0e0e0',
                paddingBottom: '24px',
              }}
            >
              <Typography variant="h4" component="h1" sx={{ textAlign: 'center' }}>
                TheCocktailDB
              </Typography>
              <Typography variant="body2" sx={{ textAlign: 'center', color: '#999999', marginTop: '8px' }}>
                SPA de Coquetéis - Integrado com API Local
              </Typography>
            </Box>

            {/* Base do Roteamento */}
            <Routes>
              {/* Redireciona a raiz para a tela principal (que futuramente será protegida) */}
              <Route path="/" element={<Navigate to="/buscar" replace />} />

              {/* Rota Pública */}
              <Route path="/login" element={
                <div>{/* Placeholder: Será implementado na Fase 3 */}</div>
              } />

              {/* Rotas que serão Privadas (Fase 3) */}
              <Route path="/buscar" element={
                <>
                  <SearchBar />
                  <Box sx={{ marginBottom: '24px' }}>
                    <CocktailList />
                  </Box>
                  <ErrorMessage />
                </>
              } />

              <Route path="/inserir" element={
                <div>{/* Placeholder: Será implementado na Fase 4 */}</div>
              } />
            </Routes>

          </Container>
        </Box>
      </CocktailProvider>
    </ThemeProvider>
  );
}

export default App;