// ===== 文字サイズ変更 =====
const fontSizes = ["14px", "16px", "18px", "22px", "26px"];
function changeFontSize(index) {
  document.documentElement.style.setProperty(
    "--font-size-base",
    fontSizes[index],
  );
  document.body.style.fontSize = fontSizes[index];
  const buttons = document.querySelectorAll(".font-size-controls button");
  buttons.forEach((btn, i) => {
    btn.classList.toggle("active", i === index);
  });
}

// ===== ドラッグ機能 =====
let isDragging = false;
let dragMoved = false;
let startX, startY, initialX, initialY;
const dragBtn = document.getElementById("draggable-menu-btn");

function startDrag(e) {
  dragMoved = false;
  const event = e.type === "touchstart" ? e.touches[0] : e;
  startX = event.clientX;
  startY = event.clientY;
  initialX = dragBtn.offsetLeft;
  initialY = dragBtn.offsetTop;
  isDragging = true;

  document.addEventListener("mousemove", onDrag);
  document.addEventListener("mouseup", stopDrag);
  document.addEventListener("touchmove", onDrag, { passive: false });
  document.addEventListener("touchend", stopDrag);
}

function onDrag(e) {
  if (!isDragging) return;
  e.preventDefault();
  const event = e.type === "touchmove" ? e.touches[0] : e;
  const dx = event.clientX - startX;
  const dy = event.clientY - startY;
  if (Math.abs(dx) > 5 || Math.abs(dy) > 5) dragMoved = true;
  dragBtn.style.left = initialX + dx + "px";
  dragBtn.style.top = initialY + dy + "px";
  dragBtn.style.right = "auto";
}

function stopDrag() {
  isDragging = false;
  document.removeEventListener("mousemove", onDrag);
  document.removeEventListener("mouseup", stopDrag);
  document.removeEventListener("touchmove", onDrag);
  document.removeEventListener("touchend", stopDrag);
}

// ===== サイドバー =====
function toggleSidebar() {
  if (dragMoved) {
    dragMoved = false;
    return;
  }
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebar-overlay");
  const isOpen = sidebar.classList.toggle("open");
  overlay.classList.toggle("show", isOpen);
  dragBtn.classList.toggle("menu-open", isOpen);
}

function closeSidebar() {
  document.getElementById("sidebar").classList.remove("open");
  document.getElementById("sidebar-overlay").classList.remove("show");
  dragBtn.classList.remove("menu-open");
}

function toggleSidebarPos() {
  document.getElementById("sidebar").classList.toggle("right");
}

// ===== スクロール進捗バー =====
function updateScrollProgress() {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  const progressBar = document.getElementById("scroll-progress");
  if (progressBar) progressBar.style.width = progress + "%";
}

// ===== ページトップ & CTAフローティング =====
function updateScrollButtons() {
  const scrollY = window.scrollY;
  const backTop = document.getElementById("back-to-top");
  const ctaFloat = document.getElementById("cta-float");

  if (backTop) backTop.classList.toggle("show", scrollY > 400);
  if (ctaFloat) ctaFloat.classList.toggle("show", scrollY > 300);
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ===== スクロールアニメーション（Intersection Observer） =====
const animateObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add("visible");
        }, index * 60);
        animateObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.12,
    rootMargin: "0px 0px -40px 0px",
  },
);

// ===== カウントアップアニメーション =====
function animateCounter(el, target, duration) {
  const startTime = performance.now();
  if (target === 0) {
    el.textContent = "0";
    return;
  }

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(eased * target);
    el.textContent = current.toLocaleString();
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.textContent = target.toLocaleString();
    }
  }
  requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.target, 10);
        animateCounter(el, target, 1800);
        counterObserver.unobserve(el);
      }
    });
  },
  { threshold: 0.5 },
);

// ===== 証言スライダー =====
let currentSlide = 0;
let autoSlideTimer;

function initSlider() {
  const track = document.getElementById("testimonial-track");
  if (!track) return;
  const slides = track.querySelectorAll(".testimonial-slide");
  const dotsContainer = document.getElementById("slider-dots");
  if (!slides.length) return;

  if (dotsContainer) {
    dotsContainer.innerHTML = "";
    slides.forEach((_, i) => {
      const dot = document.createElement("div");
      dot.className = "slider-dot" + (i === 0 ? " active" : "");
      dot.onclick = () => goToSlide(i);
      dotsContainer.appendChild(dot);
    });
  }

  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");
  if (prevBtn) {
    prevBtn.onclick = () => {
      goToSlide((currentSlide - 1 + slides.length) % slides.length);
    };
  }
  if (nextBtn) {
    nextBtn.onclick = () => {
      goToSlide((currentSlide + 1) % slides.length);
    };
  }

  startAutoSlide(slides.length);

  // タッチスワイプ対応
  let touchStartX = 0;
  track.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.touches[0].clientX;
    },
    { passive: true },
  );
  track.addEventListener("touchend", (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      goToSlide(
        diff > 0
          ? (currentSlide + 1) % slides.length
          : (currentSlide - 1 + slides.length) % slides.length,
      );
    }
  });
}

function goToSlide(index) {
  const track = document.getElementById("testimonial-track");
  if (!track) return;
  const slides = track.querySelectorAll(".testimonial-slide");
  currentSlide = index;
  track.style.transform = `translateX(-${index * 100}%)`;
  document.querySelectorAll(".slider-dot").forEach((dot, i) => {
    dot.classList.toggle("active", i === index);
  });
  resetAutoSlide(slides.length);
}

function startAutoSlide(slideCount) {
  autoSlideTimer = setInterval(() => {
    goToSlide((currentSlide + 1) % slideCount);
  }, 5000);
}

function resetAutoSlide(slideCount) {
  clearInterval(autoSlideTimer);
  startAutoSlide(slideCount);
}

// ===== FAQ アコーディオン =====
function toggleFaq(questionEl) {
  const item = questionEl.parentElement;
  const isOpen = item.classList.contains("open");
  document
    .querySelectorAll(".faq-item.open")
    .forEach((el) => el.classList.remove("open"));
  if (!isOpen) item.classList.add("open");
}

// ===== 地図モーダル =====
function showMap(address) {
  const modal = document.getElementById("map-modal");
  const container = document.getElementById("map-container");
  if (!modal || !container) return;

  const encodedAddress = encodeURIComponent(address);
  const mapHtml = `<iframe src="https://maps.google.co.jp/maps?output=embed&q=${encodedAddress}&z=16" allowfullscreen></iframe>`;

  container.innerHTML = mapHtml;
  modal.style.display = "flex";
  document.body.style.overflow = "hidden";
}

function closeMap() {
  const modal = document.getElementById("map-modal");
  const container = document.getElementById("map-container");
  if (modal) modal.style.display = "none";
  if (container) container.innerHTML = "";
  document.body.style.overflow = "auto";
}

// ===== プロフィールモーダル =====
function openProfile() {
  const modal = document.getElementById("profileModal");
  const body = document.getElementById("modal-body");
  if (!modal || !body) return;

  body.innerHTML = `
        <div class="profile-modal-inner">
            <h3 style="color:var(--primary-color); border-bottom:2px solid var(--accent-color); padding-bottom:10px; margin-top:0;">石川 直人 プロフィール</h3>
            <div class="profile-text-content">
                <p style="font-size: clamp(16px, 5.0vw, 25px);">1976年、横浜に生まれ育った石川さん。「都会すぎず、田舎すぎない横浜の雰囲気が大好き」と語る彼は、地元への愛着が人一倍強いファイナンシャルプランナーです。</p>
                <p style="font-size: clamp(16px, 5.0vw, 25px);">大学卒業後、大手金融機関に勤務。そこで多くのお客様と接する中で、「本当に中立な立場で、一人ひとりの人生に寄り添ったアドバイスがしたい」という強い想いが芽生え、独立を決意しました。</p>
                <p style="font-size: clamp(16px, 5.0vw, 25px);">現在は、ハッピーライフアカデミーの代表として、年間100回以上のセミナーに登壇。「難しいお金の話を、世界一わかりやすく」をモットーに、50代からの資産形成や老後資金の不安解消をサポートしています。</p>
                <p style="font-size: clamp(16px, 5.0vw, 25px);">趣味は、週末に横浜の公園を散歩することと、美味しいパン屋さん巡り。二児の父でもあり、家庭では「お金の教育」を実践中。「将来、子供たちが自分らしく生きるための知恵を伝えたい」と、優しい笑顔で話します。</p>
                <p style="font-size: clamp(16px, 5.0vw, 25px);">「お金は目的ではなく、幸せになるための手段。皆さんの人生がより豊かになるお手伝いができることが、私の最大の喜びです」</p>
                <div style="text-align: center; margin-top: 30px;">
                <a href="https://rarea.events/event/270723" target="_blank" class="btn">もっと詳しく（外部サイト）</a>
            </div>
                </div>
        </div>
    `;
  modal.style.display = "block";
  document.body.style.overflow = "hidden";
}

function closeModal() {
  const modal = document.getElementById("profileModal");
  if (modal) modal.style.display = "none";
  document.body.style.overflow = "auto";
}

// ===== 初期化処理 =====
document.addEventListener("DOMContentLoaded", () => {
  // スクロールイベント
  window.addEventListener("scroll", () => {
    updateScrollProgress();
    updateScrollButtons();
  });

  // アニメーション監視開始
  document.querySelectorAll(".animate-on-scroll").forEach((el) => {
    animateObserver.observe(el);
  });

  // カウンター監視開始
  document.querySelectorAll(".stat-number[data-target]").forEach((el) => {
    counterObserver.observe(el);
  });

  // スライダー初期化
  initSlider();

  // モーダル外側クリックで閉じる
  window.onclick = function (event) {
    const mapModal = document.getElementById("map-modal");
    const profileModal = document.getElementById("profileModal");
    if (event.target == mapModal) closeMap();
    if (event.target == profileModal) closeModal();
  };
});
