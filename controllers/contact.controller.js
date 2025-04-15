
import { Contact  } from "../models/contact.model.js";
const getconatct  = async (req, res) => {
    try {
        const  contact = await Contact.find();        
        res.render("admin/contact-list", { contact });
    } catch (error) {
        console.error("Error fetching contact:", error);
        req.session.toastMessage = { type: "error", text: "Error fetching contact" };
        res.redirect("/contact");

    }
};
// add data to conatct
const Addcontact = async (req, res) => {
    try {
    
         const  {name,email,subject,message,Phone} = req.body
        //  console.log(req.body);

        if (!name || !email || !subject || !message || !Phone) {
            req.session.toastMessage = { type: "error", text: "All Fields Require" };
            return res.redirect("/contact");
        }
        const data = await Contact.create({
            name ,
            email,
            Phone,
            subject,
            message,
        });
        // console.log('stored data' , data)
        if(!data){
        req.session.toastMessage = { type: "success", text: "error while contact" };
        }
        req.session.toastMessage = { type: "success", text: "We Contact You Shortly..." };
        res.redirect('/contact')

    } catch (error) {
        console.error("Error adding to wishlist:", error);
        req.session.toastMessage = { type: "error", text: "Error adding to wishlist" };
        res.redirect("/contact");
    }
};



export  { getconatct, Addcontact };
