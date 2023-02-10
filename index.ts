import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: "50mb" }));

app.get("/", async (req, res) => {
  res.send("Hello from DALL-E!");
});


app.listen(process.env.PORT, () => {
  return console.log(`Express is listening at http://localhost:${process.env.PORT}`);
});
