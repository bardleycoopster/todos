const jwt = require("jsonwebtoken");
const { ApolloError } = require("apollo-server-express");
const config = require("../config");

module.exports = ({ req }) => {
  let user;
  let token = req.headers.authorization;
  if (token) {
    token = token.replace("Bearer ", "");

    // verifies secret and checks exp
    jwt.verify(token, config.jwt.secret, (err, decoded) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          throw new ApolloError("JWT expired", "BAD_REQUEST");
        } else {
          throw new ApolloError("Invalid JWT", "BAD_REQUEST");
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
