const express = require('express');
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT;
const localhost = process.env.HOST;
const authRouter = require('./src/routes/authRoutes');
const userRouter = require('./src/routes/userRoutes');
const productRouter = require('./src/routes/productRoutes');
const campsiteRouter = require('./src/routes/campsiteRoutes');
const orderRouter = require('./src/routes/orderRoutes');
const Dashboard = require('./src/routes/adminDashBoardRoutes');
const campsiteOwnerRouter = require('./src/routes/campsiteOwner');
const uploadRoutes = require('./src/routes/uploadRoutes');

// Admin routes
const adminUserRouter = require('./src/routes/adminUserRoutes');
const adminProductRouter = require('./src/routes/adminProductRoutes');
const adminCategoryRouter = require('./src/routes/adminCategoryRoutes');
const adminOrderRouter = require('./src/routes/adminOrderRoutes');
const adminCampsiteRouter = require('./src/routes/adminCampsiteRoutes');

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
app.use(productRouter);
app.use(orderRouter);
app.use(campsiteRouter);
app.use(Dashboard);
app.use(campsiteOwnerRouter);
app.use('/api', uploadRoutes);

// Admin routes
app.use(adminUserRouter);
app.use(adminProductRouter);
app.use(adminCategoryRouter);
app.use(adminOrderRouter);
app.use(adminCampsiteRouter);

app.listen(port, localhost, () => {
    console.log(`Server listening at http://${localhost}:${port}`);
});
