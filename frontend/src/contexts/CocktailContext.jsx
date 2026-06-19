import React, { createContext, useReducer, useCallback } from 'react';
import { useAuth } from './AuthContext'; // Importando nosso contexto de autenticação

// Criar o Context
export const CocktailContext = createContext();

// Estado inicial
const initialState = {
  cocktails: [],
  loading: false,
  error: null,
  validationError: null,
  searchTerm: '',
  searchType: 'name', // 'name' ou 'ingredient'
};

// Action Types
export const ACTIONS = {
  FETCH_START: 'FETCH_START',
  FETCH_SUCCESS: 'FETCH_SUCCESS',
  FETCH_ERROR: 'FETCH_ERROR',
  SET_VALIDATION_ERROR: 'SET_VALIDATION_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_SEARCH_PARAMS: 'SET_SEARCH_PARAMS',
  RESET_RESULTS: 'RESET_RESULTS',
};

// Reducer function
const cocktailReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.FETCH_START:
      return { ...state, loading: true, error: null, validationError: null };
    case ACTIONS.FETCH_SUCCESS:
      return { ...state, cocktails: action.payload || [], loading: false, error: null, validationError: null };
    case ACTIONS.FETCH_ERROR:
      return { ...state, loading: false, error: action.payload, cocktails: [] };
    case ACTIONS.SET_VALIDATION_ERROR:
      return { ...state, validationError: action.payload };
    case ACTIONS.CLEAR_ERROR:
      return { ...state, error: null, validationError: null };
    case ACTIONS.SET_SEARCH_PARAMS:
      return { ...state, searchTerm: action.payload.searchTerm, searchType: action.payload.searchType };
    case ACTIONS.RESET_RESULTS:
      return { ...state, cocktails: [], error: null, validationError: null, searchTerm: '' };
    default:
      return state;
  }
};

// Provider Component
export const CocktailProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cocktailReducer, initialState);
  
  // Consumindo o token e a função de logout do nosso AuthContext
  const { token, logout } = useAuth();

  // Ação: Buscar coquetéis pela API Local
  const fetchCocktails = useCallback(async (searchTerm, searchType = 'name') => {
    if (!searchTerm || searchTerm.trim() === '') {
      dispatch({
        type: ACTIONS.SET_VALIDATION_ERROR,
        payload: 'Por favor, preencha o campo de busca.',
      });
      return;
    }

    dispatch({ type: ACTIONS.FETCH_START });
    dispatch({ type: ACTIONS.SET_SEARCH_PARAMS, payload: { searchTerm, searchType } });

    try {
      // Base da URL Local
      let url = 'https://localhost:3000/api/cocktails';

      // Montando os Query Params conforme o contrato da API
      if (searchType === 'name') {
        url += `?search=${encodeURIComponent(searchTerm)}`;
      } else if (searchType === 'ingredient') {
        url += `?ingredient=${encodeURIComponent(searchTerm)}`;
      } else {
        throw new Error('Tipo de busca inválido');
      }

      // Disparando o Fetch com o cabeçalho de Autorização JWT
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      // Tratamento de segurança: Token inválido ou expirado
      if (response.status === 401 || response.status === 403) {
        logout();
        throw new Error('Sessão expirada ou não autorizada. Por favor, faça login novamente.');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Erro na API: ${response.status}`);
      }

      // Normalizar a resposta: drinks pode ser null, undefined, ou []
      const drinks = data?.drinks;
      const hasDrinks = Array.isArray(drinks) && drinks.length > 0;

      if (!hasDrinks) {
        const errorMessage = 
          searchType === 'ingredient'
            ? `Nenhum coquetel encontrado com o ingrediente "${searchTerm}". Tente outro ingrediente!`
            : `Nenhum coquetel encontrado com o nome "${searchTerm}".`;
        
        dispatch({
          type: ACTIONS.FETCH_ERROR,
          payload: errorMessage,
        });
      } else {
        dispatch({
          type: ACTIONS.FETCH_SUCCESS,
          payload: drinks,
        });
      }
    } catch (err) {
      dispatch({
        type: ACTIONS.FETCH_ERROR,
        payload: `Erro ao buscar coquetéis: ${err.message}`,
      });
    }
  }, [token, logout]); // O Hook agora depende do token e do logout

  const clearErrors = useCallback(() => {
    dispatch({ type: ACTIONS.CLEAR_ERROR });
  }, []);

  const resetResults = useCallback(() => {
    dispatch({ type: ACTIONS.RESET_RESULTS });
  }, []);

  const value = {
    state,
    dispatch,
    fetchCocktails,
    clearErrors,
    resetResults,
  };

  return (
    <CocktailContext.Provider value={value}>
      {children}
    </CocktailContext.Provider>
  );
};

export const useCocktail = () => {
  const context = React.useContext(CocktailContext);
  if (!context) {
    throw new Error('useCocktail deve ser usado dentro de um CocktailProvider');
  }
  return context;
};