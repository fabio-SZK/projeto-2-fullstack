import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Container, Box, Typography, Button } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';

// Importação dos Contextos
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { CocktailProvider } from '../contexts/CocktailContext';

// Importação dos Componentes
import SearchBar from './SearchBar';
import CocktailList from './CocktailList';
import ErrorMessage from './ErrorMessage';
import Login from './Login';
import ProtectedRoute from './ProtectedRoute';
import InsertCocktail from './InsertCocktail';

// Tema customizado
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

function AppHeader() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box
      sx={{
        marginBottom: '40px',
        borderBottom: '1px solid #e0e0e0',
        paddingBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="h4" component="h1" sx={{ textAlign: 'left' }}>
          TheCocktailDB
        </Typography>
        <Typography variant="body2" sx={{ textAlign: 'left', color: '#999999', marginTop: '8px' }}>
          SPA de Coquetéis - Integrado com API Local
        </Typography>
      </Box>
      
      {/* Menu de Navegação - Exibido apenas se autenticado */}
      {token && (
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="contained" color="primary" onClick={() => navigate('/buscar')}>
            Buscar
          </Button>
          <Button variant="contained" color="secondary" onClick={() => navigate('/inserir')}>
            Inserir Coquetel
          </Button>
          <Button variant="outlined" color="error" startIcon={<LogoutIcon />} onClick={handleLogout}>
            Sair
          </Button>
        </Box>
      )}
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <CocktailProvider>
          <Box sx={{ minHeight: '100vh', backgroundColor: '#ffffff', paddingTop: '40px', paddingBottom: '40px' }}>
            <Container maxWidth="lg">
              
              <AppHeader />

              <Routes>
                <Route path="/" element={<Navigate to="/buscar" replace />} />
                <Route path="/login" element={<Login />} />

                <Route path="/buscar" element={
                  <ProtectedRoute>
                    <SearchBar />
                    <Box sx={{ marginBottom: '24px' }}>
                      <CocktailList />
                    </Box>
                    <ErrorMessage />
                  </ProtectedRoute>
                } />

                {/* ROTA ATUALIZADA DA FASE 4 */}
                <Route path="/inserir" element={
                  <ProtectedRoute>
                    <InsertCocktail />
                  </ProtectedRoute>
                } />
              </Routes>

            </Container>
          </Box>
        </CocktailProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;