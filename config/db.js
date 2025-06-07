// const mongoose = require('mongoose');

// const connectDB = async () => {
//     try{
//         await mongoose.connect(process.env.Mongo_URI, {});
//         console.log('MongoDB connected');
//     }catch(err){
//         console.error('MongoDB connection error:', err);
//         process.exit(1);
        
//     }
// }

// module.exports = connectDB;


//OPTIMIZE CODE/////////////////////////////////////////////

// In db.js
const mongoose = require('mongoose');

// Add connection pooling
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
      maxPoolSize: 10, // Adjust based on your needs
      serverSelectionTimeoutMS: 5000
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
