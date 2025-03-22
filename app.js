const express = require('express');
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT;
const localhost = process.env.HOST;
const authRouter = require('./src/routes/authRoutes');
const userRouter = require('./src/routes/userRoutes');
const app = express();
const cookieParser = require('cookie-parser');
const connectDB = require('./src/Config/connectdb');

app.use(cors({
    credentials: true,
}));

//CRUD
app.use(express.json());
app.use(cookieParser());

connectDB();

// Routes
app.use(authRouter);
app.use(userRouter);

app.listen(port, localhost, () => {
    console.log(`Server listening at http://${localhost}:${port}`);
});