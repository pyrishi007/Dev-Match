// ---LIBRARY IMPORT---
const bcrypt = require("bcrypt");

// PASSWORD HASHING & ENCRYPTION
const encryptPassword = async (clientPassword) => {
  const hashPassword = await bcrypt.hash(clientPassword, 10);
  return hashPassword;
};

module.exports = encryptPassword;
