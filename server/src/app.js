import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import { apiLimiter } from "./middlewares/rateLimiter.middleware.js";
import cors from "cors";
import { corsOptions } from "./config/cors.js";
import cookieParser from "cookie-parser";
import { notFound } from "./middlewares/notFound.middleware.js";
import { errorHandler } from "./middlewares/error.middleware.js";

import routes from "./routes/index.js";

const app = express();
app.use(helmet());
app.use(morgan("dev"));
app.use(compression());
app.use(apiLimiter);
app.use(cors(corsOptions));
app.use(
  express.json({
    limit: "10kb",
  }),
);
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({
    message: "API Running",
  });
});

// Routes will come here
app.use("/api/v1", routes);

// 404 middleware
app.use(notFound);

// Global Error middleware
app.use(errorHandler);

export default app;
