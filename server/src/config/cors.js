import cors from "cors"
import {env} from "./env.js"

export const corsOptions = {
    origin: env.CLIENT_URL,
    credentials:true
}