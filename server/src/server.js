import app from "./app.js";
import { connectDB } from "./config/db.js";
import mongoose from "mongoose";
import { env } from "./config/env.js";

const startServer = async () => {
  await connectDB();

  app.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
  });
};

process.on("SIGINT", async () => {
  await mongoose.connection.close();

  console.log("MongoDB Connection Closed");

  process.exit(0);
});

startServer();
