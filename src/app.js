import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import DbConnect from './config/connectDB.js';

dotenv.config();
DbConnect();

const app = express();

//Middleware
app.use(cors());
app.use(helmet());
app.use(compression());

//Rate limiting
const limiter = rateLimit({
    windowMs: process.env.RATE_LIMIT_WINDOW * 60 * 1000,
    max: process.env.RATE_LIMIT_REQUESTS
});

app.use("/api/", limiter);

//Body parsing
app.use(express.json({limit: process.env.UPLOAD_LIMIT}));
app.use(express.urlencoded({extended:true, limit: process.env.UPLOAD_LIMIT}));

//Logging
app.use(morgan("combined"));

//Routes
app.get('/', (req, res) => {
  res.send('AI Content CMS API is running');
});

// Start server
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;

