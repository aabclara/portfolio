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

    // velocidade: projetos rolam BEM devagar (10px/s), marquees do hero (60px/s)
    const isProjetoMarquee = marquee.classList.contains("projeto-bloco__marquee");
    const PX_POR_SEG = isProjetoMarquee ? 10 : 60;
    marquee.style.setProperty("--marquee-speed", `${track.scrollWidth / PX_POR_SEG}s`);
  });
})();

/* ---------- Projetos: drag-to-scroll nas linhas de imagens ---------- */
(() => {
  document.querySelectorAll(".projeto-bloco__marquee").forEach((marquee) => {
    let isDown = false;
    let startX = 0;
    let scrollStart = 0;

    // Para o drag funcionar, precisamos controlar o scroll horizontal via wrapper
    // Vamos transformar o marquee em um scroll container quando o usuário arrasta
    marquee.addEventListener("mousedown", (e) => {
      // Ignora se clicou numa imagem (para lightbox)
      if (e.target.tagName === "IMG") return;
      isDown = true;
      startX = e.pageX;
      scrollStart = marquee.scrollLeft;
      marquee.classList.add("is-dragging");
      e.preventDefault();
    });

    marquee.addEventListener("mousemove", (e) => {
      if (!isDown) return;
      e.preventDefault();
      const dx = e.pageX - startX;
      marquee.scrollLeft = scrollStart - dx;
    });

    marquee.addEventListener("mouseup", () => {
      isDown = false;
      marquee.classList.remove("is-dragging");
    });

    marquee.addEventListener("mouseleave", () => {
      isDown = false;
      marquee.classList.remove("is-dragging");
    });
  });
})();

/* ---------- Lightbox for project images ---------- */
(() => {
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  const img = document.createElement('img');
  lightbox.appendChild(img);
  document.body.appendChild(lightbox);

  // Open on click of thumbnail
  document.querySelectorAll('.projetos__item img').forEach((thumb) => {
    thumb.addEventListener('click', () => {
      img.src = thumb.src;
      lightbox.classList.add('is-open');
    });
  });

  // Close when clicking outside the image
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      lightbox.classList.remove('is-open');
    }
  });

  // Close with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      lightbox.classList.remove('is-open');
    }
  });
})();
