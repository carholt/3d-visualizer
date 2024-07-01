const mongoose = require('mongoose');

const ModelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  forFrontPage: { type: Boolean, default: false },
  uploadDate: { type: Date, default: Date.now },
  lastModified: { type: Date, default: Date.now },
  fileSize: { type: Number, required: true },
  associatedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false }
});

const Model = mongoose.model('Model', ModelSchema);
const User = mongoose.model('User', UserSchema);

module.exports = { Model, User };