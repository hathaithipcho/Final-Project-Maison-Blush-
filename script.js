/* ══════════════════════════════════════════════════════════
   script.js — Maison Blush
   รวม: Bloom & Mist (เก่า) + Cart Sidebar + Filter + Reviews
         + FAQ + Scroll Reveal + Responsive Nav + Toast
══════════════════════════════════════════════════════════ */

/* ══════════════════════════════════════
   CANVAS — Falling Petals & Mist
══════════════════════════════════════ */
const canvas = document.getElementById('petalCanvas');
const ctx    = canvas ? canvas.getContext('2d') : null;

function resize() {
  if (!canvas) return;
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}

if (canvas) {
  resize();
  window.addEventListener('resize', resize);
}

function drawPetal(ctx, x, y, size, angle, color, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.5, size, 0, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

function drawMist(ctx, x, y, r, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
  grad.addColorStop(0,   'rgba(253,232,236,0.9)');
  grad.addColorStop(0.5, 'rgba(243,198,206,0.4)');
  grad.addColorStop(1,   'rgba(243,198,206,0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

const PETAL_COLORS = ['#f9dde2','#f3c6ce','#e8b4be','#fde8ec','#dbeedd','#b8d4ae'];

class Petal {
  constructor() { this.reset(true); }
  reset(initial) {
    this.x           = Math.random() * canvas.width;
    this.y           = initial ? Math.random() * canvas.height : -20;
    this.size        = 4 + Math.random() * 9;
    this.speedY      = 0.4 + Math.random() * 0.8;
    this.speedX      = (Math.random() - 0.5) * 0.6;
    this.angle       = Math.random() * Math.PI * 2;
    this.spin        = (Math.random() - 0.5) * 0.03;
    this.alpha       = 0.3 + Math.random() * 0.45;
    this.color       = PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)];
    this.wobble      = Math.random() * Math.PI * 2;
    this.wobbleSpeed = 0.015 + Math.random() * 0.015;
  }
  update() {
    this.wobble += this.wobbleSpeed;
    this.x      += this.speedX + Math.sin(this.wobble) * 0.5;
    this.y      += this.speedY;
    this.angle  += this.spin;
    if (this.y > canvas.height + 20) this.reset(false);
  }
  draw() { drawPetal(ctx, this.x, this.y, this.size, this.angle, this.color, this.alpha); }
}

class MistDrop {
  constructor() { this.reset(true); }
  reset(initial) {
    this.x      = Math.random() * canvas.width;
    this.y      = initial ? Math.random() * canvas.height : canvas.height + 20;
    this.r      = 8 + Math.random() * 22;
    this.speedY = -(0.15 + Math.random() * 0.35);
    this.speedX = (Math.random() - 0.5) * 0.3;
    this.alpha  = 0.06 + Math.random() * 0.12;
    this.life   = 1;
    this.decay  = 0.002 + Math.random() * 0.003;
  }
  update() {
    this.x     += this.speedX;
    this.y     += this.speedY;
    this.r     += 0.15;
    this.alpha -= this.decay;
    if (this.alpha <= 0 || this.y < -this.r) this.reset(false);
  }
  draw() { drawMist(ctx, this.x, this.y, this.r, this.alpha); }
}

const petals = canvas ? Array.from({ length: 38 }, () => new Petal()) : [];
const mists  = canvas ? Array.from({ length: 22 }, () => new MistDrop()) : [];

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  mists.forEach(m  => { m.update(); m.draw(); });
  petals.forEach(p => { p.update(); p.draw(); });
  requestAnimationFrame(animate);
}

if (canvas && ctx) animate();

/* ══════════════════════════════════════
   SPARKLE
══════════════════════════════════════ */
const styleEl = document.createElement('style');
styleEl.textContent = `
  @keyframes sparkleFloat {
    0%   { opacity:1; transform:translateY(0) scale(1); }
    100% { opacity:0; transform:translateY(-56px) scale(0.3); }
  }
  .sparkle-el {
    position:fixed; font-size:20px; color:#c4607a;
    pointer-events:none; z-index:9999;
    animation:sparkleFloat 0.9s ease forwards;
  }
`;
document.head.appendChild(styleEl);

function spawnSparkle(el) {
  const layer = document.getElementById('sparkleLayer');
  if (!layer) return;

  const r = el.getBoundingClientRect();
  const s = document.createElement('div');

  s.className = 'sparkle-el';
  s.textContent = '✦';

  s.style.left = `${r.left + r.width / 2}px`;
  s.style.top  = `${r.top - 8}px`;

  layer.appendChild(s);

  s.addEventListener('animationend', () => s.remove());
}

/* ══════════════════════════════════════
   REVIEWS — localStorage
══════════════════════════════════════ */

// รีวิว default (จะแสดงเสมอ ลบไม่ได้)
const DEFAULT_REVIEWS = [
  {
    id: 'default-1',
    name: "Durin's Mom",
    product: 'Radient Heart · 50 ml',
    text: 'ยอด ดีเลิศ เด็ดขาด อันดับหนึ่ง ศักดิ์สิทธิ์ มหัศจรรย์ ที่สุด สุดยอด เยี่ยม ยอดเยี่ยม ยอด เยี่ยมยอด ดีที่สุด เลิศที่สุด ชนะเลิศ เลิศเลอ ดีเด่น สุดเหวี่ยง วิเศษ ฮีโร่ บริสุทธิ์ ล้ำเลิศ ชั้นเลิศ เลิศล้ำ เด็ด หนึ่งเดียว พิเศษ ยอดไปเลย เยี่ยมไปเลย ที่หนึ่งเลย โดดเด่น ปาฏิหาริย์',
    stars: 5,
    avatarBg: '',
    isDefault: true
  },
  {
    id: 'default-2',
    name: 'สมรศรี สุขเรืองมาก',
    product: 'Forest Walk · 100 ml',
    text: 'beautiful, pretty, beauty, effortless, opulent, unparalleled, glamorous, magnificent, bewitching, immaculate, spectacular, exotic, bewitching, radiating, coveted, commanding, unrivaled, supreme exquisite, breathtaking, radiant, enchanting, mesmerizing, divine, magnificent, alluring,',
    stars: 5,
    avatarBg: 'background:linear-gradient(135deg,#c8b8d8,#e8aeb7)',
    isDefault: true
  },
  {
    id: 'default-3',
    name: 'NeneEmu',
    product: 'Lirio · 100 ml',
    text: 'Very nice scent, I had used for a whole day. The colour was pretty nice though looks like sugary green apple.',
    stars: 5,
    avatarBg: 'background:linear-gradient(135deg,#a8c89e,#f3c6ce)',
    isDefault: true
  },
  {
    id: 'default-4',
    name: '.mio1i',
    product: 'Afternoon Tea · 50 ml',
    text: 'รีวิวกลิ่น Afternoon Tea ตอนแรกไม่ได้คาดหวังมาก แต่ฉีดแล้วชอบเลย กลิ่นมันนุ่มๆ เหมือนชาร้อนตอนบ่ายจริงๆ หอมแบบไม่หวานเลี่ยน รู้สึกสบายๆ ฉีดได้ทุกวันเลยค่ะ',
    stars: 5,
    avatarBg: 'background:linear-gradient(135deg,#8b6f8b,#c4a0b8)',
    isDefault: true
  },
  {
    id: 'default-5',
    name: 'Baguette カンパニー',
    product: 'Sakura Dew · 30 ml',
    text: 'Sakura Dew กลิ่นนี้คือหวานแบบใสๆ ไม่ได้หวานเลี่ยน เป็นฟีลดอกไม้เบาๆ เหมือนเดินอยู่ใต้ต้นซากุระตอนเช้าอ่ะ สดชื่นมาก',
    stars: 5,
    avatarBg: 'background:linear-gradient(135deg,#f3b8c4,#fde0e8)',
    isDefault: true
  },
  {
    id: 'default-6',
    name: 'FuFu is veri cute',
    product: 'Cotton Cloud · 50 ml',
    text: 'กลิ่นนี้นุ่มมากกก แบบเหมือนผ้าสะอาดใหม่ๆ + แป้งเด็กนิดๆ หอมแบบสบายใจสุด รวมๆคือเริ่ดค่ะ',
    stars: 5,
    avatarBg: 'background:linear-gradient(135deg,#d4b896,#e8c87a)',
    isDefault: true
  }
];

// โหลดรีวิวของ user จาก localStorage
function loadUserReviews() {
  try {
    return JSON.parse(localStorage.getItem('userReviews')) || [];
  } catch(e) {
    return [];
  }
}

// บันทึกรีวิวของ user ลง localStorage
function saveUserReviews(reviews) {
  localStorage.setItem('userReviews', JSON.stringify(reviews));
}

// สร้าง HTML ของการ์ดรีวิวเดียว
function buildReviewCard(review) {
  const starDisplay = '★'.repeat(review.stars) + '☆'.repeat(5 - review.stars);
  const initial = review.name ? review.name.charAt(0).toUpperCase() : '?';
  const avatarStyle = review.avatarBg ? `style="${review.avatarBg}"` : '';
  const deleteBtn = review.isDefault
    ? ''
    : `<button class="review-delete" onclick="deleteReview('${review.id}')" title="ลบรีวิว">✕</button>`;

  return `
    <div class="review-card" data-review-id="${review.id}">
      ${deleteBtn}
      <div class="review-stars">${starDisplay}</div>
      <p class="review-text">"${review.text}"</p>
      <div class="review-author">
        <div class="review-avatar" ${avatarStyle}>${initial}</div>
        <div>
          <div class="review-name">${review.name}</div>
          <div class="review-product">${review.product}</div>
        </div>
      </div>
    </div>
  `;
}

// render รีวิวทั้งหมดใน grid
// แทนที่ฟังก์ชัน renderAllReviews() เดิมทั้งหมด
let visibleReviewCount = 6; // จำนวนเริ่มต้นที่แสดง

function renderAllReviews() {
  const grid = document.getElementById('reviewsGrid');
  if (!grid) return;

  const userReviews = loadUserReviews();
  const allReviews = [...userReviews.slice().reverse(), ...DEFAULT_REVIEWS];

  // แสดงแค่ visibleReviewCount ใบ
  const toShow = allReviews.slice(0, visibleReviewCount);
  grid.innerHTML = toShow.map(buildReviewCard).join('');

  grid.querySelectorAll('.review-card').forEach((el, i) => {
    el.style.animationDelay = (i * 0.06) + 's';
  });

  // จัดการปุ่ม "ดูเพิ่มเติม" / "ย่อ"
  let btnWrap = document.getElementById('reviewToggleWrap');
  if (!btnWrap) {
    btnWrap = document.createElement('div');
    btnWrap.id = 'reviewToggleWrap';
    btnWrap.style.cssText = 'text-align:center;margin-top:32px';
    grid.after(btnWrap);
  }

  if (allReviews.length <= 6) {
    btnWrap.innerHTML = '';
    return;
  }

  const isExpanded = visibleReviewCount >= allReviews.length;
  btnWrap.innerHTML = `
    <button onclick="toggleReviews()" style="
      padding:12px 36px;border:1px solid rgba(243,198,206,0.7);
      background:rgba(255,255,255,0.88);color:var(--pink-deep);
      border-radius:30px;font-family:'Jost',sans-serif;font-size:12px;
      letter-spacing:2.5px;text-transform:uppercase;cursor:pointer;
      transition:all 0.3s;backdrop-filter:blur(10px);
      box-shadow:0 4px 20px rgba(232,174,183,0.15)
    ">
      ${isExpanded ? '✿ ย่อรีวิว' : `✿ ดูเพิ่มเติม (${allReviews.length - 6} รีวิว)`}
    </button>
  `;
}

function toggleReviews() {
  const userReviews = loadUserReviews();
  const allReviews = [...userReviews.slice().reverse(), ...DEFAULT_REVIEWS];
  
  if (visibleReviewCount >= allReviews.length) {
    // ย่อกลับ แล้ว scroll ขึ้นไปที่ grid
    visibleReviewCount = 6;
    renderAllReviews();
    document.getElementById('reviewsGrid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    // ขยายดูทั้งหมด
    visibleReviewCount = allReviews.length;
    renderAllReviews();
  }
}
// ลบรีวิว user
function deleteReview(id) {
  let userReviews = loadUserReviews();
  userReviews = userReviews.filter(r => r.id !== id);
  saveUserReviews(userReviews);
  // reset กลับ 6 ถ้าเหลือน้อยกว่า visibleReviewCount
  const total = userReviews.length + DEFAULT_REVIEWS.length;
  if (visibleReviewCount > total) visibleReviewCount = Math.max(6, total);
  renderAllReviews();
  showToast('ลบรีวิวแล้ว 🌸');
}

/* ══════════════════════════════════════
   DOMContentLoaded 
══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
   initSparkles();
  renderRatingSummary();

  renderCart();
  updateCartBadge();


  renderAllReviews();
function initSparkles() {
  const layer = document.getElementById('sparkleLayer');
  if (!layer) return;

  const COUNT = 35;

  for (let i = 0; i < COUNT; i++) {
    const dot = document.createElement('div');
    dot.className = 'sparkle';

    // กระจาย position แบบ random ทั่วหน้า
    dot.style.left   = Math.random() * 100 + 'vw';
    dot.style.top    = Math.random() * 100 + 'vh';

    // หน่วงเวลาต่างกันแต่ละดวง
    dot.style.animationDelay    = (Math.random() * 4) + 's';
    dot.style.animationDuration = (2 + Math.random() * 3) + 's';

    // ขนาดสุ่มเล็กน้อย
    const size = 3 + Math.random() * 4;
    dot.style.width  = size + 'px';
    dot.style.height = size + 'px';

    layer.appendChild(dot);
  }
}

  const track = document.querySelector('.marquee-track');
  document.querySelector('.marquee-bar')?.addEventListener('mouseenter', () => {
    if (track) track.style.animationPlayState = 'paused';
  });
  document.querySelector('.marquee-bar')?.addEventListener('mouseleave', () => {
    if (track) track.style.animationPlayState = 'running';
  });

  document.querySelectorAll('.pc-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const prevText = this.textContent;
      this.textContent = '✦ Added!';
      this.style.background = 'var(--deep-rose, #c4607a)';
      this.style.color = '#fff';
      const card = this.closest('.product-card, .card');
      const name = card?.querySelector('h3')?.innerText || 'Item';
      addToCart(name, '', 0, '🌸');
      spawnSparkle(this);
      setTimeout(() => {
        this.textContent = prevText;
        this.style.background = '';
        this.style.color = '';
      }, 1600);
    });
  });

  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('visible');
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => revealObserver.observe(el));

  document.querySelectorAll('.cards .card').forEach((c, i) => {
    c.style.transitionDelay = (i * 0.12) + 's';
  });

  function handleResize() {
    const h = document.getElementById('hamburger');
    if (!h) return;
    h.style.display = window.innerWidth < 768 ? 'flex' : 'none';
    if (window.innerWidth >= 768) closeMobileNav();
  }
  handleResize();
  window.addEventListener('resize', handleResize);

});

/* ══════════════════════════════════════
   MOBILE NAV
══════════════════════════════════════ */
function openMobileNav()  { document.getElementById('mobileNav')?.classList.add('open'); }
function closeMobileNav() { document.getElementById('mobileNav')?.classList.remove('open'); }

/* ══════════════════════════════════════
   SHOPPING CART SIDEBAR
══════════════════════════════════════ */
let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];

function saveCart() {
  localStorage.setItem('cartItems', JSON.stringify(cartItems));
}

function openCart() {
  document.getElementById('cartOverlay')?.classList.add('open');
  document.getElementById('cartSidebar')?.classList.add('open');
}
function closeCart() {
  document.getElementById('cartOverlay')?.classList.remove('open');
  document.getElementById('cartSidebar')?.classList.remove('open');
}

function addToCart(name, size, price, imgSrc, buyNow = false) {
  if (price === 0 || !price) {
    alert("⚠️ กรุณาระบุราคาของสินค้า");
    return;
  }
  const item = {
    name: name,
    size: size,
    price: price,
    imgSrc: imgSrc,
    qty: 1,
    id: Date.now(),
  };
  cartItems.push(item);
  saveCart();
  renderCart();
  updateCartBadge();
  if (buyNow) {
    window.location.href = "checkout.html";
  } else {
    showToast("เพิ่มสินค้าในตะกร้าแล้ว 🛒");
  }
}

function removeFromCart(id) {
  cartItems = cartItems.filter(i => i.id !== id);
  saveCart();
  renderCart();
  updateCartBadge();
}

function changeQty(id, delta) {
  const item = cartItems.find(i => i.id === id);
  if (item) {
    item.qty += delta;
    if (item.qty <= 0) removeFromCart(id);
    else renderCart();
  }
  localStorage.setItem('cartItems', JSON.stringify(cartItems));
  updateCartBadge();
}

function updateCartBadge() {
  const total = cartItems.reduce((s, i) => s + i.qty, 0);
  const badge = document.getElementById('cartBadge');
  if (!badge) return;
  badge.textContent = total;
  badge.classList.toggle('show', total > 0);
  const oldCount = document.getElementById('cart-count');
  if (oldCount) oldCount.innerText = total;
}

function renderCart() {
  const container = document.getElementById('cartItems');
  const empty     = document.getElementById('cartEmpty');
  const footer    = document.getElementById('cartFooterPanel');
  if (!container) return;

  if (cartItems.length === 0) {
    if (empty)  empty.style.display  = 'block';
    if (footer) footer.style.display = 'none';
    container.innerHTML = '';
    if (empty) container.appendChild(empty);
    return;
  }

  if (empty)  empty.style.display  = 'none';
  if (footer) footer.style.display = 'block';
  container.innerHTML = '';

  let total = 0;

  cartItems.forEach(item => {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <div class="cart-item-img">
        <img src="${item.imgSrc}" alt="${item.name}" width="50" height="50">
      </div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-size">${item.size}</div>
        <div class="qty-control">
          <button class="qty-btn" onclick="changeQty(${item.id}, -1)">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
        </div>
        ${item.price && item.price > 0 ? `<div class="cart-item-price">฿${(item.price * item.qty).toLocaleString()}</div>` : ''}
      </div>
      <button class="cart-remove" onclick="removeFromCart(${item.id})">✕</button>
    `;
    container.appendChild(div);
    if (item.price > 0) total += item.price * item.qty;
  });

  const totalEl = document.getElementById('cartTotal');
  if (totalEl) totalEl.textContent = '฿' + total.toLocaleString();

  const oldList = document.getElementById('cart-items');
  if (oldList) {
    oldList.innerHTML = '';
    cartItems.forEach(item => {
      const li = document.createElement('li');
      li.innerText = `${item.name} ${item.size} (×${item.qty})`;
      oldList.appendChild(li);
    });
  }
}

/* ══════════════════════════════════════
   TOAST NOTIFICATION
══════════════════════════════════════ */
let toastTimeout;
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => t.classList.remove('show'), 2800);
}

/* ══════════════════════════════════════
   PRODUCT FILTER
══════════════════════════════════════ */
function applyFilters() {
  var priceFilter = document.getElementById('filterPrice').value;
  var sizeFilter = document.getElementById('filterSize').value;
  var allCards = document.querySelectorAll('.cards .card');
  var noResults = true;

  var noResultsMessage = document.getElementById('noResultsMessage');
  if (noResultsMessage) noResultsMessage.remove();

  allCards.forEach(function(card) {
    var cardPrice = parseInt(card.getAttribute('data-price'));
    var cardSize = parseInt(card.getAttribute('data-size'));
    var showCard = true;

    if (priceFilter) {
      var priceRange = priceFilter.split('-');
      var minPrice = parseInt(priceRange[0]);
      var maxPrice = parseInt(priceRange[1]);
      if (cardPrice < minPrice || cardPrice > maxPrice) showCard = false;
    }
    if (sizeFilter) {
      if (cardSize !== parseInt(sizeFilter)) showCard = false;
    }

    if (showCard) {
      card.style.display = 'block';
      noResults = false;
    } else {
      card.style.display = 'none';
    }
  });

  if (noResults) {
    var messageElement = document.createElement('div');
    messageElement.id = 'noResultsMessage';
    messageElement.innerHTML = 'ไม่มีสินค้าที่ตรงกับการค้นหา 🌸';
    messageElement.style.textAlign = 'center';
    messageElement.style.fontSize = '18px';
    messageElement.style.color = '#e8aeb7';
    messageElement.style.marginTop = '20px';
    document.querySelector('.cards').appendChild(messageElement);
  }
}

/* ══════════════════════════════════════
   FAQ ACCORDION
══════════════════════════════════════ */
function toggleFaq(btn) {
  const answer = btn.nextElementSibling;
  const isOpen = btn.classList.contains('open');

  document.querySelectorAll('.faq-question.open').forEach(q => {
    q.classList.remove('open');
    q.nextElementSibling.style.maxHeight = '0';
  });

  if (!isOpen) {
    btn.classList.add('open');
    answer.style.maxHeight = answer.scrollHeight + 'px';
  }
}

/* ══════════════════════════════════════
   STAR RATING
══════════════════════════════════════ */
let selectedStars = 0;
function setStars(n) {
  selectedStars = n;
  document.querySelectorAll('#starSelect span').forEach((s, i) => {
    s.classList.toggle('active', i < n);
  });
}

/* ══════════════════════════════════════
   REVIEW FORM SUBMIT
══════════════════════════════════════ */
function submitReview() {
  const name    = document.getElementById('reviewName').value.trim();
  const product = document.getElementById('reviewProduct').value;
  const text    = document.getElementById('reviewText').value.trim();

  if (!name || !text || selectedStars === 0) {
    showReviewAlert('⚠️ กรุณากรอกข้อมูลให้ครบถ้วน');
    return;
  }

  // สร้าง object รีวิวใหม่
  const newReview = {
    id: 'user-' + Date.now(),
    name: name,
    product: product,
    text: text,
    stars: selectedStars,
    avatarBg: '',
    isDefault: false
  };

  // บันทึกลง localStorage
  const userReviews = loadUserReviews();
  userReviews.push(newReview);
  saveUserReviews(userReviews);

  // render ใหม่
  renderAllReviews();

  // แสดง popup สำเร็จ
  showReviewAlert('ขอบคุณสำหรับรีวิวของคุณ');

  // reset form
  document.getElementById('reviewName').value = '';
  document.getElementById('reviewText').value = '';
  setStars(0);
}

/* ══════════════════════════════════════
   CONTACT FORM VALIDATION
══════════════════════════════════════ */
function submitContact() {
  const name    = document.getElementById('contactName').value.trim();
  const email   = document.getElementById('contactEmail').value.trim();
  const topic   = document.getElementById('contactTopic').value.trim();
  const message = document.getElementById('contactMessage').value.trim();

  if (name === "" || email === "" || topic === "" || message === "") {
    showToast('⚠️ กรุณากรอกข้อมูลให้ครบก่อนส่งข้อความ');
    return;
  }

  const gmailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
  if (!gmailPattern.test(email)) {
    showToast('⚠️ กรุณาใส่อีเมล Gmail ให้ถูกต้อง เช่น example@gmail.com');
    return;
  }

  showToast('✉️ ส่งข้อความเรียบร้อยแล้ว! เราจะตอบกลับภายใน 24 ชั่วโมง');

  document.getElementById('contactName').value    = "";
  document.getElementById('contactEmail').value   = "";
  document.getElementById('contactTopic').value   = "";
  document.getElementById('contactMessage').value = "";
}

/* ══════════════════════════════════════
   CHECKOUT
══════════════════════════════════════ */
function goToCheckout() {
  if (cartItems.length === 0) {
    showToast("🛒 กรุณาเลือกสินค้าก่อน");
    return;
  }
  window.location.href = "checkout.html";
}

function buyNow(name, size, price, imgSrc) {
  let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
  const existingItem = cartItems.find(item => item.name === name && item.size === size);
  if (existingItem) {
    existingItem.qty += 1;
  } else {
    const newItem = {
      name: name, size: size, price: price, imgSrc: imgSrc,
      qty: 1, id: Date.now()
    };
    cartItems.push(newItem);
  }
  localStorage.setItem("cartItems", JSON.stringify(cartItems));
  window.location.href = "checkout.html";
}

function confirmOrder() {
  const name    = document.getElementById("shipName").value.trim();
  const phone   = document.getElementById("shipPhone").value.trim();
  const address = document.getElementById("shipAddress").value.trim();
  const payment = document.getElementById("paymentMethod").value;
  const cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];

  if (!name || !phone || !address || !payment || cartItems.length === 0) {
    document.getElementById("errorPopup").classList.add("show");
    return;
  }
  if (phone.length !== 10) {
    document.getElementById("errorPopup").classList.add("show");
    return;
  }

  localStorage.removeItem("cartItems");
  document.getElementById("orderSuccess").classList.add("show");
}

function resetFilters() {
  document.getElementById('filterPrice').value = '';
  document.getElementById('filterSize').value  = '';
  document.querySelectorAll('.cards .card').forEach(card => {
    card.style.display = 'block';
  });
  const noResultsMessage = document.getElementById('noResultsMessage');
  if (noResultsMessage) noResultsMessage.remove();
}

/* ══════════════════════════════════════
   ALERT MODALS
══════════════════════════════════════ */
function showAlert(message) {
  document.getElementById('alertMessage').textContent = message;
  document.getElementById('customAlert').classList.add('show');
}

function closeAlert() {
  document.getElementById('customAlert').classList.remove('show');
}

function validateForm() {
  let name = document.querySelector('input[placeholder="ชื่อผู้รับ"]').value;
  if (name === "") {
    showAlert("กรุณากรอกข้อมูลให้ครบถ้วนนะคะ 🌸");
    return false;
  }
}

function closeError() {
  document.getElementById("errorPopup").classList.remove("show");
}

function goHome() {
  window.location.href = "index.html";
}

// ✅ โค้ดแก้ไข
function showReviewAlert(message) {
  document.getElementById("reviewAlertText").textContent = message;
  const el = document.getElementById("reviewAlert");
  el.style.display = "flex";
  document.body.style.overflow = "hidden"; // ล็อก scroll ตอนเปิด
}

function closeReviewAlert() {
  const el = document.getElementById("reviewAlert");
  el.style.display = "none";
  document.body.style.overflow = "";       // ✅ คืน scroll และปลด overlay
}

function calculateRatingStats() {
  const userReviews = loadUserReviews();
  const allReviews = [...DEFAULT_REVIEWS, ...userReviews];

  const total = allReviews.length;

  const counts = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0
  };

  allReviews.forEach(r => {
    if (counts[r.stars] !== undefined) {
      counts[r.stars]++;
    }
  });

  const percent = (n) => total === 0 ? 0 : Math.round((n / total) * 100);

  return {
    total,
    avg:
      total === 0
        ? 0
        : (
            allReviews.reduce((sum, r) => sum + r.stars, 0) / total
          ).toFixed(1),
    percent5: percent(counts[5]),
    percent4: percent(counts[4]),
    percent3: percent(counts[3]),
    percent2: percent(counts[2]),
    percent1: percent(counts[1]),
  };
}

function renderRatingSummary() {
  const s = calculateRatingStats();

  const setBar = (id, percent) => {
    const el = document.getElementById(id);
    if (el) el.style.width = percent + "%";
  };

  const setText = (id, percent) => {
    const el = document.getElementById(id);
    if (el) el.textContent = percent + "%";
  };

  setBar("bar5", s.percent5);
  setBar("bar4", s.percent4);
  setBar("bar3", s.percent3);
  setBar("bar2", s.percent2);
  setBar("bar1", s.percent1);

  setText("txt5", s.percent5);
  setText("txt4", s.percent4);
  setText("txt3", s.percent3);
  setText("txt2", s.percent2);
  setText("txt1", s.percent1);

  const avg = document.getElementById("avgRating");
  if (avg) avg.textContent = s.avg;
}

document.addEventListener("DOMContentLoaded", () => {

  const modal = document.getElementById("imgModal");
  const modalImg = document.getElementById("imgModalSrc");
  const closeBtn = document.querySelector(".img-close");

  let justOpenedModal = false; // 🔥 กันคลิกซ้อน

  function openImgModal(src){
    justOpenedModal = true;

    modalImg.src = src;

    setTimeout(() => {
      modal.classList.add("show");
    }, 10);

    document.body.style.overflow = "hidden";

    setTimeout(() => {
      justOpenedModal = false;
    }, 120);
  }

function closeImgModal(){
  modal.classList.remove("show");
  modalImg.src = "";
  document.body.style.overflow = "";  // ✅ reset กลับค่าเดิม
}


  // 👉 กดรูปเพื่อเปิด
  document.querySelectorAll(".bottle-wrap img").forEach(img => {
    img.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      openImgModal(img.src);
    });
  });

  // 👉 คลิกพื้นหลังเพื่อปิด
  modal.addEventListener("click", (e) => {
    if (justOpenedModal) return;

    if (e.target === modal) {
      closeImgModal();
    }
  });

  // 👉 คลิกรูปไม่ให้ปิด
  modalImg.addEventListener("click", (e) => {
    e.stopPropagation();
  });

  // 👉 ปุ่ม X ปิด
  if (closeBtn) {
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      closeImgModal();
    });
  }

  // 👉 กด ESC ปิด
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeImgModal();
  });

});

function initSparkles() {
  const layer = document.getElementById('sparkleLayer');
  if (!layer) return;

  const COUNT = 35;

  for (let i = 0; i < COUNT; i++) {
    const dot = document.createElement('div');
    dot.className = 'sparkle';

    // กระจาย position แบบ random ทั่วหน้า
    dot.style.left   = Math.random() * 100 + 'vw';
    dot.style.top    = Math.random() * 100 + 'vh';

    // หน่วงเวลาต่างกันแต่ละดวง
    dot.style.animationDelay    = (Math.random() * 4) + 's';
    dot.style.animationDuration = (2 + Math.random() * 3) + 's';

    // ขนาดสุ่มเล็กน้อย
    const size = 3 + Math.random() * 4;
    dot.style.width  = size + 'px';
    dot.style.height = size + 'px';

    layer.appendChild(dot);
  }
}