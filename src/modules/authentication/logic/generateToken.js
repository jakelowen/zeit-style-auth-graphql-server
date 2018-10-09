import * as jwt from "jsonwebtoken";

export default (id, validTokenVersion) =>
  jwt.sign(
    {
      id,
      version: parseInt(validTokenVersion, 10)
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
