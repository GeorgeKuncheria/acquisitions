import authRouter from '#routes/auth.routes.js';
import userRouter from '#routes/users.routes.js';

const initializeRoutes = app => {
  app.use('/api/auth', authRouter);
  app.use('/api/users', userRouter);
};

export default initializeRoutes;
