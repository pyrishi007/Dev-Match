const { ALLOWED_UPDATE } = require("./CONSTANTS");

// for post method
const updateValidation = (req) => {
  console.log(req.body);

  //Checks for updates which are allowed
  const isUpdateAllowed = Object.keys(req.body).every((eachKey) =>
    ALLOWED_UPDATE.includes(eachKey),
  );

  if (!isUpdateAllowed) {
    throw new Error("Update not allowed");
  }
};

module.exports = {
  updateValidation,
};
