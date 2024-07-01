const mongoose = require('mongoose');
const { User } = require('./models');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(async () => {
  try {
    const adminUser = new User({
      username: 'admin',
      password: 'adminpassword',
      isAdmin: true
    });
    await adminUser.save();
    console.log('Admin user created successfully');
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    mongoose.disconnect();
  }
}).catch(err => console.error('Could not connect to MongoDB', err));