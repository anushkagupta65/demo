const mongoose = require('mongoose');
require('dotenv').config();
const string = process.env.DB_STRING || "";

const connectDB = async () => {
    try {
        await mongoose.connect(string, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB connected');
    }
    catch (error) {
        console.error('MongoDB connection error:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;