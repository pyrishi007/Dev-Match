// --LIBRARY IMPORTS--
const jwt = require("jsonwebtoken");

// --UTILITY & HELPER FUNCTION IMPORTS--
const Client = require("../models/user.model");

// JWT TOKEN VERIFICATION
const verifyToken = async (req, res, next) => {
  try {
    //REQUIRE TOKEN FROM COOKIE
    const { token } = req.cookies;
    if (!token) throw new Error("Authentication required");

    //DECODE DATA OUT OF TOKEN
    const { _id } = jwt.verify(token, process.env.JWT_SECRET_KEY);

    //GETTING USER INFO BT ID
    const user = await Client.findById(_id);
    if (!user) throw new Error("User not found");

    //SETTING req.body = {user}
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = verifyToken;
