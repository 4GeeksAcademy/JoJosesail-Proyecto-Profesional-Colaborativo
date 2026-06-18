const state = {
  product: null,
  selectedSize: "",
  selectedColor: "",
  cartCount: 0
};

const CART_STORAGE_KEY = "store_cart_state";

const refs = {
  image: document.getElementById("productImage"),
  category: document.getElementById("productCategory"),
  name: document.getElementById("productName"),
  code: document.getElementById("productCode"),
  sizeLabel: document.getElementById("selectedSizeLabel"),
  price: document.getElementById("productPrice"),
  materials: document.getElementById("materialsText"),
  scenarios: document.getElementById("scenarioList"),
  sizeOptions: document.getElementById("sizeOptions"),
  colorOptions: document.getElementById("colorOptions"),
  quantity: document.getElementById("quantity"),
  addToCart: document.getElementById("addToCart"),
  cartCount: document.getElementById("cartCount"),
  cartMessage: document.getElementById("cartMessage")
};

function formatPrice(value, currency) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency
  }).format(value);
}

function saveCartState(lastQuantity) {
  if (!state.product) {
    return;
  }

  const payload = {
    count: state.cartCount,
    product: {
      id: state.product.id,
      name: state.product.name,
      code: state.product.code,
      price: state.product.price,
      currency: state.product.currency
    },
    selection: {
      size: state.selectedSize,
      color: state.selectedColor
    },
    lastQuantity,
    updatedAt: new Date().toISOString()
  };

  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(payload));
}

function loadCartState() {
  const raw = localStorage.getItem(CART_STORAGE_KEY);
  if (!raw) {
    return;
  }

  try {
    const parsed = JSON.parse(raw);
    if (Number.isFinite(parsed.count) && parsed.count >= 0) {
      state.cartCount = parsed.count;
      refs.cartCount.textContent = String(state.cartCount);
    }
  } catch (error) {
    console.error("No se pudo recuperar el carrito guardado.", error);
  }
}

function renderBaseInfo() {
  const { product } = state;

  refs.image.src = product.image.src;
  refs.image.alt = product.image.alt;
  refs.category.textContent = product.category;
  refs.name.textContent = product.name;
  refs.code.textContent = product.code;
  refs.price.textContent = formatPrice(product.price, product.currency);
  refs.sizeLabel.textContent = state.selectedSize;
  refs.materials.textContent = product.description.materials;

  refs.scenarios.innerHTML = "";
  product.description.recommendedUse.forEach((scenario) => {
    const item = document.createElement("li");
    item.textContent = scenario;
    refs.scenarios.appendChild(item);
  });
}

function renderSizeOptions() {
  refs.sizeOptions.innerHTML = "";

  state.product.sizes.forEach((size) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "option-chip";
    if (size === state.selectedSize) {
      button.classList.add("active");
    }
    button.textContent = size;
    button.addEventListener("click", () => {
      state.selectedSize = size;
      refs.sizeLabel.textContent = size;
      renderSizeOptions();
    });

    refs.sizeOptions.appendChild(button);
  });
}

function renderColorOptions() {
  refs.colorOptions.innerHTML = "";

  state.product.colors.forEach((color) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "color-swatch";
    button.style.backgroundColor = color.hex;
    button.setAttribute("aria-label", `Color ${color.name}`);
    button.title = color.name;

    if (color.name === state.selectedColor) {
      button.classList.add("active");
    }

    button.addEventListener("click", () => {
      state.selectedColor = color.name;
      renderColorOptions();
    });

    refs.colorOptions.appendChild(button);
  });
}

function setupCartBehavior() {
  refs.addToCart.addEventListener("click", () => {
    const amount = Number(refs.quantity.value);
    const quantity = Number.isFinite(amount) && amount > 0 ? Math.floor(amount) : 1;

    refs.quantity.value = quantity;
    state.cartCount += quantity;
    refs.cartCount.textContent = String(state.cartCount);
    refs.cartMessage.textContent = `${quantity} unidad(es) agregadas. Talla ${state.selectedSize}, color ${state.selectedColor}.`;
    saveCartState(quantity);
  });
}

async function initProductView() {
  try {
    loadCartState();

    const response = await fetch("products.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("No se pudo cargar products.json");
    }

    state.product = await response.json();
    state.selectedSize = state.product.sizes[0];
    state.selectedColor = state.product.colors[0].name;

    renderBaseInfo();
    renderSizeOptions();
    renderColorOptions();
    setupCartBehavior();
  } catch (error) {
    refs.cartMessage.textContent = "Error al cargar el producto. Revisa products.json.";
    console.error(error);
  }
}

initProductView();
