import createError from 'http-errors';
import express, { ErrorRequestHandler, RequestHandler } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import logger from 'morgan';
import swaggerUi from 'swagger-ui-express';

import indexRouter from './routes/index';
import usersRouter from './routes/users';
import rolesRouter from './routes/roles';
import permissionsRouter from './routes/permissions';
import authRouter from './routes/auth';
import dashboardRouter from './routes/dashboard';
import studentsRouter from './routes/students';
import activityLogsRouter from './routes/activityLogs';
import settingsRouter from './routes/settings';
import { swaggerSpec } from './config/swagger';
import { env } from './config/env';

const app = express();

app.use(logger('dev'));
app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/roles', rolesRouter);
app.use('/permissions', permissionsRouter);
app.use('/auth', authRouter);
app.use('/dashboard', dashboardRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/students', studentsRouter);
app.use('/api/students', studentsRouter);
app.use('/activity-logs', activityLogsRouter);
app.use('/api/activity-logs', activityLogsRouter);
app.use('/settings', settingsRouter);
app.use('/api/settings', settingsRouter);

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