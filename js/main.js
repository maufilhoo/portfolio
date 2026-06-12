import { initI18n, getTranslation } from './i18n.js';
import { initFooterMeta } from './footer.js';

/* ─── Overlay ────────────────────────────────────────────────────── */
function initOverlay() {
  const overlay = document.getElementById('overlay');
  if (!overlay) return;
  requestAnimationFrame(() => {
    overlay.classList.add('hidden');
    setTimeout(() => overlay.remove(), 900);
  });
}

/* ─── Scroll to top ──────────────────────────────────────────────── */
function initScrollTop() {
  const btn = document.querySelector('.footer-scroll-top');
  if (btn) btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ─── Copy email ─────────────────────────────────────────────────── */
function initCopyEmail() {
  const btns = document.querySelectorAll('#copy-email, [data-copy-email]');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      navigator.clipboard.writeText('talkmauriciof@gmail.com')
        .then(() => {
          btn.textContent = getTranslation('nav_copied');
          const key = btn.dataset.i18n;
          setTimeout(() => {
            btn.textContent = key ? getTranslation(key) : btn.dataset.origText;
          }, 2000);
        })
        .catch(() => { window.location.href = 'mailto:talkmauriciof@gmail.com'; });
    });
    if (!btn.dataset.i18n) btn.dataset.origText = btn.textContent;
  });
}

/* ─── Work grid reveal ───────────────────────────────────────────── */
function initWorkReveal() {
  const items = document.querySelectorAll('[data-reveal]');
  if (!items.length) return;
  const obs = new IntersectionObserver(
    entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in-view'); }),
    { threshold: 0.08 }
  );
  items.forEach(el => obs.observe(el));
}

/* ─── Audio player ───────────────────────────────────────────────── */
const TRACKS = [
  'assets/audio/tincoas.mp3',
  'assets/audio/tom-misch.mp3'
];

function initAudio() {
  const btn     = document.getElementById('audio-btn');
  const audio   = document.getElementById('bg-audio');
  const popover = document.getElementById('audio-track-popover');
  if (!btn || !audio || !popover) return;

  btn.addEventListener('click', () => {
    if (audio.paused) {
      audio.play().then(() => btn.classList.add('playing')).catch(() => {});
    } else {
      audio.pause();
      btn.classList.remove('playing');
    }
  });

  popover.querySelectorAll('.track-opt').forEach(opt => {
    opt.addEventListener('click', e => {
      e.stopPropagation();
      const idx = parseInt(opt.dataset.track);
      const wasPlaying = !audio.paused;
      const currentTime = 0;

      popover.querySelectorAll('.track-opt').forEach(o => o.classList.remove('active'));
      opt.classList.add('active');

      audio.pause();
      audio.src = TRACKS[idx];
      audio.currentTime = currentTime;

      if (wasPlaying) {
        audio.play().then(() => btn.classList.add('playing')).catch(() => {});
      } else {
        btn.classList.remove('playing');
      }
    });
  });
}

/* ─── Header scroll — transparent + auto-hide over showcase ─────── */
function initHeaderScroll() {
  const header   = document.querySelector('.site-header');
  const showcase = document.getElementById('work');
  if (!header) return;

  let hideTimer   = null;
  let lastScrollY = window.scrollY;

  function showHeader() {
    clearTimeout(hideTimer);
    header.classList.remove('is-hidden');
  }

  function scheduleHide() {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => header.classList.add('is-hidden'), 2000);
  }

  function isOverShowcase() {
    if (!showcase) return false;
    const rect = showcase.getBoundingClientRect();
    return rect.top <= 72 && rect.bottom > 0;
  }

  function update() {
    const scrolled = window.scrollY > 50;
    header.classList.toggle('is-scrolled', scrolled);

    const dy = window.scrollY - lastScrollY;
    lastScrollY = window.scrollY;

    if (!scrolled) {
      showHeader();
      return;
    }

    if (dy < 0) {
      showHeader();
      return;
    }

    if (isOverShowcase()) scheduleHide();
  }

  window.addEventListener('scroll', update, { passive: true });

  document.addEventListener('mousemove', e => {
    if (e.clientY < 80) showHeader();
  });
  document.addEventListener('touchstart', () => showHeader(), { passive: true });

  update();
}

/* ─── Bio fade on scroll ─────────────────────────────────────────── */
function initBioFade() {
  const hero = document.querySelector('.hero-section');
  if (!hero) return;
  const update = () => {
    const bottom = hero.getBoundingClientRect().bottom;
    const height = hero.offsetHeight;
    const fadeStart = height * 0.5;
    const fadeEnd   = height * 0.1;
    const progress  = Math.min(1, Math.max(0, (bottom - fadeEnd) / (fadeStart - fadeEnd)));
    hero.style.opacity = progress;
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* ─── Feed items ─────────────────────────────────────────────────── */
const FEED_ITEMS = [
  'assets/images/feed/1.webp',
  'assets/images/feed/2.webp',
  'assets/images/feed/3.webp',
  'assets/images/feed/4.webp',
  'assets/images/feed/5.webp',
  'assets/images/feed/6.gif',
  'assets/images/feed/7.webp',
  'assets/images/feed/8.gif',
  'assets/images/feed/9.webp',
  'assets/images/feed/10.mp4',
  'assets/images/feed/11.webp',
  'assets/images/feed/12.gif',
  'assets/images/feed/13.webp',
  'assets/images/feed/14.webp',
  'assets/images/feed/15.webp',
  'assets/images/feed/16.webp',
  'assets/images/feed/17.webp',
  'assets/images/feed/18.webp',
  'assets/images/feed/19.webp',
  'assets/images/feed/20.webp',
  'assets/images/feed/21.gif',
  'assets/images/feed/22.webp',
  'assets/images/feed/23.webp',
];

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/* ─── Feed showcase (random auto-play) ──────────────────────────── */
function initFeedShowcase() {
  const section = document.getElementById('work');
  if (!section) return;

  const items = [...FEED_ITEMS];
  let idx = 0;
  let current = null;
  let timer = null;

  function next() {
    if (idx >= items.length) { idx = 0; }
    const src = items[idx++];
    const isVideo = src.endsWith('.mp4');

    let el;
    if (isVideo) {
      el = document.createElement('video');
      el.autoplay = true;
      el.muted = true;
      el.playsInline = true;
      el.loop = false;
      el.src = src;
      el.addEventListener('ended', () => { clearTimeout(timer); next(); });
    } else {
      el = document.createElement('img');
      el.src = src;
      el.alt = '';
    }
    el.className = 'feed-media';
    section.appendChild(el);

    const old = current;
    current = el;

    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('visible')));

    if (old) {
      old.classList.remove('visible');
      setTimeout(() => { if (old.parentNode) old.remove(); }, 750);
    }

    if (!isVideo) {
      clearTimeout(timer);
      timer = setTimeout(next, 4500);
    }
  }

  next();
}

/* ─── Project data ───────────────────────────────────────────────── */
const PROJECT_DATA = {
  enjoei: {
    client: 'Enjoei',
    detail: {
      pt: 'Enjoei veio até nós em um momento de virada. Nascida da linguagem da internet, a marca havia acumulado múltiplas referências, códigos e personalidades, mas precisava de mais critério e maturidade para acompanhar um público que também evoluiu. Nosso trabalho foi organizar esse excesso sem perder a irreverência, criando um sistema de identidade flexível, contemporâneo e vivo.\n\nRedesenhamos o logotipo, desenvolvemos assets proprietários e criamos a Enjoei Display, tipografia feita sob medida para sustentar diferentes climas e expressões. A tecnologia ampliou o craft por meio de uma plataforma criativa que transforma letras em padrões, estampas e composições infinitas para o dia a dia da marca.\n\nComo Designer Sênior, estive profundamente envolvido em todas as frentes do projeto, da identidade visual à criação da tipografia proprietária, plataforma criativa, case e demais elementos visuais.',
      en: 'Enjoei came to us at a turning point. Born from internet culture, the brand had accumulated multiple references, codes, and personalities, but needed clearer structure and maturity to evolve alongside a growing audience. Our role was to organize this abundance without losing its irreverence, shaping a flexible, contemporary, and living identity system.\n\nWe redesigned the logo, developed proprietary assets, and created Enjoei Display, a custom typeface built to support multiple moods and expressions. Technology extended the craft through a creative platform that turns letters into patterns, prints, and infinite compositions for everyday use.\n\nAs a Senior Designer, I was deeply involved across all aspects of the project, from visual identity and typography to the creative platform, case development, and visual assets.',
    },
    credits: [
      [{ pt: 'Design',      en: 'Design' },      'Eduardo França, Gustavo André, Mauricio Filho, Mariana Hermeto', { dir: 'Dandara Almeida' }],
      [{ pt: 'Estratégia',  en: 'Strategy' },    'Anna Carla, Carol Polli, Sarah Stutz', { dir: 'Paula Marchiori' }],
      [{ pt: 'Verbal',      en: 'Copywriting' }, 'Elen Campos, Vallécia Carvalho'],
      [{ pt: 'Parceiros',   en: 'Partners' },    'Blackletra: Enjoei Display', 'André Burnier: Programação Criativa', 'Consoante: Identidade Sonora'],
    ],
    studio: 'Tátil Design',
    recognition: [
      'Brazil Design Award (BDA) 2023',
      '🥇 Craft for Design / Typography',
      '🥈 Graphic Design / Brand Design',
      '🥈 Branding / Creative Programming',
      '🥉 Graphic Design / Brand Design',
      'Latin American Design Awards (LAD) 2023',
      '🥇 Typography / Kinetic',
      '🥈 Digital / Experimental',
      'ADG Brazilian Graphic Design Biennial 2024',
      '📕 Enjoei Display Variable Font',
    ],
  },
  justos: {
    client: 'Justos',
    detail: {
      pt: 'A Justos surgiu com a ambição de transformar uma categoria inteira. Criada para repensar o mercado de seguros, a marca nasceu para desafiar convenções, engajar motoristas e incentivar um trânsito mais tranquilo e consciente. Nosso papel foi traduzir esse propósito em uma identidade bold e ativista, capaz de equilibrar tecnologia, inteligência de dados e conexão humana.\n\nDesenvolvemos um sistema visual inspirado na linguagem geométrica da sinalização viária e dos elementos do trânsito, utilizando códigos e símbolos universais para construir uma experiência de marca dinâmica e acessível. Um tom de voz provocativo e direto ajudou a descomplicar o segurês, sintetizar informações e construir confiança, dando forma a uma marca que acredita que o avanço só acontece de forma coletiva.\n\nComo Designer Sênior, estive envolvido no desenvolvimento e desdobramento da identidade visual, brandbook, case e demais ativos visuais.',
      en: 'Justos was created with the ambition of transforming an entire category. Designed to rethink the insurance market, the company set out to challenge industry conventions, engage drivers, and encourage safer and more conscious behavior on the road. Our role was to translate this purpose into a bold and activist identity capable of balancing technology, data intelligence, and human connection.\n\nWe developed a visual system inspired by the geometric language of traffic signs and road infrastructure, using universal symbols and codes to create a dynamic and accessible brand experience. A provocative yet straightforward verbal identity helped demystify insurance jargon, simplify information, and build trust, giving shape to a brand that believes meaningful progress can only happen collectively.\n\nAs a Senior Designer, I was involved in the development and rollout of the visual identity, brand guidelines, case study, and supporting visual assets.',
    },
    credits: [
      [{ pt: 'Design',    en: 'Design' },      'Camilla Mattos, Gustavo André, Eduardo França, Mauricio Filho, Mariana Hermeto', { dir: 'Dandara Almeida' }],
      [{ pt: 'Verbal',    en: 'Copywriting' }, 'Ana Cunha, Mila Bartilotti, Lourenço Araujo'],
    ],
    studio: 'Tátil Design',
  },
  phlor: {
    client: 'Phlor',
    detail: {
      pt: 'A Phlor nasceu da ideia de que pequenos rituais podem transformar a forma como nos relacionamos com os espaços e com nós mesmos. Voltada para fragrâncias e produtos pensados para ambientes internos e externos, a marca buscava traduzir beleza, cuidado e individualidade por meio de uma identidade sensorial e sofisticada. Meu objetivo foi transformar esses atributos em uma linguagem visual capaz de expressar a essência da marca de forma singular e consistente.\n\nDesenvolvi uma identidade visual fundamentada no conceito de transformação. O logotipo combina símbolo e lettering proprietários para formar uma espiral em expansão, enquanto a tipografia faz referência ao movimento das chamas e à natureza mutável dos aromas. Inspiradas por elementos naturais, a paleta cromática e as ilustrações exclusivas geram padrões orgânicos que reforçam o caráter holístico e contemporâneo da marca em embalagens e demais pontos de contato.\n\nComo designer independente, conduzi todas as etapas do projeto, da concepção da marca ao desenvolvimento da identidade visual, do design de embalagens à direção de arte da fotografia dos produtos, garantindo consistência e autoria em toda a experiência da marca.',
      en: 'Phlor was created around the idea that everyday rituals can transform the way we experience our homes and ourselves. Focused on fragrances and products designed for interior and exterior spaces, the brand sought to express beauty, care, and individuality through a refined and sensorial identity system. My goal was to translate these attributes into a visual language capable of expressing the brand\'s essence in a distinctive and meaningful way.\n\nI developed a visual identity rooted in the concept of transformation. The logo combines a custom symbol and wordmark to form an expanding spiral, while the typography references the movement of flames and the evolving nature of scent. Inspired by natural materials, the color palette and proprietary illustrations create organic patterns that reinforce the brand\'s holistic and contemporary character across packaging and communication.\n\nAs an independent designer, I led every stage of the project, from brand conception and visual identity development to packaging design and art direction for product photography, ensuring consistency and authorship across every touchpoint.',
    },
    credits: [
      [{ pt: 'Design & Direção de Arte', en: 'Design & Art Direction' }, 'Mauricio Filho'],
      [{ pt: 'Parceiros',               en: 'Partners' },               'Órix Media House: Fotografia'],
    ]
  },
  '99': {
    client: '99',
    detail: {
      pt: 'A 99 sempre ocupou um papel central na conexão entre pessoas, lugares e oportunidades em todo o Brasil. À medida que a empresa ampliava seu ecossistema e sua relevância, surgiu o desafio de traduzir um propósito mais claro para a marca: cuidar das pessoas abrindo caminhos para despertar novas histórias. Nosso trabalho foi transformar essa visão em uma identidade visual capaz de refletir tanto a escala da plataforma quanto a diversidade das comunidades que ela conecta.\n\nPartindo dos ativos já reconhecidos da marca, buscamos inspiração na linguagem visual das cidades, seus contornos, rotas e fluxos constantes. O sistema resultante combina padrões, texturas, mapas e elementos gráficos modulares para construir uma identidade flexível e expressiva. Próxima, inclusiva e adaptável, a linguagem visual reflete a complexidade da vida urbana ao mesmo tempo em que fortalece a conexão entre passageiros, motoristas e sociedade.\n\nComo Designer Sênior, estive envolvido no desenvolvimento e desdobramento do sistema de identidade visual, contribuindo para a construção de ativos gráficos, aplicações da marca e materiais de apresentação do projeto.',
      en: '99 has always played a central role in connecting people, places, and opportunities across Brazil. As the company expanded its ecosystem and impact, the challenge was to evolve the brand around a clear purpose: caring for people by opening paths for new stories to happen. Our role was to translate this vision into a visual identity capable of reflecting both the scale of the platform and the diversity of the communities it serves.\n\nBuilding on existing brand assets, we drew inspiration from the visual language of cities, their routes, contours, and constant movement. The resulting system combines patterns, textures, maps, and modular graphic elements to create a flexible and expressive identity. Designed to be inclusive, recognizable, and adaptable, the visual language mirrors the complexity and dynamism of urban life while strengthening the connection between passengers, drivers, and society.\n\nAs a Senior Designer, I was involved in the development and rollout of the visual identity system, helping shape graphic assets, brand applications, and case study materials.',
    },
    credits: [
      [{ pt: 'Design',      en: 'Design' },      'Gustavo André, Eduardo França, Mauricio Filho, Lays Santos', { dir: 'Dandara Almeida' }],
      [{ pt: 'Estratégia',  en: 'Strategy' },    'Paula Marchiori, Carol Avari'],
      [{ pt: 'Verbal',      en: 'Copywriting' }, 'Ana Cunha, Mila Bartilotti'],
    ],
    studio: 'Tátil Design',
    recognition: [
      'Brazil Design Award (BDA) 2022',
      '🥉 Graphic Design',
    ],
  },
  martorelli: {
    client: 'Martorelli',
    detail: {
      pt: 'O Martorelli Advogados é um escritório construído sobre uma trajetória sólida e, ao mesmo tempo, em constante evolução. Referência em seu segmento, a marca buscava fortalecer seu posicionamento por meio de uma identidade capaz de expressar tanto sua história quanto sua visão de futuro. Nosso desafio foi traduzir esse equilíbrio entre tradição e transformação em um sistema visual contemporâneo e relevante.\n\nRedesenhamos a identidade visual para refletir a diversidade, a expertise e a cultura centrada nas pessoas que definem o escritório. O novo logotipo combina influências tipográficas clássicas e contemporâneas, expressando uma marca que respeita seu legado sem deixar de evoluir. A paleta cromática, a linguagem fotográfica focada nas relações humanas, a arquitetura de marcas e o tom de voz mais próximo trabalham em conjunto para construir uma experiência consistente e atual em todos os pontos de contato.\n\nComo Designer Sênior, estive envolvido no desenvolvimento e desdobramento da identidade visual, contribuindo para aplicações da marca, ativos visuais e materiais de apresentação do projeto.',
      en: 'Martorelli Advogados is a firm built on a strong legacy while continuously evolving to meet new realities. Recognized as a reference in its field, the firm sought to strengthen its positioning through a brand capable of expressing both its history and its forward-looking vision. Our challenge was to translate this balance between tradition and transformation into a contemporary identity system.\n\nWe redesigned the visual identity to reflect the firm\'s diversity, expertise, and human-centered culture. The new logo combines classical and contemporary typographic influences, expressing a brand that respects its heritage while embracing change. A refined color palette, people-focused photography, a structured brand architecture, and a more approachable verbal language work together to create a cohesive and modern brand experience across every touchpoint.\n\nAs a Senior Designer, I was involved in the development and rollout of the visual identity system, contributing to brand applications, visual assets, and case study materials.',
    },
    credits: [
      [{ pt: 'Design',      en: 'Design' },      'Camilla Mattos, Eduardo França, Gustavo André, Mauricio Filho, Priscila Czuka', { dir: 'Dandara Almeida' }],
      [{ pt: 'Estratégia',  en: 'Strategy' },    'Amanda Gebara'],
      [{ pt: 'Verbal',      en: 'Copywriting' }, 'Ana Cunha, Mila Bartilotti, Lourenço Araujo'],
    ],
    studio: 'Tátil Design',
  },
  metallo:       { client: 'Metallo' },
  papeltec:      { client: 'Papeltec' },
  caixa:         { client: 'Caixa' },
  'natura-homem':{ client: 'Natura' },
  'natura-pais': { client: 'Natura' },
  ativa:         { client: 'Ativa' },
  vibra:         { client: 'Vibra' },
  mdesign:       { client: 'MDesign' },
};

/* ─── Work table ─────────────────────────────────────────────────── */
function initWorkTable() {
  const wrap = document.querySelector('.work-table-wrap');
  if (!wrap) return;

  const rows = wrap.querySelectorAll('.wt-row');
  const preview = document.getElementById('wt-hover-preview');
  const previewImg = preview ? preview.querySelector('img') : null;
  let activeRow = null;

  if (preview && previewImg) {
    document.addEventListener('mousemove', e => {
      preview.style.left = e.clientX + 'px';
      preview.style.top  = e.clientY + 'px';
    });

    rows.forEach(row => {
      const head = row.querySelector('.wt-row-head');
      head.addEventListener('mouseenter', () => {
        if (row.classList.contains('is-open')) return;
        try {
          const imgs = JSON.parse(row.dataset.images || '[]');
          if (imgs.length) { previewImg.src = imgs[0]; preview.classList.add('visible'); }
        } catch(e) {}
      });
      head.addEventListener('mouseleave', () => preview.classList.remove('visible'));
    });
  }

  rows.forEach(row => {
    row.querySelector('.wt-row-head').addEventListener('click', () => {
      const isOpen = row.classList.contains('is-open');
      if (activeRow && activeRow !== row) closeRow(activeRow);
      isOpen ? (() => { closeRow(row); activeRow = null; })()
             : (() => { openRow(row);  activeRow = row;  })();
    });
  });

  document.getElementById('lang-round')?.addEventListener('click', () => {
    if (activeRow) { closeRow(activeRow); activeRow = null; }
    wrap.querySelectorAll('.wt-expand-inner[data-built]').forEach(el => delete el.dataset.built);
  });

  // ── Case lightbox ────────────────────────────────────────────
  const caseLb = document.createElement('div');
  caseLb.id = 'case-lightbox';
  caseLb.innerHTML = `
    <button class="case-lb-close" aria-label="Fechar">✕</button>
    <button class="case-lb-prev" aria-label="Anterior">‹</button>
    <img class="case-lb-img" src="" alt="">
    <button class="case-lb-next" aria-label="Próxima">›</button>
    <div class="case-lb-dots"></div>
  `;
  document.body.appendChild(caseLb);

  const clbImg   = caseLb.querySelector('.case-lb-img');
  const clbDots  = caseLb.querySelector('.case-lb-dots');
  const clbClose = caseLb.querySelector('.case-lb-close');
  const clbPrev  = caseLb.querySelector('.case-lb-prev');
  const clbNext  = caseLb.querySelector('.case-lb-next');
  let clbImgs = [], clbIdx = 0;

  function openCaseLightbox(imgs, startIdx) {
    clbImgs = imgs.filter(s => !s.endsWith('.mp4'));
    clbIdx  = Math.max(0, Math.min(startIdx, clbImgs.length - 1));
    clbDots.innerHTML = '';
    clbImgs.forEach((_, i) => {
      const d = document.createElement('button');
      d.className = 'case-lb-dot' + (i === clbIdx ? ' active' : '');
      d.setAttribute('aria-label', `Imagem ${i + 1}`);
      d.addEventListener('click', e => { e.stopPropagation(); showCaseSlide(i); });
      clbDots.appendChild(d);
    });
    showCaseSlide(clbIdx, true);
    caseLb.classList.add('visible');
  }

  function showCaseSlide(idx, instant) {
    clbIdx = idx;
    if (!instant) clbImg.classList.add('fading');
    setTimeout(() => {
      clbImg.src = clbImgs[idx];
      clbImg.classList.remove('fading');
      clbDots.querySelectorAll('.case-lb-dot').forEach((d, i) => d.classList.toggle('active', i === idx));
    }, instant ? 0 : 150);
  }

  function closeCaseLightbox() { caseLb.classList.remove('visible'); }

  clbClose.addEventListener('click', closeCaseLightbox);
  caseLb.addEventListener('click', e => { if (e.target === caseLb) closeCaseLightbox(); });
  clbPrev.addEventListener('click', e => {
    e.stopPropagation();
    showCaseSlide((clbIdx - 1 + clbImgs.length) % clbImgs.length);
  });
  clbNext.addEventListener('click', e => {
    e.stopPropagation();
    showCaseSlide((clbIdx + 1) % clbImgs.length);
  });
  document.addEventListener('keydown', e => {
    if (!caseLb.classList.contains('visible')) return;
    if (e.key === 'Escape')     closeCaseLightbox();
    if (e.key === 'ArrowLeft')  showCaseSlide((clbIdx - 1 + clbImgs.length) % clbImgs.length);
    if (e.key === 'ArrowRight') showCaseSlide((clbIdx + 1) % clbImgs.length);
  });

  let caseTouchX = 0;
  caseLb.addEventListener('touchstart', e => { caseTouchX = e.touches[0].clientX; }, { passive: true });
  caseLb.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - caseTouchX;
    if (Math.abs(dx) > 50) dx < 0
      ? showCaseSlide((clbIdx + 1) % clbImgs.length)
      : showCaseSlide((clbIdx - 1 + clbImgs.length) % clbImgs.length);
  });

  function openRow(row) {
    if (preview) preview.classList.remove('visible');
    row.classList.add('is-open');
    buildExpand(row);
    requestAnimationFrame(() => row.querySelector('.wt-expand').classList.add('is-open'));
  }

  function closeRow(row) {
    row.classList.remove('is-open');
    row.querySelector('.wt-expand').classList.remove('is-open');
  }

  function buildExpand(row) {
    const inner = row.querySelector('.wt-expand-inner');
    if (inner.dataset.built) return;
    inner.innerHTML = '';
    inner.dataset.built = '1';

    const project = row.dataset.project;
    const data    = PROJECT_DATA[project] || {};
    const isEN    = document.documentElement.lang === 'en';

    let imgs = [];
    try { imgs = JSON.parse(row.dataset.images || '[]'); } catch(e) {}

    // ── Info panel (col 1) ───────────────────────────────────────
    const info = document.createElement('div');
    info.className = 'wt-info-panel';

    const detailText = data.detail
      ? (typeof data.detail === 'object' ? (isEN ? data.detail.en : data.detail.pt) : data.detail)
      : '';

    if (detailText) {
      const overviewLabel = document.createElement('span');
      overviewLabel.className = 'wt-overview-label';
      overviewLabel.textContent = 'Overview';
      info.appendChild(overviewLabel);

      const desc = document.createElement('div');
      desc.className = 'wt-expand-desc';
      desc.innerHTML = detailText.split('\n\n').map(p =>
        `<p>${p.replace(/\n/g, '<br>')}</p>`
      ).join('');
      info.appendChild(desc);
    }

    function makeCreditsPanel(labelText, rows, studio, bodyFn) {
      const wrap = document.createElement('div');
      wrap.className = 'wt-credits';

      const toggle = document.createElement('button');
      toggle.className = 'wt-credits-toggle';
      const lbl = document.createElement('span');
      lbl.className = 'wt-credits-label';
      lbl.textContent = labelText;
      const icon = document.createElement('span');
      icon.className = 'wt-credits-icon';
      icon.textContent = '+';
      toggle.appendChild(lbl);
      toggle.appendChild(icon);

      const body = document.createElement('div');
      body.className = 'wt-credits-body';

      if (bodyFn) {
        bodyFn(body);
      } else {
        rows.forEach(row => {
          const rowEl = document.createElement('div');
          rowEl.className = 'wt-credits-row';
          if (row.key) {
            const keyEl = document.createElement('span');
            keyEl.className = 'wt-credits-key';
            keyEl.textContent = row.key;
            rowEl.appendChild(keyEl);
          }
          row.values.forEach(v => {
            const valEl = document.createElement('span');
            valEl.className = v.isDir ? 'wt-credits-dir' : 'wt-credits-val';
            valEl.textContent = v.isDir
              ? `${isEN ? 'Direction' : 'Direção'}: ${v.text}`
              : v.text;
            rowEl.appendChild(valEl);
          });
          body.appendChild(rowEl);
        });
      }

      toggle.addEventListener('click', () => {
        // close other open panels in same info panel
        info.querySelectorAll('.wt-credits.is-open').forEach(el => {
          if (el !== wrap) {
            el.classList.remove('is-open');
            el.querySelector('.wt-credits-icon').textContent = '+';
          }
        });
        const open = wrap.classList.toggle('is-open');
        icon.textContent = open ? '−' : '+';
      });

      // close on outside click
      document.addEventListener('click', function onOutside(e) {
        if (!wrap.contains(e.target) && wrap.classList.contains('is-open')) {
          wrap.classList.remove('is-open');
          icon.textContent = '+';
        }
      });

      if (studio) {
        const studioEl = document.createElement('p');
        studioEl.className = 'wt-credits-studio';
        const prefix = isEN ? 'Project developed at ' : 'Projeto desenvolvido na ';
        studioEl.innerHTML = prefix + `<strong>${studio}</strong>`;
        body.appendChild(studioEl);
      }

      wrap.appendChild(toggle);
      wrap.appendChild(body);
      return wrap;
    }

    const hasCredits = data.credits && data.credits.length;
    const hasRecognition = data.recognition && data.recognition.length;
    const hasBehance = !!data.behance;

    if (hasCredits || hasRecognition || hasBehance) {
      const btns = document.createElement('div');
      btns.className = 'wt-credits-btns';

      if (hasCredits) {
        const rows = data.credits.map(([labelObj, ...values]) => {
          const key = typeof labelObj === 'object' ? (isEN ? labelObj.en : labelObj.pt) : labelObj;
          const vals = values.map(v => {
            if (typeof v === 'object' && v.dir !== undefined) return { text: v.dir, isDir: true };
            const text = typeof v === 'object' ? (isEN ? v.en : v.pt) : v;
            return { text, isDir: false };
          });
          return { key, values: vals };
        });
        btns.appendChild(makeCreditsPanel(isEN ? 'Technical Sheet' : 'Ficha Técnica', rows, data.studio));
      }

      if (hasRecognition) {
        const recogGroups = [];
        let curGroup = null;
        data.recognition.forEach(s => {
          if (/^[🥇🥈🥉📕]/u.test(s)) {
            if (curGroup) curGroup.items.push(s);
          } else {
            const m = s.match(/^(.*?)\s+(\d{4})$/);
            curGroup = { name: m ? m[1] : s, year: m ? m[2] : null, items: [] };
            recogGroups.push(curGroup);
          }
        });
        btns.appendChild(makeCreditsPanel(
          isEN ? 'Recognition' : 'Reconhecimento',
          null, null,
          body => {
            recogGroups.forEach((g, i) => {
              const gEl = document.createElement('div');
              gEl.className = 'wt-recog-group' + (i > 0 ? ' wt-recog-group--sep' : '');
              const nameEl = document.createElement('span');
              nameEl.className = 'wt-recog-name';
              nameEl.textContent = g.name;
              gEl.appendChild(nameEl);
              if (g.year) {
                const yrEl = document.createElement('span');
                yrEl.className = 'wt-recog-year';
                yrEl.textContent = g.year;
                gEl.appendChild(yrEl);
              }
              g.items.forEach(item => {
                const itEl = document.createElement('span');
                itEl.className = 'wt-recog-item';
                itEl.textContent = item;
                gEl.appendChild(itEl);
              });
              body.appendChild(gEl);
            });
          }
        ));
      }

      if (hasBehance || true) {
        const bLink = document.createElement('a');
        bLink.className = 'wt-behance-btn';
        bLink.href = data.behance || '#';
        bLink.target = '_blank';
        bLink.rel = 'noopener';
        if (!data.behance) bLink.style.opacity = '0.4';
        const bLabel = document.createElement('span');
        bLabel.className = 'wt-behance-label';
        bLabel.textContent = 'Behance';
        const bArrow = document.createElement('span');
        bArrow.className = 'wt-credits-icon';
        bArrow.textContent = '↗';
        bLink.appendChild(bLabel);
        bLink.appendChild(bArrow);
        btns.appendChild(bLink);
      }

      info.appendChild(btns);
    }

    inner.appendChild(info);

    // ── Carousel wrap (cols 2–3) ──────────────────────────────────
    const carouselWrap = document.createElement('div');
    carouselWrap.className = 'wt-carousel-wrap';

    const carouselOuter = document.createElement('div');
    carouselOuter.className = 'wt-carousel-outer';

    const carousel = document.createElement('div');
    carousel.className = 'wt-carousel';

    const imgOnlyIdxMap = []; // maps carousel child index → clbImgs index
    let imgCount = 0;

    imgs.forEach((src, carouselIdx) => {
      let el;
      if (src.endsWith('.mp4')) {
        el = document.createElement('video');
        el.src       = src;
        el.autoplay  = true;
        el.muted     = true;
        el.loop      = true;
        el.playsInline = true;
        el.style.cssText = 'height:100%;width:auto;border-radius:6px;flex-shrink:0;display:block;';
        imgOnlyIdxMap.push(-1);
      } else {
        el = document.createElement('img');
        el.src     = src;
        el.alt     = '';
        el.loading = 'lazy';
        el.style.cursor = 'pointer';
        const thisImgIdx = imgCount++;
        el.addEventListener('click', () => openCaseLightbox(imgs, thisImgIdx));
        imgOnlyIdxMap.push(thisImgIdx);
      }
      carousel.appendChild(el);
    });

    carouselOuter.appendChild(carousel);
    carouselWrap.appendChild(carouselOuter);

    // Dots + scroll hint
    if (imgs.length > 1) {
      const dotsWrap = document.createElement('div');
      dotsWrap.className = 'wt-dots-wrap';

      const hint = document.createElement('span');
      hint.className = 'wt-dots-hint';
      hint.textContent = isEN ? 'scroll to see more' : 'arraste para ver mais';
      dotsWrap.appendChild(hint);

      const dotsEl = document.createElement('div');
      dotsEl.className = 'wt-dots';

      const dots = imgs.map((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'wt-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', `Imagem ${i + 1}`);
        dot.addEventListener('click', e => {
          e.preventDefault();
          dot.blur();
          const imgEl = carousel.children[i];
          if (imgEl) carouselOuter.scrollTo({ left: imgEl.offsetLeft, behavior: 'smooth' });
        });
        dotsEl.appendChild(dot);
        return dot;
      });

      carouselOuter.addEventListener('scroll', () => {
        const mid = carouselOuter.scrollLeft + carouselOuter.clientWidth / 2;
        let best = 0, bestDist = Infinity;
        Array.from(carousel.children).forEach((img, i) => {
          const dist = Math.abs(img.offsetLeft + img.offsetWidth / 2 - mid);
          if (dist < bestDist) { bestDist = dist; best = i; }
        });
        dots.forEach((d, i) => d.classList.toggle('active', i === best));
      }, { passive: true });

      dotsWrap.appendChild(dotsEl);
      carouselWrap.appendChild(dotsWrap);
    }

    inner.appendChild(carouselWrap);
  }
}

/* ─── Gallery ────────────────────────────────────────────────────── */
const GALLERY_DATA = [
  { project: 'enjoei',   label: 'Enjoei',
    picks: ['assets/images/cases/enjoei/1.webp','assets/images/cases/enjoei/5.gif','assets/images/cases/enjoei/12.webp'],
    all:   ['assets/images/cases/enjoei/1.webp','assets/images/cases/enjoei/2.webp','assets/images/cases/enjoei/3.webp','assets/images/cases/enjoei/4.webp','assets/images/cases/enjoei/5.gif','assets/images/cases/enjoei/6.webp','assets/images/cases/enjoei/7.webp','assets/images/cases/enjoei/8b.webp','assets/images/cases/enjoei/9.webp','assets/images/cases/enjoei/10.webp','assets/images/cases/enjoei/10 1.gif','assets/images/cases/enjoei/11.webp','assets/images/cases/enjoei/12.webp','assets/images/cases/enjoei/14.webp','assets/images/cases/enjoei/15.webp','assets/images/cases/enjoei/16.webp','assets/images/cases/enjoei/17.webp','assets/images/cases/enjoei/18.webp','assets/images/cases/enjoei/20.webp','assets/images/cases/enjoei/21.webp','assets/images/cases/enjoei/22.webp'] },
  { project: 'justos',   label: 'Justos',
    picks: ['assets/images/cases/justos/1.webp','assets/images/cases/justos/6.webp','assets/images/cases/justos/11.webp'],
    all:   ['assets/images/cases/justos/1.webp','assets/images/cases/justos/3.webp','assets/images/cases/justos/6.webp','assets/images/cases/justos/7.webp','assets/images/cases/justos/9.webp','assets/images/cases/justos/10.webp','assets/images/cases/justos/11.webp','assets/images/cases/justos/13.webp','assets/images/cases/justos/15.webp'] },
  { project: 'phlor',    label: 'Phlor',
    picks: ['assets/images/cases/phlor/1.webp','assets/images/cases/phlor/5.webp','assets/images/cases/phlor/10.webp'],
    all:   ['assets/images/cases/phlor/1.webp','assets/images/cases/phlor/2.webp','assets/images/cases/phlor/3.webp','assets/images/cases/phlor/4.webp','assets/images/cases/phlor/5.webp','assets/images/cases/phlor/6.webp','assets/images/cases/phlor/7.webp','assets/images/cases/phlor/8.webp','assets/images/cases/phlor/9.webp','assets/images/cases/phlor/10.webp','assets/images/cases/phlor/11.webp','assets/images/cases/phlor/12.webp','assets/images/cases/phlor/13.webp','assets/images/cases/phlor/14.webp','assets/images/cases/phlor/15.webp'] },
  { project: 'metallo',  label: 'Metallo',
    picks: ['assets/images/cases/metallo/1.webp','assets/images/cases/metallo/3.webp','assets/images/cases/metallo/5.webp'],
    all:   ['assets/images/cases/metallo/1.webp','assets/images/cases/metallo/2.webp','assets/images/cases/metallo/3.webp','assets/images/cases/metallo/4.webp','assets/images/cases/metallo/5.webp','assets/images/cases/metallo/6.webp'] },
  { project: 'papeltec', label: 'Papeltec',
    picks: ['assets/images/cases/papeltec/1.webp','assets/images/cases/papeltec/4.webp','assets/images/cases/papeltec/7.webp'],
    all:   ['assets/images/cases/papeltec/1.webp','assets/images/cases/papeltec/2.webp','assets/images/cases/papeltec/3.webp','assets/images/cases/papeltec/4.webp','assets/images/cases/papeltec/5.webp','assets/images/cases/papeltec/6.webp','assets/images/cases/papeltec/7.webp','assets/images/cases/papeltec/Frame 2629.webp','assets/images/cases/papeltec/Frame 2630.webp'] },
  { project: 'caixa',    label: 'Caixa',
    picks: ['assets/images/cases/caixa.webp'],
    all:   ['assets/images/cases/caixa.webp'] },
  { project: 'natura',   label: 'Natura',
    picks: ['assets/images/cases/natura.webp'],
    all:   ['assets/images/cases/natura.webp'] },
  { project: 'ativa',    label: 'Ativa',
    picks: ['assets/images/cases/ativa/1.webp','assets/images/cases/ativa/3.webp','assets/images/cases/ativa/5.webp'],
    all:   ['assets/images/cases/ativa/1.webp','assets/images/cases/ativa/2.webp','assets/images/cases/ativa/3.webp','assets/images/cases/ativa/4.webp','assets/images/cases/ativa/5.webp','assets/images/cases/ativa/6.webp'] },
  { project: 'vibra',    label: 'Vibra Picto',
    picks: ['assets/images/cases/vibra/1.webp','assets/images/cases/vibra/3.webp','assets/images/cases/vibra/5.webp'],
    all:   ['assets/images/cases/vibra/1.webp','assets/images/cases/vibra/2.webp','assets/images/cases/vibra/3.webp','assets/images/cases/vibra/4.webp','assets/images/cases/vibra/5.webp','assets/images/cases/vibra/6.webp','assets/images/cases/vibra/7.webp'] },
  { project: 'mdesign',  label: 'MDesign',
    picks: ['assets/images/cases/mdesign/1.gif','assets/images/cases/mdesign/571399534.webp','assets/images/cases/mdesign/Frame 84.webp'],
    all:   ['assets/images/cases/mdesign/1.gif','assets/images/cases/mdesign/571399534.webp','assets/images/cases/mdesign/571399535.webp','assets/images/cases/mdesign/Envelope.webp','assets/images/cases/mdesign/Frame 2.webp','assets/images/cases/mdesign/Frame 3.webp','assets/images/cases/mdesign/Frame 84.webp'] },
  { project: '99',       label: '99',
    picks: ['assets/images/cases/99/imageye___-_6924204799d08a071d58f46b_tatil-99-nova-linguagem-visual-escalator-advertisement.webp','assets/images/cases/99/imageye___-_6924205edf44a64f77a34a72_tatil-99-nova-linguagem-visual-framed-posters-gallery.webp','assets/images/cases/99/imageye___-_692420b0ceb4d12ea2ac9faa_tatil-99-nova-linguagem-visual-map-of-sao-paulo.webp'],
    all:   ['assets/images/cases/99/imageye___-_6924204799d08a071d58f46b_tatil-99-nova-linguagem-visual-escalator-advertisement.webp','assets/images/cases/99/imageye___-_69242056d05392e7c6377003_tatil-99-nova-linguagem-visual-bold-yellow-text.webp','assets/images/cases/99/imageye___-_6924205a73c8da16db0f5660_tatil-99-nova-linguagem-visual-smartphone-displaying-app.webp','assets/images/cases/99/imageye___-_6924205edf44a64f77a34a72_tatil-99-nova-linguagem-visual-framed-posters-gallery.webp','assets/images/cases/99/imageye___-_69242084e72288e44cd8981f_tatil-99-nova-linguagem-visual-notebook-with-yellow-design.webp','assets/images/cases/99/imageye___-_692420acdb6ccb7c5603d7ff_tatil-99-nova-linguagem-visual-open-book-with-yellow-pages.webp','assets/images/cases/99/imageye___-_692420b0ceb4d12ea2ac9faa_tatil-99-nova-linguagem-visual-map-of-sao-paulo.webp','assets/images/cases/99/imageye___-_692420b5b54d651606e73bfa_tatil-99-nova-linguagem-visual-collage-of-graphics-and-photos.webp','assets/images/cases/99/imageye___-_692420bf6219eca972b28b79_tatil-99-nova-linguagem-visual-yellow-graphic-design.webp','assets/images/cases/99/imageye___-_692420c563bdeb9ba92f8b11_tatil-99-nova-linguagem-visual-car-ride-experience.webp','assets/images/cases/99/imageye___-_692420cb09c8c9bc1c417079_tatil-99-nova-linguagem-visual-app-interface-for-women-drivers.webp','assets/images/cases/99/imageye___-_69331acb62c25635edf11e0b_tatil-99-nova-linguagem-visual-aerial-parking-lot.webp','assets/images/cases/99/10.mp4'] },
  { project: 'martorelli', label: 'Martorelli',
    picks: ['assets/images/cases/martorelli/1.webp','assets/images/cases/martorelli/3.webp','assets/images/cases/martorelli/5.webp'],
    all:   ['assets/images/cases/martorelli/1.webp','assets/images/cases/martorelli/2.mov','assets/images/cases/martorelli/3.webp','assets/images/cases/martorelli/4.webp','assets/images/cases/martorelli/5.webp','assets/images/cases/martorelli/6.mov','assets/images/cases/martorelli/9.webp','assets/images/cases/martorelli/10.webp','assets/images/cases/martorelli/11.webp','assets/images/cases/martorelli/12.webp','assets/images/cases/martorelli/13.webp','assets/images/cases/martorelli/14.webp','assets/images/cases/martorelli/15.webp','assets/images/cases/martorelli/16.webp'] },
];

function initGallery() {
  const section = document.getElementById('gallery');
  if (!section) return;

  // Label
  const label = document.createElement('p');
  label.className = 'gallery-label';
  label.textContent = 'Gallery';
  section.appendChild(label);

  // Flat list of gallery items (shuffled)
  const flat = [];
  GALLERY_DATA.forEach(({ project, label: proj, picks, all }) => {
    picks.forEach(src => flat.push({ src, project, label: proj, all }));
  });
  shuffle(flat);

  // Scatter layout: 5 x-zones
  const zones   = [3, 19, 38, 57, 73]; // % from left
  const zoneY   = zones.map(() => 0);
  const IMG_H   = 200; // fixed image height (px)
  const CAP_H   = 24;
  const GAP_MIN = 70;
  const GAP_RND = 140;

  const canvas = document.createElement('div');
  canvas.className = 'gallery-canvas';
  section.appendChild(canvas);

  flat.forEach(item => {
    // Place in shortest zone, with slight randomness to avoid strict ordering
    const candidates = zoneY.map((y, i) => ({ i, y })).sort((a, b) => a.y - b.y).slice(0, 3);
    const chosen = candidates[Math.floor(Math.random() * candidates.length)];
    const zoneIdx = chosen.i;

    const topGap  = GAP_MIN + Math.floor(Math.random() * GAP_RND);
    const top     = zoneY[zoneIdx] + (zoneY[zoneIdx] === 0 ? Math.floor(Math.random() * 80) : topGap);

    const el = document.createElement('div');
    el.className = 'gallery-item';
    el.style.left = zones[zoneIdx] + '%';
    el.style.top  = top + 'px';
    el.dataset.project = item.project;

    const img = document.createElement('img');
    img.src     = item.src;
    img.alt     = '';
    img.loading = 'lazy';

    const cap = document.createElement('p');
    cap.className   = 'gallery-item-caption';
    cap.textContent = item.label;

    el.appendChild(img);
    el.appendChild(cap);
    canvas.appendChild(el);

    el.addEventListener('click', () => openLightbox(item.all, item.all.indexOf(item.src), item.label));

    zoneY[zoneIdx] = top + IMG_H + CAP_H + GAP_MIN;
  });

  canvas.style.height = Math.max(...zoneY) + 80 + 'px';

  // ── Lightbox ────────────────────────────────────────────────────
  const lb      = document.createElement('div');
  lb.className  = 'gallery-lightbox';
  lb.innerHTML  = `
    <button class="gallery-lb-close" aria-label="Close">✕</button>
    <button class="gallery-lb-prev"  aria-label="Previous">←</button>
    <img class="gallery-lightbox-img" src="" alt="" />
    <button class="gallery-lb-next"  aria-label="Next">→</button>
    <span class="gallery-lb-project"></span>
    <span class="gallery-lb-counter"></span>
  `;
  document.body.appendChild(lb);

  const lbImg     = lb.querySelector('.gallery-lightbox-img');
  const lbCounter = lb.querySelector('.gallery-lb-counter');
  const lbProject = lb.querySelector('.gallery-lb-project');
  let lbImgs = [], lbIdx = 0;

  function openLightbox(imgs, startIdx, projectLabel) {
    lbImgs = imgs;
    lbIdx  = Math.max(0, startIdx);
    lbProject.textContent = projectLabel;
    showLbSlide(lbIdx);
    lb.classList.add('visible');
  }

  function showLbSlide(idx) {
    lbImg.classList.add('fading');
    setTimeout(() => {
      lbImg.src = lbImgs[idx];
      lbCounter.textContent = (idx + 1) + ' / ' + lbImgs.length;
      lbImg.classList.remove('fading');
    }, 160);
  }

  lb.querySelector('.gallery-lb-close').addEventListener('click', () => lb.classList.remove('visible'));
  lb.addEventListener('click', e => { if (e.target === lb) lb.classList.remove('visible'); });

  lb.querySelector('.gallery-lb-prev').addEventListener('click', e => {
    e.stopPropagation();
    lbIdx = (lbIdx - 1 + lbImgs.length) % lbImgs.length;
    showLbSlide(lbIdx);
  });
  lb.querySelector('.gallery-lb-next').addEventListener('click', e => {
    e.stopPropagation();
    lbIdx = (lbIdx + 1) % lbImgs.length;
    showLbSlide(lbIdx);
  });

  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('visible')) return;
    if (e.key === 'Escape')      lb.classList.remove('visible');
    if (e.key === 'ArrowLeft')   { lbIdx = (lbIdx - 1 + lbImgs.length) % lbImgs.length; showLbSlide(lbIdx); }
    if (e.key === 'ArrowRight')  { lbIdx = (lbIdx + 1) % lbImgs.length; showLbSlide(lbIdx); }
  });

  let galleryTouchX = 0;
  lb.addEventListener('touchstart', e => { galleryTouchX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - galleryTouchX;
    if (Math.abs(dx) > 50) {
      lbIdx = dx < 0 ? (lbIdx + 1) % lbImgs.length : (lbIdx - 1 + lbImgs.length) % lbImgs.length;
      showLbSlide(lbIdx);
    }
  });
}

/* ─── Hero card gather animation ────────────────────────────────── */
function initHeroCards() {
  const cards     = document.querySelectorAll('.hero-card');
  const hero      = document.querySelector('.hero-section');
  const photoCard = hero ? hero.querySelector('.hero-photo-card') : null;
  if (!cards.length) return;

  const UNIT     = window.innerWidth <= 768 ? 85 : 170;
  const HOLD_MS  = 3000; // 3s spread before gathering
  let   autoTimer = null;

  function hidePhotoCard() {
    if (photoCard) { photoCard.style.transition = 'none'; photoCard.style.opacity = '0'; }
  }
  function showPhotoCard() {
    if (photoCard) { photoCard.style.transition = 'opacity 0.4s ease'; photoCard.style.opacity = '1'; }
  }

  // Instant gather (no animation) — used as reset state
  function snapGathered() {
    clearTimeout(autoTimer);
    hidePhotoCard();
    cards.forEach(card => {
      card.style.transition = 'none';
      card.style.transform  = 'translateX(0)';
      card.style.opacity    = '1';
    });
  }

  // Animated spread from center → then auto-gather after HOLD_MS
  function animateSpreadThenGather() {
    clearTimeout(autoTimer);
    hidePhotoCard();

    // Spread: inner cards go first (lower delay), outer arrive last
    cards.forEach(card => {
      const order = parseInt(card.dataset.order);
      const d = (order - 1) * 80; // inner first
      const x = card.dataset.side === 'left' ? -(order * UNIT) : (order * UNIT);
      card.style.transition = `transform 0.8s cubic-bezier(0.25,0.46,0.45,0.94) ${d}ms`;
      card.style.transform  = `translateX(${x}px)`;
      card.style.opacity    = '1';
    });

    // After HOLD_MS, gather back
    autoTimer = setTimeout(() => {
      cards.forEach(card => {
        const order = parseInt(card.dataset.order);
        const d = (order - 1) * 60;
        card.style.transition = `transform 0.9s cubic-bezier(0.25,0.46,0.45,0.94) ${d}ms, opacity 0.5s ease ${d}ms`;
        card.style.transform  = 'translateX(0)';
        card.style.opacity    = '1';
      });
      setTimeout(showPhotoCard, 900 + (4 - 1) * 60 + 100);
    }, HOLD_MS);
  }

  // Start gathered (hidden by typewriter on first visit)
  snapGathered();

  // Called by typewriter after stage reveals, or immediately on repeat visits
  function activate() {
    animateSpreadThenGather();
  }

  // Re-trigger when scrolling back to hero (not on initial load)
  if (hero) {
    let heroWasHidden = false;
    new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) {
        heroWasHidden = true;
        snapGathered();
      } else if (heroWasHidden) {
        heroWasHidden = false;
        setTimeout(activate, 200);
      }
    }, { threshold: 0.4 }).observe(hero);
  }

  // Re-trigger on Home nav click — prevent reload, scroll to top instead
  document.querySelectorAll('a[href="index.html"], a[href="/"]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(activate, 600);
    });
  });

  return activate;
}

/* ─── Bio parallax scale ─────────────────────────────────────────── */
function initBioParallax() {
  if (window.innerWidth <= 768) return;
  const section = document.querySelector('.bio-section');
  if (!section) return;

  section.style.transformOrigin = 'center center';

  function update() {
    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight;
    // 0 when element top hits bottom of screen, 1 when it reaches 30% from top
    const progress = Math.min(1, Math.max(0, (vh - rect.top) / (vh * 0.7)));
    const scale = 0.6 + progress * 0.4;
    section.style.transform = `scale(${scale})`;
    section.style.opacity = progress;
  }

  window.addEventListener('scroll', update, { passive: true });
}

/* ─── Hello greeting (first visit only) ─────────────────────────── */
function initHelloGreeting(armGather) {
  const stage   = document.querySelector('.hero-card-stage');
  const tagline = document.querySelector('.welcome-tagline');
  const title   = document.querySelector('.hero-title');
  const FIRST_VISIT_KEY = 'mf-intro-seen';
  const firstVisit = !localStorage.getItem(FIRST_VISIT_KEY);

  // Greeting only on home page
  const path = window.location.pathname;
  const isHome = path === '/' || path.endsWith('index.html') || path === '';
  if (!isHome) return;

  // Skip greeting when navigating directly to #work (or any hash anchor)
  if (window.location.hash) {
    if (stage)   stage.style.opacity   = '1';
    if (tagline) tagline.style.opacity = '1';
    if (title)   title.style.opacity   = '1';
    if (!firstVisit && armGather) armGather();
    else if (armGather) { localStorage.setItem(FIRST_VISIT_KEY, '1'); armGather(); }
    return;
  }

  if (!firstVisit) {
    [stage, tagline, title].forEach(el => {
      if (el) { el.style.opacity = '0'; el.style.transition = 'none'; }
    });

    const retGreeting = document.createElement('div');
    retGreeting.className = 'hello-greeting';
    retGreeting.textContent = getTranslation('hero_hello_return');
    document.body.appendChild(retGreeting);
    requestAnimationFrame(() => requestAnimationFrame(() => retGreeting.classList.add('visible')));

    setTimeout(() => {
      retGreeting.style.transition = 'opacity 0.5s ease';
      retGreeting.style.opacity = '0';
      setTimeout(() => {
        retGreeting.remove();
        [title, stage, tagline].forEach(el => {
          if (!el) return;
          el.style.transition = 'opacity 0.6s ease';
          el.style.opacity = '1';
        });
        if (armGather) armGather();
      }, 500);
    }, 1400);
    return;
  }

  localStorage.setItem(FIRST_VISIT_KEY, '1');

  [stage, tagline, title].forEach(el => {
    if (el) { el.style.opacity = '0'; el.style.transition = 'none'; }
  });

  const greeting = document.createElement('div');
  greeting.className = 'hello-greeting';
  greeting.textContent = getTranslation('hero_hello');
  document.body.appendChild(greeting);

  requestAnimationFrame(() => requestAnimationFrame(() => greeting.classList.add('visible')));

  setTimeout(() => {
    greeting.style.transition = 'opacity 0.5s ease';
    greeting.style.opacity = '0';
    setTimeout(() => {
      greeting.remove();
      [title, stage, tagline].forEach(el => {
        if (!el) return;
        el.style.transition = 'opacity 0.6s ease';
        el.style.opacity = '1';
      });
      if (armGather) armGather();
    }, 500);
  }, 1800);
}

/* ─── Mobile nav toggle ──────────────────────────────────────────── */
function initMobileNav() {
  const btn  = document.querySelector('.nav-fish-btn');
  const pill = document.querySelector('.nav-fish-pill');
  if (!btn || !pill) return;

  btn.addEventListener('click', () => {
    if (window.innerWidth > 768) return;
    pill.classList.toggle('is-open');
  });

  pill.querySelectorAll('.nav-fish-link').forEach(link => {
    link.addEventListener('click', () => pill.classList.remove('is-open'));
  });

  document.addEventListener('touchstart', e => {
    if (window.innerWidth > 768) return;
    if (!e.target.closest('.nav-fish-wrap')) pill.classList.remove('is-open');
  }, { passive: true });
}

/* ─── Init ───────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  window.scrollTo(0, 0);
  initOverlay();
  const armGather = initHeroCards();
  initScrollTop();
  initWorkReveal();
  initAudio();
  initHeaderScroll();
  initBioFade();
  initBioParallax();
  initFeedShowcase();
  initWorkTable();
  initFooterMeta();
  await initI18n();
  initHelloGreeting(armGather);
  initCopyEmail();
  initMobileNav();
});
