import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";

import connectDB from "./mongodb/connect";
import dalleRoutes from "./routes/dalleRoutes";
import postRoutes from "./routes/postRoutes";
import userRoutes from "./routes/userRoutes";

// dotenv to use Environment variables
dotenv.config();
const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// Setup routes
app.use(express.json({ limit: "50mb" }));
app.use("/api/v1/post", postRoutes);
app.use("/api/v1/dalle", dalleRoutes);
app.use("/api/v1/user", userRoutes);

// Response on main page
app.get("/", async (req, res) => {
  res.send("Hello from DALL-E!");
});

const startServer = async () => {
  try {
    connectDB(process.env.MONGODB_URL);
    app.listen(process.env.PORT, () => {
      return console.log(
        `Server is listening on http://localhost:${process.env.PORT}`
      );
    });
  } catch (error) {
    console.log(error);
  }
};

startServer();
