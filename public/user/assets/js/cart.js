document.addEventListener("DOMContentLoaded", function () {
    // Select all plus and minus buttons
    const qtyButtons = document.querySelectorAll(".qty-btn");
    const cartTotalElem = document.getElementById("cart-total");
  
    // Function to update the total cart price in the UI
    function updateCartTotal() {
      let total = 0;
      document.querySelectorAll(".subtotal-price").forEach(function (subtotalEl) {
        total += parseFloat(subtotalEl.textContent);
      });
      if (cartTotalElem) {
        cartTotalElem.textContent = total.toFixed(2);
      }
    }
  
    // Attach click events to each quantity button
    qtyButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        // Get the closest row
        const row = button.closest("tr");
        // Retrieve the input field that holds the quantity
        const qtyInput = row.querySelector(".qty-input");
        let quantity = parseInt(qtyInput.value);
        // Get the price from the data attribute
        const price = parseFloat(qtyInput.getAttribute("data-price"));
        // Get the productId from the data attribute
        const productId = qtyInput.getAttribute("data-product-id");
  
        // Determine whether to increment or decrement the quantity
        if (button.classList.contains("plus")) {
          quantity++;
        } else if (button.classList.contains("minus") && quantity > 1) {
          quantity--;
        }
  
        // Update the input field with the new quantity
        qtyInput.value = quantity;
  
        // Update the subtotal displayed for this product
        const subtotalElem = row.querySelector(".subtotal-price");
        subtotalElem.textContent = (quantity * price).toFixed(2);
  
        // Update the overall cart total
        updateCartTotal();
  
        // Send an AJAX request to update the quantity in the database
        fetch("/cart/update", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ productId: productId, quantity: quantity }),
        })
          .then(function (response) {
            return response.json();
          })
          .then(function (data) {
            if (data.success) {
              console.log("Cart updated successfully.");
            } else {
              console.error("Error updating cart:", data.error);
            }
          })
          .catch(function (error) {
            console.error("Fetch error:", error);
          });
      });
    });
  
    // Initial total calculation
    updateCartTotal();
  });
  