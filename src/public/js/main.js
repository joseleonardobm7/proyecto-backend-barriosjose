const socket = io();

// AGREGANDO FUNCIONALIDAD AL BOTÓN CREAR PRODUCTO
const productCreateButton = document.getElementById("btn-product-save");
productCreateButton.addEventListener("click", () => {
  productCreate();
});

socket.on("products", (data) => {
  renderProducts(data);
});

// RENDERIZAR PRODUCTOS
const renderProducts = (data) => {
  const productsContainer = document.getElementById("productsContainer");
  productsContainer.innerHTML = "";
  data.forEach((d) => {
    const card = document.createElement("div");
    card.classList.add("col");
    const defaultImg =
      d.image ||
      "https://via.placeholder.com/300x200.png?text=Producto+sin+imagen";
    card.innerHTML = `
      <div class="card-product">
        <div class="text-center mx-auto" style="width: 300px; height: 200px;">
          <div class="d-flex justify-content-center align-items-center" style="width: 100%; height: 100%;">
            <img 
              src="${defaultImg}"
              class="img-fluid" 
              style="max-width: 100%; max-height: 100%;" 
              alt="${d.title}" 
              onerror="this.src='https://via.placeholder.com/300x200.png?text=Producto+sin+imagen'"
            >
          </div>
        </div>
        <div class="card-body">
          <ul class="list-group list-group-flush">
            <li class="list-group-item d-flex justify-content-between">
              <span class="fw-bold me-2"> Código </span>
              <span>${d.sku}</span>
            </li>
            <li class="list-group-item d-flex justify-content-between">
              <span class="fw-bold me-2"> Título </span>
              <span class="card-title" data-bs-toggle="tooltip" data-bs-placement="top" title="${d.title}">${d.title}</span>
            </li>
            <li class="list-group-item d-flex justify-content-between">
              <span class="fw-bold me-2"> Precio </span>
              <span>$${d.price}</span>
            </li>
          </ul>
          <button class="btn btn-danger btn-sm w-100 btn-delete-product">Eliminar</button>
        </div>
      </div>
    `;
    productsContainer.appendChild(card);
    // AGREGANDO FUNCIONALIDAD AL BOTÓN ELIMINAR PRODUCTO
    card.querySelector("button").addEventListener("click", () => {
      productDelete(d.id);
    });
  });
};

// ELIMINAR PRODUCTO
const productDelete = (id) => {
  socket.emit("productDelete", id);
  socket.emit("productsLoad", {});
};

// CREAR PRODUCTO
const productCreate = async () => {
  let image = "";
  const inputImage = document.getElementById("product-image");

  if (inputImage.files.length > 0) {
    const formData = new FormData();
    formData.append("image", inputImage.files[0]);
    try {
      const response = await fetch("/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) image = await response.text();
    } catch (error) {
      console.error("Error al Guardar la Imagen:", error);
    }
  }

  const productData = {
    sku: parseInt(document.getElementById("product-sku").value),
    title: document.getElementById("product-title").value,
    price: parseFloat(document.getElementById("product-price").value),
    description: document.getElementById("product-description").value,
    category: document.getElementById("product-category").value,
    image,
    rating: {
      rate: 0,
      count: 0,
    },
  };
  // CREAR PRODUCTO
  socket.emit("productCreate", productData, (res) => {
    const { error } = res;
    if (error) {
      alert(error);
    } else {
      // MOSTRAR PESTAÑA DE PRODUCTOS
      const tabTriggerEl = document.querySelector("#administrar-productos-tab");
      const tab = new bootstrap.Tab(tabTriggerEl);
      tab.show();

      // RESETEAR FORMULARIO
      const form = document.getElementById("form-product-create");
      form.reset();

      // RECARGAR PRODUCTOS
      socket.emit("productsLoad", {});
    }
  });
};

// RENDERIZAR CARRITOS
socket.on("carts", (data) => {
  renderCarts(data);
});
const renderCarts = (data) => {
  const cartsContainer = document.getElementById("cartsContainer");
  cartsContainer.innerHTML = "";
  data.forEach((d) => {
    const card = document.createElement("div");
    card.classList.add("col");
    const defaultImg =
      "https://via.placeholder.com/300x200.png?text=Carrito+sin+imagen";
    let totalCart = 0;
    card.innerHTML = `
      <div class="card-cart">
        <div class="text-center mx-auto" style="width: 300px; height: 200px;">
          <div class="d-flex justify-content-center align-items-center w-100 h-100">
            <img 
              src="${defaultImg}"
              class="img-fluid" 
              style="max-width: 100%; max-height: 100%;" 
              alt="${d.title}" 
              onerror="this.src='https://via.placeholder.com/300x200.png?text=Carrito+sin+imagen'"
            >
          </div>
        </div>
        <div class="card-body w-100">
          <ul class="list-group list-group-flush">
            <li class="list-group-item d-flex justify-content-between">
              <span class="fw-bold me-2"> Usuario </span>
              <span>${d.userId || ""}</span>
            </li>
            <li class="list-group-item d-flex justify-content-between">
              <span class="fw-bold me-2"> Monto </span>
              <span>$${totalCart || 0}</span>
            </li>
            <li class="list-group-item d-flex flex-column justify-content-between">
              <div> <span class="fw-bold me-2"> Productos </span></div>
              <ul class="product-list" ></ul>
            </li>
          </ul>
        </div>
        <div class="w-100">
          <button class="btn btn-danger btn-sm w-100 btn-delete-cart">Eliminar</button>
        </div>
      </div>
    `;
    cartsContainer.appendChild(card);

    // AGREGAR LA LISTA DE PRODUCTOS
    const productListContainer = card.querySelector(".product-list");

    const productList = d.products;
    const noProducts = document.createElement("span");
    noProducts.innerHTML = "Sin productos registrados";
    if (!productList.length) {
      productListContainer.appendChild(noProducts);
    } else {
      productList.forEach((p) => {
        const { product, quantity } = p;
        const { sku, price, _id } = product;
        totalCart += price * quantity || 0;
        // CREANDO LI
        const productLine = document.createElement("li");
        productLine.classList.add(
          "d-flex",
          "justify-content-start",
          "align-items-center"
        );
        // LLENANDO LI
        productLine.innerHTML = `
          <button class="btn btn-danger btn-sm btn-icon-small btn-delete-product-cart-${_id}">
            <i class="bi bi-trash"></i>
          </button>
          <div class="ps-3">
            SKU: ${sku} - [${quantity} x $${price}] -> $ ${quantity * price}
          </div>
        `;
        productListContainer.appendChild(productLine);

        // AGREGANDO FUNCIONALIDAD AL BOTÓN ELIMINAR PRODUCTO DE CARRITO
        card
          .querySelector(`.btn-delete-product-cart-${_id}`)
          .addEventListener("click", () => {
            console.log(_id);
          });
      });
    }

    // AGREGANDO FUNCIONALIDAD AL BOTÓN ELIMINAR CARRITO
    card.querySelector(".btn-delete-cart").addEventListener("click", () => {
      cartDelete(d._id);
    });
  });
};

// ELIMINAR PRODUCTO
const cartDelete = (id) => {
  socket.emit("cartDelete", id);
  socket.emit("cartsLoad", {});
};

// INICIALIZAR TOOLTIPS DE BOOSTRAP
const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
tooltips.forEach((tooltip) => {
  new bootstrap.Tooltip(tooltip);
});
