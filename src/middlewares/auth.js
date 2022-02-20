const jwt = require("jsonwebtoken");
const User = require("../models/user");

const authorize = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");

    const decoded = await jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({
      _id: decoded._id,
      "tokens.token": token,
    }); // decoded._id is the id od the user we put as a unique identifier in user model
    if (!user) {
      throw new Error();
    }
    req.token = token; // access this req.user on logout route
    req.user = user; // save the user on req.user so we cannot see other users profile...we get only our profile on {{DOMAIN}}/users/me
    next();
  } catch (error) {
    res.status(401).send("Please Authenticate");
  }
};

module.exports = authorize;
