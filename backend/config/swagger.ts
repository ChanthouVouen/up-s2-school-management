import path from 'path';
import swaggerJSDoc from 'swagger-jsdoc';
import { env } from './env';

const swaggerOptions: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'School Management API',
      version: '1.0.0',
      description: 'REST API for the School Management system',
    },
    servers: [
      {
        url: `http://localhost:${env.port}`,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  // App runs compiled from dist/, so __dirname points at dist/config here — scan the compiled route files.
  // swagger-jsdoc's glob matcher needs forward slashes even on Windows, so path.join's
  // backslashes have to be normalized or the pattern silently matches nothing.
  apis: [path.join(__dirname, '..', 'routes', '*.js').split(path.sep).join('/')],
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);
