const jwt = require("jsonwebtoken");
const { AuthenticationError } = require("apollo-server-express");
const config = require("../config");

module.exports = ({ req }) => {
  let user;
  let token =
    req.headers.authorization &&
    req.headers.authorization.replace("Bearer ", "");

  if (token) {
    // verifies secret and checks exp
    jwt.verify(token, config.jwt.secret, (err, decoded) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          throw new AuthenticationError("JWT expired");
        } else {
          throw new AuthenticationError(
            req.headers.authorization + "Invalid JWT"
          );
        }
      }

      user = {
        id: decoded.id,
        username: decoded.username,
      };
    });
  }
  return { user };
};
