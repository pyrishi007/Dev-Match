const mongoose = require("mongoose");
const {
  NUMBEREGEX,
  EMAILREGEX,
  PASSWORD_REGEX,
  ALLOWED_GENDER_VALUES,
} = require("../Utils/CONSTANTS");

const clientSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
    },

    lastname: {
      type: String,
    },

    number: {
      type: String,
      required: true,
      unique: true,

      //10-Digit number validation
      validate(value) {
        if (!NUMBEREGEX.test(value)) throw new Error("Not valid");
      },
    },

    email: {
      type: String,
      required: true, //THis field is required
      unique: true, //No duplicate is allowed
      lowercase: true, //Should always be in lower case
      trim: true, //no white spaces from sides are allowed

      // Strict validation for email
      validate(value) {
        if (!EMAILREGEX.test(value)) throw new Error("Not valid");
      },
    },

    password: {
      type: String,
      required: true,
      minLength: 8, //minimum characters are 10
      validate(value) {
        if (!PASSWORD_REGEX.test(value))
          throw new Error(
            "Password must contain uppercase, lowercase, number, special character, and minimum 8 characters.",
          );
      },
    },

    age: {
      type: Number,
      required: true,
      min: 18, //minimum age value should be 18 or above
    },

    gender: {
      type: String,
      required: true,

      // always remember that validation always works first time when the data is saving it cannot be done when wiht patch or put, we have to use option is that case
      // making custom validation for gender
      validate(value) {
        if (!ALLOWED_GENDER_VALUES.includes(value.toLowerCase()))
          throw new Error("Gender data is invalid");
      },
    },

    profileURL: {
      type: String,
      default: "URL", //Default behviour is added
    },

    skills: {
      type: [String], //Can be added mutltiple String
    },
  },
  { timestamps: true },
);

const Client = mongoose.model("Client", clientSchema);

module.exports = Client;

// Why this ata validation is important is because to avoid any polluted data to enter into the DB
