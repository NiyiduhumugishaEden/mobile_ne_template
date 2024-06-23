const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'API Documentation',
    description: 'Mobile NE API documentation',
  },
  host: 'localhost:5000',
  schemes: ['http'],
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./src/routes/usersRoutes.ts']; // Adjust the path to your route files

swaggerAutogen(outputFile, endpointsFiles, doc);
