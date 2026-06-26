// ---LIBRARY IMPORTS---
const mongoose = require("mongoose");
require("dotenv").config();

//DB CONNECTION CONFIG
const connectDB = async () => {
  await mongoose.connect(process.env.mongoStr);
};

module.exports = connectDB;
