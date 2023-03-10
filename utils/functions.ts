import jwt from "jsonwebtoken";
require("dotenv").config();

export const authorize = async (req, res, next) => {
  try {
    const bearerTokenString = req.headers.authorization;

    if (!bearerTokenString) {
      return res.status(401).json({
        error: "Resource requires Bearer token in Authorization header",
      });
    }

    const splitBearerTokenString = bearerTokenString.split(" ");

    if (splitBearerTokenString.length !== 2) {
      return res.status(400).json({ error: "Bearer token is malformed" });
    }

    const token = splitBearerTokenString[1];

    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: "Invalid JWT" });
      }

      req.userId = decoded.id;
      next();
    });
  } catch (error) {
    console.log(error);
  }
};

export const sanitize = (text: string) => {
  return text.replace(/'/g, "''");
};
