
import express from "express";
import { Addcontact, getconatct  } from "../controllers/contact.controller.js";
const router = express.Router();


router.get("/", (req, res) => {
    res.render("user/contact");
});


router.get('/contact', getconatct)
router.post('/addcontact',Addcontact)

export default  router;
