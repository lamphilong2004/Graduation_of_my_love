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
  } else if (timeParam === '11h40') {
    displayTime = "11 giờ 40";
    targetTimeStr = "11:40:00";
  } else if (timeParam === '17h') {
    displayTime = "17 giờ 00";
    targetTimeStr = "17:00:00";
  }

  // Cập nhật text hiển thị giờ trên giao diện
  const timeDisplayEl = document.querySelector('.cd-time');
  if (timeDisplayEl) {
    timeDisplayEl.innerText = displayTime;
  }

  const eventTimeEl = document.getElementById('event-time');
  if (eventTimeEl) {
    if (timeParam === '11h') {
      eventTimeEl.innerText = "11h00";
    } else if (timeParam === '11h40') {
      eventTimeEl.innerText = "11h40";
    } else if (timeParam === '17h') {
      eventTimeEl.innerText = "17h00";
    } else if (timeParam) {
      eventTimeEl.innerText = timeParam;
    }
  }

  // 3. COUNTDOWN TIMER
  const countDownDate = new Date("Jul 25, 2026 " + targetTimeStr).getTime();
  const timerInterval = setInterval(function () {
    const now = new Date().getTime();
    const distance = countDownDate - now;

    if (distance < 0) return clearInterval(timerInterval);

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
    if (chatContainer.children.length > 0) {
      const first = chatContainer.children[0];
      const clone = first.cloneNode(true);
      first.remove();
      chatContainer.appendChild(clone);
    }
  }, 3500);

  // HÀM HIỂN THỊ THÔNG BÁO CUSTOM
  function showCustomAlert(title, message, iconClass = 'fa-heart') {
    const alertModal = document.getElementById('custom-alert-modal');
    const alertTitle = document.getElementById('custom-alert-title');
    const alertMsg = document.getElementById('custom-alert-msg');
    const alertIcon = document.getElementById('custom-alert-icon');
    const alertOk = document.getElementById('custom-alert-ok');

    if (alertModal && alertTitle && alertMsg && alertIcon) {
      alertTitle.innerHTML = title;
      alertMsg.innerHTML = message;
      alertIcon.innerHTML = `<i class="fas ${iconClass}"></i>`;
      alertModal.classList.remove('hidden');

      if (alertOk) {
        alertOk.onclick = () => {
          alertModal.classList.add('hidden');
        };
      }
    } else {
      alert(message); // Fallback
    }
  }

  // 6. XỬ LÝ GỬI LỜI CHÚC (INLINE FORM - KẾT NỐI FIREBASE)
  const submitInlineWishBtn = document.getElementById('submit-inline-wish-btn');
  const inlineWishNameInput = document.getElementById('inline-wish-name');
  const inlineWishTextInput = document.getElementById('inline-wish-text');

  // Lắng nghe dữ liệu từ Firebase
  onChildAdded(wishesRef, (snapshot) => {
    const data = snapshot.val();

    const newBubble = document.createElement('div');
    newBubble.className = 'chat-bubble';

    // Đổi icon theo trạng thái tham gia để phân biệt tinh tế (giữ chung 1 màu nền để không phân biệt đối xử)
    let iconHTML = '';
    
    // Nền hồng rực rỡ chung cho tất cả
    newBubble.style.background = 'linear-gradient(135deg, #ff8fa3, #ff4d6d)'; 
    newBubble.style.color = '#ffffff';
    newBubble.style.border = '1px solid #ff4d6d';

    if (data.isAttending === false) {
      // Chỉ gửi lời chúc
      iconHTML = '<i class="fas fa-envelope-open-text" style="margin-right: 6px;"></i>';
    } else {
      // Xác nhận tham gia
      iconHTML = '<i class="fas fa-graduation-cap" style="margin-right: 6px;"></i>';
    }

    newBubble.innerHTML = `${iconHTML}<strong>${data.name}:</strong> ${data.text}`;
    chatContainer.appendChild(newBubble);
  });

  if (submitInlineWishBtn) {
    submitInlineWishBtn.addEventListener('click', () => {
      const name = inlineWishNameInput.value.trim();
      const text = inlineWishTextInput.value.trim();
      // Khách chỉ dùng form này là gửi lời chúc (không tham gia) -> xám
      const isAttending = false;

      if (!name || !text) {
        showCustomAlert("Khoan đã nào!", "Vui lòng nhập đầy đủ tên và lời chúc nhé!", "fa-exclamation-circle");
        return;
      }

      // Đổi thành "Đang gửi..." để user không bấm liên tục
      const originalText = submitInlineWishBtn.innerHTML;
      submitInlineWishBtn.innerHTML = "<i class='fas fa-spinner fa-spin'></i> Đang gửi...";
      submitInlineWishBtn.disabled = true;

      // Đẩy dữ liệu lên Firebase
      push(wishesRef, {
        name: name,
        text: text,
        isAttending: isAttending,
        timestamp: Date.now()
      }).then(() => {
        // Xóa form
        inlineWishNameInput.value = '';
        inlineWishTextInput.value = '';
        submitInlineWishBtn.innerHTML = originalText;
        submitInlineWishBtn.disabled = false;
        showCustomAlert("Tuyệt vời!", "Gửi lời chúc thành công! Bạn hãy nhìn lên khung chat nhé!", "fa-paper-plane");
      }).catch((error) => {
        console.error("Lỗi khi gửi lời chúc:", error);
        submitInlineWishBtn.innerHTML = originalText;
        submitInlineWishBtn.disabled = false;
        showCustomAlert("Ôi hỏng!", "Có lỗi xảy ra, vui lòng thử lại sau.", "fa-times-circle");
      });
    });
  }

  // 6.5 LOGIC NÚT XÁC NHẬN THAM GIA
  const confirmAttendanceBtn = document.getElementById('confirm-attendance-btn');
  const customPromptModal = document.getElementById('custom-prompt-modal');
  const customPromptName = document.getElementById('custom-prompt-name');
  const customPromptText = document.getElementById('custom-prompt-text');
  const customPromptConfirm = document.getElementById('custom-prompt-ok');
  const customPromptCancel = document.getElementById('custom-prompt-cancel');
  const customPromptTitle = document.getElementById('custom-prompt-title');
  const customPromptMsg = document.getElementById('custom-prompt-msg');
  const customPromptIcon = document.getElementById('custom-prompt-icon');

  // Lưu lại tên nếu họ đã gửi form
  let savedName = "";

  // Sửa lại submitInlineWishBtn để lưu tên
  if (submitInlineWishBtn) {
    const oldOnClick = submitInlineWishBtn.onclick;
    submitInlineWishBtn.addEventListener('click', () => {
       savedName = inlineWishNameInput.value.trim(); // Lưu lại tên trước khi form bị xóa
    });
  }

  function proceedWithConfirmation(name, text) {
    const originalHtml = confirmAttendanceBtn.innerHTML;
    confirmAttendanceBtn.innerHTML = "<i class='fas fa-spinner fa-spin'></i> Đang gửi...";
    confirmAttendanceBtn.disabled = true;

    push(wishesRef, {
      name: name,
      text: text || "Chúc Mừng!",
      isAttending: true,
      timestamp: Date.now()
    }).then(() => {
      confirmAttendanceBtn.innerHTML = "<i class='fas fa-check'></i> Đã xác nhận tham gia";
      confirmAttendanceBtn.style.background = "#4CAF50";

      showCustomAlert("Cảm ơn bạn!", `Hẹn gặp lại <strong>${name}</strong> ở tại buổi lễ tốt nghiệp của mình nhé !!!`, "fa-heart");
    }).catch((error) => {
      console.error('Lỗi khi xác nhận:', error);
      confirmAttendanceBtn.innerHTML = originalHtml;
      confirmAttendanceBtn.disabled = false;
      showCustomAlert("Ôi hỏng!", "Có lỗi xảy ra khi xác nhận. Bạn thử lại sau nhé.", "fa-times-circle");
    });
  }

  if (confirmAttendanceBtn) {
    confirmAttendanceBtn.addEventListener('click', () => {
      let name = inlineWishNameInput.value.trim() || savedName;
      let text = inlineWishTextInput.value.trim();

      if (!name) {
        if (customPromptModal) {
          if(customPromptTitle) customPromptTitle.innerHTML = "Nhập tên của bạn";
          if(customPromptMsg) customPromptMsg.innerHTML = "Hãy để lại tên để mình biết bạn sẽ đến nhé!";
          if(customPromptIcon) customPromptIcon.innerHTML = '<i class="fas fa-graduation-cap"></i>';
          if(customPromptConfirm) customPromptConfirm.innerHTML = "Xác nhận";
          
          if(customPromptText) customPromptText.style.display = 'none'; // Ẩn trường nhập lời chúc

          customPromptName.value = '';
          customPromptModal.classList.remove('hidden');
          setTimeout(() => customPromptName.focus(), 100);
        } else {
          name = prompt("Vui lòng nhập tên của bạn:");
          if (name && name.trim() !== "") {
            savedName = name;
            proceedWithConfirmation(name, "");
          }
        }
      } else {
        proceedWithConfirmation(name, text);
      }
    });

    if (customPromptConfirm && customPromptCancel) {
      customPromptCancel.addEventListener('click', () => {
        customPromptModal.classList.add('hidden');
      });

      customPromptConfirm.addEventListener('click', () => {
        const inputName = customPromptName.value.trim();
        if (!inputName) {
          customPromptName.focus();
          return;
        }
        customPromptModal.classList.add('hidden');
        savedName = inputName;
        proceedWithConfirmation(inputName, "");
      });

      customPromptName.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          customPromptConfirm.click();
        }
      });
    }
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
      dynamicBullets: true,
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
      slide.addEventListener('click', function (e) {
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
    lightboxClose.addEventListener('click', function () {
      lightbox.classList.add('hidden');
    });

    // Đóng lightbox khi click ra ngoài ảnh
    lightbox.addEventListener('click', function (e) {
      if (e.target !== lightboxImg) {
        lightbox.classList.add('hidden');
      }
    });
  }

  // 10. CUSTOM ALERT MODAL LOGIC
  const customAlertModal = document.getElementById('custom-alert-modal');
  const customAlertCloseBtn = document.getElementById('custom-alert-close');

  if (customAlertModal && customAlertCloseBtn) {
    customAlertCloseBtn.addEventListener('click', () => {
      customAlertModal.classList.add('hidden');
    });

    // Đóng khi click ra ngoài nội dung
    customAlertModal.addEventListener('click', (e) => {
      if (e.target === customAlertModal) {
        customAlertModal.classList.add('hidden');
      }
    });
  }

});





  // XỬ LÝ SỰ KIỆN CHO SECRET ENVELOPE (LỜI CHÚC CỦA NGƯỜI YÊU)
  const secretBtn = document.getElementById("secret-envelope-btn");
  const secretModal = document.getElementById("secret-modal");
  const closeSecretBtn = document.getElementById("close-secret-btn");
  const secretOkBtn = document.getElementById("secret-modal-ok");

  const authModal1 = document.getElementById("auth-modal-1");
  const closeAuth1 = document.getElementById("close-auth-1");
  const authPwdInput = document.getElementById("auth-pwd-input");
  const authSubmitBtn = document.getElementById("auth-submit-btn");
  const authErrorMsg = document.getElementById("auth-error-msg");

  const authModal2 = document.getElementById("auth-modal-2");
  const authAnsYes = document.getElementById("auth-ans-yes");
  const authAnsNo = document.getElementById("auth-ans-no");

  if (secretBtn) {
    secretBtn.addEventListener("click", () => {
      // Mở modal 1 (Mật khẩu) thay vì mở thẳng secret modal
      authModal1.classList.remove("hidden");
      authPwdInput.value = "";
      authErrorMsg.style.display = "none";
      setTimeout(() => authPwdInput.focus(), 100);
    });
  }

  if (closeAuth1) {
    closeAuth1.addEventListener("click", () => {
      authModal1.classList.add("hidden");
    });
  }

  if (authSubmitBtn) {
    authSubmitBtn.addEventListener("click", () => {
      if (authPwdInput.value.trim() === "14042022") {
        // Đúng mật khẩu
        authModal1.classList.add("hidden");
        authModal2.classList.remove("hidden");
      } else {
        // Sai mật khẩu
        authErrorMsg.style.display = "block";
        const alertBox = authModal1.querySelector(".alert-content");
        alertBox.classList.remove("shake");
        void alertBox.offsetWidth; // trigger reflow
        alertBox.classList.add("shake");
      }
    });

    authPwdInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") authSubmitBtn.click();
    });
  }

  if (authAnsNo) {
    const runaway = () => {
      const container = authAnsNo.parentElement;
      // Trừ hao kích thước nút để không bay ra ngoài
      const maxX = container.clientWidth - authAnsNo.clientWidth;
      const maxY = container.clientHeight - authAnsNo.clientHeight + 100; // allow moving slightly lower
      
      const newX = Math.max(0, Math.random() * maxX);
      const newY = Math.max(0, Math.random() * maxY - 50); // allow moving up and down
      
      authAnsNo.style.transition = "0.2s";
      authAnsNo.style.left = newX + "px";
      authAnsNo.style.top = newY + "px";
    };

    authAnsNo.addEventListener("mouseover", runaway);
    authAnsNo.addEventListener("touchstart", (e) => {
      e.preventDefault(); // Ngăn click trên điện thoại
      runaway();
    }, {passive: false});
  }

  if (authAnsYes) {
    authAnsYes.addEventListener("click", () => {
      authModal2.classList.add("hidden");
      secretModal.classList.remove("hidden");
    });
  }

  if (closeSecretBtn) {
    closeSecretBtn.addEventListener("click", () => {
      secretModal.classList.add("hidden");
    });
  }
  
  if (secretOkBtn) {
    secretOkBtn.addEventListener("click", () => {
      secretModal.classList.add("hidden");
    });
  }
