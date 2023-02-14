import express from "express";
import * as dotenv from "dotenv";
import { pool } from "../queries/query";
import bcrypt from "bcrypt";

dotenv.config();

const router = express.Router();

router.get("/", async (req, res) => {
  pool.query("SELECT * FROM users ORDER BY id ASC", (error, results) => {
    if (error) {
      throw error;
    }
    res.status(200).json(results.rows);
  });
});

router.get("/:userId", async (req, res) => {
  pool.query(
    `SELECT * FROM users WHERE id=${req.params.userId} ORDER BY id ASC`,
    (error, results) => {
      if (error) {
        throw error;
      }
      res.status(200).json(results.rows);
    }
  );
});

router.post("/register", async (req, res) => {
    const selectQuery = `
      SELECT username
      FROM users
      WHERE username = $1
    `;
  
    const selectValues = [req.body.username];
    const { rows: existingUsernames } = await pool.query(selectQuery, selectValues);
  
    if (existingUsernames.length > 0) {
      return res.status(403).json({ message: "Username is already taken" });
    }
  
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(req.body.password, salt);
  
    const insertQuery = `
      INSERT INTO users (firstname, lastname, email, password, username)
      VALUES ($1, $2, $3, $4, $5)
    `;
  
    const insertValues = [
      req.body.firstname,
      req.body.lastname,
      req.body.email,
      hash,
      req.body.username
    ];
  
    await pool.query(insertQuery, insertValues);
    res.status(200).json({ message: "Successfully registered" });
  });
  

export default router;
