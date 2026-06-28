// ---LIBRARY IMPORT---
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// PASSWORD HASHING & ENCRYPTION
const encryptPassword = async (clientPassword) => {
  const hashPassword = await bcrypt.hash(clientPassword, 10);
  return hashPassword;
};

module.exports = {
  encryptPassword,
};
