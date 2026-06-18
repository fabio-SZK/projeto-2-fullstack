import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Paper,
  Typography,
  Stack,
  Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useCocktail } from '../contexts/CocktailContext';

const SearchBar = () => {
  const { state, fetchCocktails, clearErrors } = useCocktail();
  const [inputValue, setInputValue] = useState('');
  const [searchType, setSearchType] = useState('name');

  // Handle input change
  const handleInputChange = (event) => {
    setInputValue(event.target.value);
    // Limpar erro de validação anterior ao digitar
    if (state.validationError) {
      clearErrors();
    }
  };

  // Handle search type change
  const handleSearchTypeChange = (event, newSearchType) => {
    if (newSearchType !== null) {
      setSearchType(newSearchType);
    }
  };

  // Handle search submission
  const handleSearch = (event) => {
    event.preventDefault();
    fetchCocktails(inputValue, searchType);
  };

  // Handle key press (Enter)
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch(event);
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        backgroundColor: '#f8f8f8',
        border: '1px solid #e0e0e0',
        borderRadius: '4px',
        padding: '24px',
        marginBottom: '24px',
      }}
    >
      <Typography
        variant="h5"
        component="h2"
        sx={{
          marginBottom: '16px',
          fontWeight: 600,
          color: '#222',
        }}
      >
        Buscar Coquetéis
      </Typography>

      <Stack spacing={3}>
        {/* Validation Error Alert */}
        {state.validationError && (
          <Alert severity="error" onClose={clearErrors}>
            {state.validationError}
          </Alert>
        )}

        {/* Search Type Toggle */}
        <Box>
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              marginBottom: '8px',
              color: '#666',
              fontWeight: 500,
            }}
          >
            Tipo de Busca
          </Typography>
          <ToggleButtonGroup
            value={searchType}
            exclusive
            onChange={handleSearchTypeChange}
            fullWidth
            sx={{
              '& .MuiToggleButton-root': {
                textTransform: 'none',
                fontSize: '14px',
                color: '#666',
                borderColor: '#ddd',
                '&.Mui-selected': {
                  backgroundColor: '#333',
                  color: '#fff',
                  borderColor: '#333',
                  '&:hover': {
                    backgroundColor: '#444',
                  },
                },
              },
            }}
          >
            <ToggleButton value="name" aria-label="buscar por nome">
              Por Nome
            </ToggleButton>
            <ToggleButton value="ingredient" aria-label="buscar por ingrediente">
              Por Ingrediente
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Search Input */}
        <TextField
          fullWidth
          label="Digite o nome do coquetel ou ingrediente"
          placeholder={searchType === 'name' ? 'Ex: Margarita' : 'Ex: Vodka'}
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          disabled={state.loading}
          variant="outlined"
          size="medium"
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: '#fff',
              '& fieldset': {
                borderColor: '#ddd',
              },
              '&:hover fieldset': {
                borderColor: '#999',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#333',
                borderWidth: '2px',
              },
            },
            '& .MuiInputBase-input::placeholder': {
              color: '#999',
              opacity: 0.7,
            },
          }}
        />

        {/* Search Button */}
        <Button
          variant="contained"
          onClick={handleSearch}
          disabled={state.loading}
          startIcon={<SearchIcon />}
          sx={{
            backgroundColor: '#333',
            color: '#fff',
            textTransform: 'none',
            fontSize: '16px',
            fontWeight: 600,
            padding: '10px 24px',
            '&:hover': {
              backgroundColor: '#444',
            },
            '&:disabled': {
              backgroundColor: '#ccc',
              color: '#999',
            },
          }}
        >
          {state.loading ? 'Buscando...' : 'Buscar'}
        </Button>

        {/* Loading State */}
        {state.loading && (
          <Typography
            variant="body2"
            sx={{
              color: '#666',
              fontStyle: 'italic',
              textAlign: 'center',
            }}
          >
            Aguarde, buscando coquetéis...
          </Typography>
        )}
      </Stack>
    </Paper>
  );
};

export default SearchBar;
