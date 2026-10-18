/* ==========================================================================
   aabClara — Portfólio | main.js
   ========================================================================== */

/* ---------- Header: compacta ao rolar e esconde ao descer ---------- */
(() => {
  const header = document.querySelector(".site-header");
  if (!header) return;

  let lastY = window.scrollY;
  let ticking = false;

  const update = () => {
    const y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 16);
    // só esconde depois de passar da altura do header e se estiver descendo
    header.classList.toggle("is-hidden", y > lastY && y > header.offsetHeight * 3);
    lastY = y;
    ticking = false;
  };

  window.addEventListener("scroll", () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });

  // se algo dentro do header recebe foco (teclado), garante que ele apareça
  header.addEventListener("focusin", () => header.classList.remove("is-hidden"));

  update();
})();

/* ---------- Marquee: loop contínuo em qualquer largura de tela ---------- */
(() => {
  document.querySelectorAll(".marquee").forEach((marquee) => {
    const track = marquee.querySelector(".marquee__track");
    if (!track) return;

    const original = [...track.children];
    // repete os itens até a faixa ser mais larga que a tela (cobre telas 4K)
    let guard = 0;
    while (track.scrollWidth < window.screen.width * 1.1 && guard++ < 10) {
      original.forEach((el) => {
        const c = el.cloneNode(true);
        c.setAttribute("aria-hidden", "true");
        track.appendChild(c);
      });
    }

    // segunda cópia idêntica: as duas andam juntas e o fim de uma encontra o início da outra
    const clone = track.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    marquee.appendChild(clone);

    // velocidade constante (px/s) independente do tamanho do conteúdo
    const PX_POR_SEG = 60;
    marquee.style.setProperty("--marquee-speed", `${track.scrollWidth / PX_POR_SEG}s`);
  });
})();
