/* ==========================================================================
   aabClara — Portfólio | main.js
   ========================================================================== */

/* ---------- 1. Header: compacta ao rolar e esconde ao descer ---------- */
(() => {
  const header = document.querySelector(".site-header");
  if (!header) return;

  let lastY = window.scrollY;
  let ticking = false;

  const update = () => {
    const y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 16);
    header.classList.toggle("is-hidden", y > lastY && y > header.offsetHeight * 3);
    lastY = y;
    ticking = false;
  };

  window.addEventListener("scroll", () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });

  header.addEventListener("focusin", () => header.classList.remove("is-hidden"));
  update();
})();

/* ---------- 2. Marquee: Loop contínuo (aabclara) e Setas para Projetos ---------- */
(() => {
  document.querySelectorAll(".marquee").forEach((marquee) => {
    const track = marquee.querySelector(".marquee__track");
    if (!track) return;

    const isProjeto = marquee.classList.contains("projeto-bloco__marquee");

    if (!isProjeto) {
      // Letreiro animado
      const originalItems = Array.from(track.children);
      let clonesNeeded = Math.ceil(10 / originalItems.length);
      if (clonesNeeded < 1) clonesNeeded = 1;

      for (let i = 1; i < clonesNeeded; i++) {
        originalItems.forEach((el) => track.appendChild(el.cloneNode(true)));
      }
      const trackClone = track.cloneNode(true);
      trackClone.setAttribute("aria-hidden", "true");
      marquee.appendChild(trackClone);

      const averageItemWidth = 200;
      const totalItems = track.children.length;
      marquee.style.setProperty("--marquee-speed", `${(totalItems * averageItemWidth) / 60}s`);

    } else {
      // Projetos com Setas
      const originalItems = Array.from(track.children);
      for (let i = 0; i < 2; i++) {
        originalItems.forEach(el => track.appendChild(el.cloneNode(true)));
      }

      const btnPrev = document.createElement("button");
      btnPrev.className = "nav-arrow nav-prev";
      btnPrev.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>';

      const btnNext = document.createElement("button");
      btnNext.className = "nav-arrow nav-next";
      btnNext.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>';

      marquee.appendChild(btnPrev);
      marquee.appendChild(btnNext);

      const scrollAmount = 350;

      btnNext.addEventListener("click", () => track.scrollBy({ left: scrollAmount, behavior: "smooth" }));
      btnPrev.addEventListener("click", () => track.scrollBy({ left: -scrollAmount, behavior: "smooth" }));

      track.addEventListener("scroll", () => {
        const oneThird = track.scrollWidth / 3;
        if (track.scrollLeft > oneThird * 2) {
          track.style.scrollBehavior = "auto";
          track.scrollLeft -= oneThird;
          void track.offsetHeight;
          track.style.scrollBehavior = "smooth";
        } else if (track.scrollLeft < 10) {
          track.style.scrollBehavior = "auto";
          track.scrollLeft += oneThird;
          void track.offsetHeight;
          track.style.scrollBehavior = "smooth";
        }
      });

      setTimeout(() => {
        track.style.scrollBehavior = "auto";
        track.scrollLeft = track.scrollWidth / 3;
        track.style.scrollBehavior = "smooth";
      }, 100);
    }
  });
})();

/* ---------- 3. Lightbox para imagens dos projetos (Agora exclusivo e sem duplicação!) ---------- */
(() => {
  // Limpa qualquer vestígio de lightboxes antigos no HTML
  document.querySelectorAll('.lightbox').forEach(el => el.remove());

  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'lightbox-close';
  closeBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';

  const img = document.createElement('img');

  lightbox.appendChild(closeBtn);
  lightbox.appendChild(img);
  document.body.appendChild(lightbox);

  const closeLightbox = () => {
    lightbox.classList.remove('is-open');
    setTimeout(() => { img.src = ''; }, 300);
  };

  document.addEventListener('click', (e) => {
    // Só abre se clicar numa imagem que esteja dentro do carrossel
    if (e.target.tagName === 'IMG' && e.target.closest('.projetos__item')) {
      img.src = e.target.src;
      lightbox.classList.add('is-open');
    }
  });

  lightbox.addEventListener('click', (e) => {
    // Fecha se clicar na área escura desfocada
    if (e.target === lightbox) closeLightbox();
  });

  // Fecha se clicar no botão X
  closeBtn.addEventListener('click', closeLightbox);

  // Fecha se apertar o "Esc" no teclado
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });
})();