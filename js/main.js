import { initI18n, getTranslation } from './i18n.js';
import { initFooterMeta } from './footer.js';
import { initCursor } from './cursor.js';
import { initWelcome } from './welcome.js';

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
function spawnSparkles(btn) {
  const rect = btn.getBoundingClientRect();
  const cx = rect.left + rect.width  / 2;
  const cy = rect.top  + rect.height / 2;
  Array.from({ length: 6 }, (_, i) => {
    const el = document.createElement('div');
    el.textContent = '✨';
    el.style.cssText = [
      'position:fixed', 'font-size:1rem', 'pointer-events:none', 'z-index:9999',
      `top:${cy}px`, `left:${cx}px`,
      'transform:translate(-50%,-50%)',
      'opacity:1',
      "font-family:'NotoEmoji',sans-serif", 'font-weight:700',
      'transition:transform 0.65s ease, opacity 0.65s ease',
    ].join(';');
    document.body.appendChild(el);
    const angle = (i / 6) * Math.PI * 2;
    const d = 44 + Math.random() * 22;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.style.transform = `translate(calc(-50% + ${Math.cos(angle)*d}px), calc(-50% + ${Math.sin(angle)*d}px))`;
      el.style.opacity   = '0';
    }));
    setTimeout(() => el.remove(), 750);
  });
}

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

  const bioBtn = document.getElementById('bio-lets-talk');
  if (bioBtn) {
    bioBtn.addEventListener('click', () => {
      spawnSparkles(bioBtn);
      const footer = document.querySelector('.site-footer');
      if (footer) footer.scrollIntoView({ behavior: 'smooth' });
    });
  }
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
function initAudio() {
  const btn   = document.getElementById('audio-btn');
  const audio = document.getElementById('bg-audio');
  if (!btn || !audio) return;

  function toggle() {
    if (audio.paused) {
      audio.play().then(() => {
        btn.classList.add('playing');
        btn.setAttribute('aria-pressed', 'true');
      }).catch(() => {});
    } else {
      audio.pause();
      btn.classList.remove('playing');
      btn.setAttribute('aria-pressed', 'false');
    }
  }

  btn.addEventListener('click', toggle);

  // Barra de espaço liga/desliga o som em qualquer ponto da página
  document.addEventListener('keydown', e => {
    if (e.code !== 'Space' || e.repeat) return;
    const t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    e.preventDefault();
    toggle();
  });
}

/* ─── Header scroll — transparent + auto-hide over showcase ─────── */
function initHeaderScroll() {
  const header   = document.querySelector('.site-header');
  const showcase = document.getElementById('work');
  if (!header) return;

  let hideTimer   = null;
  let lastScrollY = window.scrollY;
  let isOnFooter  = false;

  const footer = document.querySelector('.site-footer');
  if (footer) {
    new IntersectionObserver(([e]) => {
      isOnFooter = e.isIntersecting;
      header.classList.toggle('is-footer', isOnFooter);
      if (isOnFooter) showHeader();
    }, { threshold: 0.05 }).observe(footer);
  }

  function showHeader() {
    clearTimeout(hideTimer);
    header.classList.remove('is-hidden');
  }

  function scheduleHide() {
    if (isOnFooter) return;
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
      timer = setTimeout(next, 2500);
    }
  }

  section.addEventListener('click', () => {
    clearTimeout(timer);
    next();
  });

  next();
}

/* ─── Project data ───────────────────────────────────────────────── */
const PROJECT_DATA = {
  "enjoei": {
    "client": "Enjoei",
    "detail": {
      "pt": "Enjoei chegou a um momento de virada. Nascida da cultura da internet, a marca havia acumulado códigos, referências e diferentes formas de expressão ao longo dos anos. O desafio era organizar esse repertório e trazer mais maturidade ao sistema sem perder a irreverência que sempre fez parte da sua personalidade.\n\nA nova identidade transforma essa diversidade em um sistema de expressão. O logotipo foi redesenhado e novos ativos proprietários ampliaram o universo da marca. Entre eles está a Enjoei Display, uma tipografia criada sob medida para assumir diferentes climas e personalidades. A tecnologia também passou a fazer parte da linguagem por meio de uma ferramenta generativa capaz de transformar letras em padrões, estampas e composições para diferentes pontos de contato.\n\nComo Designer Sênior, participei do desenvolvimento da identidade visual e da construção dos principais ativos do sistema. Atuei na criação da Enjoei Display com a Blackletra, no desenvolvimento da ferramenta generativa com André Burnier e em todas as apresentações e na construção dos cases do projeto.",
      "en": "Enjoei reached a turning point. Born from internet culture, the brand had accumulated a wide mix of codes, references and ways of expressing itself over the years. The challenge was to bring more structure and maturity to that universe without losing the irreverence that had always defined its personality.\n\nThe new identity turns this diversity into a system for expression. The logo was redesigned and a set of proprietary assets expanded the brand world. One of them is Enjoei Display, a custom typeface designed to shift across different moods and personalities. Technology also became part of the visual language through a generative tool that transforms letterforms into patterns, prints and compositions across multiple touchpoints.\n\nAs a Senior Designer, I helped develop the visual identity and shape the system's core assets. I worked with Blackletra on Enjoei Display and with André Burnier on the generative tool. I was also involved in every presentation and in the development of the project case studies."
    },
    "credits": [
      [
        {
          "pt": "Design",
          "en": "Design"
        },
        "Eduardo França, Gustavo André, Mauricio Filho, Mariana Hermeto",
        {
          "dir": "Dandara Almeida"
        }
      ],
      [
        {
          "pt": "Estratégia",
          "en": "Strategy"
        },
        "Anna Carla, Carol Polli, Sarah Stutz",
        {
          "dir": "Paula Marchiori"
        }
      ],
      [
        {
          "pt": "Verbal",
          "en": "Copywriting"
        },
        "Elen Campos, Vallécia Carvalho"
      ],
      [
        {
          "pt": "Parceiros",
          "en": "Partners"
        },
        "Blackletra — Enjoei Display",
        "André Burnier — Programação Criativa",
        "Consoante — Identidade Sonora"
      ]
    ],
    "studio": "Tátil Design",
    "recognition": [
      "Brazil Design Award (BDA) 2023",
      "🥇 Craft for Design / Typography",
      "🥈 Graphic Design / Brand Design",
      "🥈 Branding / Creative Programming",
      "🥉 Graphic Design / Brand Design",
      "Latin American Design Awards (LAD) 2023",
      "🥇 Typography / Kinetic",
      "🥈 Digital / Experimental",
      "ADG Brazilian Graphic Design Biennial 2024",
      "📕 Enjoei Display Variable Font"
    ],
    "behance": "https://www.behance.net/gallery/167548923/Enjoei"
  },
  "mdesign": {
    "client": "M Design Studio",
    "detail": {
      "pt": "A M Design Studio nasceu no Brasil a partir de uma sólida experiência em marcenaria e mobiliário sob medida. Ao expandir sua atuação para o mercado americano, encontrou uma categoria em que a ideia de personalização nem sempre representa soluções realmente únicas. O desafio era reposicionar o estúdio para comunicar um nível mais profundo de autoria e personalização sem perder a precisão e a linguagem contemporânea que já faziam parte do seu trabalho.\n\nO posicionamento parte de uma ideia simples: cada projeto deve nascer das pessoas e dos espaços que irá ocupar. A M Design Studio passa a se apresentar não apenas como uma marcenaria, mas como um estúdio de design envolvido em todo o processo. A identidade visual traduz essa abordagem ao combinar referências técnicas da fabricação com uma expressão tipográfica mais humana. Método e craft convivem em um sistema que dá suporte aos projetos sem competir com eles.\n\nComo designer independente, conduzi todo o rebranding, do reposicionamento à construção da identidade visual e das animações que ajudam a traduzir a ideia de modularidade e processo artesanal. O projeto se sintetiza em uma ideia central: criar espaços que façam sentido para o lugar e para as pessoas que vivem nele.",
      "en": "M Design Studio was founded in Brazil on a strong background in bespoke cabinetry and furniture. As the studio expanded into the US market, it entered a category where the idea of customization does not always result in truly unique solutions. The challenge was to reposition the studio around a deeper sense of authorship and personalization while preserving the precision and contemporary character already present in its work.\n\nThe positioning starts from a simple idea: every project should begin with the people and the spaces it is made for. M Design Studio is presented not simply as a cabinetry company but as a design studio involved throughout the process. The visual identity reflects this approach by combining technical references from fabrication with a more human typographic expression. Method and craft coexist in a system that supports the work without competing with it.\n\nAs an independent designer, I led the entire rebrand from positioning to the visual identity and the animations that express its modular thinking and handcrafted process. The project comes down to one central idea: creating spaces that make sense for the place and the people who live in it."
    },
    "credits": [
      [
        {
          "pt": "Estratégia, Design & Motion",
          "en": "Strategy, Design & Motion"
        },
        "Mauricio Filho"
      ]
    ]
  },
  "justos": {
    "client": "Justos",
    "detail": {
      "pt": "A Justos nasceu com a ambição de repensar a relação das pessoas com seguros. Em uma categoria marcada pela complexidade e pela distância, a marca propõe usar tecnologia e dados para incentivar uma direção mais consciente e construir relações mais transparentes com motoristas. O desafio era transformar esse posicionamento em uma identidade simples, reconhecível e capaz de questionar os códigos tradicionais do setor.\n\nO sistema visual parte da linguagem da sinalização e dos elementos presentes no trânsito. Formas geométricas e símbolos familiares são reorganizados para construir uma identidade direta e dinâmica. A linguagem verbal complementa o sistema ao simplificar informações e abandonar o tradicional segurês. Juntos, esses elementos dão forma a uma marca que entende o avanço como uma construção coletiva.\n\nComo Designer Sênior, participei do desenvolvimento da identidade visual. Atuei no desdobramento das aplicações da marca, no brandbook e na construção dos cases do projeto.",
      "en": "Justos was created to rethink the relationship people have with insurance. In a category often defined by complexity and distance, the brand uses technology and data to encourage more conscious driving and build more transparent relationships with drivers. The challenge was to turn that ambition into an identity that felt simple, recognizable and willing to challenge the conventions of the category.\n\nThe visual system draws from road signage and the familiar language of traffic. Geometric forms and recognizable symbols are reorganized into a direct and dynamic identity. The verbal language supports the system by simplifying information and moving away from traditional insurance jargon. Together, these elements shape a brand that sees progress as something built collectively.\n\nAs a Senior Designer, I contributed to the development of the visual identity. My work focused on brand applications, the brand guidelines and the project case studies."
    },
    "credits": [
      [
        {
          "pt": "Design",
          "en": "Design"
        },
        "Camilla Mattos, Gustavo André, Eduardo França, Mauricio Filho, Mariana Hermeto",
        {
          "dir": "Dandara Almeida"
        }
      ],
      [
        {
          "pt": "Verbal",
          "en": "Copywriting"
        },
        "Ana Cunha, Mila Bartilotti, Lourenço Araujo"
      ]
    ],
    "studio": "Tátil Design",
    "behance": "https://www.behance.net/gallery/192085867/Justos"
  },
  "metallo": {
    "client": "Metallo",
    "detail": {
      "pt": "A Metallo é uma marca de móveis e objetos sob medida em metal, criada em 2020. Sua identidade original já trazia precisão, respiro e um gesto tipográfico sutil na letra T, inspirado na sombra de uma mesa, um dos produtos de maior saída no momento em que a marca foi criada. Anos depois, o desafio foi revisitar essa base para ampliar sua presença e distinção sem abandonar a elegância que sempre definiu a marca.\n\nA atualização coloca materialidade, peso e processo no centro da linguagem. O azul profundo ganha mais presença e funciona como base estrutural do sistema. Texturas metálicas e enquadramentos rígidos reforçam sua lógica construtiva. A tipografia assume um papel mais expressivo e encontra beleza nas pequenas imperfeições do processo de fabricação. O logotipo original foi preservado. A evolução acontece ao seu redor por meio de novas relações de cor, escala, composição e ritmo.\n\nComo designer independente, fui responsável tanto pela identidade original, criada em 2020, quanto por sua evolução. Conduzi a direção de arte, o desenvolvimento do sistema visual e suas principais aplicações, preservando o que já pertencia à marca enquanto ampliava sua expressão.",
      "en": "Metallo is a custom furniture and object brand focused on metalwork. I created its original identity in 2020 around precision, space and a subtle typographic gesture in the letter T. The detail was inspired by the shadow of a table, one of the brand's best-selling pieces at the time. Years later, the challenge was to revisit that foundation and give the brand more presence and distinction without losing the elegance that had defined it from the start.\n\nThe refresh puts materiality, weight and process at the center of the visual language. A deep blue becomes the structural base of the system. Metallic textures and rigid framing reinforce the logic of fabrication. Typography takes on a more expressive role and finds character in the small imperfections of the making process. The original logo remains unchanged. Instead, the evolution happens around it through new relationships of color, scale, composition and rhythm.\n\nAs an independent designer, I was responsible for both the original 2020 identity and its evolution. I led the art direction, visual system and key applications while preserving what already belonged to the brand and expanding the way it could express itself."
    },
    "credits": [
      [
        {
          "pt": "Design & Direção de Arte",
          "en": "Design & Art Direction"
        },
        "Mauricio Filho"
      ]
    ]
  },
  "99": {
    "client": "99",
    "detail": {
      "pt": "A 99 ocupa um papel importante na conexão entre pessoas, lugares e oportunidades em todo o Brasil. Com a ampliação do seu ecossistema, surgiu a necessidade de expressar com mais clareza um propósito para a marca: cuidar das pessoas e abrir caminhos para novas histórias. O desafio era evoluir uma identidade já amplamente reconhecida sem perder sua proximidade com a vida cotidiana das cidades.\n\nA nova linguagem parte dos códigos visuais do ambiente urbano e de seus fluxos constantes. Contornos, rotas e mapas se transformam em um sistema de padrões e elementos gráficos modulares. A identidade ganha flexibilidade para acompanhar diferentes contextos da plataforma e, ao mesmo tempo, reforça a conexão entre passageiros, motoristas e as comunidades das quais fazem parte.\n\nComo Designer, participei do desenvolvimento e do desdobramento do sistema de identidade visual. Contribuí para a construção dos ativos gráficos, das aplicações da marca, dos materiais de comunicação, das apresentações e dos cases do projeto.",
      "en": "99 plays an important role in connecting people, places and opportunities across Brazil. As its ecosystem expanded, the brand needed a clearer expression of its purpose: caring for people while opening paths for new stories. The challenge was to evolve an identity that was already widely recognized without losing its connection to the everyday life of Brazilian cities.\n\nThe new language draws from the visual codes of the urban environment and its constant flows. Routes, contours and maps become a system of patterns and modular graphic elements. This gives the identity enough flexibility to move across different parts of the platform while reinforcing the relationship between passengers, drivers and the communities around them.\n\nAs a Designer, I contributed to the development and rollout of the visual identity system. My work included graphic assets, brand applications, communication materials, presentations and the project case studies."
    },
    "credits": [
      [
        {
          "pt": "Design",
          "en": "Design"
        },
        "Gustavo André, Eduardo França, Mauricio Filho, Lays Santos",
        {
          "dir": "Dandara Almeida"
        }
      ],
      [
        {
          "pt": "Estratégia",
          "en": "Strategy"
        },
        "Paula Marchiori, Carol Avari"
      ],
      [
        {
          "pt": "Verbal",
          "en": "Copywriting"
        },
        "Ana Cunha, Mila Bartilotti"
      ]
    ],
    "studio": "Tátil Design",
    "recognition": [
      "Brazil Design Award (BDA) 2022",
      "🥉 Graphic Design"
    ],
    "behance": "https://www.behance.net/gallery/152582735/99-nova-linguagem-visual"
  },
  "phlor": {
    "client": "Phlor",
    "detail": {
      "pt": "A Phlor nasceu da ideia de que pequenos rituais podem transformar a relação que temos com os espaços e com nós mesmos. Criada para uma linha de fragrâncias e produtos para ambientes, a marca precisava traduzir cuidado, individualidade e sensorialidade em uma expressão própria. O desafio era construir uma identidade sofisticada sem perder seu caráter humano e contemplativo.\n\nO conceito de transformação orienta todo o sistema. O logotipo combina símbolo e lettering proprietários em uma espiral que sugere expansão e movimento. A tipografia se inspira no comportamento das chamas e na natureza mutável dos aromas. Elementos naturais também orientam a paleta e as ilustrações, criando padrões orgânicos que conectam embalagens e diferentes pontos de contato.\n\nComo designer independente, conduzi todas as etapas do projeto, da concepção da marca ao desenvolvimento da identidade visual. Fui responsável também pelo design das embalagens e pela direção de arte da fotografia dos produtos, construindo uma experiência que refletia o posicionamento em todos os pontos de contato.",
      "en": "Phlor was created around the idea that small rituals can transform the way we relate to our spaces and to ourselves. Built around a collection of fragrances and products for the home, the brand needed to express care, individuality and sensoriality in a distinctive way. The challenge was to create a sophisticated identity without losing its human and contemplative character.\n\nTransformation became the foundation of the system. The logo combines a custom symbol and lettering in a spiral that suggests expansion and movement. The typography draws from the behavior of flames and the changing nature of scent. Natural references also shape the color palette and illustrations, creating organic patterns that connect packaging with the wider brand experience.\n\nAs an independent designer, I led every stage of the project from the initial brand concept to the visual identity. I was also responsible for packaging design and the art direction of the product photography, building an experience that reflected the positioning across every touchpoint."
    },
    "credits": [
      [
        {
          "pt": "Design & Direção de Arte",
          "en": "Design & Art Direction"
        },
        "Mauricio Filho"
      ],
      [
        {
          "pt": "Parceiros",
          "en": "Partners"
        },
        "Órix Media House — Fotografia"
      ]
    ],
    "behance": "https://www.behance.net/gallery/206100963/Phlor"
  },
  "natura-homem": {
    "client": "Natura",
    "detail": {
      "pt": "Natura Homem é a linha de perfumaria masculina de uma das maiores marcas de beleza do Brasil. O projeto propôs uma evolução de toda a linha para integrar suas comunicações e representar diferentes expressões do homem contemporâneo. O desafio era construir um sistema capaz de acolher essas múltiplas facetas sob uma mesma ideia: cuidar de si e do outro também é uma forma de potência.\n\nO sistema organiza as fragrâncias em plataformas que representam diferentes momentos e intensidades. A direção de arte transforma cada conceito em uma expressão visual própria por meio de casting, still e captação hipersensorial. Cada plataforma recebe uma direção específica de luz e styling. Paleta e materialidade completam a diferenciação sem romper a unidade do conjunto. O resultado é uma linguagem sensorial que permite reconhecer cada fragrância como parte de um mesmo universo.\n\nComo Designer Sênior na Tátil, participei do design e da direção de arte das fotografias. Atuei na tradução de cada conceito em imagens de casting, still e captação hipersensorial, buscando uma expressão própria para cada plataforma sem perder a coerência que unifica o sistema de Natura Homem.",
      "en": "Natura Homem is the men's fragrance line of one of Brazil's largest beauty brands. The project evolved the full portfolio to create a more integrated communication system and represent different expressions of contemporary masculinity. The challenge was to bring those different facets together around one idea: caring for yourself and for others can also be a form of strength.\n\nThe system organizes the fragrances into platforms built around different moments and intensities. Art direction gives each concept its own visual expression through casting, still life and hypersensory imagery. Each platform has a distinct approach to lighting and styling. Color and materiality add further differentiation without breaking the unity of the collection. The result is a sensorial language that makes each fragrance feel distinct while clearly belonging to the same world.\n\nAs a Senior Designer at Tátil, I worked on the design and art direction of the photography. I translated each concept into casting, still life and hypersensory imagery, giving every platform its own expression while maintaining the coherence of the Natura Homem system."
    },
    "credits": [
      [
        {
          "pt": "Direção Criativa",
          "en": "Creative Direction"
        },
        "Julia Liberati, Beto Bicesto"
      ],
      [
        {
          "pt": "Gerência de Criação",
          "en": "Creative Management"
        },
        "Hudson Girundi"
      ],
      [
        {
          "pt": "Design",
          "en": "Design"
        },
        "Cahue Abatipietro, Carolina Pinheiro, Gustavo Crivellari, Mauricio Filho"
      ],
      [
        {
          "pt": "Design 3D",
          "en": "3D Design"
        },
        "Arthur Figueiredo"
      ],
      [
        {
          "pt": "Redação",
          "en": "Copywriting"
        },
        "Daniela Varanda"
      ],
      [
        {
          "pt": "Produção Executiva",
          "en": "Executive Production"
        },
        "Gazpacho Produções"
      ],
      [
        {
          "pt": "Fotografia (Casting)",
          "en": "Photography (Casting)"
        },
        "Ivan Erick"
      ],
      [
        {
          "pt": "Fotografia (Still)",
          "en": "Photography (Still)"
        },
        "Thiago Justo"
      ]
    ],
    "studio": "Tátil Design"
  },
  "natura-pais": {
    "client": "Natura",
    "detail": {
      "pt": "Como parte do universo de Natura Homem, a campanha de Dia dos Pais nasceu de uma provocação sobre novas formas de representar masculinidade e paternidade. Aproveitando o lançamento de uma nova fragrância da linha, o desafio era fugir dos códigos tradicionais da categoria e transformar uma ideia delicada em imagem: a força de um pai também pode ser suave.\n\nA campanha apresenta a paternidade como uma expressão mais presente, afetiva e verdadeira desse homem. A linguagem visual valoriza o íntimo e os pequenos gestos de conexão. Abraços, olhares e momentos de proximidade substituem representações baseadas apenas em força ou rigidez. As imagens constroem uma visão mais sensível da paternidade e ampliam o território de Natura Homem.\n\nComo Designer Sênior na Tátil, participei do design e da direção de arte da campanha. Atuei na construção da linguagem visual e na tradução do conceito em imagens capazes de expressar essa nova perspectiva sobre força, cuidado e paternidade.",
      "en": "As part of the Natura Homem universe, the Father's Day campaign explored new ways of representing masculinity and fatherhood. Built around the launch of a new fragrance, the challenge was to move beyond the familiar codes of the category and turn a delicate idea into images: a father's strength can also be gentle.\n\nThe campaign presents fatherhood as a more present, affectionate and honest expression of masculinity. The visual language focuses on intimacy and small gestures of connection. Hugs, glances and moments of closeness replace representations built only around strength or rigidity. The images create a more sensitive view of fatherhood and expand the emotional territory of Natura Homem.\n\nAs a Senior Designer at Tátil, I contributed to the campaign's design and art direction. I worked on the visual language and translated the concept into images that express a new perspective on strength, care and fatherhood."
    },
    "credits": [
      [
        {
          "pt": "Direção Criativa",
          "en": "Creative Direction"
        },
        "Julia Liberati, Beto Bicesto"
      ],
      [
        {
          "pt": "Gerência de Criação",
          "en": "Creative Management"
        },
        "Rodrigo Godin"
      ],
      [
        {
          "pt": "Design",
          "en": "Design"
        },
        "Mauricio Filho, Gabriel Kalani"
      ],
      [
        {
          "pt": "Design 3D",
          "en": "3D Design"
        },
        "Arthur Figueiredo"
      ],
      [
        {
          "pt": "Redação",
          "en": "Copywriting"
        },
        "Daniela Varanda"
      ],
      [
        {
          "pt": "Produção Executiva",
          "en": "Executive Production"
        },
        "Gazpacho Produções"
      ],
      [
        {
          "pt": "Fotografia (Casting)",
          "en": "Photography (Casting)"
        },
        "Ivan Erick"
      ]
    ],
    "studio": "Tátil Design + Natura"
  },
  "caixa": {
    "client": "CAIXA",
    "detail": {
      "pt": "A realização da COP30 em Belém criou para a CAIXA uma oportunidade de aproximar sua presença nacional da cultura e do território amazônico. No coração do complexo do Ver-o-Peso, a nova Agência-Conceito foi pensada para ir além de um ponto de atendimento e traduzir no espaço os compromissos da marca com sustentabilidade, diversidade e pertencimento.\n\nGuiada pela ideia “É da nossa natureza fazer acontecer”, a linguagem visual conecta a escala da CAIXA ao contexto local. A simbiose orienta a narrativa central e dá forma a um sistema que se desdobra pelo ambiente por meio de elementos gráficos e ilustrações. Para ampliar a autenticidade do projeto, convidamos a artista paraense Renata Segtowick, responsável pelas ilustrações finais do espaço a partir da direção visual desenvolvida pela equipe. O resultado integra linguagem e arquitetura e transforma a agência em um ponto de encontro entre marca, cultura e território.\n\nParticipei da construção da linguagem visual e da definição do sistema gráfico aplicado ao espaço. Atuei na gerência da equipe de design e no desenvolvimento das principais soluções visuais do projeto, em colaboração com as equipes de criação, 3D, negócios e com a artista Renata Segtowick.",
      "en": "With COP30 taking place in Belém, CAIXA had an opportunity to connect its national presence more closely with the culture and territory of the Amazon. Located in the heart of the Ver-o-Peso complex, the new Concept Branch was designed as more than a place for banking services. It brings the brand's commitments to sustainability, diversity and belonging into a physical experience.\n\nThe visual language is guided by CAIXA's COP30 idea, “It's in our nature to make it happen.” Symbiosis became the central narrative and shaped a system that unfolds throughout the environment through graphics and illustration. To give the project a stronger local voice, we invited Pará-based artist Renata Segtowick to create the final illustrations based on the visual direction developed by the team. The result brings identity and architecture together, turning the branch into a meeting point between brand, culture and territory.\n\nI contributed to the development of the visual language and the graphic system applied throughout the space. I managed the design team and worked on the project's key visual solutions in collaboration with the creative, 3D and business teams, as well as with Renata Segtowick."
    },
    "credits": [
      [
        {
          "pt": "Direção Criativa",
          "en": "Creative Direction"
        },
        "Beto Bicesto"
      ],
      [
        {
          "pt": "Gerência de Criação",
          "en": "Creative Management"
        },
        "Mauricio Filho"
      ],
      [
        {
          "pt": "Design",
          "en": "Design"
        },
        "Adson Rodrigues, Gabriel Kalani, Mauricio Filho"
      ],
      [
        {
          "pt": "Ilustrações",
          "en": "Illustration"
        },
        "Renata Segtowick"
      ],
      [
        {
          "pt": "Design 3D",
          "en": "3D Design"
        },
        "Carlos Eduardo"
      ],
      [
        {
          "pt": "Negócios",
          "en": "Business"
        },
        "Vanessa Clark, Natália Ramos"
      ]
    ],
    "studio": "Tátil Design"
  },
  "papeltec": {
    "client": "Papeltec",
    "detail": {
      "pt": "A Papeltec é uma das principais fornecedoras de embalagens de papel para diferentes marcas e enxerga o papel como mais do que uma matéria-prima. Para a empresa, cada embalagem também representa uma conexão entre marcas e pessoas. O desafio era traduzir essa visão em uma identidade mais humana e contemporânea, deixando para trás uma percepção predominantemente industrial.\n\nO rebranding parte da ideia de que cada embalagem carrega uma história. O novo símbolo representa um broto e reforça a relação da marca com renovação e sustentabilidade. A tipografia mais amigável e a paleta inspirada na natureza aproximam a comunicação. Ilustrações e elementos direcionais acrescentam movimento ao sistema e reforçam o papel da Papeltec como parceira de outras marcas. Essa ideia se sintetiza na plataforma verbal: “Sua história, nosso papel.”\n\nComo designer independente, conduzi o rebranding da marca desde a estratégia até a construção do sistema visual. Fui responsável pelo redesenho do logotipo, definição tipográfica, paleta, ilustrações proprietárias, motion e pela tagline que amarra toda a ideia do novo posicionamento.",
      "en": "Papeltec is a leading supplier of paper packaging for a wide range of brands and sees paper as more than a raw material. Each package is also a point of connection between a brand and the people it reaches. The challenge was to translate that perspective into a more human and contemporary identity while moving away from a predominantly industrial perception.\n\nThe rebrand is built around the idea that every package carries a story. A new sprout symbol connects the brand to renewal and sustainability. Friendlier typography and a nature-inspired palette make the communication feel more approachable. Proprietary illustrations and directional elements add movement to the system and reinforce Papeltec's role as a partner to other brands. The idea comes together in the tagline “Sua história, nosso papel,” which plays on the double meaning of paper and role in Portuguese.\n\nAs an independent designer, I led the rebrand from strategy through the complete visual system. I was responsible for the logo redesign, typography, color palette, proprietary illustrations, motion and the tagline that brings the new positioning together."
    },
    "credits": [
      [
        {
          "pt": "Design & Direção de Arte",
          "en": "Design & Art Direction"
        },
        "Mauricio Filho"
      ]
    ]
  },
  "vibra": {
    "client": "Vibra",
    "detail": {
      "pt": "A Vibra, antiga BR, é uma das maiores distribuidoras de energia do Brasil e está presente no cotidiano de milhões de pessoas. Dentro de um projeto mais amplo de rebranding e sinalização, surgiu a necessidade de criar uma linguagem própria para orientar pessoas nos diferentes espaços da marca. O desafio era desenvolver um sistema de pictogramas funcional e reconhecível que também carregasse os princípios da nova identidade.\n\nA família iconográfica nasce da própria estrutura visual da Vibra. O movimento aparece nas diagonais com diferentes espessuras e inclinações. Terminações chanfradas suavizam as formas e criam contraste, enquanto elementos arredondados adotam proporções ovais características da identidade. Esses princípios estruturam pictogramas de identificação, direção, acessibilidade, transporte e reciclagem.\n\nComo Designer, participei do projeto de reposicionamento da antiga BR para Vibra. Neste case, escolhi destacar uma frente que desenvolvi com maior autonomia: a sinalização e a família iconográfica. Atuei desde a definição dos princípios construtivos até o desenho e a padronização dos pictogramas, além da construção do sistema de sinalização para postos de abastecimento e ambientes corporativos.",
      "en": "Vibra, formerly BR, is one of Brazil's largest energy distributors and part of the everyday lives of millions of people. Within a broader rebranding and signage project, the brand needed a visual language that could guide people through its different environments. The challenge was to create a functional and recognizable pictogram system that still felt unmistakably connected to the new identity.\n\nThe icon family grows directly from Vibra's visual structure. Movement appears through diagonals with different weights and angles. Beveled endings soften the forms and create contrast, while rounded elements follow the oval proportions found throughout the identity. These principles shape a system for identification, directions, accessibility, transportation and recycling.\n\nAs a Designer, I contributed to the broader repositioning from BR to Vibra. For this case, I chose to focus on an area I developed with greater autonomy: signage and the icon family. My work ranged from defining the construction principles to drawing and standardizing the pictograms. I also helped build the signage system for fuel stations and corporate environments."
    },
    "credits": [
      [
        {
          "pt": "Design",
          "en": "Design"
        },
        "Mauricio Filho, Carlos Teles, Hudson Girundi"
      ],
      [
        {
          "pt": "Direção Criativa",
          "en": "Creative Direction"
        },
        "Renan Benvenutti"
      ],
      [
        {
          "pt": "Negócios",
          "en": "Business"
        },
        "Karla Ribeiro, Vanessa Clark"
      ]
    ],
    "studio": "Tátil Design"
  },
  "martorelli": {
    "client": "Martorelli",
    "detail": {
      "pt": "O Martorelli Advogados é um escritório construído sobre uma trajetória sólida e em constante evolução. A marca buscava fortalecer seu posicionamento por meio de uma identidade capaz de expressar sua história e, ao mesmo tempo, sua visão de futuro. O desafio era encontrar um equilíbrio entre a tradição do setor jurídico e uma cultura mais contemporânea e centrada nas pessoas.\n\nA nova identidade combina referências clássicas e contemporâneas. Essa relação aparece no redesenho do logotipo e se estende ao sistema visual. A fotografia e as ilustrações colocam as pessoas no centro da comunicação. As ilustrações traduzem a ideia de solidez em movimento ao envolver e organizar conteúdos, destacar informações e se adaptar a diferentes formatos. Seu caráter mais poético e cuidadoso cria um contraponto aos códigos comerciais e genéricos do setor. A linguagem verbal completa o sistema com um tom mais próximo e atual.\n\nComo Designer Sênior, participei do desenvolvimento e do desdobramento do sistema de identidade visual. Contribuí para a construção dos ativos gráficos, das aplicações da marca, dos materiais de comunicação, das apresentações e dos cases do projeto.",
      "en": "Martorelli Advogados is a law firm built on a strong legacy and a culture of continuous evolution. The brand wanted to strengthen its positioning through an identity that could express both its history and its outlook for the future. The challenge was to balance the traditions of the legal sector with a more contemporary and people-centered culture.\n\nThe new identity brings classical and contemporary references together. This tension begins with the redesigned logo and extends across the wider visual system. Photography and illustration place people at the center of the communication. The illustrations express the idea of solidity in motion by framing content, organizing information and adapting to different formats. Their more poetic and crafted quality creates a clear contrast with the generic commercial codes often found in the sector. A more approachable verbal language completes the system.\n\nAs a Senior Designer, I contributed to the development and rollout of the visual identity system. My work included graphic assets, brand applications, communication materials, presentations and the project case studies."
    },
    "credits": [
      [
        {
          "pt": "Design",
          "en": "Design"
        },
        "Camilla Mattos, Eduardo França, Gustavo André, Mauricio Filho, Priscila Czuka",
        {
          "dir": "Dandara Almeida"
        }
      ],
      [
        {
          "pt": "Estratégia",
          "en": "Strategy"
        },
        "Amanda Gebara"
      ],
      [
        {
          "pt": "Verbal",
          "en": "Copywriting"
        },
        "Ana Cunha, Mila Bartilotti, Lourenço Araujo"
      ]
    ],
    "studio": "Tátil Design",
    "behance": "https://www.behance.net/gallery/186776133/Matorelli-Advogados"
  }
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
          // Usa a capa do case, não o 1º item do carrossel — que pode ser
          // um vídeo e deixaria o preview quebrado.
          if (imgs.length) {
            previewImg.src = `assets/images/cases/${row.dataset.project}.webp`;
            preview.classList.add('visible');
          }
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

  // ── Alternar entre lista e grade ──────────────────────────────
  (function initViewToggle() {
    const toolbar = wrap.querySelector('.wt-toolbar');
    const table   = wrap.querySelector('.work-table');
    if (!toolbar || !table) return;

    const grid = document.createElement('div');
    grid.className = 'work-grid';

    rows.forEach(row => {
      const card = document.createElement('button');
      card.className = 'wt-card';

      const img = document.createElement('img');
      img.className = 'wt-card-img';
      img.src = `assets/images/cases/${row.dataset.project}.webp`;
      img.alt = '';
      img.loading = 'lazy';

      const info = document.createElement('span');
      info.className = 'wt-card-info';
      const name = document.createElement('span');
      name.className = 'wt-card-name';
      name.textContent = row.querySelector('.wt-name').textContent;
      const year = document.createElement('span');
      year.className = 'wt-card-year';
      year.textContent = row.querySelector('.wt-year').textContent;
      info.appendChild(name);
      info.appendChild(year);

      const sector = document.createElement('span');
      sector.className = 'wt-card-sector';
      sector.textContent = row.querySelector('.wt-sector').textContent;

      card.appendChild(img);
      card.appendChild(info);
      card.appendChild(sector);

      // Clicar no card volta para a lista já com o case aberto
      card.addEventListener('click', () => {
        setView('list');
        if (!row.classList.contains('is-open')) row.querySelector('.wt-row-head').click();
        requestAnimationFrame(() => row.scrollIntoView({ behavior: 'smooth', block: 'start' }));
      });

      grid.appendChild(card);
    });

    table.after(grid);

    function setView(view) {
      wrap.classList.toggle('is-grid', view === 'grid');
      toolbar.querySelectorAll('.wt-view-btn').forEach(b =>
        b.classList.toggle('is-active', b.dataset.view === view));
      localStorage.setItem('work-view', view);
      if (view === 'grid' && activeRow) { closeRow(activeRow); activeRow = null; }
    }

    toolbar.querySelectorAll('.wt-view-btn').forEach(b =>
      b.addEventListener('click', () => setView(b.dataset.view)));

    setView(localStorage.getItem('work-view') === 'grid' ? 'grid' : 'list');
  })();

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
    <video class="case-lb-video" controls loop muted playsinline></video>
    <button class="case-lb-next" aria-label="Próxima">›</button>
    <div class="case-lb-dots"></div>
  `;
  document.body.appendChild(caseLb);

  const clbImg   = caseLb.querySelector('.case-lb-img');
  const clbVideo = caseLb.querySelector('.case-lb-video');
  const clbDots  = caseLb.querySelector('.case-lb-dots');
  const clbClose = caseLb.querySelector('.case-lb-close');
  const clbPrev  = caseLb.querySelector('.case-lb-prev');
  const clbNext  = caseLb.querySelector('.case-lb-next');
  let clbItems = [], clbIdx = 0;

  // O lightbox mostra imagens e vídeos. Vídeo abre com controles nativos,
  // para dar play/pause; GIF continua sendo imagem, sem controles.
  function openCaseLightbox(items, startIdx) {
    clbItems = items;
    clbIdx   = Math.max(0, Math.min(startIdx, clbItems.length - 1));
    clbDots.innerHTML = '';
    clbItems.forEach((_, i) => {
      const d = document.createElement('button');
      d.className = 'case-lb-dot' + (i === clbIdx ? ' active' : '');
      d.setAttribute('aria-label', `Item ${i + 1}`);
      d.addEventListener('click', e => { e.stopPropagation(); showCaseSlide(i); });
      clbDots.appendChild(d);
    });
    showCaseSlide(clbIdx, true);
    caseLb.classList.add('visible');
  }

  function showCaseSlide(idx, instant) {
    clbIdx = idx;
    const src = clbItems[idx];
    if (!instant) clbImg.classList.add('fading');
    setTimeout(() => {
      if (src.endsWith('.mp4')) {
        clbImg.style.display = 'none';
        clbImg.removeAttribute('src');
        clbVideo.style.display = 'block';
        clbVideo.src = src;
        clbVideo.play().catch(() => {});
      } else {
        clbVideo.pause();
        clbVideo.removeAttribute('src');
        clbVideo.style.display = 'none';
        clbImg.style.display = 'block';
        clbImg.src = src;
      }
      clbImg.classList.remove('fading');
      clbDots.querySelectorAll('.case-lb-dot').forEach((d, i) => d.classList.toggle('active', i === idx));
    }, instant ? 0 : 150);
  }

  function closeCaseLightbox() {
    caseLb.classList.remove('visible');
    clbVideo.pause();
  }

  clbClose.addEventListener('click', closeCaseLightbox);
  caseLb.addEventListener('click', e => { if (e.target === caseLb) closeCaseLightbox(); });
  clbPrev.addEventListener('click', e => {
    e.stopPropagation();
    showCaseSlide((clbIdx - 1 + clbItems.length) % clbItems.length);
  });
  clbNext.addEventListener('click', e => {
    e.stopPropagation();
    showCaseSlide((clbIdx + 1) % clbItems.length);
  });
  document.addEventListener('keydown', e => {
    if (!caseLb.classList.contains('visible')) return;
    if (e.key === 'Escape')     closeCaseLightbox();
    if (e.key === 'ArrowLeft')  showCaseSlide((clbIdx - 1 + clbItems.length) % clbItems.length);
    if (e.key === 'ArrowRight') showCaseSlide((clbIdx + 1) % clbItems.length);
  });

  let caseTouchX = 0;
  caseLb.addEventListener('touchstart', e => { caseTouchX = e.touches[0].clientX; }, { passive: true });
  caseLb.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - caseTouchX;
    if (Math.abs(dx) > 50) dx < 0
      ? showCaseSlide((clbIdx + 1) % clbItems.length)
      : showCaseSlide((clbIdx - 1 + clbItems.length) % clbItems.length);
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
    const stopVideos = () => row.querySelectorAll('video').forEach(v => v.pause());
    stopVideos();
    setTimeout(stopVideos, 700); // de novo depois da animação de fechar
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
      overviewLabel.textContent = isEN ? 'Overview' : 'Visão Geral';
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

      if (hasBehance) {
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

    const videos = [];

    imgs.forEach((src, idx) => {
      let el;
      if (src.endsWith('.mp4')) {
        el = document.createElement('video');
        el.src       = src;
        el.muted     = true;
        el.loop      = true;
        el.playsInline = true;
        el.preload   = 'metadata';
        el.style.cssText = 'height:100%;width:auto;border-radius:6px;flex-shrink:0;display:block;cursor:pointer;';
        videos.push(el);
      } else {
        el = document.createElement('img');
        el.src     = src;
        el.alt     = '';
        el.loading = 'lazy';
        el.style.cursor = 'pointer';
        // Reserva largura enquanto a imagem não carrega: sem isso a img fica
        // com 0px e o carrossel calcula a rolagem e os dots errados.
        el.style.minWidth = '240px';
        el.addEventListener('load', () => { el.style.minWidth = ''; }, { once: true });
      }
      el.addEventListener('click', () => openCaseLightbox(imgs, idx));
      carousel.appendChild(el);
    });

    carouselOuter.appendChild(carousel);
    carouselWrap.appendChild(carouselOuter);

    // Vídeo fora da área visível do carrossel fica congelado no 1º frame
    // (o Chrome não dá autoplay em quem está fora da tela). Toca só o que
    // está à vista e pausa o resto — também evita travar a página.
    if (videos.length) {
      const syncVideos = () => {
        const box = carouselOuter.getBoundingClientRect();
        if (!box.width || !box.height) { // linha fechada: nada toca
          videos.forEach(v => { if (!v.paused) v.pause(); });
          return;
        }
        videos.forEach(v => {
          const r = v.getBoundingClientRect();
          const visible = r.right > box.left + 20 && r.left < box.right - 20;
          if (visible) { if (v.paused) v.play().catch(() => {}); }
          else if (!v.paused) v.pause();
        });
      };
      carouselOuter.addEventListener('scroll', syncVideos, { passive: true });
      window.addEventListener('resize', syncVideos);
      setTimeout(syncVideos, 120);
      setTimeout(syncVideos, 700); // depois da animação de abertura
    }

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
    const progress = Math.min(1, Math.max(0, (vh - rect.top) / (vh * 0.7)));
    const scale = 0.6 + progress * 0.4;
    section.style.transform = `scale(${scale})`;
  }

  window.addEventListener('scroll', update, { passive: true });
}


/* ─── Welcome tagline sequence ───────────────────────────────────── */
function wrapEmoji(text) {
  return text.replace(/([\u{1F000}-\u{1FFFF}]|[\u{2600}-\u{27FF}])/gu,
    m => `<span class="emoji-noto">${m}</span>`);
}

function initTaglineSequence() {
  const tagline = document.querySelector('.welcome-tagline');
  if (!tagline) return;

  const step1    = getTranslation('hero_step1');
  const lastStep = getTranslation('hero_step2');
  const pool     = [getTranslation('hero_step3')];

  tagline.innerHTML = wrapEmoji(step1);

  function fadeOut(cb) {
    tagline.style.transition = 'opacity 0.4s ease';
    tagline.style.opacity = '0';
    setTimeout(cb, 450);
  }
  function fadeIn() {
    tagline.style.transition = 'opacity 0.4s ease';
    tagline.style.opacity = '1';
  }
  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function runCycle(alreadyFaded) {
    const steps = shuffle(pool);
    let i = 0;

    function showFinal() {
      tagline.classList.add('is-final');
      tagline.innerHTML = `<span>${wrapEmoji(step1)}</span><span class="wt-final-arrow"></span>`;
      fadeIn();
      setTimeout(() => {
        fadeOut(() => {
          tagline.classList.remove('is-final');
          runCycle(true);
        });
      }, 4000);
    }

    function showStep() {
      if (i >= steps.length) {
        tagline.innerHTML = wrapEmoji(lastStep);
        tagline.style.cursor = 'pointer';
        function onDiscoClick() {
          const audioBtn = document.getElementById('audio-btn');
          if (audioBtn) audioBtn.click();
        }
        tagline.addEventListener('click', onDiscoClick);
        fadeIn();
        setTimeout(() => {
          tagline.style.cursor = '';
          tagline.removeEventListener('click', onDiscoClick);
          fadeOut(showFinal);
        }, 2000);
        return;
      }
      tagline.innerHTML = wrapEmoji(steps[i++]);
      fadeIn();
      setTimeout(() => fadeOut(showStep), 1500);
    }

    alreadyFaded ? showStep() : setTimeout(() => fadeOut(showStep), 1500);
  }

  runCycle(false);
}

document.addEventListener('welcome-done', initTaglineSequence);

/* ─── Scroll reveal ──────────────────────────────────────────────── */
function initReveal() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Vertical clip reveal — same effect as hero title
  const vSelectors = [
    '.bio-head',
    '.bio-body-text',
    '.bio-body-awards',
    '.work-table-head',
    '.footer-tagline',
    '.footer-wordmark',
  ];
  const vEls = vSelectors.flatMap(sel => [...document.querySelectorAll(sel)]);

  vEls.forEach(el => {
    const clip = document.createElement('div');
    clip.className = 'rv-clip';
    el.parentNode.insertBefore(clip, el);
    clip.appendChild(el);
    el.classList.add('rv-v');
  });

  // Horizontal reveal for work table rows
  const hEls = document.querySelectorAll('.wt-row');
  hEls.forEach(el => el.classList.add('rv-h'));

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const inner = entry.target.querySelector('.rv-v');
      if (inner) inner.classList.add('rv-in');
      else entry.target.classList.add('rv-in');
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.15 });

  vEls.forEach(el => obs.observe(el.parentNode)); // observe the clip wrapper
  hEls.forEach(el => obs.observe(el));
}

/* ─── Faixa de cases do aviso mobile ─────────────────────────────── */
const CASE_SLUGS = ['enjoei', 'mdesign', 'justos', 'metallo', '99', 'phlor',
  'natura-homem', 'natura-pais', 'caixa', 'martorelli', 'papeltec', 'vibra'];

function initMobileGateStrip() {
  const gate = document.querySelector('.mobile-gate');
  if (!gate || window.innerWidth > 768) return;
  if (gate.querySelector('.mobile-gate-strip')) return;

  const strip = document.createElement('div');
  strip.className = 'mobile-gate-strip';
  strip.setAttribute('aria-hidden', 'true');

  const track = document.createElement('div');
  track.className = 'mobile-gate-track';
  // lista duplicada: a animação volta ao início sem emenda
  [...CASE_SLUGS, ...CASE_SLUGS].forEach(slug => {
    const img = document.createElement('img');
    img.src = `assets/images/cases/${slug}.webp`;
    img.alt = '';
    track.appendChild(img);
  });

  strip.appendChild(track);
  gate.appendChild(strip);
}

/* ─── Mobile nav toggle ──────────────────────────────────────────── */
function initMobileRowThumbs() {
  if (window.innerWidth > 768) return;
  document.querySelectorAll('.wt-row[data-project]').forEach(row => {
    const project = row.dataset.project;
    const head = row.querySelector('.wt-row-head');
    if (!head) return;
    const img = document.createElement('img');
    img.src = `assets/images/cases/${project}.webp`;
    img.alt = '';
    img.className = 'wt-row-thumb';
    head.prepend(img);
  });
}

function initMobileNav() {
  const menuBtn  = document.getElementById('mobile-menu-btn');
  const overlay  = document.getElementById('mobile-menu-overlay');
  const closeBtn = document.getElementById('mobile-menu-close');
  const letsBtn  = document.getElementById('mobile-menu-letstalk');
  const langBtn  = document.getElementById('mobile-menu-lang');
  const mainLang = document.getElementById('lang-round');

  if (!menuBtn || !overlay) return;

  function openMenu()  { overlay.classList.add('is-open'); document.body.style.overflow = 'hidden'; }
  function closeMenu() { overlay.classList.remove('is-open'); document.body.style.overflow = ''; }

  menuBtn.addEventListener('click', openMenu);
  closeBtn?.addEventListener('click', closeMenu);

  letsBtn?.addEventListener('click', () => {
    navigator.clipboard.writeText('talkmauriciof@gmail.com')
      .then(() => {
        const orig = letsBtn.textContent;
        letsBtn.textContent = 'Copiado ✉️';
        setTimeout(() => { letsBtn.textContent = orig; closeMenu(); }, 1200);
      })
      .catch(() => { closeMenu(); window.location.href = 'mailto:talkmauriciof@gmail.com'; });
  });

  function updateLangBtn() {
    if (langBtn) langBtn.textContent = document.documentElement.lang === 'en' ? 'PT' : 'EN';
  }

  langBtn?.addEventListener('click', () => { mainLang?.click(); updateLangBtn(); });
  mainLang?.addEventListener('click', updateLangBtn);
  updateLangBtn();

  overlay.querySelectorAll('.mobile-menu-link').forEach(link => {
    if (link.tagName === 'A') link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
}

/* ─── Cookie Bar ─────────────────────────────────────────────────── */
function initCookieBar() {
  const bar = document.getElementById('cookie-bar');
  if (!bar) return;

  let dismissed = false;

  function dismiss() {
    if (dismissed) return;
    dismissed = true;
    bar.classList.add('is-hidden');
    setTimeout(() => bar.remove(), 500);
  }

  const timer = setTimeout(dismiss, 3000);

  document.getElementById('cookie-close').addEventListener('click', () => {
    clearTimeout(timer);
    dismiss();
  });

  const hero = document.querySelector('.hero-section');
  const threshold = hero ? hero.offsetHeight : window.innerHeight;

  function onScroll() {
    if (window.scrollY >= threshold) {
      clearTimeout(timer);
      dismiss();
      window.removeEventListener('scroll', onScroll);
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ─── Init ───────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  window.scrollTo(0, 0);
  initOverlay();
  initCookieBar();
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
  initWelcome(armGather);
  initReveal();
  initCopyEmail();
  initMobileRowThumbs();
  initMobileGateStrip();
  initMobileNav();
  initCursor();
});
