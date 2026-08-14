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
      "pt": "Enjoei veio até nós em um momento de virada. Nascida da linguagem da internet, a marca havia acumulado múltiplas referências, códigos e personalidades, mas precisava de mais critério e maturidade para acompanhar um público que também evoluiu. Nosso trabalho foi organizar esse excesso sem perder a irreverência, criando um sistema de identidade flexível, contemporâneo e vivo.\n\nRedesenhamos o logotipo, desenvolvemos assets proprietários e criamos a Enjoei Display, tipografia feita sob medida para sustentar diferentes climas e expressões. A tecnologia ampliou o craft por meio de uma plataforma criativa que transforma letras em padrões, estampas e composições infinitas para o dia a dia da marca.\n\nComo Designer Sênior, estive profundamente envolvido em todas as frentes do projeto, da identidade visual à criação da tipografia proprietária, plataforma criativa, case e demais elementos visuais.",
      "en": "Enjoei came to us at a turning point. Born from internet culture, the brand had accumulated multiple references, codes, and personalities, but needed clearer structure and maturity to evolve alongside a growing audience. Our role was to organize this abundance without losing its irreverence, shaping a flexible, contemporary, and living identity system.\n\nWe redesigned the logo, developed proprietary assets, and created Enjoei Display, a custom typeface built to support multiple moods and expressions. Technology extended the craft through a creative platform that turns letters into patterns, prints, and infinite compositions for everyday use.\n\nAs a Senior Designer, I was deeply involved across all aspects of the project, from visual identity and typography to the creative platform, case development, and visual assets."
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
  "justos": {
    "client": "Justos",
    "detail": {
      "pt": "A Justos surgiu com a ambição de transformar uma categoria inteira. Criada para repensar o mercado de seguros, a marca nasceu para desafiar convenções, engajar motoristas e incentivar um trânsito mais tranquilo e consciente. Nosso papel foi traduzir esse propósito em uma identidade bold e ativista, capaz de equilibrar tecnologia, inteligência de dados e conexão humana.\n\nDesenvolvemos um sistema visual inspirado na linguagem geométrica da sinalização viária e dos elementos do trânsito, utilizando códigos e símbolos universais para construir uma experiência de marca dinâmica e acessível. Um tom de voz provocativo e direto ajudou a descomplicar o segurês, sintetizar informações e construir confiança, dando forma a uma marca que acredita que o avanço só acontece de forma coletiva.\n\nComo Designer Sênior, estive envolvido no desenvolvimento e desdobramento da identidade visual, brandbook, case e demais ativos visuais.",
      "en": "Justos was created with the ambition of transforming an entire category. Designed to rethink the insurance market, the company set out to challenge industry conventions, engage drivers, and encourage safer and more conscious behavior on the road. Our role was to translate this purpose into a bold and activist identity capable of balancing technology, data intelligence, and human connection.\n\nWe developed a visual system inspired by the geometric language of traffic signs and road infrastructure, using universal symbols and codes to create a dynamic and accessible brand experience. A provocative yet straightforward verbal identity helped demystify insurance jargon, simplify information, and build trust, giving shape to a brand that believes meaningful progress can only happen collectively.\n\nAs a Senior Designer, I was involved in the development and rollout of the visual identity, brand guidelines, case study, and supporting visual assets."
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
  "phlor": {
    "client": "Phlor",
    "detail": {
      "pt": "A Phlor nasceu da ideia de que pequenos rituais podem transformar a forma como nos relacionamos com os espaços e com nós mesmos. Voltada para fragrâncias e produtos pensados para ambientes internos e externos, a marca buscava traduzir beleza, cuidado e individualidade por meio de uma identidade sensorial e sofisticada. Meu objetivo foi transformar esses atributos em uma linguagem visual capaz de expressar a essência da marca de forma singular e consistente.\n\nDesenvolvi uma identidade visual fundamentada no conceito de transformação. O logotipo combina símbolo e lettering proprietários para formar uma espiral em expansão, enquanto a tipografia faz referência ao movimento das chamas e à natureza mutável dos aromas. Inspiradas por elementos naturais, a paleta cromática e as ilustrações exclusivas geram padrões orgânicos que reforçam o caráter holístico e contemporâneo da marca em embalagens e demais pontos de contato.\n\nComo designer independente, conduzi todas as etapas do projeto, da concepção da marca ao desenvolvimento da identidade visual, do design de embalagens à direção de arte da fotografia dos produtos, garantindo consistência e autoria em toda a experiência da marca.",
      "en": "Phlor was created around the idea that everyday rituals can transform the way we experience our homes and ourselves. Focused on fragrances and products designed for interior and exterior spaces, the brand sought to express beauty, care, and individuality through a refined and sensorial identity system. My goal was to translate these attributes into a visual language capable of expressing the brand’s essence in a distinctive and meaningful way.\n\nI developed a visual identity rooted in the concept of transformation. The logo combines a custom symbol and wordmark to form an expanding spiral, while the typography references the movement of flames and the evolving nature of scent. Inspired by natural materials, the color palette and proprietary illustrations create organic patterns that reinforce the brand’s holistic and contemporary character across packaging and communication.\n\nAs an independent designer, I led every stage of the project, from brand conception and visual identity development to packaging design and art direction for product photography, ensuring consistency and authorship across every touchpoint."
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
  "99": {
    "client": "99",
    "detail": {
      "pt": "A 99 sempre ocupou um papel central na conexão entre pessoas, lugares e oportunidades em todo o Brasil. À medida que a empresa ampliava seu ecossistema e sua relevância, surgiu o desafio de traduzir um propósito mais claro para a marca: cuidar das pessoas abrindo caminhos para despertar novas histórias. Nosso trabalho foi transformar essa visão em uma identidade visual capaz de refletir tanto a escala da plataforma quanto a diversidade das comunidades que ela conecta.\n\nPartindo dos ativos já reconhecidos da marca, buscamos inspiração na linguagem visual das cidades, seus contornos, rotas e fluxos constantes. O sistema resultante combina padrões, texturas, mapas e elementos gráficos modulares para construir uma identidade flexível e expressiva. Próxima, inclusiva e adaptável, a linguagem visual reflete a complexidade da vida urbana ao mesmo tempo em que fortalece a conexão entre passageiros, motoristas e sociedade.\n\nComo Designer Sênior, estive envolvido no desenvolvimento e desdobramento do sistema de identidade visual, contribuindo para a construção de ativos gráficos, aplicações da marca e materiais de apresentação do projeto.",
      "en": "99 has always played a central role in connecting people, places, and opportunities across Brazil. As the company expanded its ecosystem and impact, the challenge was to evolve the brand around a clear purpose: caring for people by opening paths for new stories to happen. Our role was to translate this vision into a visual identity capable of reflecting both the scale of the platform and the diversity of the communities it serves.\n\nBuilding on existing brand assets, we drew inspiration from the visual language of cities, their routes, contours, and constant movement. The resulting system combines patterns, textures, maps, and modular graphic elements to create a flexible and expressive identity. Designed to be inclusive, recognizable, and adaptable, the visual language mirrors the complexity and dynamism of urban life while strengthening the connection between passengers, drivers, and society.\n\nAs a Senior Designer, I was involved in the development and rollout of the visual identity system, helping shape graphic assets, brand applications, and case study materials."
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
  "martorelli": {
    "client": "Martorelli",
    "detail": {
      "pt": "O Martorelli Advogados é um escritório construído sobre uma trajetória sólida e, ao mesmo tempo, em constante evolução. Referência em seu segmento, a marca buscava fortalecer seu posicionamento por meio de uma identidade capaz de expressar tanto sua história quanto sua visão de futuro. Nosso desafio foi traduzir esse equilíbrio entre tradição e transformação em um sistema visual contemporâneo e relevante.\n\nRedesenhamos a identidade visual para refletir a diversidade, a expertise e a cultura centrada nas pessoas que definem o escritório. O novo logotipo combina influências tipográficas clássicas e contemporâneas, expressando uma marca que respeita seu legado sem deixar de evoluir. A paleta cromática, a linguagem fotográfica focada nas relações humanas, a arquitetura de marcas e o tom de voz mais próximo trabalham em conjunto para construir uma experiência consistente e atual em todos os pontos de contato.\n\nComo Designer Sênior, estive envolvido no desenvolvimento e desdobramento da identidade visual, contribuindo para aplicações da marca, ativos visuais e materiais de apresentação do projeto.",
      "en": "Martorelli Advogados is a firm built on a strong legacy while continuously evolving to meet new realities. Recognized as a reference in its field, the firm sought to strengthen its positioning through a brand capable of expressing both its history and its forward-looking vision. Our challenge was to translate this balance between tradition and transformation into a contemporary identity system.\n\nWe redesigned the visual identity to reflect the firm's diversity, expertise, and human-centered culture. The new logo combines classical and contemporary typographic influences, expressing a brand that respects its heritage while embracing change. A refined color palette, people-focused photography, a structured brand architecture, and a more approachable verbal language work together to create a cohesive and modern brand experience across every touchpoint.\n\nAs a Senior Designer, I was involved in the development and rollout of the visual identity system, contributing to brand applications, visual assets, and case study materials."
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
  },
  "metallo": {
    "client": "Metallo",
    "detail": {
      "pt": "A Metallo nasceu em 2020, marca dedicada à criação de móveis e objetos sob medida em metal e madeira. Desde o início, o sistema visual já era sólido, preciso e arejado, com uma intervenção sutil na letra T que remetia à sombra de uma mesa — um gesto discreto que traduzia sofisticação e contemporaneidade. Anos depois, o desafio foi revisitar essa base: algumas de suas qualidades ainda não estavam totalmente explícitas, e a atualização partiu justamente desse ajuste de foco, em busca de mais ousadia e distinção sem abrir mão da elegância original.\n\nA revisão reforça materialidade, peso e processo como eixos centrais da marca. O azul cobalto profundo passa a operar como campo estrutural, enquanto texturas metálicas e enquadramentos rígidos organizam uma lógica construtiva coerente com o que a Metallo produz. A tipografia assume o protagonismo — imperfeita e precisa, moldada pelo próprio processo de fabricação — e a paleta se apoia em tons de metal, madeira e branco para sustentar diferentes climas. O logotipo foi preservado: as decisões aconteceram ao seu redor, por meio de cor, escala e ritmo, em busca de maior coerência entre forma e discurso.\n\nComo designer independente, conduzi todas as etapas do projeto, da concepção original em 2020 à atualização da linguagem, definindo direção de arte, sistema visual e aplicações. O resultado mantém a sofisticação que sempre definiu a Metallo, agora com mais presença, distinção e maturidade.",
      "en": "Metallo was founded in 2020 as a brand dedicated to custom-made furniture and objects in metal and wood. From the start, its visual system was already solid, precise, and airy, with a subtle intervention on the letter T that evoked the shadow of a table — a discreet gesture expressing sophistication and a contemporary spirit. Years later, the challenge was to revisit this foundation: some of its qualities were not yet fully explicit, and the refresh began precisely with that adjustment in focus, seeking greater boldness and distinction without giving up the original elegance.\n\nThe refresh reinforces materiality, weight, and process as the brand's central axes. Deep cobalt blue becomes a structural field, while metallic textures and rigid framing organize a constructive logic aligned with what Metallo makes. Typography takes the lead — imperfect and precise, shaped by the manufacturing process itself — while a palette of metal, wood, and white tones supports different moods. The logo was preserved: decisions happened around it, through color, scale, and rhythm, in search of greater coherence between form and discourse.\n\nAs an independent designer, I led every stage of the project, from the original 2020 concept to the evolution of the visual language, defining art direction, visual system, and applications. The result preserves the sophistication that has always defined Metallo, now with greater presence, distinction, and maturity."
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
  "papeltec": {
    "client": "Papeltec",
    "detail": {
      "pt": "A Papeltec é uma fabricante de embalagens de papel — de sacolas a embalagens personalizadas — que enxerga o papel como mais do que matéria-prima: um compromisso com a sustentabilidade e uma ponte entre marcas e clientes. O desafio era traduzir esse propósito em uma identidade à altura, deixando para trás uma imagem mais industrial e genérica para assumir um posicionamento humano, acolhedor e conectado ao valor que a marca gera em cada entrega.\n\nO rebranding parte da ideia de que cada embalagem carrega uma narrativa única. O novo logotipo troca o peso industrial por um símbolo de broto, leve e orgânico, reforçando o vínculo com a natureza e a renovação. A tipografia arredondada e amigável, somada a uma paleta de verdes vivos e tons terrosos, constrói uma presença acolhedora e contemporânea. Ilustrações e setas trazem movimento ao sistema, evidenciando o papel da marca como conectora e impulsionadora — alguém que ajuda outras marcas a alcançarem um lugar de protagonismo. Tudo se sintetiza na plataforma verbal: Sua história, nosso papel.\n\nComo designer independente, conduzi o rebranding da marca, da estratégia e do redesenho do logotipo à construção do sistema visual, tipografia, paleta, ilustrações e plataforma verbal, garantindo consistência em todos os pontos de contato.",
      "en": "Papeltec is a paper packaging manufacturer — from shopping bags to custom packaging — that sees paper as more than raw material: a commitment to sustainability and a bridge between brands and their customers. The challenge was to translate this purpose into an identity that lived up to it, leaving behind a more industrial, generic image to embrace a human, welcoming positioning connected to the value the brand creates with every delivery.\n\nThe rebranding starts from the idea that every package carries a unique narrative. The new logo trades industrial weight for a sprout symbol — light and organic — reinforcing the bond with nature and renewal. Rounded, friendly typography, combined with a palette of vivid greens and earthy tones, builds a welcoming and contemporary presence. Illustrations and arrows bring movement to the system, highlighting the brand's role as a connector and enabler — one that helps other brands reach a leading position. It all comes together in the verbal platform: Sua história, nosso papel (Your story, our paper — and our role).\n\nAs an independent designer, I led the brand's rebranding — from strategy and logo redesign to the visual system, typography, color palette, illustrations, and verbal platform — ensuring consistency across every touchpoint."
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
  "caixa": {
    "client": "Caixa"
  },
  "natura-homem": {
    "client": "Natura",
    "detail": {
      "pt": "Natura Homem é a linha de perfumaria masculina de uma das maiores marcas de beleza do Brasil. O projeto consistiu em um rebranding de toda a linha, com o objetivo de integrar as comunicações e traduzir as múltiplas personalidades do homem contemporâneo. O desafio era construir um sistema capaz de acolher diferentes intensidades e facetas — do homem que busca leveza ao que marca presença — sob uma mesma ideia condutora: cuidar de si e do outro como uma forma de potência.\n\nO sistema organiza as fragrâncias em plataformas complementares, cada uma traduzindo uma faceta desse homem e um momento da sua rotina. A direção de arte deu forma visual a cada conceito, transformando-o em imagem por meio de casting, still e captação hipersensorial. Luz, styling, paleta e materialidade foram calibrados linha a linha para que cada uma tivesse expressão própria, mantendo a coerência do conjunto. O resultado é uma linguagem integrada, sensorial e contemporânea, que acompanha o homem em suas diferentes intensidades.\n\nComo Designer Sênior na Tátil, atuei no design e na direção de arte das fotografias, traduzindo cada conceito da linha em imagem — do casting ao still e à captação hipersensorial —, garantindo uma expressão visual própria para cada faceta e coerente com o sistema.",
      "en": "Natura Homem is the men's fragrance line of one of Brazil's largest beauty brands. The project was a rebranding of the entire line, aiming to integrate its communications and translate the multiple personalities of the contemporary man. The challenge was to build a system able to hold different intensities and facets — from the man who seeks lightness to the one who makes a bold statement — under a single guiding idea: caring for oneself and others as a form of strength.\n\nThe system organizes the fragrances into complementary platforms, each translating a facet of this man and a moment of his routine. Art direction gave visual form to each concept, turning it into image through casting, still life, and hypersensorial capture. Light, styling, palette, and materiality were calibrated line by line so that each one had its own expression while keeping the whole cohesive. The result is an integrated, sensorial, and contemporary language that follows the man across his different intensities.\n\nAs a Senior Designer at Tátil, I led the design and art direction of the photography, translating each concept of the line into image — from casting to still life and hypersensorial capture — ensuring a distinct visual expression for each facet, coherent with the system."
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
      "pt": "Como parte do universo Natura Homem, a campanha de Dia dos Pais nasceu de uma provocação: como falar de masculinidade e paternidade sem cair no óbvio? Aproveitando o mote do lançamento de uma nova fragrância da linha, o desafio foi transformar uma ideia delicada em imagem — a de que a verdadeira força de um pai pode ser suave. Ele não precisa provar; precisa estar.\n\nA paternidade passa a ser tratada como uma das expressões desse homem: mais presente, afetivo, leve e verdadeiro. Criamos uma linguagem visual que acolhe o íntimo, o silêncio e o afeto — um convite a enxergar o homem em evolução, com camadas mais profundas do que força ou rigidez. Um abraço apertado, um olhar que sente, a leveza que toca: cada imagem foi construída para revelar essa sensibilidade, atualizando o tom da marca com mais presença e vínculo.\n\nComo Designer Sênior na Tátil, atuei na direção de arte e no design da campanha de Dia dos Pais, dando forma visual ao conceito e traduzindo em imagem essa nova expressão da paternidade.",
      "en": "As part of the Natura Homem universe, the Father's Day campaign began with a provocation: how do you talk about masculinity and fatherhood without falling into the obvious? Building on the launch of a new fragrance in the line, the challenge was to turn a delicate idea into image — that a father's true strength can be gentle. He doesn't need to prove himself; he needs to be there.\n\nFatherhood becomes one of the expressions of this man: more present, affectionate, light, and true. We created a visual language that embraces intimacy, silence, and affection — an invitation to see the man in evolution, with layers deeper than strength or rigidity. A tight hug, a gaze that feels, a lightness that touches: every image was built to reveal this sensitivity, updating the brand's tone with greater presence and connection.\n\nAs a Senior Designer at Tátil, I led the art direction and design of the Father's Day campaign, giving visual form to the concept and translating this new expression of fatherhood into image."
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
  "vibra": {
    "client": "Vibra",
    "detail": {
      "pt": "A VIBRA é uma das maiores distribuidoras de energia do Brasil, presente no dia a dia de milhões de pessoas por meio de uma ampla rede de pontos de contato. Dentro de um projeto mais amplo de rebranding e sinalização, um dos desafios era construir um sistema de wayfinding próprio — capaz de orientar com clareza e, ao mesmo tempo, carregar a personalidade da marca. Para isso, foi desenvolvida uma família iconográfica sob medida, que traduzisse a linguagem VIBRA para a escala da sinalização.\n\nA família de pictogramas nasce da própria estrutura da marca. O movimento — traço central da VIBRA — é representado por diagonais de espessuras e angulações variadas, enquanto as terminações chanfradas suavizam as formas e criam contraste. Todas as formas circulares são ovais, conectando-se ao caráter humanista da identidade. A partir desses princípios, o sistema cobre pictogramas identificativos, direcionais, de acessibilidade (PNE), transporte e reciclagem — estes últimos seguindo os padrões normativos (CONAMA / NBR) —, formando um conjunto coeso, funcional e com identidade própria.\n\nComo designer na Tátil, atuei no desdobramento (rollout) da marca e, em especial, no desenvolvimento da família iconográfica completa para o sistema de sinalização, do conceito à construção e padronização de cada pictograma.",
      "en": "VIBRA is one of the largest energy distributors in Brazil, part of the daily lives of millions of people through an extensive network of touchpoints. Within a broader rebranding and signage project, one of the challenges was to build a proprietary wayfinding system — able to guide clearly while carrying the brand's personality. To achieve this, a custom iconographic family was developed to translate the VIBRA language into the scale of signage.\n\nThe pictogram family stems from the brand's own structure. Movement — VIBRA's core trait — is expressed through diagonals of varying thickness and angle, while beveled terminations soften the forms and create contrast. All circular shapes are oval, connecting to the humanist character of the identity. Building on these principles, the system covers identification, directional, accessibility, transportation, and recycling pictograms — the latter following regulatory standards (CONAMA / NBR) — forming a cohesive, functional set with its own identity.\n\nAs a designer at Tátil, I worked on the brand's rollout and, in particular, on developing the complete iconographic family for the signage system — from concept to the construction and standardization of each pictogram."
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
  "mdesign": {
    "client": "M Design Studio",
    "detail": {
      "pt": "Fundada no Brasil, a M Design Studio nasce de um sólido saber-fazer em marcenaria e mobiliário sob medida, com linguagem contemporânea e alto nível de personalização. O desafio surgiu ao levar essa proposta para o mercado americano, onde \"moderno e bem-feito\" já não basta para se destacar e o termo \"custom\" virou um atalho comercial — na prática, soluções padronizadas que geram espaços genéricos, nos quais as pessoas se adaptam ao que é oferecido, e não o contrário. Traduzir personalização, qualidade e autoria em códigos que fizessem sentido nesse novo contexto, sem perder o caráter contemporâneo do estúdio, era o ponto de partida.\n\nA identidade parte do que o estúdio já faz de melhor: tratar cada projeto como único, concebido a partir das rotinas reais de quem vai habitá-lo. Mais do que uma marcenaria, a M Design Studio passa a se apresentar como um estúdio de design dedicado a marcenaria e mobiliário sob medida, com envolvimento próximo em todas as etapas. O sistema visual segue essa mesma lógica: enraizado em contextos técnicos e processos criativos, expressa método e precisão ao mesmo tempo em que introduz uma dimensão humana por meio do craft e da expressão tipográfica. O resultado sustenta o trabalho do estúdio sem se sobrepor a ele, reforçando o posicionamento de construir do zero, e não adaptar soluções.\n\nComo designer independente, conduzi todo o rebranding, do reposicionamento à identidade visual e ao motion. Um estúdio feito para fazer sentido — para o espaço e para as pessoas que vivem nele.",
      "en": "Founded in Brazil, M Design Studio is built on a solid mastery of bespoke cabinetry and millwork, with a contemporary language and a high level of customization. The challenge arose when bringing this proposition to the American market, where \"modern and well-made\" is no longer enough to stand out and \"custom\" has become a commercial shortcut — in practice, cookie-cutter systems that produce generic spaces, where people adapt to what is offered instead of the other way around. Translating customization, quality, and authorship into codes that make sense in this new context, without losing the studio's contemporary character, was the starting point.\n\nThe identity builds on what the studio already does best: treating each project as unique, conceived around the real-life routines of the people who will live in it. More than a carpentry workshop, M Design Studio now presents itself as a design studio focused on bespoke cabinetry and millwork, with close involvement throughout the entire process. The visual system follows the same logic: rooted in technical contexts and creative processes, it expresses method and precision while introducing a human dimension through craft and typographic expression. The result supports the studio's work without overshadowing it, reinforcing its positioning: building from scratch, not adapting solutions.\n\nAs an independent designer, I led the entire rebranding, from positioning to visual identity and motion. A studio made to make sense — for the space and for the people who live in it."
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
  initMobileNav();
  initCursor();
});
