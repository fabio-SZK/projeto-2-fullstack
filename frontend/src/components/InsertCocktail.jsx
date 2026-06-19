import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Alert, 
  Paper,
  MenuItem,
  IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../contexts/AuthContext';

export default function InsertCocktail() {
  const { token } = useAuth();
  
  // Estados para os campos obrigatórios
  const [strDrink, setStrDrink] = useState('');
  const [strCategory, setStrCategory] = useState('');
  const [strAlcoholic, setStrAlcoholic] = useState('Alcoholic');
  const [strGlass, setStrGlass] = useState('');
  const [strInstructions, setStrInstructions] = useState('');
  
  // Estado para a imagem
  const [strDrinkThumb, setStrDrinkThumb] = useState('');

  // Lista dinâmica de ingredientes e medidas (inicia com 1 linha vazia)
  const [ingredientsList, setIngredientsList] = useState([{ ingredient: '', measure: '' }]);

  // Estados de feedback UI
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Manipuladores da lista dinâmica
  const handleIngredientChange = (index, field, value) => {
    const newList = [...ingredientsList];
    newList[index][field] = value;
    setIngredientsList(newList);
  };

  const handleAddIngredient = () => {
    if (ingredientsList.length < 15) {
      setIngredientsList([...ingredientsList, { ingredient: '', measure: '' }]);
    }
  };

  const handleRemoveIngredient = (index) => {
    const newList = [...ingredientsList];
    newList.splice(index, 1);
    setIngredientsList(newList);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    // Monta o payload base
    const payload = {
      strDrink,
      strCategory,
      strAlcoholic,
      strGlass,
      strInstructions,
      ...(strDrinkThumb && { strDrinkThumb }),
    };

    // Mapeia a lista dinâmica de ingredientes
    ingredientsList.forEach((item, index) => {
      const idx = index + 1;
      if (item.ingredient.trim() !== '') {
        payload[`strIngredient${idx}`] = item.ingredient;
        if (item.measure.trim() !== '') {
          payload[`strMeasure${idx}`] = item.measure;
        }
      }
    });

    try {
      const response = await fetch('https://localhost:3000/api/cocktails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao inserir o coquetel.');
      }

      setSuccessMsg('Coquetel inserido com sucesso!');
      
      // Reseta os campos após o sucesso
      setStrDrink('');
      setStrCategory('');
      setStrAlcoholic('Alcoholic');
      setStrGlass('');
      setStrInstructions('');
      setStrDrinkThumb('');
      setIngredientsList([{ ingredient: '', measure: '' }]);

    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 700 }}>
        <Typography variant="h5" component="h2" mb={3} textAlign="center">
          Cadastrar Novo Coquetel
        </Typography>

        {errorMsg && <Alert severity="error" sx={{ mb: 3 }}>{errorMsg}</Alert>}
        {successMsg && <Alert severity="success" sx={{ mb: 3 }}>{successMsg}</Alert>}

        <form onSubmit={handleSubmit}>
          {/* Sessão: dados basicos */}
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Informações Básicas
          </Typography>
          
          <TextField label="Nome da Bebida" fullWidth required margin="dense" value={strDrink} onChange={(e) => setStrDrink(e.target.value)} disabled={isSubmitting} />
          
          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            <TextField label="Categoria" fullWidth required margin="dense" value={strCategory} onChange={(e) => setStrCategory(e.target.value)} disabled={isSubmitting} />
            <TextField label="Tipo" select fullWidth required margin="dense" value={strAlcoholic} onChange={(e) => setStrAlcoholic(e.target.value)} disabled={isSubmitting}>
              <MenuItem value="Alcoholic">Alcoólico</MenuItem>
              <MenuItem value="Non alcoholic">Não Alcoólico</MenuItem>
              <MenuItem value="Optional alcohol">Álcool Opcional</MenuItem>
            </TextField>
          </Box>
          
          <TextField label="Tipo de Copo" fullWidth required margin="dense" value={strGlass} onChange={(e) => setStrGlass(e.target.value)} disabled={isSubmitting} sx={{ mt: 1 }} />
          
          <TextField label="URL da Imagem Opcional" fullWidth margin="dense" value={strDrinkThumb} onChange={(e) => setStrDrinkThumb(e.target.value)} disabled={isSubmitting} sx={{ mt: 1 }} />

          <TextField label="Instruções" fullWidth required multiline rows={3} margin="dense" value={strInstructions} onChange={(e) => setStrInstructions(e.target.value)} disabled={isSubmitting} sx={{ my: 2 }} />

          {/* sessão: ingredientes dinâmicos */}
          <Box sx={{ mt: 2, mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" fontWeight="bold">
              Ingredientes e Medidas
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Limite: {ingredientsList.length} / 15
            </Typography>
          </Box>

          {ingredientsList.map((item, index) => (
            <Box key={index} sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 1 }}>
              <TextField 
                label={`Ingrediente ${index + 1}`} 
                fullWidth 
                size="small"
                value={item.ingredient} 
                onChange={(e) => handleIngredientChange(index, 'ingredient', e.target.value)} 
                disabled={isSubmitting} 
              />
              <TextField 
                label="Medida" 
                fullWidth 
                size="small"
                value={item.measure} 
                onChange={(e) => handleIngredientChange(index, 'measure', e.target.value)} 
                disabled={isSubmitting} 
              />
              <IconButton 
                color="error" 
                onClick={() => handleRemoveIngredient(index)}
                disabled={ingredientsList.length === 1 || isSubmitting}
                title="Remover linha"
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}

          <Button 
            variant="outlined" 
            startIcon={<AddIcon />} 
            onClick={handleAddIngredient}
            disabled={ingredientsList.length >= 15 || isSubmitting}
            sx={{ mt: 1 }}
          >
            Adicionar Ingrediente
          </Button>

          <Button type="submit" variant="contained" color="primary" fullWidth size="large" sx={{ mt: 4 }} disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Salvar Coquetel'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
}