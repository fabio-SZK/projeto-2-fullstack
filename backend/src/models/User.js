const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

/**
 * Schema de Usuário
 * Armazena credenciais de autenticação com hash de senha via bcrypt
 */
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email é obrigatório'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido'],
    },
    password: {
      type: String,
      required: [true, 'Senha é obrigatória'],
      minlength: [6, 'Senha deve ter no mínimo 6 caracteres'],
      select: false, // Não retorna a senha por padrão nas consultas
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Adiciona createdAt e updatedAt automaticamente
  }
);

/**
 * HOOK PRÉ-SAVE: Criptografa a senha com bcrypt antes de salvar
 * Só criptografa se a senha foi modificada
 */
userSchema.pre('save', async function (next) {
  // Se a senha não foi modificada, pula para o próximo middleware
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Gera salt com 10 rounds (padrão seguro)
    const salt = await bcrypt.genSalt(10);
    // Hash da senha
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * MÉTODO DE INSTÂNCIA: Compara senha fornecida com hash armazenado
 * Retorna true/false
 */
userSchema.methods.comparePassword = async function (passwordProvided) {
  return await bcrypt.compare(passwordProvided, this.password);
};

/**
 * MÉTODO DE INSTÂNCIA: Retorna objeto público do usuário (sem senha)
 */
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
