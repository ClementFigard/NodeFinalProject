import express from "express";
import bodyParser from "body-parser";
import { v4 as uuidv4 } from "uuid";
import cors from "cors";
import { Pool } from "pg";

import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import { Todo } from "./types";

const app = express();
const PORT = 8000;

const pool = new Pool({
  user: "avnadmin",
  host: "pg-todo-oissa24.g.aivencloud.com",
  database: "defaultdb",
  password: "AVNS_CoBTps1vQXmpWRJHA2U",
  port: 26398,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.query(`CREATE TABLE IF NOT EXISTS todos (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)`);

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Todo API",
      version: "1.0.0",
      description: "A simple Todo API",
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
      },
    ],
  },
  apis: ["src/app.ts"],
};

app.use(cors());

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(bodyParser.json());

app.get("/todos", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM todos ORDER BY created_at DESC"
    );
    res.status(200).json(
      result.rows.map((todo) => {
        return {
          ...todo,
          createdAt: todo.created_at,
          updatedAt: todo.updated_at,
        };
      })
    );
  } catch (error) {
    console.error("Error fetching todos:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/todos/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM todos WHERE id = $1", [id]);
    if (result.rows.length) {
      res.status(200).json({
        ...result.rows[0],
        createdAt: result.rows[0].created_at,
        updatedAt: result.rows[0].updated_at,
      });
    } else {
      res.status(404).send("Todo not found");
    }
  } catch (error) {
    console.error("Error fetching todo:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/todos", async (req, res) => {
  const { title, description, status } = req.body;
  const id = uuidv4();
  try {
    const result = await pool.query(
      `INSERT INTO todos (id, title, description, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [id, title, description, status || "pending", new Date(), new Date()]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating todo:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.put("/todos/:id", async (req, res) => {
  const { id } = req.params;
  const { title, description, status } = req.body;
  try {
    const result = await pool.query(
      `UPDATE todos 
       SET title = $1, description = $2, status = $3, updated_at = NOW()
       WHERE id = $4 RETURNING *`,
      [title, description, status, id]
    );
    if (result.rows.length) {
      res.status(200).json(result.rows[0]);
    } else {
      res.status(404).send("Todo not found");
    }
  } catch (error) {
    console.error("Error updating todo:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.delete("/todos/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM todos WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length) {
      res.status(200).send("Todo deleted");
    } else {
      res.status(404).send("Todo not found");
    }
  } catch (error) {
    console.error("Error deleting todo:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Todo:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - status
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the todo
 *         title:
 *           type: string
 *           description: The title of the todo
 *         description:
 *           type: string
 *           description: The detailed description of the todo
 *         status:
 *           type: string
 *           description: The current status of the todo (e.g., pending, completed)
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The creation timestamp of the todo
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The last update timestamp of the todo
 *       example:
 *         id: d5fE_asz
 *         title: Write documentation
 *         description: Complete the Swagger API documentation for the project
 *         status: pending
 *         createdAt: 2024-12-01T10:00:00Z
 *         updatedAt: 2024-12-05T15:30:00Z
 */

/**
 * @swagger
 * /todos:
 *   get:
 *     summary: Returns a list of todos
 *     responses:
 *       200:
 *         description: A list of todos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Todo'
 */

/**
 * @swagger
 * /todos/{id}:
 *   get:
 *     summary: Get the todo by id
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The id of the todo
 *     responses:
 *       200:
 *         description: The todo description by id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 *       404:
 *         description: The todo was not found
 */

/**
 * @swagger
 * /todos:
 *   post:
 *     summary: Create a new todo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Todo'
 *     responses:
 *       201:
 *         description: Todo created
 */

/**
 * @swagger
 * /todos/{id}:
 *   put:
 *     summary: Update a todo by id
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The id of the todo to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Todo'
 *     responses:
 *       200:
 *         description: Todo updated
 *       404:
 *         description: The todo was not found
 */

/**
 * @swagger
 * /todos/{id}:
 *   delete:
 *     summary: Deletes a todo
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The id of the todo to delete
 *     responses:
 *       200:
 *         description: Todo deleted
 *       404:
 *         description: The todo was not found
 */
