//--LIBRARY IMPORTS--
const express = require("express");

//---MIDDLEWARE IMPORTS--
const verifyToken = require("../middleware/userAuth");

//CONFIG
const profileRouter = express.Router();

//JWT MIDDLEWARE
profileRouter.use("/profile", verifyToken);

//get /user/profile
profileRouter.get("/profile/view", (req, res, next) => {
  try {
    res.status(200).send(req.user);
  } catch (err) {
    next(err);
  }
});

module.exports = profileRouter;
