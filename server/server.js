import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { clerkMiddleware, requireAuth } from '@clerk/express'
import aiRouter from './routes/aiRoutes.js';
import connectCloudinary from './configs/cloudinary.js';
import userRouter from './routes/userRoutes.js';
import path from 'path';

const app= express();

await connectCloudinary()

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use(cors());
app.use(express.json());
app.use(clerkMiddleware())

app.get("/",(req,res)=>{
    res.send("hello");
})

app.use(requireAuth())
app.use('/api/ai',aiRouter)
app.use('/api/user',userRouter)

const Port= 3000;

app.listen(Port,()=>{
    console.log(`running on ${Port}`);
})