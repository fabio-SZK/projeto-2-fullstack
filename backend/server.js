const https = require('https');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const express = require('express');
const compression = require('compression');
const morgan = require('morgan');
const winston = require('winston');
const expressWinston = require('express-winston');
const cors = require('cors');
const sanitizer = require('perfect-express-sanitizer');
const xss = require('xss');

const { connectDB } = require('./src/config/database');
const authRoutes = require('./src/routes/authRoutes');
const cocktailRoutes = require('./src/routes/cocktailRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

/**
 * CONFIGURAÇÃO DE LOGGING - Winston + Morgan
 */
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    // Logs de erro em arquivo
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Logs gerais em arquivo
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880,
      maxFiles: 5,
    }),
    // Logs também no console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

// Criar pasta de logs se não existir
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * MIDDLEWARES GLOBAIS
 */

// Compressão de respostas
app.use(compression());

// CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
    credentials: true,
  })
);

// Parse de JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Logging HTTP com Morgan
app.use(
  morgan('combined', {
    stream: fs.createWriteStream(path.join(logsDir, 'http.log'), { flags: 'a' }),
  })
);

// Logging estruturado com express-winston
app.use(
  expressWinston.logger({
    transports: [new winston.transports.Console()],
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    colorize: true,
  })
);

// Sanitização global com perfect-express-sanitizer
app.use(
  sanitizer.clean({
    level: 5, // Nível de sanitização
    xss: true, // Remove XSS
    noSql: true, // Remove NoSQL injection
    sql: true, // Remove SQL injection
  })
);

app.locals.xss = xss;


app.locals.sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  return xss(str.trim().slice(0, 500)); 
};

/**
 * Carregar certificados HTTPS local
 */
function getOrCreateCertificates() {
  const certDir = path.join(__dirname, 'certs');
  const keyPath = path.join(certDir, 'server.key');
  const certPath = path.join(certDir, 'server.cert');

  if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
    logger.error('Certificados HTTPS não encontrados. Execute: openssl req -x509 -newkey rsa:2048 -keyout certs/server.key -out certs/server.crt -days 365 -nodes -subj "/CN=localhost"');
    process.exit(1);
  }

  return {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
  };
}

/**
 * INICIALIZAÇÃO DO SERVIDOR
 */
async function startServer() {
  try {
    // Conectar ao banco de dados
    await connectDB();

    // ROTAS DA APLICAÇÃO 
    // Rota de autenticação 
    app.use('/api', authRoutes);

    // Rota de coquetéis 
    app.use('/api', cocktailRoutes);

    // Fallback para rotas indefinidas
    app.use('/api', (req, res) => {
      res.status(404).json({ error: 'Rota não encontrada' });
    });

    app.get('/health', (req, res) => {
      res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // Logging de erros com express-winston
    app.use(
      expressWinston.errorLogger({
        transports: [
          new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        ],
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json()
        ),
      })
    );

    // Middleware de erro 
    app.use((err, req, res, next) => {
      logger.error({
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
      });

      res.status(err.status || 500).json({
        error: process.env.NODE_ENV === 'production' ? 'Erro interno' : err.message,
      });
    });

    // Criar e iniciar servidor HTTPS
    const httpsOptions = getOrCreateCertificates();
    const server = https.createServer(httpsOptions, app);

    server.listen(PORT, () => {
      logger.info(`Servidor HTTPS rodando em: https://localhost:${PORT}`);

      logger.info(`Logging ativo em: logs/`);
    });

    process.on('SIGTERM', async () => {
      logger.warn('SIGTERM recebido. Encerrando servidor...');
      server.close(async () => {
        await require('./src/config/database').disconnectDB();
        process.exit(0);
      });
    });
  } catch (error) {
    logger.error(`Erro ao iniciar servidor: ${error.message}`);
    process.exit(1);
  }
}

// Iniciar servidor
startServer();

module.exports = app;
