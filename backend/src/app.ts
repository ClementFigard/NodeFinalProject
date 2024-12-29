import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { v4 as uuidv4 } from "uuid";
import cors from "cors";
import { Pool } from "pg";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import { Todo } from "./types";

dotenv.config({ path: '../process.env' }); // Charger les variables d'environnement

const app = express();
const PORT: number = parseInt(process.env.PORT || "8000");

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || "5432"),
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

app.get("/todos", async (req: Request, res: Response) => {
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

app.get("/todos/:id", async (req: Request, res: Response) => {
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

app.post("/todos", async (req: Request, res: Response) => {
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

app.put("/todos/:id", async (req: Request, res: Response) => {
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

app.delete("/todos/:id", async (req: Request, res: Response) => {
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