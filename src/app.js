import express from 'express';
import logger from '#config/logger.js';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import {securityMiddleware } from '#middleware/security.middleware.js';


import initializeRoutes from '#routes/index.js';


const app = express();

app.use(helmet());
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// HTTP request logger middleware
app.use(morgan('combined', {stream: {write: (message) => logger.info(message.trim())}}));

app.use(securityMiddleware);


app.get('/', (req, res) => {
  logger.info('Hello from Aquisitions API!');
  res.status(200).send('Hello from Aquisitions API!');
});


app.get('/health', (req, res) => {
  res.status(200).json({status:'OK', timeStamp: new Date().toISOString(), uptime: process.uptime()});
});

app.get('/api', (req, res) => {
  res.status(200).json({message:'Acquisitions API is running!'});
});


initializeRoutes(app);


app.use((req,res)=>{
  res.status(404).json({error:'Route not found'});
})

export default app;
