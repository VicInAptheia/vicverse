// ====== 极简：自带缓动滚动（不依赖浏览器） ======
function easeInOutCubic(t){ return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2; }
function smoothScrollTo(targetY, duration = 700){
  const startY = window.pageYOffset;
  const dist = targetY - startY;
  const t0 = performance.now();
  function step(now){
    const p = Math.min((now - t0) / duration, 1);
    const y = startY + dist * easeInOutCubic(p);
    window.scrollTo(0, y);
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
function topWithOffset(el, offset = 80){
  const r = el.getBoundingClientRect();
  return r.top + window.pageYOffset - offset;
}

// ====== 自动年份（可留）======
const yr = document.querySelector("[data-year]");
if (yr) yr.textContent = new Date().getFullYear();

// ====== 接管所有锚点：a[href^="#"] 与 data-scroll ======
document.addEventListener("click", (e) => {
  const link = e.target.closest('a[href^="#"], [data-scroll]');
  if (!link) return;

  const href = link.getAttribute("href");
  if (!href || href === "#" || !href.startsWith("#")) return;

  const target = document.querySelector(href);
  if (!target) return;

  // 阻止默认瞬移
  e.preventDefault();
  try { history.pushState(null, "", href); } catch {}

  // 平滑滚动
  smoothScrollTo(topWithOffset(target, 80), 700);
});
// ====== 第二屏（About）任何操作 → 自动跳到第三屏 ======
document.addEventListener("DOMContentLoaded", () => {
  const about   = document.querySelector("#about");
  const gallery = document.querySelector("#gallery");
  if (!about || !gallery) return;

  let advanced = false;
  function goToGallery(){
    if (advanced) return;
    advanced = true;
    smoothScrollTo(topWithOffset(gallery, 80), 700);
  }

  // 当进入 about 区域时，监听任何用户操作
  window.addEventListener("scroll", () => {
    const r = about.getBoundingClientRect();
    const entered = r.top < window.innerHeight * 0.85 && r.bottom > 0;
    if (entered){
      // 绑定一次性触发事件
      const opts = { once: true, passive: true };
      about.addEventListener("click",      goToGallery, opts);
      about.addEventListener("wheel",      goToGallery, opts);
      about.addEventListener("touchstart", goToGallery, opts);
      about.addEventListener("mousemove",  goToGallery, opts);
      window.addEventListener("keydown",   goToGallery, opts);
    }
  }, { passive: true });
});
// ---- 让 .reveal 在手机/PC 都能显现 ----
document.addEventListener("DOMContentLoaded", () => {
  const items = document.querySelectorAll(".reveal");
  const show = el => el.classList.add("in");

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -20% 0px", threshold: 0.1 });
    items.forEach(el => io.observe(el));
  } else {
    // 兜底：旧设备或任何异常，直接显示
    items.forEach(show);
  }
});
