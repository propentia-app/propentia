/* =========================================================
   propentia — imágenes más ligeras para la nube
   Antes de subir una imagen a la biblioteca o a un documento guardado se
   pasa por aquí. Reglas:
   - Más grande que MAX_DIM por algún lado: se reduce (igual que antes).
   - Con transparencia (p. ej. un plano con el fondo borrado): se guarda como
     WebP (o PNG si el navegador no sabe crear WebP), porque un JPEG
     convertiría lo transparente en negro.
   - Sin transparencia (renders, fotos): se guarda como JPEG. Un render en PNG
     pesa de 1.5 a 2.6 MB; en JPEG calidad 0.85 pesa una décima parte y en el
     PDF no se nota.
   - Un JPEG que ya cabe en MAX_DIM no se vuelve a comprimir (no se degrada).
   - Nunca se devuelve algo MÁS pesado que el original: si no se gana al menos
     15 %, se deja el original tal cual.
   ========================================================= */
(function () {
  "use strict";

  const MAX_DIM = 1600;
  const JPEG_QUALITY = 0.85;
  const WEBP_QUALITY = 0.85;
  const MIN_GAIN = 0.85; // el resultado debe pesar menos del 85 % del original para reemplazarlo

  function mimeOf(dataUrl) {
    const m = /^data:(image\/[a-z0-9.+-]+)/i.exec(dataUrl);
    return m ? m[1].toLowerCase() : "";
  }

  // Devuelve una promesa con el data URL optimizado (o el mismo si no conviene tocarlo).
  function optimize(dataUrl) {
    if (typeof dataUrl !== "string" || dataUrl.indexOf("data:image/") !== 0) return Promise.resolve(dataUrl);
    const mime = mimeOf(dataUrl);
    if (mime === "image/svg+xml" || mime === "image/gif") return Promise.resolve(dataUrl);
    return new Promise(function (resolve) {
      const img = new Image();
      img.onload = function () {
        try {
          const w = img.naturalWidth, h = img.naturalHeight;
          if (!w || !h) { resolve(dataUrl); return; }
          const big = Math.max(w, h) > MAX_DIM;
          if (!big && mime === "image/jpeg") { resolve(dataUrl); return; }
          const scale = big ? MAX_DIM / Math.max(w, h) : 1;
          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.round(w * scale));
          canvas.height = Math.max(1, Math.round(h * scale));
          const ctx = canvas.getContext("2d", { willReadFrequently: true });
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          // Si no se puede revisar la transparencia, se asume que la hay (PNG): es la opción segura.
          let hasAlpha = true;
          try {
            const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
            hasAlpha = false;
            for (let i = 3; i < data.length; i += 4) {
              if (data[i] < 255) { hasAlpha = true; break; }
            }
          } catch (e) { hasAlpha = true; }
          let out;
          if (hasAlpha) {
            // Con transparencia: WebP (conserva la transparencia y pesa unas 15 veces menos que el
            // PNG). Safari no sabe crear WebP y devuelve PNG: en ese caso se queda el PNG de siempre.
            out = canvas.toDataURL("image/webp", WEBP_QUALITY);
            if (out.indexOf("data:image/webp") !== 0) out = canvas.toDataURL("image/png");
          } else {
            out = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
          }
          const limite = dataUrl.length * (big ? 1 : MIN_GAIN);
          resolve(out.length < limite ? out : dataUrl);
        } catch (e) { resolve(dataUrl); }
      };
      img.onerror = function () { resolve(dataUrl); };
      img.src = dataUrl;
    });
  }

  window.ImageOpt = { optimize: optimize, MAX_DIM: MAX_DIM, JPEG_QUALITY: JPEG_QUALITY };
})();
