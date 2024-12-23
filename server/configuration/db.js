const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables

// MongoDB Connection Function
const connectDB = async () => {
  try {
    // Use the URI from your environment variable, fallback to hardcoded URI if missing
    const dbURI = process.env.MONGO_URI || 'mongodb+srv://kbrownonuigbo:fDrFRtQwPeBiEO35@cluster0.jotqa.mongodb.net/blogdb?retryWrites=true&w=majority&appName=Cluster0';

    console.log('Connecting to MongoDB with URI:', dbURI);

    // Connect to MongoDB
    await mongoose.connect(dbURI); // No need for useNewUrlParser or other deprecated options
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);

    // Exit the process in case of an error (except during tests)
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
  }
};

// MongoDB Disconnection Function
const disconnectDB = async () => {
  try {
    if (process.env.NODE_ENV === 'test') {
      await mongoose.connection.dropDatabase(); // Drop the test database
      console.log('Test database dropped...');
    }

    await mongoose.connection.close(); // Close the MongoDB connection
    console.log('MongoDB Disconnected...');
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error.message);
  }
};

// Exporting Connection Functions
module.exports = { connectDB, disconnectDB };
