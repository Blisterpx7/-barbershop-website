const mongoose = require('mongoose');

// Use MongoDB Atlas connection string
const uri = process.env.MONGODB_URI || 'mongodb+srv://markdave3312004:markdave31@cluster0.swdvfha.mongodb.net/Mydb?retryWrites=true&w=majority&appName=Cluster0';

const connectDB = async () => {
  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

module.exports = connectDB;