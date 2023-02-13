import express from "express";
import * as dotenv from "dotenv";
import db from "../queries/userQueries";

dotenv.config();

const router = express.Router();

// Postgres query
router.route("/").get(db.getUsers);

export default router;