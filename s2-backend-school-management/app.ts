import createError from 'http-errors';
import express, { ErrorRequestHandler, RequestHandler } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import logger from 'morgan';
import swaggerUi from 'swagger-ui-express';

import indexRouter from './routes/index';
import usersRouter from './routes/users';
import authRouter from './routes/auth';
import { swaggerSpec } from './config/swagger';
import { env } from './config/env';

const app = express();

app.use(logger('dev'));
app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const notFoundHandler: RequestHandler = (_req, _res, next) => {
  next(createError(404));
};

app.use(notFoundHandler);

const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Internal Server Error',
    ...(req.app.get('env') === 'development' ? { stack: err.stack } : {}),
  });
};

app.use(errorHandler);

export default app;