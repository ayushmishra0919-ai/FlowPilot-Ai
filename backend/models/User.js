const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a user name'],
      trim: true,
      maxlength: 100
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: [true, 'Please provide a password']
    },
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'admin'
    }
  },
  {
    timestamps: true
  }
);

// Do not return passwordHash in JSON
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
