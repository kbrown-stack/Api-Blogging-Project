const mongoose = require('mongoose');
require('dotenv').config();



const connectDB = async () => {
  try {
    const dbURI = process.env.MONGO_URI;

    console.log('Connecting to MongoDB with URI:');

    await mongoose.connect(dbURI,{useNewUrlParser: true,
      useCreateIndex: true, useFindAndModify: false,
    });
    console.log(`MongoDB Connected`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1); 
    }
  }
};

const disconnectDB = async () => {
  try {
    if (process.env.NODE_ENV === 'test') {
      await mongoose.connection.dropDatabase();
      console.log('Test database dropped...');
    }
    await mongoose.connection.close();
    console.log('MongoDB Disconnected...');
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error.message);
  }
};

module.exports = { connectDB, disconnectDB };

