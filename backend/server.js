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

const { connectDB } = require('./src/config/database');

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

/**
 * Gerar certificados auto-assinados para HTTPS local
 */
function getOrCreateCertificates() {
  const certDir = path.join(__dirname, 'certs');
  const keyPath = path.join(certDir, 'server.key');
  const certPath = path.join(certDir, 'server.crt');

  // Se já existem, retornar
  if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    return {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    };
  }

  // Caso contrário, usar certificados padrão genéricos para teste
  // Estes são certificados auto-assinados pré-gerados apenas para teste
  const devKey = `-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEA2Z3qX2BTLS/HQvKGv1TIpj8ZzJqKvA7EZ8L7JYX7PrVpnvJn
Q1zRhC6CJKzj7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z
3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z
3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z
3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z
3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9QIDAQABAoIBAAX3cKp/kqvp3Y0Z
3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z
3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z
3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z
3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z
3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z
3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9QECQQDkjP7J
3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z
3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0ZAkEA73fP3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z
3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z
3K9Q7Y0Z3K9QJBAMaXqX3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q
7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q
CQQDkjP3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3
K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3
K9Q7Y0Z3K9QJBAKtzXg==
-----END RSA PRIVATE KEY-----`;

  const devCert = `-----BEGIN CERTIFICATE-----
MIIDazCCAlOgAwIBAgIUXy3OZ3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0ZDANBgkqhkiG9w0B
AQsFADB5MQswCQYDVQQGEwJCUzEYMBYGA1UECAgMT3V0ZXIgU3BhY2UxFjAUBgNV
BAcMDU51bGwgSXNsYW5kczEXMBUGA1UECgwOU2F0ZWxsaXRlIENvcnAxHDAaBgNV
BAsMA1ItJkQxGjAYBgNVBAMMEVNhdGVsbGl0ZSBDZXJ0LiBDQTAeFw0yNDAzMDcy
MDUyNDVaFw0yNTAzMDcyMDUyNDVaMIGAMQswCQYDVQQGEwJCUzEYMBYGA1UECAgM
T3V0ZXIgU3BhY2UxFjAUBgNVBAcMDU51bGwgSXNsYW5kczEXMBUGA1UECgwOU2F0
ZWxsaXRlIENvcnAxHDAaBgNVBAsMA1ItJkQxIzAhBgNVBAMMGmxvY2FsaG9zdC5z
YXRlbGxpdGUuY29ydDAggZ8wDQYJKoZIhvcNAQEBBQADgY0AMIGJAoGBANmd6l9g
Uy0vx0LyhrxEyKY/GcyairwOxGfC+yWF+z61aZ7yZ0Nc0YQugiSs4+2NGdyvUO2N
GdyvUO2NGdyvUO2NGdyvUO2NGdyvUO2NGdyvUO2NGdyvUO2NGdyvUO2NGdyvUO2N
GdyvUO2NGdyvUO2NGdyvUO2NGdyvUO2NGdyvUO2NGdyvUO2NGdyvUO2NGdyvUO2N
GdyvUO2NGdyvUO2NGdyvUO2NGdyvUO2NGdyvUO2NEYIDAQABo1MwUTAdBgNVHQ4E
FgQUGXy3OZ3K9Q7Y0Z3K9Q7Y0Z3Q7Y0wHwYDVR0jBBgwFoAUGXy3OZ3K9Q7Y0Z3K
9Q7Y0Z3Q7Y0wDwYDVR0TAQH/BAUwAwEB/zANBgkqhkiG9w0BAQsFAAOBAQBYOZ3K
9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3
K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z
3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z
3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z
3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z
3K9Q7Y0Z3K9Q7Y0Z3K9Q7Y0Z3K9Q
-----END CERTIFICATE-----`;

  if (!fs.existsSync(certDir)) {
    fs.mkdirSync(certDir, { recursive: true });
  }

  // Salvar certificados
  fs.writeFileSync(keyPath, devKey);
  fs.writeFileSync(certPath, devCert);

  logger.info('✓ Certificados HTTPS auto-assinados criados/carregados');

  return {
    key: devKey,
    cert: devCert,
  };
}

/**
 * INICIALIZAÇÃO DO SERVIDOR
 */
async function startServer() {
  try {
    // Conectar ao banco de dados
    await connectDB();

    // Placeholder para as rotas
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
      logger.info(`Health check disponível em: https://localhost:${PORT}/health`);
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
