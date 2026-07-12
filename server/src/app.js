import express from "express"
import helmet from "helmet"
import morgan from "morgan"
import compression from "compression"
import { apiLimiter } from "./middlewares/rateLimiter.middleware.js";
import cors from "cors"
import { corsOptions } from "./config/cors.js";
import cookieParser from "cookie-parser"

const app = express();
app.use(helmet())
app.use(morgan("dev"))
app.use(compression())
app.use(apiLimiter)
app.use(cors(corsOptions))
app.use(express.json({
    limit:"10kb"
}))
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser())


// Routes will come here

// 404 middleware

// Global Error middleware



app.get("/", (req , res)=>{
    res.json({
        message:"API Running"
    })
})

export default app;