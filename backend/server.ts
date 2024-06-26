import bodyParser from "body-parser";
import express from 'express';
import mysql from 'mysql';
import { DB } from "./routes/modules/db";
// import Database from "./routes/modules/database";

import { router as userRouter } from './routes/users';
import { router as itemRouter } from './routes/items';
import { router as indexRouter } from './routes/index';
import { router as orderRouter } from './routes/orders';
import { router as savedFoldersRouter } from './routes/savedFolders';
import { router as savedItemsRouter } from './routes/savedItems';
import { router as paymentRouter } from './routes/payment';
import { router as profileRouter } from './routes/profile';
import { router as savedPaymentMethodRouter } from './routes/savedPayment';

export const app = express();

const PORT = process.env.PORT || 3000;

var cors = require('cors');
var corsOptions = { origin: "http://localhost:3000/", methods: ["POST, GET, DELETE"], credentials: true };


app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

DB.makeConnection();

// use routes
app.use('/', indexRouter);
app.use("/user", userRouter);
app.use("/items", itemRouter);
app.use("/order", orderRouter);
app.use("/savedFolders", savedFoldersRouter);
app.use("/savedItems", savedItemsRouter);
app.use("/profile", profileRouter);
app.use("/payment", paymentRouter);
app.use("/savedPaymentMethod", savedPaymentMethodRouter);


app.listen(3000, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app;
// TODO

// Insert new listing or item user is selling
// Insert new saved item for user