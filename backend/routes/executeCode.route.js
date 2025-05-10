import express from "express";
import { executeCode } from "../controllers/executeCode.controllers.js";
import { authMiddleware } from "../Middleware/middleware.js";

const executionRoute = express.Router();

executionRoute.post("/" , authMiddleware , executeCode);

export default executionRoute;