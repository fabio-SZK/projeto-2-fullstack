const express = require('express');
const redisCache = require('express-redis-cache');
const Cocktail = require('../models/Cocktail');
const requireAuth = require('./authMiddleware');

const router = express.Router();

/**
 * Configuração de cache Redis
 */
const cache = redisCache({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  auth_pass: process.env.REDIS_PASSWORD || undefined,
  prefix: 'cocktails:', // Prefixo para identificar cache de coquetéis
});

/**
 * GET /api/cocktails
 * Busca coquetéis com filtros opcionais 
 * Query params:
 *   - search: busca por nome (text search)
 *   - ingredient: busca por ingrediente (case-insensitive)
 *   - category: filtro por categoria
 *   - alcoholic: filtro por tipo alcoólico (Alcoholic, Non alcoholic, Optional alcohol)
 *   - limit: quantidade máxima de resultados (padrão: 20, máx: 100)
 *   - skip: paginação (padrão: 0)

 */
router.get(
  '/cocktails',
  requireAuth, // Middleware de autenticação
  cache.route({ expire: 3600 }), // Cache de 1 hora
  async (req, res, next) => {
    try {

      const { search, ingredient, category, alcoholic, limit, skip } = req.query;

      let searchTerm = '';
      if (search && typeof search === 'string') {
        searchTerm = req.app.locals.sanitizeString(search);
      }

      let ingredientTerm = '';
      if (ingredient && typeof ingredient === 'string') {
        ingredientTerm = req.app.locals.sanitizeString(ingredient);
      }

      // Validação de categoria 
      const validCategories = [
        'Ordinary Drink',
        'Cocktail',
        'Shot',
        'Coffee / Tea',
        'Homemade Liqueur',
        'Punch / Party Drink',
        'Beer',
        'Soft Drink / Mocktail',
      ];
      let categoryFilter = '';
      if (category && validCategories.includes(category)) {
        categoryFilter = category;
      }

      // Validação de tipo alcoólico 
      const validAlcoholic = ['Alcoholic', 'Non alcoholic', 'Optional alcohol'];
      let alcoholicFilter = '';
      if (alcoholic && validAlcoholic.includes(alcoholic)) {
        alcoholicFilter = alcoholic;
      }

      let limitNumber = 20;
      let skipNumber = 0;

      if (limit) {
        const parsedLimit = parseInt(limit, 10);
        if (!isNaN(parsedLimit) && parsedLimit > 0) {
          limitNumber = Math.min(parsedLimit, 100); // Máximo 100
        }
      }

      if (skip) {
        const parsedSkip = parseInt(skip, 10);
        if (!isNaN(parsedSkip) && parsedSkip >= 0) {
          skipNumber = parsedSkip;
        }
      }

      let query = {};

      // Se tem search term, usar text search
      if (searchTerm) {
        query.$text = { $search: searchTerm };
      }

      // Busca por ingrediente (case-insensitive)
      if (ingredientTerm) {
        const ingredientRegex = new RegExp(ingredientTerm, 'i');
        query.$or = [
          { strIngredient1: ingredientRegex },
          { strIngredient2: ingredientRegex },
          { strIngredient3: ingredientRegex },
          { strIngredient4: ingredientRegex },
          { strIngredient5: ingredientRegex },
          { strIngredient6: ingredientRegex },
          { strIngredient7: ingredientRegex },
          { strIngredient8: ingredientRegex },
          { strIngredient9: ingredientRegex },
          { strIngredient10: ingredientRegex },
          { strIngredient11: ingredientRegex },
          { strIngredient12: ingredientRegex },
          { strIngredient13: ingredientRegex },
          { strIngredient14: ingredientRegex },
          { strIngredient15: ingredientRegex },
        ];
      }

      // Filtros adicionais
      if (categoryFilter) {
        query.strCategory = categoryFilter;
      }

      if (alcoholicFilter) {
        query.strAlcoholic = alcoholicFilter;
      }

      let dbQuery = Cocktail.find(query)
        .skip(skipNumber)
        .limit(limitNumber)
        .lean(); 


      if (searchTerm) {
        dbQuery = dbQuery.sort({ score: { $meta: 'textScore' } });
      } else {
        // Caso contrário, ordenar por data de modificação (mais recentes primeiro)
        dbQuery = dbQuery.sort({ updatedAt: -1 });
      }

      const cocktails = await dbQuery.exec();


      const formattedCocktails = cocktails.map((drink) => ({
        idDrink: drink.idDrink,
        strDrink: drink.strDrink,
        strTags: drink.strTags || '',
        strCategory: drink.strCategory,
        strAlcoholic: drink.strAlcoholic,
        strGlass: drink.strGlass,
        strInstructions: drink.strInstructions,
        strDrinkThumb: drink.strDrinkThumb,
        strIngredient1: drink.strIngredient1,
        strIngredient2: drink.strIngredient2,
        strIngredient3: drink.strIngredient3,
        strIngredient4: drink.strIngredient4,
        strIngredient5: drink.strIngredient5,
        strIngredient6: drink.strIngredient6,
        strIngredient7: drink.strIngredient7,
        strIngredient8: drink.strIngredient8,
        strIngredient9: drink.strIngredient9,
        strIngredient10: drink.strIngredient10,
        strIngredient11: drink.strIngredient11,
        strIngredient12: drink.strIngredient12,
        strIngredient13: drink.strIngredient13,
        strIngredient14: drink.strIngredient14,
        strIngredient15: drink.strIngredient15,
        strMeasure1: drink.strMeasure1,
        strMeasure2: drink.strMeasure2,
        strMeasure3: drink.strMeasure3,
        strMeasure4: drink.strMeasure4,
        strMeasure5: drink.strMeasure5,
        strMeasure6: drink.strMeasure6,
        strMeasure7: drink.strMeasure7,
        strMeasure8: drink.strMeasure8,
        strMeasure9: drink.strMeasure9,
        strMeasure10: drink.strMeasure10,
        strMeasure11: drink.strMeasure11,
        strMeasure12: drink.strMeasure12,
        strMeasure13: drink.strMeasure13,
        strMeasure14: drink.strMeasure14,
        strMeasure15: drink.strMeasure15,
        dateModified: drink.updatedAt,
      }));

      // contagem para paginação
      const total = await Cocktail.countDocuments(query);


      res.status(200).json({
        drinks: formattedCocktails,
        pagination: {
          total,
          limit: limitNumber,
          skip: skipNumber,
          hasMore: skipNumber + limitNumber < total,
        },
      });

      console.log(
        `[GET /cocktails] Search: "${searchTerm}", Ingredient: "${ingredientTerm}", Category: ${categoryFilter || 'all'}, Found: ${formattedCocktails.length}/${total}`
      );
    } catch (error) {
      console.error('[GET /cocktails] Erro:', error.message);
      next(error);
    }
  }
);

/**
 * POST /api/cocktails
 * Cria um novo coquetel (requer autenticação)
 * Body
 *   - strDrink: nome do coquetel (obrigatório)
 *   - strCategory: categoria (obrigatório)
 *   - strAlcoholic: tipo alcoólico (obrigatório)
 *   - strGlass: tipo de copo (obrigatório)
 *   - strInstructions: instruções (obrigatório)
 *   - strDrinkThumb: URL da imagem (opcional)
 *   - strTags: tags (opcional)
 *   - strIngredient1-15: ingredientes (opcional)
 *   - strMeasure1-15: medidas (opcional)
 */
router.post('/cocktails', requireAuth, async (req, res, next) => {
  try {

    const {
      strDrink,
      strCategory,
      strAlcoholic,
      strGlass,
      strInstructions,
      strDrinkThumb,
      strTags,
    } = req.body;

    // Validação de campos obrigatórios
    if (!strDrink || !strCategory || !strAlcoholic || !strGlass || !strInstructions) {
      return res.status(400).json({
        error: 'Campos obrigatórios faltando: strDrink, strCategory, strAlcoholic, strGlass, strInstructions',
      });
    }

    const sanitizedDrink = req.app.locals.sanitizeString(strDrink);
    const sanitizedInstructions = req.app.locals.sanitizeString(strInstructions);
    const sanitizedGlass = req.app.locals.sanitizeString(strGlass);
    const sanitizedTags = req.app.locals.sanitizeString(strTags || '');
    const sanitizedThumb = req.app.locals.sanitizeString(strDrinkThumb || '');

    // Validação de categoria
    const validCategories = [
      'Ordinary Drink',
      'Cocktail',
      'Shot',
      'Coffee / Tea',
      'Homemade Liqueur',
      'Punch / Party Drink',
      'Beer',
      'Soft Drink / Mocktail',
    ];
    if (!validCategories.includes(strCategory)) {
      return res.status(400).json({
        error: `Categoria inválida. Categorias aceitas: ${validCategories.join(', ')}`,
      });
    }

    // Validação de tipo alcoólico
    const validAlcoholic = ['Alcoholic', 'Non alcoholic', 'Optional alcohol'];
    if (!validAlcoholic.includes(strAlcoholic)) {
      return res.status(400).json({
        error: `Tipo alcoólico inválido. Aceitos: ${validAlcoholic.join(', ')}`,
      });
    }

  
    const ingredientData = {};
    for (let i = 1; i <= 15; i++) {
      const ingredient = req.body[`strIngredient${i}`];
      const measure = req.body[`strMeasure${i}`];

      if (ingredient || measure) {
        if (!ingredient || !measure) {
          return res.status(400).json({
            error: `strIngredient${i} e strMeasure${i} devem estar ambos preenchidos ou ambos vazios`,
          });
        }

        // Sanitizar
        ingredientData[`strIngredient${i}`] = req.app.locals.sanitizeString(ingredient);
        ingredientData[`strMeasure${i}`] = req.app.locals.sanitizeString(measure);
      }
    }

    const newCocktail = new Cocktail({
      strDrink: sanitizedDrink,
      strCategory,
      strAlcoholic,
      strGlass: sanitizedGlass,
      strInstructions: sanitizedInstructions,
      strDrinkThumb: sanitizedThumb,
      strTags: sanitizedTags,
      ...ingredientData,
    });

    // Salvar no banco
    await newCocktail.save();


    const savedCocktail = newCocktail.toObject();
    const formattedResponse = {
      idDrink: savedCocktail.idDrink,
      strDrink: savedCocktail.strDrink,
      strTags: savedCocktail.strTags || '',
      strCategory: savedCocktail.strCategory,
      strAlcoholic: savedCocktail.strAlcoholic,
      strGlass: savedCocktail.strGlass,
      strInstructions: savedCocktail.strInstructions,
      strDrinkThumb: savedCocktail.strDrinkThumb,
      strIngredient1: savedCocktail.strIngredient1,
      strIngredient2: savedCocktail.strIngredient2,
      strIngredient3: savedCocktail.strIngredient3,
      strIngredient4: savedCocktail.strIngredient4,
      strIngredient5: savedCocktail.strIngredient5,
      strIngredient6: savedCocktail.strIngredient6,
      strIngredient7: savedCocktail.strIngredient7,
      strIngredient8: savedCocktail.strIngredient8,
      strIngredient9: savedCocktail.strIngredient9,
      strIngredient10: savedCocktail.strIngredient10,
      strIngredient11: savedCocktail.strIngredient11,
      strIngredient12: savedCocktail.strIngredient12,
      strIngredient13: savedCocktail.strIngredient13,
      strIngredient14: savedCocktail.strIngredient14,
      strIngredient15: savedCocktail.strIngredient15,
      strMeasure1: savedCocktail.strMeasure1,
      strMeasure2: savedCocktail.strMeasure2,
      strMeasure3: savedCocktail.strMeasure3,
      strMeasure4: savedCocktail.strMeasure4,
      strMeasure5: savedCocktail.strMeasure5,
      strMeasure6: savedCocktail.strMeasure6,
      strMeasure7: savedCocktail.strMeasure7,
      strMeasure8: savedCocktail.strMeasure8,
      strMeasure9: savedCocktail.strMeasure9,
      strMeasure10: savedCocktail.strMeasure10,
      strMeasure11: savedCocktail.strMeasure11,
      strMeasure12: savedCocktail.strMeasure12,
      strMeasure13: savedCocktail.strMeasure13,
      strMeasure14: savedCocktail.strMeasure14,
      strMeasure15: savedCocktail.strMeasure15,
      dateModified: savedCocktail.updatedAt,
    };


    res.status(201).json({
      message: 'Coquetel criado com sucesso',
      drink: formattedResponse,
    });


    console.log(
      `[POST /cocktails] Novo coquetel criado por ${req.user.email}: "${sanitizedDrink}" (${savedCocktail.idDrink})`
    );

    // Invalidar cache para GET /api/cocktails (opcionalmente)
    // cache.clear('cocktails:*');
  } catch (error) {
    console.error('[POST /cocktails] Erro:', error.message);

    
    if (error.code === 11000) {
      return res.status(409).json({
        error: 'Coquetel já existe',
      });
    }

    // Validação do Mongoose
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors)
        .map((e) => e.message)
        .join(', ');
      return res.status(400).json({
        error: `Erro de validação: ${messages}`,
      });
    }

    next(error);
  }
});

module.exports = router;
