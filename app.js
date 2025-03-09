const express = require('express');
const cors = require('cors');
require('dotenv').config();
const routes = require('./src/routes');
const port = process.env.POST || 5000;
const localhost = process.env.HOST;
const app = express();
const connectDB = require('./src/Config/connectdb');

app.use(cors({
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

//CRUD
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

app.use('/api', routes);

app.listen(port, localhost, () => {
    console.log(`Server listening at http://${localhost}:${port}`);
});