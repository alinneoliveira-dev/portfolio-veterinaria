(function () {
  "use strict";
  var SITE = window.SITE, CURSOS = window.CURSOS || [];
  var $ = function (s, r) { return (r || document).querySelector(s); };

  /* Links de contato */
  var wa = "https://wa.me/" + SITE.whatsapp + "?text=" + encodeURIComponent(SITE.whatsappMessage);
  $("#wa-main").href = wa;
  $("#wa-fab").href = wa;
  $("#wa-label").textContent = SITE.whatsappLabel;
  var mail = $("#mail-link");
  mail.textContent = SITE.email;
  mail.href = "mailto:" + SITE.email;
  if (SITE.linkedin) { $("#ln-link").href = SITE.linkedin; $("#ln-box").hidden = false; }

  /* Menu mobile */
  var burger = $("#burger"), menu = $("#menu");
  function setMenu(open) {
    menu.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  }
  burger.addEventListener("click", function () { setMenu(!menu.classList.contains("open")); });
  menu.addEventListener("click", function (e) { if (e.target.tagName === "A") setMenu(false); });

  /* Copiar e-mail */
  $(".copy").addEventListener("click", function (e) {
    var b = e.currentTarget;
    function ok() { b.textContent = "Copiado"; setTimeout(function () { b.textContent = "Copiar"; }, 1800); }
    function select() { var r = document.createRange(); r.selectNodeContents(mail); var s = getSelection(); s.removeAllRanges(); s.addRange(r); }
    try { navigator.clipboard.writeText(SITE.email).then(ok, select); } catch (err) { select(); }
  });

  /* Cursos e certificados */
  var lightbox = $("#lightbox"), lbImg = $("#lightbox img");
  function openLightbox(src, alt) { lbImg.src = src; lbImg.alt = alt; lightbox.hidden = false; $("#lb-close").focus(); }
  function closeLightbox() { lightbox.hidden = true; lbImg.removeAttribute("src"); }
  lightbox.addEventListener("click", function (e) { if (e.target !== lbImg) closeLightbox(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !lightbox.hidden) closeLightbox(); });

  var box = $("#cursos");
  CURSOS.forEach(function (c) {
    var isPdf = /\.pdf$/i.test(c.cert || "");
    var card = document.createElement("article");
    card.className = "card";

    if (c.cert && !isPdf) {
      var thumb = document.createElement("button");
      thumb.type = "button";
      thumb.className = "cert-thumb";
      thumb.setAttribute("aria-label", "Ampliar certificado: " + c.nome);
      var img = document.createElement("img");
      img.src = c.cert; img.alt = "Certificado do curso " + c.nome; img.loading = "lazy";
      thumb.appendChild(img);
      thumb.addEventListener("click", function () { openLightbox(c.cert, img.alt); });
      card.appendChild(thumb);
    }

    var body = document.createElement("div");
    body.className = "body";
    var meta = document.createElement("span"); meta.className = "meta"; meta.textContent = c.data;
    var h = document.createElement("h4"); h.textContent = c.nome;
    var inst = document.createElement("span"); inst.className = "inst"; inst.textContent = c.inst;
    var cert = document.createElement("span"); cert.className = "cert";
    if (c.cert && isPdf) {
      var a = document.createElement("a"); a.href = c.cert; a.target = "_blank"; a.rel = "noopener"; a.textContent = "Abrir certificado (PDF)";
      cert.appendChild(a);
    } else if (c.cert) {
      var btn = document.createElement("button"); btn.type = "button"; btn.textContent = "Ver certificado";
      btn.addEventListener("click", function () { openLightbox(c.cert, "Certificado do curso " + c.nome); });
      cert.appendChild(btn);
    } else {
      cert.textContent = "Certificado de conclusão";
    }
    body.appendChild(meta); body.appendChild(h); body.appendChild(inst); body.appendChild(cert);
    card.appendChild(body);
    box.appendChild(card);
  });

  /* Carrossel da galeria */
  var track = $("#track"), prev = $("#car-prev"), next = $("#car-next"), bar = $("#car-progress");
  function step() {
    var s = track.querySelector(".slide");
    return s ? s.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 16) : 300;
  }
  function update() {
    var max = track.scrollWidth - track.clientWidth;
    prev.disabled = track.scrollLeft <= 4;
    next.disabled = track.scrollLeft >= max - 4;
    var visible = track.clientWidth / track.scrollWidth;
    bar.style.width = Math.max(visible * 100, 12) + "%";
    bar.style.marginLeft = max > 0 ? (track.scrollLeft / max) * (100 - parseFloat(bar.style.width)) + "%" : "0";
  }
  prev.addEventListener("click", function () { track.scrollBy({ left: -step() * 2, behavior: "smooth" }); });
  next.addEventListener("click", function () { track.scrollBy({ left: step() * 2, behavior: "smooth" }); });
  track.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  track.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") { e.preventDefault(); next.click(); }
    if (e.key === "ArrowLeft") { e.preventDefault(); prev.click(); }
  });

  /* Arrastar com o mouse (no celular o toque já rola nativamente) */
  var down = false, startX = 0, startLeft = 0;
  track.addEventListener("pointerdown", function (e) {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    down = true; startX = e.clientX; startLeft = track.scrollLeft;
    track.classList.add("dragging");
    track.setPointerCapture(e.pointerId);
  });
  track.addEventListener("pointermove", function (e) {
    if (down) track.scrollLeft = startLeft - (e.clientX - startX);
  });
  function endDrag() { if (!down) return; down = false; track.classList.remove("dragging"); }
  track.addEventListener("pointerup", endDrag);
  track.addEventListener("pointercancel", endDrag);
  update();
})();
