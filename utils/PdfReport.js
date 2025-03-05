
import PDFDocument from "pdfkit";

export const generateInvoicePDF = (order, res) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
  
    // **Set Response Headers**
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="order_${order._id}.pdf"`);
  
    doc.pipe(res); // Stream PDF directly to browser
  
    // **1. Add Logo & Title**
    // const logoPath = path.resolve("public", "logo.png"); // Adjust path
    // doc.image(logoPath, 50, 30, { width: 100 });
    doc.fontSize(20).text("PACK POINT - Order Invoice", 200, 50, { align: "center", bold: true });
    doc.moveTo(50, 80).lineTo(550, 80).stroke();
  
    doc.moveDown();


    // **2. Order Summary (Table Format)**
    doc.fontSize(14).text("Order Summary", 50, doc.y, { bold: true });
    doc.moveDown();
  
    doc.fontSize(12).text(`Order ID: ${order._id}`, 50, doc.y);
    doc.moveDown(); // Moves to the next line
  
    doc.text(`Date: ${new Date(order.createdAt).toDateString()}`, 50, doc.y);
    doc.moveDown(); // Moves to the next line
  
    doc.text(`Payment Status: ${order.paymentStatus}`, 50, doc.y);
    doc.moveDown(); // Moves to the next line
  
    doc.text(`Total Amount: ${order.total}`, 50, doc.y);
    doc.moveDown(); // Moves to the next line
  
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    
    // **3. Ordered Items Table**
    doc.fontSize(14).text("Ordered Items", 50, doc.y, { bold: true });
    doc.moveDown();
  
    // Table Headers (Ensuring they are aligned properly in a row)
    const startY = doc.y;
    doc.fontSize(12)
      .text("Product Name", 50, startY, { bold: true })
      .text("Qty", 250, startY, { bold: true })
      .text("Unit Price", 350, startY, { bold: true })
      .text("Subtotal", 450, startY, { bold: true });
  
    doc.moveTo(50, doc.y + 5).lineTo(550, doc.y + 5).stroke();
    doc.moveDown();
  
    // List Products in Table (Ensuring each row is properly aligned)
    order.products.forEach(product => {
      const itemY = doc.y; // Store current Y position
  
      doc.fontSize(12)
        .text(product.name, 50, itemY)       // Product Name
        .text(`${product.quantity}`, 250, itemY)  // Quantity
        .text(`${product.price}`, 350, itemY) // Unit Price
        .text(`${product.price * product.quantity}`, 450, itemY); // Subtotal
  
      doc.moveDown(); // Move to the next row
    });
  
    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke(); // Separator Line
    doc.moveDown();
  
    // **4. Shipping Address (Row Format)**
    doc.fontSize(14).text("Shipping Address", 50, doc.y, { bold: true });
    doc.moveDown();
  
    // Correctly formatting shipping details
    doc.fontSize(12).text(`${order.firstName} ${order.lastName}`, 50, doc.y);
    doc.text(`${order.address}`, 50, doc.y + 15);
    doc.text(`${order.country}, ${order.postcode}`, 50, doc.y + 30);
    doc.text(`Contact No: ${order.phone}`, 50, doc.y + 45);
  
    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();
  
    // **5. Footer (Thank You Note & Support Info)**
    doc.fontSize(14).text("Thank you for your order!", 50, doc.y, { bold: true });
    doc.fontSize(12).text("For any support, contact us at PackPoint@mail.com", 50, doc.y + 20);
  
    doc.end(); // Close PDF
  };
  
  