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
  const query = sql`SELECT * FROM users ORDER BY id ASC`;
  pool.query(query, (error, results) => {
    // handle response
    if (error) {
      throw error;
    }
    res.status(200).json(results.rows);
  });
});

// Get Users by ID
router.get("/:userId", async (req, res) => {
  const query = sql`SELECT * FROM users WHERE id=$1`;
  pool.query(query, [req.params.userId], (error, results) => {
    if (error) {
      throw error;
    }
    res.status(200).json(results.rows);
  });
});

// Add new User
router.post("/register", async (req, res) => {
  const selectQuery = `
      SELECT username
      FROM users
      WHERE username = $1
    `;

  const selectValues = [req.body.username];
  const { rows: existingUsernames } = await pool.query(
    selectQuery,
    selectValues
  );

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
    req.body.username,
  ];

  await pool.query(insertQuery, insertValues);
  res.status(201).json({ message: "Successfully registered" });
});

router.delete("/delete", authorize, async (req, res) => {
  const query = sql`DELETE FROM users WHERE id = ${req.body.userId}`;
  pool.query(query, (error, results) => {
    if (error) {
      throw error;
    }
    res.status(204).json(results.rows);
  });
});

// Login User
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Login requires username and password fields" });
  }

  const query = sql`SELECT * FROM users WHERE username=${username}`;
  const { rows: users } = await pool.query(query);

  // If no users found, send error message
  if (users.length !== 1) {
    return res.status(401).json({ error: "Invalid login credentials" });
  }

  const user = users[0];

  // Use bcrypt to compare inputted password to the one in database
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (isPasswordValid) {
    // Password is valid
    const token = jwt.sign(
      { user_id: user.user_id },
      process.env.JWT_SECRET_KEY
    );

    return res.json({
      message: "Successfully logged in",
      token,
    });
  }

  // Password is false
  return res.status(403).json({ error: "Invalid login credentials" });
});

router.put("/edit", authorize, async (req, res) => {
  const { userId, firstname, lastname, email, password, username } = req.body;

  // Sanitize user inputs
  const sanitizedFirstName = sanitize(firstname);
  const sanitizedLastName = sanitize(lastname);
  const sanitizedEmail = sanitize(email);
  const sanitizedPassword = sanitize(password);
  const sanitizedUsername = sanitize(username);

  // Update only non-empty fields
  const columnsToUpdate = [];
  const valuesToUpdate = [];

  if (sanitizedFirstName) {
    columnsToUpdate.push("firstname");
    valuesToUpdate.push(sanitizedFirstName);
  }
  if (sanitizedLastName) {
    columnsToUpdate.push("lastname");
    valuesToUpdate.push(sanitizedLastName);
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

  // Build the SQL query dynamically
  let query = "UPDATE users SET ";
  for (let i = 0; i < columnsToUpdate.length; i++) {
    query += `${columnsToUpdate[i]} = $${i + 1}`;
    if (i < columnsToUpdate.length - 1) {
      query += ", ";
    }
  }
  query += ` WHERE id = $${columnsToUpdate.length + 1}`;

  // Add the userId as the last parameter in the values array
  valuesToUpdate.push(userId);

  // Execute the SQL query using the connection pool
  try {
    await pool.query(query, valuesToUpdate);
    res.status(204).json({ message: "User updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
