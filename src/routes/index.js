import authRouter from '#routes/auth.routes.js';

const  initializeRoutes = (app) => {
  app.use('/api/auth', authRouter);
};

export default initializeRoutes;