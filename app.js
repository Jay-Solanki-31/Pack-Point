import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import flash from 'connect-flash';
import session from 'express-session';

import userRouter from './routers/user.routes.js';
import authRouter from './routers/auth.routes.js';
import productRouter from './routers/product.routes.js'; 
import adminRouter from './routers/admin.routes.js';
import wishlistRoutes from './routers/whishList.routes.js'
import cartRoutes from './routers/cart.routes.js';
import { getProducts } from "./controllers/user.controller.js"; 
import { verifyJWT } from './middleware/auth.middleware.js';

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());
app.use(flash());
app.use(verifyJWT)
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(express.static("public/admin/assets"));
app.use(express.static("public/user"));


app.set("view engine", "ejs");
app.set("views", "./views");

app.get("/", getProducts); 
app.use("/user", userRouter);        
app.use("/auth", authRouter);        
app.use("/admin", adminRouter);      
app.use("/product", productRouter);    
app.use("/wishlist", wishlistRoutes);
app.use("/cart", cartRoutes);



app.use((req, res) => {
    res.status(404).send({ success: false, message: "Route not found" });
});

export { app };
