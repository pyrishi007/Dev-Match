//--LIBRARY IMPORTS--
const express = require("express");

//--UTILS--
const { validateEditData } = require("../Utils/validations");

//---MIDDLEWARE IMPORTS--
const verifyToken = require("../middleware/userAuth");

//CONFIG
const profileRouter = express.Router();

//JWT MIDDLEWARE
profileRouter.use("/profile", verifyToken);

//get /profile/view
profileRouter.get("/profile/view", (req, res, next) => {
  try {
    res.status(200).send(req.user);
  } catch (err) {
    next(err);
  }
});

//patch /profile/view
profileRouter.patch("/profile/edit", (req, res, next) => {
  try {
    //VALIDATE USER DATA
    validateEditData(req.body);

    //UPDATE USER DATA
    req.user.editData(req.body);

    //SENT UPDATED DATA
    res.send(req.user);
  } catch (err) {
    next(err);
  }
});

module.exports = profileRouter;
