function createNavbar() {
  return `
    <header class="topbar">
      <div class="brand-wrap">
        <a href="/" class="logo" aria-label="Volver a inicio">
          <span class="logo-mark">JS</span>
          <span class="logo-text">JoJose Sail</span>
        </a>
      </div>

      <form class="search-wrap" role="search" aria-label="Buscar productos">
        <label for="global-search" class="sr-only">Buscar</label>
        <input
          id="global-search"
          type="search"
          name="q"
          placeholder="Buscar calzado, camisas, accesorios..."
        />
        <button type="submit">Buscar</button>
      </form>

      <nav class="quick-links" aria-label="Navegacion rapida">
        <a href="/">Inicio</a>
        <a href="/carrito.html">Carrito</a>
      </nav>

      <div class="account-menu">
        <button type="button" aria-haspopup="menu" aria-expanded="false">
          Mi cuenta
        </button>
      </div>
    </header>
  `;
}

function createFooter() {
  return `
    <footer class="site-footer">
      <div class="footer-grid">
        <section>
          <h3>Categorias</h3>
          <ul>
            <li><a href="#">Calzado</a></li>
            <li><a href="#">Camisas</a></li>
            <li><a href="#">Pantalones</a></li>
            <li><a href="#">Accesorios</a></li>
          </ul>
        </section>

        <section>
          <h3>Legal</h3>
          <ul>
            <li><a href="#">Terminos y condiciones</a></li>
            <li><a href="#">Politica de privacidad</a></li>
            <li><a href="#">Sobre la marca</a></li>
          </ul>
        </section>

        <section>
          <h3>Contacto</h3>
          <ul>
            <li><a href="mailto:hola@jojosesail.com">hola@jojosesail.com</a></li>
            <li><a href="tel:+34123456789">+34 123 456 789</a></li>
            <li>Calle Moda 99, Barcelona</li>
          </ul>
        </section>
      </div>
      <p class="footer-note">2026 JoJose Sail. Todos los derechos reservados.</p>
    </footer>
  `;
}

function mountSharedLayout() {
  var navbarTarget = document.getElementById("site-navbar");
  var footerTarget = document.getElementById("site-footer");

  if (navbarTarget) navbarTarget.innerHTML = createNavbar();
  if (footerTarget) footerTarget.innerHTML = createFooter();
}

document.addEventListener("DOMContentLoaded", mountSharedLayout);