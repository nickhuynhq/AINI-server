import express from "express";
import * as dotenv from "dotenv";
import { pool } from "../postgres/postgres";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { authorize, sanitize } from "../utils/functions";
import sql from "sql-template-strings";

dotenv.config();

const router = express.Router();

// Get all Users
router.get("/", async (req, res) => {
  try {
    const query = sql`SELECT * FROM users ORDER BY id ASC`;
    const { rows } = await pool.query(query);
    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get Users by ID
router.get("/:userId", async (req, res) => {
  try {
    const query = sql`SELECT * FROM users WHERE id=$1`;
    const { rows } = await pool.query(query);
    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Add new User
router.post("/register", async (req, res) => {
  try {
    const usernameQuery = `
      SELECT username
      FROM users
      WHERE username = $1
    `;

    const emailQuery = `
      SELECT email
      FROM users
      WHERE email = $1
    `;

    const username = [req.body.username];
    const email = [req.body.email];
    const { rows: existingUsernames } = await pool.query(usernameQuery, username);
    const { rows: existingEmails } = await pool.query(emailQuery, email);

    if (existingUsernames.length > 0) {
      return res.status(403).json({ message: "Username is already taken" });
    }

    if (existingEmails.length > 0) {
      return res.status(403).json({ message: "Email already in use" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const insertQuery = `
      INSERT INTO users (name, email, password, username, picture)
      VALUES ($1, $2, $3, $4, $5)
    `;

    const insertValues = [
      req.body.name,
      req.body.email,
      hashedPassword,
      req.body.username,
      req.body.picture,
    ];

    await pool.query(insertQuery, insertValues);
    res.status(201).json({ message: "Successfully registered" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/delete", authorize, async (req, res) => {
  try {
    const query = sql`DELETE FROM users WHERE id = ${req.body.userId}`;
    const result = await pool.query(query);
    res.status(200).json({ message: "User successfully deleted" });
  } catch (error) {
    res.status(400).json({ error: error });
  }
});

// Login User
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(password)

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Login requires username and password fields" });
    }

    const query = sql`SELECT * FROM users WHERE email=${email}`;
    const { rows: users } = await pool.query(query);

    console.log(users)
    // If no users found, send error message
    if (users.length !== 1) {
      return res.status(401).json({ error: "User does not exist" });
    }

    const user = users[0];

    // Use bcrypt to compare inputted password to the one in database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log(isPasswordValid)

    if (isPasswordValid) {
      // Password is valid
      const token = jwt.sign(
        { user_id: user.id },
        process.env.JWT_SECRET_KEY
      );

      return res.json({
        message: "Successfully logged in",
        token,
      });
    }

    // Password is false
    return res.status(403).json({ error: "Invalid login credentials" });
    
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error });
  }
});

// Edit User
router.put("/edit", authorize, async (req, res) => {
  try {
    const { userId, name, email, password, username, picture } = req.body;

    // Sanitize user inputs
    const sanitizeName = sanitize(name);
    const sanitizedEmail = sanitize(email);
    const sanitizedPassword = sanitize(password);
    const sanitizedUsername = sanitize(username);
    const sanitizedPicture = sanitize(picture);

    // Update only non-empty fields
    const columnsToUpdate = [];
    const valuesToUpdate = [];

    if (sanitizeName) {
      columnsToUpdate.push("name");
      valuesToUpdate.push(sanitizeName);
    }
    if (sanitizedEmail) {
      columnsToUpdate.push("email");
      valuesToUpdate.push(sanitizedEmail);
    }
    if (sanitizedPassword) {
      // Hash the new password
      const hashedPassword = await bcrypt.hash(sanitizedPassword, 10);
      columnsToUpdate.push("password");
      valuesToUpdate.push(hashedPassword);
    }
    if (sanitizedUsername) {
      columnsToUpdate.push("username");
      valuesToUpdate.push(sanitizedUsername);
    }
    if (sanitizedPicture) {
      columnsToUpdate.push("picture");
      valuesToUpdate.push(sanitizedPicture);
    }

    // If no columns to update, return error message
    if (columnsToUpdate.length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    const query = sql`
      UPDATE users
      SET ${sql(
        columnsToUpdate.map((column, index) => [column, valuesToUpdate[index]])
      )}
      WHERE id=${userId}
      RETURNING *
    `;
    const { rows } = await pool.query(query);

    if (rows.length !== 1) {
      return res.status(404).json({ error: "User not found" });
    }

    const updatedUser = rows[0];
    res
      .status(200)
      .json({ message: "Successfully updated user", user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
