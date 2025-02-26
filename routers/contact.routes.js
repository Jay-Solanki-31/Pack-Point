
import express from "express";
import { Addcontact } from "../controllers/contact.controller.js";
const router = express.Router();


router.get("/", (req, res) => {
    res.render("user/contact");
});

router.post('/addcontact',Addcontact)

export default  router;
