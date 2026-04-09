(function () {
  "use strict";

  var STORAGE_KEY = "perfectlymitzi-font-size";

  function setFontSize(size) {
    var html = document.documentElement;
    html.classList.remove("fs-medium", "fs-large");
    if (size === "medium") html.classList.add("fs-medium");
    if (size === "large") html.classList.add("fs-large");
    try {
      localStorage.setItem(STORAGE_KEY, size || "small");
    } catch (e) {
      /* ignore */
    }
  }

  function initFontResize() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "medium" || saved === "large") setFontSize(saved);
    } catch (e) {
      /* ignore */
    }

    var wrap = document.querySelector(".font-resize");
    if (!wrap) return;

    wrap.querySelectorAll("[data-font-size]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        setFontSize(btn.getAttribute("data-font-size") || "small");
      });
    });
  }

  function initNavActive() {
    var path = window.location.pathname || "";
    var page = path.split("/").pop() || "";
    if (!page || page === "") page = "index.html";
    /* file:// on Windows may include drive; normalize to filename */
    if (page.indexOf("\\") !== -1) page = page.split("\\").pop() || page;

    document.querySelectorAll(".main-nav a[data-nav]").forEach(function (a) {
      var target = a.getAttribute("data-nav");
      if (target === page) {
        a.classList.add("is-active");
      } else {
        a.classList.remove("is-active");
      }
    });
  }

  function initBackgroundFallback() {
    var img = new Image();
    img.onerror = function () {
      document.body.classList.add("no-bg-image");
    };
    img.src = "assets/david.jpg";
  }

  function initFeatureCarousels() {
    document.querySelectorAll("[data-feature-carousel]").forEach(function (root) {
      var track = root.querySelector(".feature-carousel__track");
      var viewport = root.querySelector(".feature-carousel__viewport");
      var prevBtn = root.querySelector(".feature-carousel__arrow--prev");
      var nextBtn = root.querySelector(".feature-carousel__arrow--next");
      var dotsWrap = root.querySelector(".feature-carousel__dots");
      if (!track || !viewport || !prevBtn || !nextBtn || !dotsWrap) return;

      var slides = track.querySelectorAll("[data-carousel-slide]");
      var n = slides.length;
      if (n === 0) return;

      var index = 0;
      var intervalMs = parseInt(root.getAttribute("data-carousel-interval") || "0", 10);
      var timer = null;
      var reducedMotion =
        typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (reducedMotion) root.classList.add("is-reduced-motion");

      function announceSlide(i) {
        var img = slides[i].querySelector("img");
        var t = img && img.getAttribute("alt") ? img.getAttribute("alt") : "Slide " + (i + 1);
        viewport.setAttribute("aria-label", "Slide " + (i + 1) + " of " + n + ": " + t);
      }

      function goTo(i) {
        index = ((i % n) + n) % n;
        track.style.transform = "translateX(-" + index * 100 + "%)";
        slides.forEach(function (slide, j) {
          var hidden = j !== index;
          slide.setAttribute("aria-hidden", hidden ? "true" : "false");
        });
        dotsWrap.querySelectorAll(".feature-carousel__dot").forEach(function (dot, j) {
          if (j === index) dot.setAttribute("aria-current", "true");
          else dot.removeAttribute("aria-current");
        });
        announceSlide(index);
      }

      function next() {
        goTo(index + 1);
      }

      function prev() {
        goTo(index - 1);
      }

      function startAutoplay() {
        if (reducedMotion || !intervalMs || intervalMs < 2000) return;
        stopAutoplay();
        timer = window.setInterval(next, intervalMs);
      }

      function stopAutoplay() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      for (var d = 0; d < n; d++) {
        (function (j) {
          var b = document.createElement("button");
          b.type = "button";
          b.className = "feature-carousel__dot";
          b.setAttribute("aria-label", "Go to slide " + (j + 1));
          b.addEventListener("click", function () {
            goTo(j);
            startAutoplay();
          });
          dotsWrap.appendChild(b);
        })(d);
      }

      prevBtn.addEventListener("click", function () {
        prev();
        startAutoplay();
      });
      nextBtn.addEventListener("click", function () {
        next();
        startAutoplay();
      });

      root.addEventListener("mouseenter", stopAutoplay);
      root.addEventListener("mouseleave", startAutoplay);
      root.addEventListener("focusin", stopAutoplay);
      root.addEventListener("focusout", function (e) {
        if (!root.contains(e.relatedTarget)) startAutoplay();
      });

      viewport.addEventListener("keydown", function (e) {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          prev();
          startAutoplay();
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          next();
          startAutoplay();
        }
      });

      goTo(0);
      startAutoplay();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initFontResize();
    initNavActive();
    initBackgroundFallback();
    initFeatureCarousels();
  });
})();
