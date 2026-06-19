import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children }) {
  const { token } = useAuth();
  const location = useLocation();

  // Se não houver token, redireciona para o login e salva a rota que o usuário tentou acessar
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  
  return children;
}