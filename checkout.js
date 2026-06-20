const form = document.getElementById("checkoutForm");
const steps = Array.from(document.querySelectorAll(".form-step"));
const stepperItems = Array.from(document.querySelectorAll(".step"));
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const submitBtn = document.getElementById("submitBtn");
const stepError = document.getElementById("stepError");
const successMessage = document.getElementById("successMessage");

const summaryProduct = document.getElementById("summaryProduct");
const summaryCode = document.getElementById("summaryCode");
const summarySize = document.getElementById("summarySize");
const summaryColor = document.getElementById("summaryColor");
const summaryQty = document.getElementById("summaryQty");
const summaryTotal = document.getElementById("summaryTotal");

const cardNumberInput = form.elements.cardNumber;
const expiryInput = form.elements.expiry;
const cvvInput = form.elements.cvv;

const CART_STORAGE_KEY = "store_cart_state";
const CHECKOUT_STORAGE_KEY = "checkout_form_data";

let currentStep = 1;

function updateView() {
  steps.forEach((step) => {
    const isActive = Number(step.dataset.step) === currentStep;
    step.classList.toggle("active", isActive);
  });

  stepperItems.forEach((step) => {
    const stepNumber = Number(step.dataset.step);
    step.classList.toggle("active", stepNumber === currentStep);
  });

  prevBtn.disabled = currentStep === 1;
  nextBtn.classList.toggle("hidden", currentStep === 3);
  submitBtn.classList.toggle("hidden", currentStep !== 3);
  stepError.textContent = "";
}

function formatPrice(value, currency) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD"
  }).format(value);
}

function loadOrderSummary() {
  const raw = localStorage.getItem(CART_STORAGE_KEY);
  if (!raw) {
    return;
  }

  try {
    const cart = JSON.parse(raw);
    const quantity = Number.isFinite(cart.count) ? cart.count : 0;
    const unitPrice = Number(cart?.product?.price || 0);
    const currency = cart?.product?.currency || "USD";

    summaryProduct.textContent = cart?.product?.name || "Producto sin nombre";
    summaryCode.textContent = cart?.product?.code || "-";
    summarySize.textContent = cart?.selection?.size || "-";
    summaryColor.textContent = cart?.selection?.color || "-";
    summaryQty.textContent = String(quantity);
    summaryTotal.textContent = formatPrice(quantity * unitPrice, currency);
  } catch (error) {
    console.error("No se pudo cargar el resumen del pedido.", error);
  }
}

function getPersistentFormData() {
  const fields = [
    "firstName",
    "lastName",
    "email",
    "phone",
    "address",
    "city",
    "region",
    "postalCode",
    "country",
    "deliveryRef"
  ];

  return fields.reduce((acc, field) => {
    acc[field] = form.elements[field].value.trim();
    return acc;
  }, {});
}

function saveFormData() {
  const payload = getPersistentFormData();
  localStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(payload));
}

function loadFormData() {
  const raw = localStorage.getItem(CHECKOUT_STORAGE_KEY);
  if (!raw) {
    return;
  }

  try {
    const data = JSON.parse(raw);
    Object.keys(data).forEach((key) => {
      if (form.elements[key] && typeof data[key] === "string") {
        form.elements[key].value = data[key];
      }
    });
  } catch (error) {
    console.error("No se pudo restaurar el formulario.", error);
  }
}

function setupFormPersistence() {
  const trackedInputs = [
    "firstName",
    "lastName",
    "email",
    "phone",
    "address",
    "city",
    "region",
    "postalCode",
    "country",
    "deliveryRef"
  ];

  trackedInputs.forEach((name) => {
    form.elements[name].addEventListener("input", saveFormData);
  });
}

function processSandboxPayment() {
  return new Promise((resolve) => {
    const transactionId = `SBX-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    setTimeout(() => {
      resolve({ transactionId, approved: true });
    }, 1300);
  });
}

function getInputsForStep(stepNumber) {
  const activeSection = form.querySelector(`.form-step[data-step=\"${stepNumber}\"]`);
  return activeSection ? Array.from(activeSection.querySelectorAll("input")) : [];
}

function isStepValid(stepNumber) {
  const inputs = getInputsForStep(stepNumber);

  for (const input of inputs) {
    if (input.required && !input.value.trim()) {
      input.focus();
      stepError.textContent = "Completa todos los campos obligatorios de este paso.";
      return false;
    }
    if (!input.checkValidity()) {
      input.focus();
      stepError.textContent = "Revisa el formato de los datos ingresados.";
      return false;
    }
  }

  if (stepNumber === 3) {
    const cleanCard = cardNumberInput.value.replace(/\s+/g, "");
    if (!/^\d{16}$/.test(cleanCard)) {
      cardNumberInput.focus();
      stepError.textContent = "El numero de tarjeta debe tener 16 digitos.";
      return false;
    }

    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiryInput.value)) {
      expiryInput.focus();
      stepError.textContent = "El vencimiento debe tener formato MM/AA.";
      return false;
    }

    if (!/^\d{3,4}$/.test(cvvInput.value)) {
      cvvInput.focus();
      stepError.textContent = "El CVV debe tener 3 o 4 digitos.";
      return false;
    }
  }

  return true;
}

nextBtn.addEventListener("click", () => {
  if (!isStepValid(currentStep)) {
    return;
  }

  currentStep = Math.min(3, currentStep + 1);
  updateView();
});

prevBtn.addEventListener("click", () => {
  currentStep = Math.max(1, currentStep - 1);
  updateView();
});

cardNumberInput.addEventListener("input", () => {
  const digits = cardNumberInput.value.replace(/\D+/g, "").slice(0, 16);
  cardNumberInput.value = digits.replace(/(\d{4})(?=\d)/g, "$1 ");
});

expiryInput.addEventListener("input", () => {
  const digits = expiryInput.value.replace(/\D+/g, "").slice(0, 4);
  if (digits.length >= 3) {
    expiryInput.value = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return;
  }
  expiryInput.value = digits;
});

cvvInput.addEventListener("input", () => {
  cvvInput.value = cvvInput.value.replace(/\D+/g, "").slice(0, 4);
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!isStepValid(3)) {
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Procesando pago...";
  stepError.textContent = "";

  const result = await processSandboxPayment();
  if (!result.approved) {
    stepError.textContent = "No se pudo completar el pago en sandbox. Intenta nuevamente.";
    submitBtn.disabled = false;
    submitBtn.textContent = "Pagar ahora";
    return;
  }

  successMessage.textContent = `Pago procesado con exito en sandbox. ID de transaccion: ${result.transactionId}.`;
  successMessage.classList.remove("hidden");
  submitBtn.textContent = "Pagado";
  nextBtn.disabled = true;
  prevBtn.disabled = true;
  localStorage.removeItem(CHECKOUT_STORAGE_KEY);
  localStorage.removeItem(CART_STORAGE_KEY);
});

loadOrderSummary();
loadFormData();
setupFormPersistence();
updateView();
