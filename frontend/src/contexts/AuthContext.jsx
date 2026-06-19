import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

const API_URL = 'https://localhost:3000/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Recupera os dados do usuário armazenados localmente caso o token exista
    if (token) {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          localStorage.removeItem('user');
        }
      }
    }
    setLoading(false);
  }, [token]);

  // Função de Login consumindo o endpoint público com a Fetch API
  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      // Extrai o corpo da resposta JSON
      const data = await response.json();

      // Verifica se o status HTTP não está na faixa de sucesso (200-299)
      if (!response.ok) {
        throw new Error(data.error || 'Erro interno ou falha na comunicação com o servidor.');
      }

      const { token: jwtToken, user: userData } = data;

      // Armazena as credenciais no localStorage conforme as diretrizes do projeto
      localStorage.setItem('token', jwtToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setToken(jwtToken);
      setUser(userData);

      return { success: true };
    } catch (error) {
      // Captura e repassa o erro para ser tratado na UI do formulário de login
      throw new Error(error.message || 'Erro de rede ou servidor inacessível.');
    }
  };

  // Mecanismo de Logout para limpar a sessão no cliente
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para facilitar o consumo do contexto nos componentes
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado obrigatoriamente dentro de um AuthProvider');
  }
  return context;
}