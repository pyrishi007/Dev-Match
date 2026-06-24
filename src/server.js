const express = require("express");
const errorHandler = require("./middleware/errorHandler");
const Client = require("./models/user.model");
const conenctDB = require("./config/database");
const dns = require("dns/promises");
const { errorMonitor } = require("events");
const { SignUpValidation, updateValidation } = require("./Utils/validations");

// Setting up DNS locally
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const app = express();
const PORT = 4000;

//JSON -> JS object
app.use(express.json());

//post /user
app.post("/user", async (req, res, next) => {
  // Validation for registering user
  await SignUpValidation(req);

  //
  try {
    const user = await Client(req.body).save();
    res.send(user);
  } catch (err) {
    next(err);
  }
});

//get /user
app.get("/user", async (req, res, next) => {
  try {
    const allFeedUser = await Client.find();

    res.send(allFeedUser);
  } catch (err) {
    next(err);
  }
});

// get /user/id/:userId
app.get("/user/id/:userId", async (req, res, next) => {
  try {
    const user = await Client.findById(req.params.userId);
    res.send(user);
  } catch (err) {
    next(err);
  }
});

// get /user/email/:userEmail
app.get("/user/email/:userEmail", async (req, res, next) => {
  try {
    const user = await Client.findOne({ email: req.params.userEmail });
    res.send(user);
  } catch (err) {
    next(err);
  }
});

//delete /user/:userId
app.delete("/user/:userId", async (req, res, next) => {
  try {
    const deletedUser = await Client.findByIdAndDelete(req.params.userId);
    res.send(`User successfully deleted : ${deletedUser}`);
  } catch (err) {
    next(err);
  }
});

//patch /user/:userId
app.patch("/user/:userId", async (req, res, next) => {
  try {
    // Check for update policy and restrictions
    updateValidation(req);

    const updatedClient = await Client.findByIdAndUpdate(
      req.params.userId,
      req.body,
      { returnDocument: "after", runValidators: true },
    );
    res.send(`User successfully updated : ${updatedClient}`);
  } catch (err) {
    next(err);
  }
});

// Global error Handler
app.use(errorHandler);

//DB connection
conenctDB()
  .then(() => {
    console.log("DB connection successfull");
    app.listen(PORT, () => {
      console.log(`Server is up and running on ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(`Error message : ${err.message}`);
  });
