const mongoose = require('mongoose');

/**
 * Gerador simples de ID numérico-string (compatível com TheCocktailDB)
 */
function generateDrinkId() {
  return Date.now().toString() + Math.random().toString(36).substring(2, 9);
}

/**
 * Schema de Cocktail
 * Modelado ESTRITAMENTE conforme as regras em modelagem-cocktail.md
 * Mantém compatibilidade com estrutura JSON da API TheCocktailDB
 */
const cocktailSchema = new mongoose.Schema(
  {
    // ID único no formato string (TheCocktailDB-compatible)
    idDrink: {
      type: String,
      required: true,
      unique: true,
      default: generateDrinkId,
    },

    // Nome do coquetel
    strDrink: {
      type: String,
      required: [true, 'Nome do coquetel (strDrink) é obrigatório'],
      trim: true,
      minlength: [3, 'Nome deve ter no mínimo 3 caracteres'],
      maxlength: [100, 'Nome não pode exceder 100 caracteres'],
      index: true,
    },

    // Tags (ex: "IBA,ContemporaryClassic")
    strTags: {
      type: String,
      trim: true,
      default: '',
    },

    // Categoria (ex: "Ordinary Drink", "Cocktail")
    strCategory: {
      type: String,
      required: [true, 'Categoria (strCategory) é obrigatória'],
      enum: ['Ordinary Drink', 'Cocktail', 'Shot', 'Coffee / Tea', 'Homemade Liqueur', 'Punch / Party Drink', 'Beer', 'Soft Drink / Mocktail'],
      index: true,
    },

    // Tipo alcoólico (ex: "Alcoholic", "Non alcoholic")
    strAlcoholic: {
      type: String,
      enum: ['Alcoholic', 'Non alcoholic', 'Optional alcohol'],
      default: 'Alcoholic',
    },

    // Tipo de copo (ex: "Cocktail glass")
    strGlass: {
      type: String,
      required: [true, 'Tipo de copo (strGlass) é obrigatório'],
      trim: true,
    },

    // Instruções de preparo
    strInstructions: {
      type: String,
      required: [true, 'Instruções (strInstructions) são obrigatórias'],
      trim: true,
      minlength: [5, 'Instruções devem ter no mínimo 5 caracteres'],
    },

    // URL da imagem do coquetel
    strDrinkThumb: {
      type: String,
      trim: true,
      default: '',
      validate: {
        validator: function (v) {
          if (v === '') return true; // Permitir vazio
          return /^https?:\/\/.+/.test(v); // Validar URL HTTP(S)
        },
        message: 'URL da imagem deve ser HTTP ou HTTPS válida',
      },
    },

    // INGREDIENTES E MEDIDAS (estrutura flat conforme API original)
    // Ingrediente 1 a 15
    strIngredient1: { type: String, trim: true, default: '' },
    strIngredient2: { type: String, trim: true, default: '' },
    strIngredient3: { type: String, trim: true, default: '' },
    strIngredient4: { type: String, trim: true, default: '' },
    strIngredient5: { type: String, trim: true, default: '' },
    strIngredient6: { type: String, trim: true, default: '' },
    strIngredient7: { type: String, trim: true, default: '' },
    strIngredient8: { type: String, trim: true, default: '' },
    strIngredient9: { type: String, trim: true, default: '' },
    strIngredient10: { type: String, trim: true, default: '' },
    strIngredient11: { type: String, trim: true, default: '' },
    strIngredient12: { type: String, trim: true, default: '' },
    strIngredient13: { type: String, trim: true, default: '' },
    strIngredient14: { type: String, trim: true, default: '' },
    strIngredient15: { type: String, trim: true, default: '' },

    // Medida 1 a 15
    strMeasure1: { type: String, trim: true, default: '' },
    strMeasure2: { type: String, trim: true, default: '' },
    strMeasure3: { type: String, trim: true, default: '' },
    strMeasure4: { type: String, trim: true, default: '' },
    strMeasure5: { type: String, trim: true, default: '' },
    strMeasure6: { type: String, trim: true, default: '' },
    strMeasure7: { type: String, trim: true, default: '' },
    strMeasure8: { type: String, trim: true, default: '' },
    strMeasure9: { type: String, trim: true, default: '' },
    strMeasure10: { type: String, trim: true, default: '' },
    strMeasure11: { type: String, trim: true, default: '' },
    strMeasure12: { type: String, trim: true, default: '' },
    strMeasure13: { type: String, trim: true, default: '' },
    strMeasure14: { type: String, trim: true, default: '' },
    strMeasure15: { type: String, trim: true, default: '' },
  },
  {
    timestamps: true, // Adiciona createdAt e updatedAt automaticamente
    // Usa 'dateModified' em vez de 'updatedAt' para compatibilidade com API original
    toJSON: {
      transform: function (doc, ret) {
        // Mapear updatedAt para dateModified conforme API original
        if (ret.updatedAt) {
          ret.dateModified = ret.updatedAt;
          delete ret.updatedAt;
        }
        delete ret.createdAt;
        delete ret.__v;
        return ret;
      },
    },
  }
);

/**
 * ÍNDICES PARA OTIMIZAÇÃO DE BUSCA
 */
cocktailSchema.index({ strDrink: 'text', strCategory: 1, strAlcoholic: 1 });

/**
 * MIDDLEWARE: Validação de ingredientes
 * Garante que não temos arrays vazios (conforme instrução do edital)
 */
cocktailSchema.pre('save', function (next) {
  // Validação: se tem ingrediente, deve ter medida correspondente
  for (let i = 1; i <= 15; i++) {
    const ingredient = this[`strIngredient${i}`];
    const measure = this[`strMeasure${i}`];

    // Se um está vazio, o outro também deve estar
    if ((ingredient && !measure) || (!ingredient && measure)) {
      return next(
        new Error(`strIngredient${i} e strMeasure${i} devem estar ambos preenchidos ou vazios`)
      );
    }
  }
  next();
});

/**
 * MÉTODO DE INSTÂNCIA: Retorna apenas ingredientes e medidas não vazios
 */
cocktailSchema.methods.getActiveIngredients = function () {
  const ingredients = [];
  for (let i = 1; i <= 15; i++) {
    if (this[`strIngredient${i}`] && this[`strMeasure${i}`]) {
      ingredients.push({
        ingredient: this[`strIngredient${i}`],
        measure: this[`strMeasure${i}`],
      });
    }
  }
  return ingredients;
};

/**
 * MÉTODO ESTÁTICO: Busca por termo de texto (nome ou categoria)
 */
cocktailSchema.statics.searchByTerm = function (term) {
  return this.find(
    { $text: { $search: term } },
    { score: { $meta: 'textScore' } }
  ).sort({ score: { $meta: 'textScore' } });
};

const Cocktail = mongoose.model('Cocktail', cocktailSchema);

module.exports = Cocktail;
