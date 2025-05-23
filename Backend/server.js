```typescript
import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import connectDB from "./Database/ConnectDB.js";
import encodeRouter from './Routes/encrypt.js';
import examRouter from './Routes/Exams.routes.js';
import userRouter from './Routes/users.js';
import studentRouter from './Routes/Student.routes.js';

// Load environment variables from .env file
dotenv.config();

const app: Express = express();
const port: number = Number(process.env.PORT) || 5000; // Use a more descriptive variable name and type, also convert to Number

// Middleware to parse JSON request bodies
app.use(express.json());

// Middleware to parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// Define a simple route for the root path
app.get("/", (req: Request, res: Response) => {
    res.send("Hello World!");
});

// Mount the routers for different resources
app.use('/exams', examRouter); // Use plural for route names
app.use('/users', userRouter); // Use plural for route names
app.use('/students', studentRouter); // Use plural for route names
app.use('/encode', encodeRouter);

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    connectDB(); // Connect to the database when the server starts
});
```