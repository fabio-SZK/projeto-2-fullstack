const mongoose = require('mongoose');

/**
 * Configuração de conexão com MongoDB usando Mongoose
 * Implementa pool de conexões para otimização
 */
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cocktaildb';
    
    const connection = await mongoose.connect(mongoURI, {
      // Pool de conexões
      maxPoolSize: 10,
      minPoolSize: 5,
      // Configurações de retry e timeout
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      retryReads: true,
      
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });

    console.log(`MongoDB conectado: ${connection.connection.host}`);
    return connection;
  } catch (error) {
    console.error(`Erro ao conectar MongoDB: ${error.message}`);
    process.exit(1);
  }
};

/**
 * Desconecta do banco de dados
 */
const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('MongoDB desconectado');
  } catch (error) {
    console.error(`Erro ao desconectar MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = {
  connectDB,
  disconnectDB,
};
