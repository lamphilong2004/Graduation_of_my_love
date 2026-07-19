import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, push, onChildAdded } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import Swiper from "https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.mjs";

// Cấu hình Firebase của bạn
const firebaseConfig = {
  apiKey: "AIzaSyCClujkDBzczuUmhSiDe4thEGaTTgs2r2w",
  authDomain: "graduation-e4488.firebaseapp.com",
  databaseURL: "https://graduation-e4488-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "graduation-e4488",
  storageBucket: "graduation-e4488.firebasestorage.app",
  messagingSenderId: "293876007301",
  appId: "1:293876007301:web:ee888170a97278008d44ec",
  measurementId: "G-ZG8D9N7HGC"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const wishesRef = ref(db, 'wishes');

document.addEventListener('DOMContentLoaded', () => {

  const doorOverlay = document.getElementById('door-overlay');
  const doorIcon = document.getElementById('door-icon');
  const musicOverlay = document.getElementById('music-overlay');
  const mainContent = document.getElementById('main-content');
  const fixedUi = document.getElementById('fixed-ui');
  
  // 1. CLICK ĐỂ MỞ CỬA (Bấm vào bất cứ đâu trên màn hình cánh cửa)
  doorOverlay.addEventListener('click', () => {
    // Kích hoạt animation mở cửa
    doorOverlay.classList.add('open');
    
    // Đợi cửa mở xong thì ẩn hẳn div đó đi và hiện màn hình "Nghe nhạc"
    setTimeout(() => {
      doorOverlay.classList.add('hidden-fully');
      mainContent.classList.remove('hidden');
      musicOverlay.classList.remove('hidden');
      
      // Khởi tạo các animation scroll
      initScrollAnimations();
    }, 1200);
  });

  // 2. CLICK ĐỂ TẮT MÀN HÌNH NGHE NHẠC VÀ HIỆN GIAO DIỆN CHÍNH
  musicOverlay.addEventListener('click', () => {
    musicOverlay.classList.add('hidden');
    fixedUi.classList.remove('hidden');
    
    // Bật nhạc
    const bgMusic = document.getElementById('bg-music');
    if (bgMusic) {
      bgMusic.play().catch(e => console.log("Trình duyệt chặn autoplay:", e));
    }
  });

  // LOGIC NÚT BẬT/TẮT NHẠC
  const musicBtn = document.getElementById('music-btn');
  if (musicBtn) {
    musicBtn.addEventListener('click', () => {
      const bgMusic = document.getElementById('bg-music');
      if (!bgMusic) return;
      const icon = musicBtn.querySelector('i');
      if (bgMusic.paused) {
        bgMusic.play();
        icon.classList.remove('fa-volume-mute');
        icon.classList.add('fa-volume-up');
      } else {
        bgMusic.pause();
        icon.classList.remove('fa-volume-up');
        icon.classList.add('fa-volume-mute');
      }
    });
  }

  // --- LOGIC ĐỔI GIỜ THEO LINK ---
  const urlParams = new URLSearchParams(window.location.search);
  const timeParam = urlParams.get('time');
  
  let displayTime = "10 giờ 00"; // Mặc định
  let targetTimeStr = "10:00:00";

  if (timeParam === '11h') {
    displayTime = "11 giờ 00";
    targetTimeStr = "11:00:00";
  } else if (timeParam === '11h30') {
    displayTime = "11 giờ 30";
    targetTimeStr = "11:30:00";
  } else if (timeParam === '17h') {
    displayTime = "17 giờ 00";
    targetTimeStr = "17:00:00";
  }

  // Cập nhật text hiển thị giờ trên giao diện
  const timeDisplayEl = document.querySelector('.cd-time');
  if (timeDisplayEl) {
    timeDisplayEl.innerText = displayTime;
  }

  // 3. COUNTDOWN TIMER
  const countDownDate = new Date("Jul 25, 2026 " + targetTimeStr).getTime();
  const timerInterval = setInterval(function() {
    const now = new Date().getTime();
    const distance = countDownDate - now;

    if(distance < 0) return clearInterval(timerInterval);

    document.getElementById("days").innerHTML = Math.floor(distance / (1000 * 60 * 60 * 24)).toString().padStart(2, '0');
    document.getElementById("hours").innerHTML = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, '0');
    document.getElementById("minutes").innerHTML = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
    document.getElementById("seconds").innerHTML = Math.floor((distance % (1000 * 60)) / 1000).toString().padStart(2, '0');
  }, 1000);

  // 4. SCROLL ANIMATIONS
  function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.animate-on-scroll').forEach((el) => {
      observer.observe(el);
    });
  }

  // 5. ANIMATION TIN NHẮN TRÔI LÊN
  const chatContainer = document.getElementById('chat-container');
  // Simple logic: clone the first message, append to bottom, remove top to loop
  setInterval(() => {
    if(chatContainer.children.length > 0) {
      const first = chatContainer.children[0];
      const clone = first.cloneNode(true);
      first.remove();
      chatContainer.appendChild(clone);
    }
  }, 3500);

  // 6. XỬ LÝ GỬI LỜI CHÚC (INLINE FORM - KẾT NỐI FIREBASE)
  const submitInlineWishBtn = document.getElementById('submit-inline-wish-btn');
  const inlineWishNameInput = document.getElementById('inline-wish-name');
  const inlineWishTextInput = document.getElementById('inline-wish-text');

  let isFirstLoad = true;

  // Lắng nghe dữ liệu từ Firebase
  onChildAdded(wishesRef, (snapshot) => {
    const data = snapshot.val();
    
    // Xóa các tin nhắn mẫu đi khi có tin nhắn thật đầu tiên
    if (isFirstLoad) {
      chatContainer.innerHTML = '';
      isFirstLoad = false;
    }

    const newBubble = document.createElement('div');
    newBubble.className = 'chat-bubble';
    newBubble.innerHTML = `<strong>${data.name}:</strong> ${data.text}`;
    chatContainer.appendChild(newBubble);
  });

  if (submitInlineWishBtn) {
    submitInlineWishBtn.addEventListener('click', () => {
      const name = inlineWishNameInput.value.trim();
      const text = inlineWishTextInput.value.trim();
      
      if (!name || !text) {
        alert("Vui lòng nhập đầy đủ tên và lời chúc nhé!");
        return;
      }
      
      // Đổi thành "Đang gửi..." để user không bấm liên tục
      const originalText = submitInlineWishBtn.innerText;
      submitInlineWishBtn.innerText = "Đang gửi...";
      submitInlineWishBtn.disabled = true;

      // Đẩy dữ liệu lên Firebase
      push(wishesRef, {
        name: name,
        text: text,
        timestamp: Date.now()
      }).then(() => {
        // Xóa form
        inlineWishNameInput.value = '';
        inlineWishTextInput.value = '';
        submitInlineWishBtn.innerText = originalText;
        submitInlineWishBtn.disabled = false;
        alert("Gửi lời chúc thành công! Bạn hãy nhìn lên khung chat nhé!");
      }).catch((error) => {
        console.error("Lỗi khi gửi lời chúc:", error);
        submitInlineWishBtn.innerText = originalText;
        submitInlineWishBtn.disabled = false;
        alert("Có lỗi xảy ra, vui lòng thử lại sau.");
      });
    });
  }

  // 7. HIỆU ỨNG BAY BAY CHILL
  const floatingContainer = document.getElementById('floating-container');
  // Bạn có thể đổi icon tùy thích ở đây (nón tốt nghiệp, ngôi sao, hoa bồ công anh...)
  const floatingItems = ['🎓', '✨', '☁️', '🌸'];
  
  if (floatingContainer) {
    setInterval(() => {
      // Chỉ tạo hiệu ứng nếu màn hình chính đang hiện (đã mở cửa)
      if (mainContent.classList.contains('hidden')) return;

      const el = document.createElement('div');
      el.className = 'floating-item';
      el.innerText = floatingItems[Math.floor(Math.random() * floatingItems.length)];
      
      // Random vị trí xuất phát từ trái sang phải (0 đến 100vw)
      el.style.left = Math.random() * 100 + 'vw';
      // Random thời gian bay (từ 10s đến 20s để tạo cảm giác chậm rãi, chill)
      el.style.animationDuration = (Math.random() * 10 + 10) + 's';
      // Random kích thước (từ 1rem đến 2rem)
      el.style.fontSize = (Math.random() * 1 + 1) + 'rem';
      
      floatingContainer.appendChild(el);
      
      // Tự động xóa khỏi DOM sau 22s để không bị nặng máy
      setTimeout(() => {
        el.remove();
      }, 22000);
    }, 1000); // Cứ 1 giây tạo 1 icon bay bay
  }

  // 8. KHỞI TẠO ALBUM SWIPER (3D COVERFLOW)
  const swiper = new Swiper(".mySwiper", {
    effect: "coverflow",
    grabCursor: true,
    centeredSlides: true,
    slidesPerView: "auto",
    observer: true,         // <-- FIX: Cập nhật Swiper khi nó chuyển từ display:none sang block
    observeParents: true,   // <-- FIX: Quan sát cả container cha
    slideToClickedSlide: true, 
    mousewheel: {
      forceToAxis: true, 
    },
    coverflowEffect: {
      rotate: 30, 
      stretch: 0,
      depth: 150, 
      modifier: 1,
      slideShadows: true, 
    },
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    loop: true,
    initialSlide: 1,
  });

  // 9. LIGHTBOX LOGIC (Xem ảnh full màn hình)
  const lightbox = document.getElementById('image-lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.querySelector('.lightbox-close');

  if (lightbox && lightboxImg && lightboxClose) {
    const swiperSlides = document.querySelectorAll('.swiper-slide');
    
    swiperSlides.forEach(slide => {
      slide.addEventListener('click', function(e) {
        // Chỉ phóng to nếu người dùng click vào ảnh đang ở giữa (active)
        // Nếu click ảnh hai bên, Swiper sẽ tự động trượt ảnh đó vào giữa
        if (slide.classList.contains('swiper-slide-active')) {
          const img = slide.querySelector('img');
          if (img) {
            lightbox.classList.remove('hidden');
            lightboxImg.src = img.src;
          }
        }
      });
    });

    // Đóng lightbox khi click nút X
    lightboxClose.addEventListener('click', function() {
      lightbox.classList.add('hidden');
    });

    // Đóng lightbox khi click ra ngoài ảnh
    lightbox.addEventListener('click', function(e) {
      if (e.target !== lightboxImg) {
        lightbox.classList.add('hidden');
      }
    });
  }

});
