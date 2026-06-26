// ---LIBRARY IMPORT---
const mongoose = require("mongoose");
const validator = require("validator");

// ---UTILTY---
const { NUMBEREGEX, ALLOWED_GENDER_VALUES } = require("../Utils/CONSTANTS");

// DB SCHEMA DESIGN
// SCHEMA LEVEL VALDATION CHECKS TO REMOVE POLLUTED DATA
const clientSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
    },

    lastname: {
      type: String,
    },

    dob: {
      type: Date,
    },

    number: {
      type: String,
      required: true,
      unique: true,

      //SCHEMA LEVEL - NUMBER VALIDATION
      validate(value) {
        if (!NUMBEREGEX.test(value)) throw new Error("Not valid");
      },
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,

      //SCHEMA LEVEL - EMAIL VALIDATION
      validate(value) {
        if (!validator.isEmail(value)) throw new Error("Not valid");
      },
    },

    password: {
      type: String,
      required: true,
    },

    age: {
      type: Number,
      required: true,

      // MINIMUM AGE DATA = >18
      min: 18,
    },

    gender: {
      type: String,
      required: true,

      // SCHEMA LEVEL - GENDER VALIDATION
      validate(value) {
        if (!ALLOWED_GENDER_VALUES.includes(value.toLowerCase()))
          throw new Error("Gender data is invalid");
      },
    },

    profileURL: {
      type: String,

      // DEAFULT URL FOR PROFILE
      default: "URL",
    },

    skills: {
      type: [String],
    },
  },
  { timestamps: true },
);

const Client = mongoose.model("Client", clientSchema);

module.exports = Client;
