require("dotenv").config();
const express = require("express");
const connectDB = require("./config/database");
const seedDatabase = require("./utils/seedDatabase");
const reservationsRouter = require("./routes/reservations");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
app.use("/reservations", reservationsRouter);

// Health check route
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

const startServer = async () => {
  try {
    await connectDB();

    await seedDatabase();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
