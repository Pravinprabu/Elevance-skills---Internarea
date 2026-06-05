const mongoose = require("mongoose");
require("dotenv").config();

module.exports.connect = async () => {
  try {
    console.log("URI:", process.env.DATABASE_URL);

    await mongoose.connect(process.env.DATABASE_URL);

    console.log("Database connected successfully");
  } catch (err) {
    console.error("MongoDB Error:");
    console.error(err);
  }
};