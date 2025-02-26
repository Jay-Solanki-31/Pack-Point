
import { Contact  } from "../models/contact.model.js";
const getconatct  = async (req, res) => {
    try {
        const  contact = await Contact.find();        
        res.render("user/contact", { contact });
    } catch (error) {
        console.error("Error fetching contact:", error);
        res.redirect("/admin/contact");
    }
};
// add data to conatct
const Addcontact = async (req, res) => {
    try {
    
         const  {name,email,subject,message} = req.body
         console.log(req.body);

        const data = await Contact.create({
            name,
            email,
            subject,
            message
        })
        if(!data){
        req.session.toastMessage = { type: "success", text: "error while contact" };
        }
        req.session.toastMessage = { type: "success", text: "We Contact You Shortly..." };
        res.redirect('/contact')

    } catch (error) {
        console.error("Error adding to wishlist:", error);
        res.redirect("/contact");
    }
};



export  { getconatct, Addcontact };
