// index.js
import express from "express";
import sequelize, { connectDB } from "./db.js";

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.send("Hello World! Node app is running with Sequelize (ESM).");
});

app.get("/dashboard", (req, res) => {
  res.send("This is the dashboard.");
});

// Start server after DB connection
const startServer = async () => {
  await connectDB();

  // Optional: sync models later
  // await sequelize.sync();

  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
};

startServer();
