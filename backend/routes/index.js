const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Model, User } = require('../models');
const authenticateToken = require('../middleware/auth');
const sharp = require('sharp');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// User routes
router.post('/register', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      username: req.body.username,
      password: hashedPassword,
      isAdmin: req.body.isAdmin || false
    });
    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (user && await bcrypt.compare(req.body.password, user.password)) {
      const token = jwt.sign(
        { userId: user._id, username: user.username, isAdmin: user.isAdmin },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      res.json({ token, isAdmin: user.isAdmin });
    } else {
      res.status(400).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

// Model routes
router.get('/models', async (req, res) => {
  try {
    const models = await Model.find().populate('associatedUsers', 'username');
    res.json(models);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching models', error: error.message });
  }
});

router.post('/models', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const { name, forFrontPage } = req.body;
    const url = `http://localhost:3000/uploads/${req.file.filename}`;
    const model = new Model({ 
      name, 
      url, 
      forFrontPage: forFrontPage === 'true',
      fileSize: req.file.size
    });
    await model.save();
    res.json(model);
  } catch (error) {
    res.status(500).json({ message: 'Error uploading model', error: error.message });
  }
});

router.get('/models/:id', async (req, res) => {
  try {
    const model = await Model.findById(req.params.id);
    if (!model) {
      return res.status(404).json({ message: 'Model not found' });
    }
    res.json(model);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching model', error: error.message });
  }
});

router.patch('/models/:id', authenticateToken, async (req, res) => {
  try {
    const model = await Model.findByIdAndUpdate(
      req.params.id, 
      { ...req.body, lastModified: Date.now() }, 
      { new: true }
    );
    if (!model) {
      return res.status(404).json({ message: 'Model not found' });
    }
    res.json(model);
  } catch (error) {
    res.status(500).json({ message: 'Error updating model', error: error.message });
  }
});

router.delete('/models/:id', authenticateToken, async (req, res) => {
  try {
    const model = await Model.findById(req.params.id);
    if (!model) {
      return res.status(404).json({ message: 'Model not found' });
    }
    
    const filePath = path.join(__dirname, '..', model.url);
    await fs.unlink(filePath);

    await Model.findByIdAndDelete(req.params.id);
    res.json({ message: 'Model deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting model', error: error.message });
  }
});

router.get('/models/:id/thumbnail', async (req, res) => {
  try {
    const model = await Model.findById(req.params.id);
    if (!model) {
      return res.status(404).json({ message: 'Model not found' });
    }

    const objFile = await fs.readFile(path.join(__dirname, '..', model.url));
    const thumbnail = await sharp(objFile)
      .resize(200, 200)
      .toFormat('png')
      .toBuffer();

    res.contentType('image/png');
    res.send(thumbnail);
  } catch (error) {
    res.status(500).json({ message: 'Error generating thumbnail', error: error.message });
  }
});

// User management routes (protected)
router.get('/users', authenticateToken, async (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

router.post('/models/:modelId/users/:userId', authenticateToken, async (req, res) => {
  try {
    const model = await Model.findById(req.params.modelId);
    const user = await User.findById(req.params.userId);

    if (!model || !user) {
      return res.status(404).json({ message: 'Model or User not found' });
    }

    if (!model.associatedUsers.includes(user._id)) {
      model.associatedUsers.push(user._id);
      await model.save();
    }

    res.json(model);
  } catch (error) {
    res.status(500).json({ message: 'Error associating user with model', error: error.message });
  }
});

// Add new user (protected, admin only)
router.post('/users', authenticateToken, async (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  try {
    const { username, password, isAdmin } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      password: hashedPassword,
      isAdmin: isAdmin || false
    });
    await newUser.save();
    const userWithoutPassword = newUser.toObject();
    delete userWithoutPassword.password;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

module.exports = router;