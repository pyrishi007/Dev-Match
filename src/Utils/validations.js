const { ALLOWED_UPDATE } = require("./CONSTANTS");
const validator = require("validator");
const Client = require("../models/user.model");
const bcrypt = require("bcrypt");

//auth/register
const validateRegistrationData = async (req) => {
  //Validation checklist
  const { firstname, lastname, password, profileURL, email } = req.body;

  //Validation for first or lastname
  if (!firstname && !lastname) {
    throw new Error("Please provide either a firstname or lastname.");
  }

  //Validation for minimum charater
  if (firstname || lastname) {
    if (firstname && firstname.length < 4)
      throw new Error("Please provide minimum 4 charaters in firstname");

    if (lastname && lastname.length < 4)
      throw new Error("Please provide minimum 4 charaters in lastname");
  }

  // Validation for no password
  if (!password) {
    throw new Error("Password is required");
  }

  // Validation for stronge password
  if (password && !validator.isStrongPassword(password)) {
    throw new Error("Password does not meet the security requirements.");
  }

  // Validation for duplicate email
  if (email) {
    const user = await Client.findOne({ email: email });
    if (user) throw new Error("Email is already in use");
    return;
  }
};

//patch
const validateUpdateData = (req) => {
  //Checks for updates which are allowed
  const isUpdateAllowed = Object.keys(req.body).every((eachKey) =>
    ALLOWED_UPDATE.includes(eachKey),
  );

  // If not allowed then throw error
  if (!isUpdateAllowed) {
    throw new Error("Update not allowed");
  }
};

//auth/login
const authenticateUser = async (password, email) => {
  if (email && validator.isEmail(email)) {
    const user = await Client.findOne({ email: email });

    if (!user) throw new Error("Incorrect email or password");

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    //return true or false
    return isPasswordMatch;
  } else {
    throw new Error("Incorrect email or password");
  }
};

module.exports = {
  validateUpdateData,
  validateRegistrationData,
  authenticateUser,
};
