require('dotenv').config();
import express = require("express");
import cors = require("cors");
import bodyParser = require("body-parser");
import cookieParser = require("cookie-parser");
import morgan = require("morgan");
import userRouter from "./routes/usersRouter";
import isAuthenticated from "./middlewares/auth";
import productsRouter from "./routes/productsRouter";
import { PrismaClient } from '@prisma/client';
import swaggerJsdoc = require('swagger-jsdoc');
import swaggerUi = require('swagger-ui-express');

const PORT = process.env.PORT || 8000;
const prisma = new PrismaClient();

const app = express();

// Use Morgan for logging
app.use(morgan('combined'));

app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());

app.use((req, res, next) => {
    const origin = req.headers.origin || "*";
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization");
    next();
});

app.use((req, res, next) => {
    console.log(req.originalUrl, "\t", req.method, "\t", req.url);
    next();
});

const swaggerOptions = {
    swaggerDefinition: {
        info: {
            title: 'API Documentation',
            description: 'API Documentation',
            contact: {
                name: 'Niyiduhumugisha Eden'
            },
            servers: ["http://localhost:8000"]
        },
        securityDefinitions: {
            Bearer: {
                type: 'apiKey',
                name: 'Authorization',
                scheme: 'bearer',
                in: 'header',
            },
        },
        security: [
            {
                Bearer: []
            }
        ]
    },
    apis: ["./src/routes/*.ts"]
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use("/users", userRouter);
app.use("/products", isAuthenticated, productsRouter);
app.get("/", (req, res) => {
    res.send("Hello world");
});

const startServer = async () => {
    try {
        await prisma.$connect();
        console.log('Connected to the database');
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to connect to the database', error);
        process.exit(1); // Exit the process with an error code
    }
};

startServer();
