import express from "express";
import * as dotenv from "dotenv";
import { v2 as cloudindary } from "cloudinary";

import Post from "../mongodb/models/post";

dotenv.config();

const router = express.Router();

export default router;
