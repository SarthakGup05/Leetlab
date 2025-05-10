import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes.js';
import problemRoutes from './routes/problem.routes.js';
import submissionRoutes from './routes/submmision.routes.js';
import executionRoute from './routes/executeCode.route.js';
import playlistRoutes from './routes/Playlist.route.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('welcome to code lab 🔥');
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/problems', problemRoutes);
app.use("/api/v1/submission" , submissionRoutes);
app.use("/api/v1/execute-code" , executionRoute)
app.use("/api/v1/playlist" , playlistRoutes)

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});


