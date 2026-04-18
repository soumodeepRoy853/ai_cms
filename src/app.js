import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";
import session from "express-session";
import MongoStore from "connect-mongo";
import path from "path";
import DbConnect from "./config/connectDB.js";
import userRoute from "./routes/userRoute.js";
import contentRoute from "./routes/contentRoute.js";
import aiRoute from "./routes/aiRoute.js";
import mediaRoute from "./routes/mediaRoute.js";
import categoryRoute from "./routes/categoryRoute.js";
import tagRoute from "./routes/tagRoute.js";
import reviewRoute from "./routes/reviewRoute.js";
import publicRoute from "./routes/publicRoute.js";
import auditRoute from "./routes/auditRoute.js";
import notificationRoute from "./routes/notificationRoute.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

dotenv.config();
DbConnect();

const app = express();

//Middleware
app.use(cors());
app.use(helmet());
app.use(compression());

//Rate limiting
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_REQUESTS || 100)
});

app.use("/api/", limiter);

//Body parsing
app.use(express.json({ limit: process.env.UPLOAD_LIMIT || "10mb" }));
app.use(express.urlencoded({ extended: true, limit: process.env.UPLOAD_LIMIT || "10mb" }));

//Sessions
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}
app.use(session({
  secret: process.env.SESSION_SECRET || "change-me",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: "sessions"
  }),
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: Number(process.env.SESSION_MAX_AGE || 7 * 24 * 60 * 60 * 1000)
  }
}));

//Logging
app.use(morgan("dev"));

//Routes
app.get('/', (req, res) => {
  res.send('AI Content CMS API is running');
});

//Static uploads
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/api/auth", userRoute);
app.use("/api/users", userRoute);
app.use("/api/content", contentRoute);
app.use("/api/ai", aiRoute);
app.use("/api/media", mediaRoute);
app.use("/api/categories", categoryRoute);
app.use("/api/tags", tagRoute);
app.use("/api/reviews", reviewRoute);
app.use("/api/public", publicRoute);
app.use("/api", auditRoute);
app.use("/api/notifications", notificationRoute);

app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;

