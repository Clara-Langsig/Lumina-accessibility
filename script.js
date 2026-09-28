// Vis toast når et "Køb nu" trykkes.
// Toasten bliver liggende i DOM'en (tom), så skærmlæsere pålideligt læser den op,
// når teksten skiftes. Et live-område der oprettes med teksten i, bliver ofte ikke læst op.
let toastTimer;

// Laver et <span lang="en"> til engelske farvenavne, så skærmlæsere udtaler dem på engelsk
function englishText(text) {
  const span = document.createElement('span');
  span.lang = 'en';
  span.textContent = text;
  return span;
}

// "parts" er en liste af tekst og elementer, fx ['Lumina Bloom i ', englishText('Dusty Rose')]
function showCartToast(parts) {
  let toast = document.querySelector('.cart-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'cart-toast';
    toast.setAttribute('role', 'status');
    document.body.appendChild(toast);
  }

  // Tøm først, så samme besked læses op igen ved flere klik
  toast.textContent = '';
  requestAnimationFrame(() => {
    toast.append(...parts);
    toast.classList.add('visible');
  });

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('visible');
    // Tøm efter fade-ud, så den gamle besked ikke hænger ved nederst på siden for skærmlæsere
    toastTimer = setTimeout(() => { toast.textContent = ''; }, 300);
  }, 3000);
}

// PANELER (søgning + kurv): åbn/luk, luk ved klik udenfor og Escape
const panels = [];

// "inside" er den del af panelet, hvor klik IKKE lukker det (fx selve søgeboksen,
// så et klik på den mørke baggrund rundt om lukker søgningen)
function registerPanel(toggle, panel, onOpen, inside = panel) {
  if (!toggle || !panel) return null;
  const entry = { toggle, panel, onOpen, inside };
  panels.push(entry);

  toggle.addEventListener('click', () => {
    if (panel.hidden) openPanel(entry);
    else closePanel(entry);
  });
  return entry;
}

function openPanel(entry) {
  // Kun ét panel åbent ad gangen
  panels.forEach(p => { if (p !== entry) closePanel(p, false); });
  entry.panel.hidden = false;
  entry.toggle.setAttribute('aria-expanded', 'true');
  if (entry.onOpen) entry.onOpen();
}

function closePanel(entry, returnFocus = false) {
  if (entry.panel.hidden) return;
  entry.panel.hidden = true;
  entry.toggle.setAttribute('aria-expanded', 'false');
  // Sender fokus tilbage til knappen, så tastaturbrugere ikke "farer vild"
  if (returnFocus) entry.toggle.focus();
}

// Klik udenfor et åbent panel lukker det
document.addEventListener('click', (e) => {
  // Elementer der lige er fjernet (fx "Fjern" i kurven) tæller ikke som klik udenfor
  if (!e.target.isConnected) return;
  panels.forEach(entry => {
    if (entry.panel.hidden) return;
    if (entry.inside.contains(e.target) || entry.toggle.contains(e.target)) return;
    closePanel(entry);
  });
});

// Escape lukker det åbne panel
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  panels.forEach(entry => closePanel(entry, true));
});

// KURV
const PRICE = 1995;
const cart = []; // [{ color, image, quantity }]

function renderCart() {
  const list = document.getElementById('cart-items');
  const empty = document.querySelector('.cart-empty');
  const total = document.getElementById('cart-total');
  const count = document.getElementById('cart-count');
  if (!list || !empty || !total || !count) return;

  list.innerHTML = '';
  cart.forEach((item, index) => {
    const li = document.createElement('li');
    li.className = 'cart-item';

    const img = document.createElement('img');
    img.src = item.image;
    img.alt = '';

    const info = document.createElement('div');
    const name = document.createElement('p');
    name.className = 'cart-item-name';
    name.textContent = 'Lumina Bloom';
    const meta = document.createElement('p');
    meta.className = 'cart-item-meta';
    meta.append(englishText(item.color), ` · Antal: ${item.quantity}`);
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'cart-remove';
    // Skjult tekst i stedet for aria-label, så farvenavnet kan markeres som engelsk
    const removeHidden = document.createElement('span');
    removeHidden.className = 'visually-hidden';
    removeHidden.append(' Lumina Bloom i ', englishText(item.color), ' fra kurven');
    remove.append('Fjern', removeHidden);
    remove.addEventListener('click', () => {
      cart.splice(index, 1);
      renderCart();
      document.getElementById('cart-title')?.focus();
    });
    info.append(name, meta, remove);

    const price = document.createElement('p');
    price.className = 'cart-item-price';
    price.textContent = `${PRICE * item.quantity} DKK`;

    li.append(img, info, price);
    list.appendChild(li);
  });

  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.quantity * PRICE, 0);

  empty.hidden = cart.length > 0;
  total.hidden = cart.length === 0;
  total.textContent = `Total: ${totalPrice} DKK`;
  // Antal vises ved "Kurv", fx "Kurv (2)". Skærmlæsere hører "Kurv (2 varer)"
  count.textContent = '';
  if (totalQuantity > 0) {
    const hidden = document.createElement('span');
    hidden.className = 'visually-hidden';
    hidden.textContent = totalQuantity === 1 ? ' vare' : ' varer';
    count.append(` (${totalQuantity}`, hidden, ')');
  }
}

function addToCart() {
  const selected = document.querySelector('.color-swatches input[name="farve"]:checked');
  if (!selected) return;
  const color = selected.value;

  const existing = cart.find(item => item.color === color);
  if (existing) existing.quantity += 1;
  else cart.push({ color, image: selected.dataset.image, quantity: 1 });

  renderCart();
  showCartToast(['Lumina Bloom i ', englishText(color), ' er lagt i kurven']);
}

function initCart() {
  const toggle = document.querySelector('.cart-toggle');
  const panel = document.getElementById('cart-panel');
  const entry = registerPanel(toggle, panel, () => {
    document.getElementById('cart-title')?.focus();
  });
  if (!entry) return;

  panel.querySelector('.cart-close')?.addEventListener('click', () => closePanel(entry, true));
  renderCart();
}

// SØGNING: finder den første sektion på siden, der indeholder søgeordet
function initSearch() {
  const toggle = document.querySelector('.search-toggle');
  const panel = document.getElementById('search-panel');
  const form = panel?.querySelector('.search-form');
  const input = document.getElementById('search-input');
  const status = document.getElementById('search-status');
  if (!form || !input || !status) return;

  const entry = registerPanel(toggle, panel, () => {
    status.textContent = '';
    input.focus();
  }, panel?.querySelector('.search-box'));
  if (!entry) return;

  const sections = [
    document.querySelector('.hero'),
    document.getElementById('shop'),
    document.getElementById('produktinfo'),
    document.querySelector('.social-connect'),
    document.querySelector('.social-section'),
    document.querySelector('footer')
  ].filter(Boolean);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = input.value.trim().toLowerCase();
    if (!query) {
      status.textContent = 'Skriv hvad du leder efter.';
      return;
    }

    const hit = sections.find(section => section.textContent.toLowerCase().includes(query));
    if (!hit) {
      status.textContent = `Ingen resultater for "${input.value.trim()}".`;
      return;
    }

    closePanel(entry);
    form.reset();

    // Scroll til sektionen og flyt fokus dertil, så skærmlæsere også kommer med
    if (!hit.hasAttribute('tabindex')) hit.setAttribute('tabindex', '-1');
    hit.scrollIntoView({ block: 'start' });
    hit.focus({ preventScroll: true });
    hit.classList.add('search-hit');
    setTimeout(() => hit.classList.remove('search-hit'), 2000);
  });
}

// "Køb nu" lægger den valgte farve i kurven
function initBuyButtons() {
  document.querySelectorAll('.feature-buy').forEach(btn => {
    btn.addEventListener('click', addToCart);
  });
}

// TILBAGE TIL TOPPEN: vis knappen, når hero-sektionen er scrollet ud af skærmen
function initBackToTop() {
  const button = document.querySelector('.back-to-top');
  const hero = document.getElementById('top');
  if (!button || !hero) return;

  const observer = new IntersectionObserver(([entry]) => {
    button.classList.toggle('is-visible', !entry.isIntersecting);
  });
  observer.observe(hero);
}

document.addEventListener('DOMContentLoaded', initBackToTop);
document.addEventListener('DOMContentLoaded', initCart);
document.addEventListener('DOMContentLoaded', initSearch);

// FARVEVÆLGER på produkt-cardet
function initColorSwatches() {
  const radios = document.querySelectorAll('.color-swatches input[name="farve"]');
  const image = document.getElementById('feature-img');
  const imageColor = document.getElementById('feature-img-color'); // i billedbeskrivelsen
  const colorName = document.getElementById('feature-color-name'); // i "Farve - ..."
  if (!radios.length || !image || !imageColor || !colorName) return;

  // "change" fyrer både ved klik og ved piletaster
  radios.forEach(radio => {
    radio.addEventListener('change', () => {
      const name = radio.value;
      image.src = radio.dataset.image;
      // Farvenavnene står i <span lang="en">, så de udtales på engelsk
      imageColor.textContent = name;
      colorName.textContent = name;
    });
  });
}

document.addEventListener('DOMContentLoaded', initColorSwatches);

// FLERE SPECIFIKATIONER: fold ekstra punkter ud/ind
function initSpecsToggle() {
  const toggle = document.querySelector('.specs-toggle');
  if (!toggle) return;
  const more = document.getElementById(toggle.getAttribute('aria-controls'));
  const icon = toggle.querySelector('.specs-toggle-icon');
  if (!more || !icon) return;

  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!isOpen));
    more.hidden = isOpen;
    icon.textContent = isOpen ? '+' : '−';
  });
}

document.addEventListener('DOMContentLoaded', initSpecsToggle);

// NYHEDSBREV i footeren
function initNewsletter() {
  const form = document.querySelector('.newsletter-form');
  const status = document.getElementById('newsletter-status');
  if (!form || !status) return;

  // "submit" fyrer kun, når browseren har godkendt e-mailen (required + type="email")
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const message = 'Tak! Din e-mail er sendt, og du er nu tilmeldt nyhedsbrevet.';

    // Tøm først, så skærmlæseren læser beskeden op igen ved en ny tilmelding
    status.textContent = '';
    setTimeout(() => { status.textContent = message; }, 100);

    alert(message);
    form.reset();
  });
}

document.addEventListener('DOMContentLoaded', initNewsletter);

document.addEventListener('DOMContentLoaded', initBuyButtons);
