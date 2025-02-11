document.addEventListener("DOMContentLoaded", function () {
    const qtyButtons = document.querySelectorAll(".qty-btn");
    const cartTotalElement = document.getElementById("cart-total");

    function updateCartTotal() {
        let total = 0;
        document.querySelectorAll(".product-subtotal .amount span").forEach(priceElement => {
            total += parseFloat(priceElement.textContent) || 0; // Ensure valid number
        });
        cartTotalElement.textContent = total.toFixed(2);
    }

    qtyButtons.forEach(button => {
        button.addEventListener("click", function (event) {
            event.preventDefault(); // Prevent page refresh

            let inputField = this.parentElement.querySelector(".qty-input");
            let subtotalElement = this.closest("tr").querySelector(".product-subtotal .amount span");
            let unitPrice = parseFloat(inputField.dataset.price);
            let quantity = parseInt(inputField.value);

            if (this.classList.contains("plus")) {
                quantity++;
            } else if (this.classList.contains("minus") && quantity > 1) {
                quantity--;
            }

            inputField.value = quantity;
            subtotalElement.textContent = (unitPrice * quantity).toFixed(2); // Update product total

            updateCartTotal(); // Update cart total
        });
    });

    updateCartTotal(); // Ensure total is correct when the page loads
});
