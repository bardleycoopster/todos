import jwt, { VerifyErrors } from "jsonwebtoken";
import { AuthenticationError } from "apollo-server-express";
import { Request } from "express";
import { JwtPayload } from "types";

import config from "../config.json";

const EXEMPT_OPERATIONS = ["IntrospectionQuery", "login"];

const context = ({ req }: { req: Request }): { user: JwtPayload | null } => {
  let user: JwtPayload | null = null;
  let token =
    req.headers.authorization &&
    req.headers.authorization.replace("Bearer ", "");

  const isOperationExempt = EXEMPT_OPERATIONS.includes(req.body.operationName);

  if (token && !isOperationExempt) {
    // verifies secret and checks exp
    jwt.verify(
      token,
      config.jwt.secret,
      (err: VerifyErrors | null, decoded): void => {
        const decodedPayload = decoded as JwtPayload;
        if (err) {
          if (err.name === "TokenExpiredError") {
            throw new AuthenticationError("JWT expired");
          } else {
            throw new AuthenticationError(
              req.headers.authorization + "Invalid JWT"
            );
          }
        }

        if (decodedPayload) {
          user = {
            id: decodedPayload.id,
            username: decodedPayload.username,
          };
        } else {
          throw new AuthenticationError(
            "JWT did not container id and username"
          );
        }
      }
    );
  }

  return { user };
};

export default context;
