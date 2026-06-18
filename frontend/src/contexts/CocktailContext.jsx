import React, { createContext, useReducer, useCallback } from 'react';

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
      return {
        ...state,
        loading: true,
        error: null,
        validationError: null,
      };

    case ACTIONS.FETCH_SUCCESS:
      return {
        ...state,
        cocktails: action.payload || [],
        loading: false,
        error: null,
        validationError: null,
      };

    case ACTIONS.FETCH_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload,
        cocktails: [],
      };

    case ACTIONS.SET_VALIDATION_ERROR:
      return {
        ...state,
        validationError: action.payload,
      };

    case ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
        validationError: null,
      };

    case ACTIONS.SET_SEARCH_PARAMS:
      return {
        ...state,
        searchTerm: action.payload.searchTerm,
        searchType: action.payload.searchType,
      };

    case ACTIONS.RESET_RESULTS:
      return {
        ...state,
        cocktails: [],
        error: null,
        validationError: null,
        searchTerm: '',
      };

    default:
      return state;
  }
};

// Provider Component
export const CocktailProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cocktailReducer, initialState);

  // Ação: Buscar coquetéis pela API
  const fetchCocktails = useCallback(async (searchTerm, searchType = 'name') => {
    // Validação de campo obrigatório
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
      let url;

      if (searchType === 'name') {
        url = `https://localhost:3000/api/cocktails?search=${encodeURIComponent(
          searchTerm
        )}`;
      } else if (searchType === 'ingredient') {
        url = `https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(
          searchTerm
        )}`;
      } else {
        throw new Error('Tipo de busca inválido');
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data = await response.json();

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
  }, []);

  // Ação: Limpar erros
  const clearErrors = useCallback(() => {
    dispatch({ type: ACTIONS.CLEAR_ERROR });
  }, []);

  // Ação: Resetar resultados
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

// Hook customizado para usar o Context
export const useCocktail = () => {
  const context = React.useContext(CocktailContext);

  if (!context) {
    throw new Error('useCocktail deve ser usado dentro de um CocktailProvider');
  }

  return context;
};
