const { ALLOWED_UPDATE } = require("./CONSTANTS");
const validator = require("validator");

// for post method
const updateValidation = (req) => {
  //Checks for updates which are allowed
  const isUpdateAllowed = Object.keys(req.body).every((eachKey) =>
    ALLOWED_UPDATE.includes(eachKey),
  );

  // If not allowed then throw error
  if (!isUpdateAllowed) {
    throw new Error("Update not allowed");
  }
};

const validateSignUpData = (req) => {
  const { firstname, lastname, password, profileURL } = req.body;

  //Validation for Sign UP data specific field

  //If firstname or lastname is not present
  if (!firstname && !lastname) {
    throw new Error("Please provide either a firstname or lastname.");
  }

  if (firstname || lastname) {
    //Checks for minimum characters
    if (firstname && firstname.length < 4)
      throw new Error("Please provide minimum 4 charaters in firstname");

    if (lastname && lastname.length < 4)
      throw new Error("Please provide minimum 4 charaters in lastname");
  }

  //if password is not present
  if (!password) {
    throw new Error("Password is required");
  }

  if (password && !validator.isStrongPassword(password)) {
    throw new Error("Password does not meet the security requirements.");
  }
};

module.exports = {
  updateValidation,
  validateSignUpData,
};
