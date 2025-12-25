const { Schema, model } = require('mongoose');

const AuthTokenSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', index: true, required: true },
  tokenHash: { type: String, unique: true, index: true, required: true },
  type: { type: String, enum: ['password_reset', 'email_verify', 'magic_link'], required: true },
  usedAt: Date,
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
  },
  createdByIP: String,
}, { timestamps: true });

AuthTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = model('AuthToken', AuthTokenSchema);
