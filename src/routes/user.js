//--LIBRARY IMPORTS--
const express = require("express");

//--MIDDLEWARE IMPORT--
const verifyToken = require("../middleware/userAuth");

//CONFIG
const userRouter = express.Router();

//JWT MIDDLEWARE
userRouter.use("/user", verifyToken);

//get /user
userRouter.get("/user/feed", async (req, res, next) => {
  try {
    const allFeedUser = await Client.find();
    res.send(allFeedUser);
  } catch (err) {
    next(err);
  }
});

module.exports = userRouter;
