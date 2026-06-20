function formatEUR(value) {
  return "EUR " + value.toFixed(2);
}

function recalculateCart() {
  var items = document.querySelectorAll(".cart-item");
  var subtotal = 0;

  items.forEach(function (item) {
    var price = Number(item.getAttribute("data-price")) || 0;
    var qtyInput = item.querySelector(".qty-input");
    var qty = Number(qtyInput.value);

    if (!Number.isFinite(qty) || qty < 1) {
      qty = 1;
      qtyInput.value = "1";
    }

    var lineTotal = price * qty;
    subtotal += lineTotal;

    var lineTotalEl = item.querySelector(".cart-line-total");
    if (lineTotalEl) {
      lineTotalEl.textContent = formatEUR(lineTotal);
    }
  });

  var taxes = subtotal * 0.21;
  var total = subtotal + taxes;

  document.getElementById("subtotal").textContent = formatEUR(subtotal);
  document.getElementById("taxes").textContent = formatEUR(taxes);
  document.getElementById("total").textContent = formatEUR(total);
}

document.addEventListener("DOMContentLoaded", function () {
  var qtyInputs = document.querySelectorAll(".qty-input");

  qtyInputs.forEach(function (input) {
    input.addEventListener("input", recalculateCart);
  });

  recalculateCart();
});