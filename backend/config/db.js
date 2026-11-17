const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campus_bikepool';

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[Database Warning] Could not connect to local MongoDB at: ${mongoUri}`);
    console.warn(`[Database Notice] To connect to MongoDB, either:`);
    console.warn(`  1. Start your local MongoDB daemon (e.g. 'mongod' or MongoDB Compass)`);
    console.warn(`  2. Or paste your free MongoDB Atlas URI into backend/.env (MONGO_URI=mongodb+srv://...)`);
  }
};

module.exports = connectDB;
