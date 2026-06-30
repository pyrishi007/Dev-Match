//---LIBRARY IMPORT---
const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

//---UTILTY---
const { NUMBEREGEX, ALLOWED_GENDER_VALUES } = require("../Utils/CONSTANTS");

//DB SCHEMA DESIGN
//SCHEMA LEVEL VALDATION CHECKS TO REMOVE POLLUTED DATA
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

//SCHEMA METHODS
//JWT TOKEN CREATION
clientSchema.methods.genrateJWT = async function () {
  const token = await jwt.sign({ _id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: "1d", //token will get expire in 1 day
  });
  return token;
};

//BCYPT PASSWORD COMPARE
clientSchema.methods.checkPassword = async function (unHashedPassowrd) {
  const isValid = await bcrypt.compare(unHashedPassowrd, this.password);
  return isValid;
};

//PROFILE EDIT
clientSchema.methods.editData = function (updateData) {
  Object.keys(updateData).forEach(
    (eachFieldValue) => (this[eachFieldValue] = updateData[eachFieldValue]),
  );
};

const Client = mongoose.model("Client", clientSchema);

module.exports = Client;
