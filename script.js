/* Back-knap: fører tilbage til index.html */
const backBtn = document.querySelector('.back-btn');
if (backBtn) {
  backBtn.addEventListener('click', () => {
    // Bruger location.href så der bliver loadet index.html
    window.location.href = 'index.html';
  });
}

// REVIEWS

// JSON data
const reviews = [
    {
        stars: 5,
        title: "Perfekt højtaler og hurtig levering!",
        text: "Jeg er meget glad og tilfreds med min nye højtaler – Lyden er bare super!",
        name: "Ida Hansen",
        date: "04/25"
    },
    
    {
        stars: 5,
        title: "Super oplevelse!",
        text: "Højtaleren har en perfekt størrelse. Jeg har den med mig overalt. Jeg er positivt overrasket!",
        name: "Marie Larsen",
        date: "11/25"
    },
    {
        stars: 5,
        title: "Så stilren og fantastisk lyd",
        text: "Jeg elsker det stilrene smukke design på højtaleren. Jeg er positivt overrasket!",
        name: "Ida Christensen",
        date: "11/25"
    },
    {
        stars: 5,
        title: "Super oplevelse!",
        text: "Højtaleren har en perfekt størrelse. Jeg har den med mig overalt. Jeg er positivt overrasket!",
        name: "Marie Larsen",
        date: "11/25"
    }
];

// DOM target
const container = document.getElementById("reviews-container");

// Generator funktion
function generateReviewCards() {
    reviews.forEach(review => {
        const card = document.createElement("div");
        card.className = "card";

        card.innerHTML = `
            <div class="stars">${"★".repeat(review.stars)}</div>
            <h3>${review.title}</h3>
            <p>${review.text}</p>
            <div class="footer">
                <span class="name">${review.name}</span>
                <span class="date">${review.date}</span>
            </div>
        `;

        container.appendChild(card);
    });
}

// Generer cards
generateReviewCards();

// Vis toast når et "Køb nu" trykkes
function showCartToast(message = 'Produktet er tilføjet til indkøbskurven') {
  // Hvis allerede en toast, fjern den først (så vi kan re-animate)
  const existing = document.querySelector('.cart-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'cart-toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.textContent = message;

  document.body.appendChild(toast);

  // Trigger ind/ud animation via CSS (tilføj class for synlig)
  requestAnimationFrame(() => toast.classList.add('visible'));

  // Fjern efter 3 sekunder
  setTimeout(() => {
    toast.classList.remove('visible');
    // fjern fra DOM efter overgang
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }, 3000);
}

// Bind handler til alle buy-knapper (incl. dem med varianter)
function initBuyButtons() {
  const buyButtons = document.querySelectorAll('.buy-button');
  buyButtons.forEach(btn => {
    // Ignorer hvis allerede bundet
    if (btn.dataset.buyHandlerBound) return;
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      showCartToast();
     
    });
    btn.dataset.buyHandlerBound = '1';
  });
}

// Init ved load + re-init hvis DOM senere ændres
document.addEventListener('DOMContentLoaded', initBuyButtons);
// Hvis du dynamisk indsætter produkter kan du køre initBuyButtons() igen efter indsættelse
