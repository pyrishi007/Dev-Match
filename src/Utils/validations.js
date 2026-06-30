// --LIBRARY IMPORTS--
const bcrypt = require("bcrypt");
const validator = require("validator");

// --UTILITY---
const Client = require("../models/user.model");
const { ALLOWED_UPDATE } = require("./CONSTANTS");

//RESITER VALIDATION
const validateRegistrationData = async (req) => {
  //DATAFIELD VALIDATION CHECKLIST
  const { firstname, lastname, password, profileURL, email } = req.body;

  //FIRST OR LASTNAME REQUIRED VALIDATION
  if (!firstname && !lastname)
    throw new Error("Please provide either a firstname or lastname.");

  //FIRSTNAME MINIMUM CHARACTER VALIDATION
  if (firstname && firstname.length < 4)
    throw new Error("Please provide minimum 4 charaters in firstname");

  //STRONG PASSWORD VALIDATION
  if (password && !validator.isStrongPassword(password))
    throw new Error("Password does not meet the security requirements.");

  //DUPLICATE EMAIL VALIDATION
  if (email) {
    const user = await Client.findOne({ email: email });
    if (user) throw new Error("Email is already in use");
    return;
  }
};

//UPDATE VALIDATION
const validateEditData = (updateData) => {
  //CHECKLIST FOR ALLOWED UPDATE
  const isUpdateAllowed = Object.keys(updateData).every((eachKey) =>
    ALLOWED_UPDATE.includes(eachKey),
  );

  if (!isUpdateAllowed) throw new Error("Update not allowed");

  return;
};

//LOGIN VALIDATION
const authenticateUser = async (password, email) => {
  if (email && validator.isEmail(email)) {
    const user = await Client.findOne({ email: email });

    //THROW ERROR WITH TF NO USER MATCH
    if (!user) throw new Error("User not found");

    //SCHEMA-METHOD
    const isPasswordMatch = await user.checkPassword(password);

    // THROW ERROR IF PASSWORD DOESNT MATCH
    if (!isPasswordMatch) throw new Error("Incorrect email or password");

    return user;
  }

  throw new Error("Incorrect email or password");
};

module.exports = {
  validateEditData,
  validateRegistrationData,
  authenticateUser,
};
