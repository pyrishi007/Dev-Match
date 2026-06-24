const bcrypt = require("bcrypt");

const encrptPassword = async (clientPassowrd) => {
  //function return hash passowrd
  const hashPassword = await bcrypt.hash(clientPassowrd, 10);
  return hashPassword;
};

module.exports = encrptPassword;
