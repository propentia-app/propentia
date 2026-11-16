/* =========================================================
   propentia — ficha renderer
   Pure DOM builder used BOTH for the live preview pane and for
   PDF capture, so what you see while editing is what you export.
   Visual language (header photo, logo, tan accent used only as
   a fill, black bold text, table-style payment schedule) is
   taken directly from the client's own PLANTILLA VACÍA.pdf.
   ========================================================= */
(function () {
  "use strict";
  const C = window.Currency;

  // Embedded as a data URI (not a relative file path) on purpose: when the
  // app is opened straight from disk (file://), a browser treats separate
  // local image files as a different origin and refuses to let html2canvas
  // read them back out for the PDF ("tainted canvas"). Inlining sidesteps
  // that entirely — the PDF export works the same whether you open
  // index.html by double-click or through a local server.
  const LOGO_DATA_URI = "data:image/png;base64,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";

  // El mismo logo de la plantilla, en tinta, para el sello del PDF claro (html2canvas no aplica filtros CSS).
  const LOGO_TINTA_URI = "data:image/png;base64,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";

  // Selectable typefaces for "modo diseñador" — 5 universally-installed
  // basics (no loading needed) plus Montserrat, loaded in index.html across
  // its full weight/italic range so the existing bold/italic toggles render
  // real glyphs instead of the browser faking (synthesizing) them.
  // `mono` overrides --font-mono too (prices, specs, payment amounts —
  // most of a ficha's visible text) so picking a typeface changes the
  // whole document, not just headings. Only the original brand look keeps
  // a dedicated monospace for tabular numbers; none of the alternates are
  // monospace fonts anyway, so reusing `body` there reads as one
  // consistent typeface throughout instead of half the page staying in
  // the old font.
  const FONT_OPTIONS = [
    { id: "", label: "Original (Newsreader + Archivo)", display: '"Newsreader","Georgia",serif', body: '"Archivo",-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif', mono: '"Archivo",-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif' },
    { id: "century-gothic", label: "Century Gothic (anterior)", display: '"Century Gothic","Futura","Avenir Next","Poppins","Segoe UI",sans-serif', body: '-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif', mono: '"SF Mono","Cascadia Code",Consolas,"Roboto Mono",monospace' },
    { id: "arial", label: "Arial", display: "Arial, Helvetica, sans-serif", body: "Arial, Helvetica, sans-serif", mono: "Arial, Helvetica, sans-serif" },
    { id: "georgia", label: "Georgia", display: 'Georgia, "Times New Roman", serif', body: "Georgia, serif", mono: "Georgia, serif" },
    { id: "times", label: "Times New Roman", display: '"Times New Roman", Times, serif', body: '"Times New Roman", Times, serif', mono: '"Times New Roman", Times, serif' },
    { id: "verdana", label: "Verdana", display: "Verdana, Geneva, sans-serif", body: "Verdana, Geneva, sans-serif", mono: "Verdana, Geneva, sans-serif" },
    { id: "trebuchet", label: "Trebuchet MS", display: '"Trebuchet MS", sans-serif', body: '"Trebuchet MS", sans-serif', mono: '"Trebuchet MS", sans-serif' },
    { id: "montserrat", label: "Montserrat", display: '"Montserrat", sans-serif', body: '"Montserrat", sans-serif', mono: '"Montserrat", sans-serif' },
    { id: "outfit", label: "Outfit (Propentia)", display: '"Outfit","Segoe UI",sans-serif', body: '"Outfit","Segoe UI",sans-serif', mono: '"Outfit","Segoe UI",sans-serif' },
  ];
  function findFontOption(id) {
    for (let i = 0; i < FONT_OPTIONS.length; i++) if (FONT_OPTIONS[i].id === id) return FONT_OPTIONS[i];
    return FONT_OPTIONS[0];
  }

  function h(tag, attrs, children) {
    const el = document.createElement(tag);
    attrs = attrs || {};
    Object.keys(attrs).forEach(function (k) {
      if (k === "class") el.className = attrs[k];
      else if (k === "html") el.innerHTML = attrs[k];
      else if (k === "text") el.textContent = attrs[k];
      else if (k.indexOf("data-") === 0) el.setAttribute(k, attrs[k]);
      else el.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) {
      if (c) el.appendChild(c);
    });
    return el;
  }

  function ph(className, label) {
    const box = h("div", { class: (className || "") + " ph" });
    if (label) box.setAttribute("data-label", label);
    return box;
  }

  function img(src, className) {
    if (!src) return null;
    return h("img", { class: className || "", src: src });
  }

  function line(parts) {
    return parts.filter(Boolean).join(" · ");
  }

  // "Modo diseñador" text overrides -> inline CSS.
  // baseSizePx MUST be the element's own normal font-size (from its CSS
  // rule) — `calc(1em + Npx)` looked like the simpler way to do this, but
  // "1em" in an inline font-size resolves against what the element would
  // INHERIT, not its own class default, so on any element with its own
  // explicit font-size (headings, prices...) it silently computed from the
  // wrong starting point. Doing the math here, in px, sidesteps that.
  function textStyleCss(ts, baseSizePx) {
    if (!ts) return "";
    const parts = [];
    if (baseSizePx) {
      parts.push("font-size:" + Math.max(6, baseSizePx + (ts.sizeDelta || 0)) + "px");
    } else if (ts.sizeDelta) {
      parts.push("font-size:calc(1em + " + ts.sizeDelta + "px)");
    }
    parts.push("font-weight:" + (ts.bold ? 700 : 400));
    if (ts.italic) parts.push("font-style:italic");
    if (ts.strike) parts.push("text-decoration:line-through");
    return parts.join(";");
  }

  // Minimal line-art icons matching the reference template's style.
  const ICONS = {
    bed: '<svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="7" rx="1"/><path d="M3 18v2M21 18v2M5 11V8a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"/></svg>',
    bath: '<svg viewBox="0 0 24 24"><path d="M4 12h16v2a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-2Z"/><path d="M4 12V7a2 2 0 0 1 2-2c1 0 1.6.5 1.8 1.2M6 18v2M18 18v2"/></svg>',
    expand: '<svg viewBox="0 0 24 24"><rect x="4" y="7" width="12" height="12"/><path d="M13 3h7v7M20 3l-8 8"/></svg>',
    pin: '<svg viewBox="0 0 24 24"><path d="M12 21s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12Z"/><circle cx="12" cy="9" r="2.3"/></svg>',
  };
  function icon(name, extraClass, sizePx) {
    const attrs = { class: "f-icon" + (extraClass ? " " + extraClass : ""), html: ICONS[name] || "" };
    if (sizePx) attrs.style = "width:" + sizePx + "px; height:" + sizePx + "px; flex:0 0 " + sizePx + "px;";
    return h("span", attrs);
  }

  function globalScaleOf(doc) {
    const eg = doc && doc.estilosGlobales;
    return (eg && eg.textScale ? eg.textScale : 100) / 100;
  }

  function renderBrandHeader(doc) {
    const eg = doc.estilosGlobales || {};
    const gs = globalScaleOf(doc);
    // Custom title: first line in the bold style, any further lines (Enter)
    // in the large light style — same two-tier look as the default
    // "Análisis de / propiedades". A one-line title is just the bold line.
    const lines = (doc.tituloEncabezado || "").split("\n").map(function (l) { return l.trim(); }).filter(Boolean);
    const titleParts = lines.length
      ? [document.createTextNode(lines[0])].concat(lines.length > 1 ? [h("span", { class: "light", text: lines.slice(1).join(" ") })] : [])
      : [document.createTextNode("Análisis de"), h("span", { class: "light", text: "propiedades" })];
    const clientName = (doc.clientName || "").trim();
    return h("div", { class: "f-brand-header" }, [
      h("div", { class: "f-brand-title", style: textStyleCss(eg.estiloHeaderTitulo, 19 * gs) }, titleParts),
      // No cliente = a document meant to go out to many people, so the
      // "Para:" line is dropped instead of printing an empty one.
      clientName ? h("div", { class: "f-brand-for", style: textStyleCss(eg.estiloHeaderPara, 12.5 * gs), text: "Para: " + clientName }) : null,
      h("div", { class: "f-brand-by", style: textStyleCss(eg.estiloHeaderElaboradoPor, 11 * gs), text: "Elaborado por: " + (doc.advisorName || "") }),
      // brandLogo: texto = el logo de la cuenta; "" = sin logo; sin definir = logo original de la plantilla.
      (typeof doc.brandLogo === "string" && !doc.brandLogo) ? null : h("img", { class: "f-brand-logo" + (doc.brandLogo ? " custom" : ""), src: doc.brandLogo || LOGO_DATA_URI, alt: "Logo" }),
    ]);
  }

  function renderTitleBlock(ficha, gs) {
    gs = gs || 1;
    return h("div", { class: "f-title-block" }, [
      h("div", { class: "f-h1", style: textStyleCss(ficha.estiloTitulo, 34 * gs), text: ficha.desarrollo || "NOMBRE DEL DESARROLLO" }),
      // Its own badge now, not folded into the eyebrow line — background
      // and text color are per-ficha, and display:inline-block (see CSS)
      // keeps the fill snug around "DEPARTAMENTO" instead of stretching
      // into a full-width bar.
      h("div", {
        class: "f-tipo-badge", text: ficha.tipoPropiedad || "TIPO DE PROPIEDAD",
        style: "background:" + (ficha.colorTipoBadge || "#DDD4C2") + ";color:" + (ficha.colorTipoBadgeTexto || "#2A2621") + ";" + textStyleCss(ficha.estiloTipoBadge, 12.5 * gs),
      }),
      h("div", { class: "f-eyebrow", style: textStyleCss(ficha.estiloEyebrow, 13.5 * gs), text: line([ficha.ciudad, ficha.entrega]) || "CIUDAD · ENTREGA" }),
    ]);
  }

  function renderModelBlock(ficha, modelo, doc, gs) {
    gs = gs || 1;
    const conv = C.convertPrice(modelo.precioBase, ficha.moneda, doc.exchangeRate);
    const priceMain = ficha.moneda === "USD" ? conv.usd : conv.mxn;
    const priceMainCur = ficha.moneda;
    const priceSub = ficha.moneda === "USD" ? conv.mxn : conv.usd;
    const priceSubCur = ficha.moneda === "USD" ? "MXN" : "USD";
    const escalas = ficha.escalas || { pago: 100 };
    // Plano/información size is per-modelo (see modelo.escalas) so a
    // ficha with several modelos can size each one's plano/photo on its
    // own — only "tabla de pago" below stays shared across every modelo
    // in the ficha, same as the text styles.
    const modeloEscalas = modelo.escalas || { plano: 100, specs: 100 };
    // escalas.specs/pago used to be applied as CSS `zoom` on the whole
    // block. html2canvas does not measure text correctly under `zoom`
    // (glyphs end up mis-spaced — overlapping or with stray gaps — and on
    // a flex child like `.f-specs` the zoomed box also breaks out of the
    // `justify-content:center` sizing, pulling the plano+specs group off
    // center). Baking the percentage directly into each element's own
    // font-size instead keeps the layout math (and html2canvas) sane.
    const specsScale = (modeloEscalas.specs || 100) / 100 * gs;
    const specsBase = 13; // shared base for the icon row + the "M² CONSTRUCCIÓN" line
    const specsStyle = textStyleCss(ficha.estiloModeloSpecs, specsBase * specsScale);
    // Grows at the same rate as the habitaciones/baños number next to it
    // (both now computed from an explicit px base — see textStyleCss —
    // so a ratio fixed once here stays correct at any size instead of
    // drifting apart the way it did under the old em-based math).
    const specsDelta = ((ficha.estiloModeloSpecs || {}).sizeDelta) || 0;
    // Base bumped up (was 22) so the icons read as clearly bigger than the
    // numbers next to them, matching the reference proportion — the ratio
    // to the text base (32/13) is baked into the delta coefficient too, so
    // growing/shrinking the specs text size scales the icons in the same
    // proportion instead of the two drifting apart.
    const iconSize = Math.max(12, Math.round((32 + specsDelta * 2.46) * specsScale));

    const specs = h("div", { class: "f-specs" }, [
      h("div", { class: "f-model-name", style: textStyleCss(ficha.estiloModeloNombre, 17 * specsScale), text: modelo.nombre || "MODELO" }),
      h("div", { class: "f-icon-row", style: specsStyle }, [
        h("div", { class: "f-icon-item" }, [icon("bed", null, iconSize), h("span", { class: "val", text: modelo.habitaciones || "0" })]),
        h("div", { class: "f-icon-item" }, [icon("bath", null, iconSize), h("span", { class: "val", text: modelo.banos || "0" })]),
      ]),
      h("div", { class: "f-surface-line", style: specsStyle }, [
        icon("expand", null, iconSize),
        h("span", { text: modelo.superficieM2 ? C.fmtSurface(modelo.superficieM2, ficha.unidadSuperficie) + " " + (modelo.etiquetaSuperficie || "") : (modelo.etiquetaSuperficie || "SUPERFICIE") }),
      ]),
      // "Desde $X" describes a single base price — once the level table is
      // active, per-level prices replace it, so showing both would just be
      // two conflicting numbers for the same modelo.
      modelo.mostrarTablaNivel ? null : h("div", { class: "f-price-block" }, [
        // Same size as BROCHURE/RENDERS/UBICACIÓN, always — sizeDelta is
        // deliberately ignored here (negrita/cursiva/tachado still apply)
        // so "Desde" can never drift from the buttons again, no matter
        // what size someone dialed in before this was tied together.
        h("div", {
          class: "f-price-badge", text: "Desde",
          style: "background:" + (ficha.colorPrecioBadge || "#DDD4C2") + ";color:" + (ficha.colorPrecioBadgeTexto || "#2A2621") + ";" + textStyleCss(Object.assign({}, ficha.estiloPrecioBadge, { sizeDelta: 0 }), 15 * gs),
        }),
        // Independent from "Concepto"/"Momento" (the esquema de pago table)
        // on purpose — precio principal/secundario have their own negrita/
        // cursiva/tachado and color now.
        h("div", { class: "f-price-big", style: textStyleCss(ficha.estiloModeloPrecio, 24 * specsScale) + ";color:" + (ficha.colorModeloPrecio || "#2A2621"), text: C.fmtMoney(priceMain, priceMainCur) }),
        ficha.mostrarConversion
          ? h("div", { class: "f-price-sub", style: textStyleCss(ficha.estiloModeloPrecioSub, 16 * specsScale) + ";color:" + (ficha.colorModeloPrecioSub || "#766D5F"), text: "APROX. " + C.fmtMoney(priceSub, priceSubCur) })
          : null,
      ]),
      // Same look as BROCHURE/RENDERS/UBICACIÓN (dark fill, light text,
      // arrow) — Showroom used to keep the older light-accent pill with a
      // cursor icon; now it's just another button in that same family.
      modelo.mostrarShowroom
        ? h("a", {
            class: "f-btn f-showroom", href: modelo.showroomEnlace || "#",
            style: "background:" + (ficha.colorShowroom || "#2A2621") + ";color:" + (ficha.colorShowroomTexto || "#F1ECE2") + ";" + textStyleCss(ficha.estiloShowroom, 15 * specsScale),
          }, [document.createTextNode(modelo.showroomTexto || "Showroom"), h("span", { class: "f-btn-arrow", text: "→" })])
        : null,
    ]);

    // No plano uploaded — instead of reserving its space with an empty
    // placeholder box, drop it entirely and let the specs block become the
    // only thing in the row, centered to the document's own content width
    // (see .f-model-no-plano) rather than sitting shoved to one side of a
    // gap nothing fills.
    let row;
    if (modelo.plano) {
      // Fixed pixel width instead of a flex percentage basis: CSS `zoom`
      // does not reliably resize a flex item whose size comes from
      // flex-basis, so the plano size control computes its own width
      // directly.
      const planoBaseWidth = 336; // ~46% of the 736px content width
      const planoW = Math.round(planoBaseWidth * ((modeloEscalas.plano || 100) / 100));
      const planoWrap = h("div", { class: "f-plano", style: "flex:0 0 auto; width:" + planoW + "px;" }, [img(modelo.plano, "")]);
      row = h("div", { class: "f-model" }, [planoWrap, specs]);
    } else {
      row = h("div", { class: "f-model f-model-no-plano" }, [specs]);
    }

    const pagoScale = (escalas.pago || 100) / 100 * gs;
    // Amounts per row get hidden either when the level-pricing table is
    // also showing (they'd be redundant, sitting right below level prices)
    // or when someone explicitly turns them off (modelo.mostrarMontosPago)
    // to leave just porcentaje/concepto/momento, centered — e.g. when the
    // real price isn't public yet. "Esquema de pago" (the schedule table,
    // or its "de contado" text alternative) can be switched off per modelo
    // — independent of both of those.
    const showAmounts = !modelo.mostrarTablaNivel && modelo.mostrarMontosPago !== false;
    const pay = modelo.mostrarEsquemaPago === false ? null : (
      modelo.pagos.tipo === "entrega_inmediata"
        // Same fondo/texto as "Barra esquema de pago" — this text IS that
        // header's stand-in when there's no table to put under it, so it
        // should never look like a different, uncolored element just
        // because "entrega inmediata" is selected instead of "preventa".
        ? h("div", {
            class: "f-pay-text",
            style: "font-size:" + (14 * pagoScale) + "px;background:" + (ficha.colorPagoHead || "#DDD4C2") + ";color:" + (ficha.colorPagoHeadTexto || "#2A2621") + ";border-color:" + (ficha.colorPagoHead || "#DDD4C2"),
            text: modelo.pagos.textoContado || "PAGO DE CONTADO O CRÉDITO HIPOTECARIO",
          })
        : renderPayTable(modelo, ficha, doc, pagoScale, showAmounts)
    );

    const level = modelo.mostrarTablaNivel ? renderLevelTable(modelo, ficha, doc, pagoScale) : null;

    const wrap = h("div", { class: "f-model-wrap" });
    wrap.appendChild(row);
    // Skip the wrapper entirely when both are off — an empty one would
    // still eat a flex `gap` on either side of nothing.
    if (level || pay) {
      // Level pricing (when active) sits above the payment schedule, not below.
      const payWrap = h("div", { class: "f-pay-wrap" });
      if (level) payWrap.appendChild(level);
      if (pay) payWrap.appendChild(pay);
      wrap.appendChild(payWrap);
    }
    return wrap;
  }

  function renderPayTable(modelo, ficha, doc, pagoScale, showAmounts) {
    pagoScale = pagoScale || 1;
    const rows = modelo.pagos.filas.map(function (f) {
      const children = [
        h("div", {}, [
          h("div", { class: "f-pay-concepto", style: textStyleCss(ficha.estiloPagoConcepto, 16 * pagoScale) + ";color:" + (ficha.colorPagoConcepto || "#2A2621"), text: (C.num(f.pct) || 0) + "% " + (f.concepto || "") }),
          f.momento ? h("div", { class: "f-pay-momento", style: textStyleCss(ficha.estiloPagoMomento, 13 * pagoScale) + ";color:" + (ficha.colorPagoMomento || "#766D5F"), text: f.momento }) : null,
        ]),
      ];
      if (showAmounts) {
        const amt = C.pagoRowAmounts(f.pct, modelo.precioBase, ficha.moneda, doc.exchangeRate);
        const amtCur = ficha.moneda === "USD" ? amt.usd : amt.mxn;
        const amtSubCur = ficha.moneda === "USD" ? amt.mxn : amt.usd;
        const amtSubLabel = ficha.moneda === "USD" ? "MXN" : "USD";
        children.push(h("div", { class: "f-pay-amt-col" }, [
          h("span", { class: "amt", style: textStyleCss(ficha.estiloPagoMonto, 16 * pagoScale) + ";color:" + (ficha.colorPagoMonto || "#766D5F"), text: C.fmtMoney(amtCur, ficha.moneda) }),
          ficha.mostrarConversion
            ? h("span", { class: "amt-sub", style: textStyleCss(ficha.estiloPagoMontoSub, 13 * pagoScale) + ";color:" + (ficha.colorPagoMontoSub || "#A69C8A"), text: "APROX. " + C.fmtMoney(amtSubCur, amtSubLabel) })
            : null,
        ]));
      }
      // No amounts (showAmounts=false, either the level table is active
      // above this or the toggle is explicitly off) means the row only
      // has the concepto/momento block left, and flexbox's
      // justify-content:space-between just shoves a single leftover item
      // to the start, hence the unwanted left-align.
      return h("div", { class: "f-pay-row" + (showAmounts ? "" : " f-pay-row-centered") }, children);
    });
    return h("div", { class: "f-pay-table" }, [
      h("div", {
        class: "f-pay-table-head", text: "Esquema de pago",
        style: "background:" + (ficha.colorPagoHead || "#DDD4C2") + ";color:" + (ficha.colorPagoHeadTexto || "#2A2621") + ";" + textStyleCss(ficha.estiloPagoHead, 13 * pagoScale),
      }),
      ...rows,
    ]);
  }

  function renderLevelTable(modelo, ficha, doc, pagoScale) {
    pagoScale = pagoScale || 1;
    const rows = [h("div", {
      class: "lt-row head",
      style: "font-size:" + (16 * pagoScale) + "px;background:" + (ficha.colorNivelHead || "#DDD4C2") + ";color:" + (ficha.colorNivelHeadTexto || "#2A2621"),
    }, [
      h("span", { text: "Nivel" }), h("span", { text: "Precio" }),
    ])];
    // Matches the payment schedule's own sizes (concepto/amt/amt-sub) so
    // both tables read as one consistent system, not two different scales.
    modelo.niveles.forEach(function (n) {
      let priceCell;
      if (n.precio) {
        // n.precio is entered IN the ficha's own currency (ficha.moneda) —
        // same convention as modelo.precioBase — not always MXN. Otherwise
        // a USD ficha showed its level prices mislabeled as MXN, with the
        // "aprox" conversion computed backwards.
        const conv = C.convertPrice(n.precio, ficha.moneda, doc.exchangeRate);
        const main = ficha.moneda === "USD" ? conv.usd : conv.mxn;
        const sub = ficha.moneda === "USD" ? conv.mxn : conv.usd;
        const subCur = ficha.moneda === "USD" ? "MXN" : "USD";
        const col = [h("span", { class: "lt-price", style: textStyleCss(ficha.estiloNivelPrecio, 16 * pagoScale) + ";color:" + (ficha.colorNivelPrecio || "#2A2621"), text: C.fmtMoney(main, ficha.moneda) })];
        if (ficha.mostrarConversion) {
          col.push(h("span", { class: "lt-price-sub", style: textStyleCss(ficha.estiloNivelPrecioSub, 13 * pagoScale) + ";color:" + (ficha.colorNivelPrecioSub || "#A69C8A"), text: "APROX. " + C.fmtMoney(sub, subCur) }));
        }
        priceCell = h("div", { class: "lt-price-col" }, col);
      } else {
        priceCell = h("span", { text: "" });
      }
      rows.push(h("div", { class: "lt-row" }, [
        h("span", { class: "lt-nombre", style: "font-size:" + (16 * pagoScale) + "px", text: n.nombre || "" }),
        priceCell,
      ]));
    });
    return h("div", { class: "f-level-table", style: "font-size:" + (12 * pagoScale) + "px" }, rows);
  }

  // =========================================================
  // ESTILO NUEVO (manual de marca Propentia 2.2)
  // Se activa con doc.estiloFicha === "nuevo". Los documentos que no lo
  // tienen siguen con el estilo clásico de arriba, sin ningún cambio.
  // Respeta todos los interruptores del llenado (conversión, botones,
  // showroom, tabla por nivel, esquema de pago, montos, franja, gastos).
  // =========================================================
  const TEMAS = {
    claro: { bg: "#F2EEE6", ink: "#2A2621", soft: "#6E675B", sup: "#ECE7DB", sup2: "#E3DDCF", line: "#D6CEBE", tc: "#A4573D", onTc: "#F2EEE6" },
    oscuro: { bg: "#1B1815", ink: "#F2EEE6", soft: "#B3ACA2", sup: "#25211D", sup2: "#2E2924", line: "#3D3731", tc: "#D08A6C", onTc: "#1B1815" },
  };
  const DENSIDAD = { compacta: { gap: 24, pad: 40 }, normal: { gap: 32, pad: 48 }, amplia: { gap: 40, pad: 56 } };
  const ALTURA_FOTO = { baja: "5/2", media: "2/1", alta: "3/2" };
  // Íconos del manual (sección 10): 24 px, trazo 2.4, puntas planas, uniones redondeadas.
  const ICONOS_N = {
    recamara: '<path d="M3.5 5v15M3.5 16.5h17V20M3.5 12.5h15a2 2 0 0 1 2 2v2"/><rect x="7" y="8" width="5" height="4.5" rx="1.5"/>',
    bano: '<path d="M3.5 12h17v2.5a4.5 4.5 0 0 1-4.5 4.5H8a4.5 4.5 0 0 1-4.5-4.5z"/><path d="M6.5 12V6.5a2 2 0 0 1 4 0M7.5 19v2M16.5 19v2"/>',
    plano: '<rect x="3.5" y="3.5" width="17" height="17" rx="2"/><path d="M12 3.5v7h8.5M3.5 14h5v6.5"/>',
    descargar: '<path d="M12 4v11M7.5 11l4.5 4.5 4.5-4.5M5 20h14"/>',
    foto: '<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="1.8"/><path d="M4 17l5-4 4 3 3-2 4 3"/>',
    ubicacion: '<path d="M12 21s-6.5-5.7-6.5-11A6.5 6.5 0 0 1 18.5 10c0 5.3-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.2"/>',
    video: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M10.5 9.5v5l4-2.5z"/>',
    flecha: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  };
  function iconoN(name, sizePx) {
    const s = sizePx || 20;
    return h("span", { class: "fn-ic", style: "width:" + s + "px;height:" + s + "px;flex:0 0 " + s + "px", html: '<svg viewBox="0 0 24 24" width="' + s + '" height="' + s + '" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="butt" stroke-linejoin="round" aria-hidden="true">' + (ICONOS_N[name] || "") + "</svg>" });
  }
  // El ícono de cada botón se elige por lo que dice su texto.
  function iconoDeBoton(texto) {
    const t = String(texto || "").toLowerCase();
    if (/brochure|pdf|descarg|folleto/.test(t)) return "descargar";
    if (/render|foto|imagen|galer/.test(t)) return "foto";
    if (/ubica|mapa|c[oó]mo llegar/.test(t)) return "ubicacion";
    if (/video|tour|showroom|recorrido/.test(t)) return "video";
    return "flecha";
  }
  // El manual pide mayúsculas solo en etiquetas: lo capturado TODO EN MAYÚSCULAS se pasa a minúsculas.
  // Lo que ya trae minúsculas se respeta tal cual lo escribió el asesor.
  const PEQ = { de: 1, del: 1, la: 1, las: 1, los: 1, y: 1, e: 1, en: 1, a: 1, al: 1 };
  function todoMayus(s) { return /[A-ZÁÉÍÓÚÑ]/.test(s) && !/[a-záéíóúñ]/.test(s); }
  function comoTitulo(s) {
    s = String(s || "").trim();
    if (!todoMayus(s)) return s;
    return s.toLowerCase().split(/(\s+)/).map(function (w, i, a) {
      if (!w.trim()) return w;
      const first = a.slice(0, i).join("").trim() === "";
      return (!first && PEQ[w]) ? w : w.charAt(0).toUpperCase() + w.slice(1);
    }).join("");
  }
  function comoOracion(s) {
    s = String(s || "").trim();
    if (!todoMayus(s)) return s;
    s = s.toLowerCase();
    return s.replace(/(^|[.!?]\s+)([¡¿"«]?)([a-záéíóúñ])/g, function (m, a, q, b) { return a + q + b.toUpperCase(); })
      .replace(/\b(mxn|usd|hoa)\b/g, function (m) { return m.toUpperCase(); });
  }
  // Estilo de texto del modo diseñador, en el estilo nuevo:
  // tamaño ±, K y T se aplican igual; N apagada = grosor normal (400), N prendida = el grosor del diseño.
  // Nunca baja de 14 px (las etiquetas pequeñas, de 11 px).
  // El «Tamaño ±» se capturó pensando en el estilo clásico (otra base de tamaño): aquí se aplica como proporción
  // de esa base clásica, para que +2 en un texto de 13 px no infle de más un texto que en el estilo nuevo mide 16.
  function tsN(ts, basePx, pesoDiseno, minPx, baseClasica) {
    ts = ts || {};
    const bc = baseClasica || basePx;
    const px = basePx * Math.max(0.5, (bc + (ts.sizeDelta || 0)) / bc);
    const parts = ["font-size:" + Math.max(minPx || 14, Math.round(px * 10) / 10) + "px"];
    parts.push("font-weight:" + (ts.bold === false ? 400 : (pesoDiseno || 600)));
    if (ts.italic) parts.push("font-style:italic");
    if (ts.strike) parts.push("text-decoration:line-through");
    return parts.join(";");
  }
  // Logotipo «propentia» para el sello, como imagen (html2canvas no dibuja máscaras CSS).
  let wordmarkCache = {};
  function wordmarkSrc(color) {
    if (wordmarkCache[color]) return wordmarkCache[color];
    try {
      const v = getComputedStyle(document.documentElement).getPropertyValue("--logo-word");
      const m = v && v.match(/base64,([^")]+)/);
      if (!m) return "";
      const svg = atob(m[1]).replace(/fill="#000"/g, 'fill="' + color + '"');
      wordmarkCache[color] = "data:image/svg+xml;base64," + btoa(svg);
    } catch (e) { return ""; }
    return wordmarkCache[color];
  }
  function esNuevo(doc) { return !!doc && doc.estiloFicha === "nuevo"; }
  function temaDe(doc) {
    const nombre = doc && doc.temaPdf === "oscuro" ? "oscuro" : "claro";
    const t = Object.assign({}, TEMAS[nombre]);
    const eg = (doc && doc.estilosGlobales) || {};
    const acento = nombre === "oscuro" ? eg.colorAcentoOscuro : eg.colorAcento;
    if (acento) t.tc = acento;
    t.nombre = nombre;
    return t;
  }
  function estiloPaginaN(doc) {
    const eg = doc.estilosGlobales || {};
    const t = temaDe(doc);
    const d = DENSIDAD[eg.densidad] || DENSIDAD.normal;
    const fo = findFontOption(eg.fontFamily || "outfit");
    const st = ["--n-bg:" + t.bg, "--n-ink:" + t.ink, "--n-soft:" + t.soft, "--n-sup:" + t.sup, "--n-sup2:" + t.sup2, "--n-line:" + t.line, "--n-tc:" + t.tc, "--n-on-tc:" + t.onTc,
      "--n-gap:" + d.gap + "px", "--n-pad:" + d.pad + "px", "background-color:" + t.bg,
      "--font-display:" + fo.display, "--font-body:" + fo.body, "--font-mono:" + fo.mono];
    if (eg.paperImage && t.nombre === "claro") st.push("background-image:url('" + eg.paperImage + "'); background-size:cover; background-position:top center;");
    return st.join(";");
  }
  function precioN(valor, ficha, doc) {
    const conv = C.convertPrice(valor, ficha.moneda, doc.exchangeRate);
    return {
      main: C.fmtMoney(ficha.moneda === "USD" ? conv.usd : conv.mxn, ficha.moneda),
      sub: "Aprox. " + C.fmtMoney(ficha.moneda === "USD" ? conv.mxn : conv.usd, ficha.moneda === "USD" ? "MXN" : "USD"),
    };
  }
  function nombreModeloN(nombre) {
    const lineas = String(nombre || "").split("\n").map(function (l) { return l.trim(); }).filter(Boolean);
    if (!lineas.length) return { titulo: "Modelo", sub: "" };
    return { titulo: comoTitulo(lineas[0]), sub: lineas.slice(1).map(comoOracion).join(" · ") };
  }

  function renderModeloN(ficha, modelo, doc, gs, flip, nombreCorto) {
    const esc = modelo.escalas || { plano: 100, specs: 100 };
    const ks = (esc.specs || 100) / 100 * gs;
    const nm = nombreModeloN(modelo.nombre);
    const specsTs = ficha.estiloModeloSpecs || {};
    const specsPx = Math.max(14, 16 * ks * Math.max(0.5, (13 + (specsTs.sizeDelta || 0)) / 13));
    const icPx = Math.round(specsPx * 1.5); // los íconos crecen con su texto
    const sup = modelo.superficieM2
      ? C.fmtSurface(modelo.superficieM2, ficha.unidadSuperficie).replace(/M²/g, "m²").replace(/SQ FT/g, "sq ft") + (modelo.etiquetaSuperficie ? " " + String(comoOracion(modelo.etiquetaSuperficie)).toLowerCase() : "")
      : "";
    const info = [
      h("h3", { class: "fn-mnom", style: tsN(ficha.estiloModeloNombre, 24 * ks, 600, 14, 17) + (ficha.estiloModeloNombre && ficha.estiloModeloNombre.italic ? "" : ""), text: nm.titulo }),
      nm.sub ? h("p", { class: "fn-msub", text: nm.sub }) : null,
      h("div", { class: "fn-specs", style: tsN(specsTs, 16 * ks, 600, 14, 13) }, [
        h("span", {}, [iconoN("recamara", icPx), h("b", { text: modelo.habitaciones || "0" })]),
        h("span", {}, [iconoN("bano", icPx), h("b", { text: modelo.banos || "0" })]),
        sup ? h("span", {}, [iconoN("plano", icPx), h("b", { text: sup })]) : null,
      ]),
    ];
    if (!modelo.mostrarTablaNivel) {
      const p = precioN(modelo.precioBase, ficha, doc);
      info.push(h("div", { class: "fn-precio" }, [
        h("span", { class: "fn-etq", text: "Precio desde" }),
        h("span", { class: "fn-pv", style: tsN(ficha.estiloModeloPrecio, 32 * ks, 600, 14, 24) + (doc.temaPdf !== "oscuro" && ficha.colorModeloPrecio && ficha.colorModeloPrecio !== "#2A2621" ? ";color:" + ficha.colorModeloPrecio : ""), text: p.main }),
        ficha.mostrarConversion ? h("span", { class: "fn-sub", style: tsN(ficha.estiloModeloPrecioSub, 14 * ks, 400, 14, 16), text: p.sub }) : null,
      ]));
    }
    if (modelo.mostrarShowroom) {
      info.push(h("div", {}, [h("a", { class: "fn-btn", href: modelo.showroomEnlace || "#", style: tsN(ficha.estiloShowroom, 16 * ks, 500, 14, 15) }, [
        iconoN(iconoDeBoton(modelo.showroomTexto || "video"), 20), document.createTextNode(comoOracion(modelo.showroomTexto || "Showroom")),
      ])]));
    }
    const plano = modelo.plano
      ? h("div", { class: "fn-pl", style: "width:" + Math.round(300 * ((esc.plano || 100) / 100)) + "px" }, [img(modelo.plano, "")])
      : null;
    const row = h("article", { class: "fn-mrow" + (flip ? " flip" : "") + (plano ? "" : " sin-plano") }, [plano, h("div", { class: "fn-mi" }, info)]);

    const bloques = [row];
    const kp = ((ficha.escalas || {}).pago || 100) / 100 * gs;
    if (modelo.mostrarTablaNivel) bloques.push(renderNivelesN(modelo, ficha, doc, kp));
    if (modelo.mostrarEsquemaPago !== false) {
      if (modelo.pagos.tipo === "entrega_inmediata") {
        bloques.push(h("div", { class: "fn-contado", style: tsN(ficha.estiloPagoHead, 16 * kp, 500, 14, 13), text: comoOracion(modelo.pagos.textoContado || "Pago de contado o crédito hipotecario") }));
      } else {
        const showAmounts = !modelo.mostrarTablaNivel && modelo.mostrarMontosPago !== false;
        bloques.push(renderPagoN(modelo, ficha, doc, kp, showAmounts, nombreCorto ? nm.titulo : ""));
      }
    }
    return h("div", { class: "fn-modelo" }, bloques);
  }

  function renderNivelesN(modelo, ficha, doc, kp) {
    const n = modelo.niveles || [];
    const filas = n.map(function (nv, i) {
      let precio = null;
      if (nv.precio) {
        const p = precioN(nv.precio, ficha, doc);
        precio = h("span", { class: "fn-npr" }, [
          h("b", { style: tsN(ficha.estiloNivelPrecio, 16 * kp, 600, 14, 16), text: p.main }),
          ficha.mostrarConversion ? h("span", { class: "fn-sub", style: tsN(ficha.estiloNivelPrecioSub, 14 * kp, 400, 14, 13), text: p.sub }) : null,
        ]);
      }
      return h("div", { class: "fn-tr" }, [
        h("span", { class: "fn-nv", style: "font-size:" + Math.max(14, 16 * kp) + "px" }, [h("i", { class: "fn-dot" + (i === n.length - 1 ? " tc" : "") }), document.createTextNode(comoOracion(nv.nombre || ""))]),
        precio,
      ]);
    });
    return h("div", { class: "fn-tabla" }, [h("div", { class: "fn-th fn-etq" }, [h("span", { text: "Nivel" }), h("span", { text: "Precio" })])].concat(filas));
  }

  function renderPagoN(modelo, ficha, doc, kp, showAmounts, nombre) {
    const filas = (modelo.pagos.filas || []).filter(function (f) { return C.num(f.pct) > 0 || f.concepto; });
    const segs = filas.map(function (f, i) {
      const pct = C.num(f.pct) || 0;
      return h("span", { class: "fn-sg" + (i === 0 ? " s0" : ""), style: "flex:" + Math.max(pct, 8) + " 1 0;font-size:" + Math.max(14, 16 * kp) + "px", text: pct + "%" });
    });
    const det = filas.map(function (f) {
      const pct = C.num(f.pct) || 0;
      const partes = [];
      if (f.momento) partes.push(comoOracion(f.momento));
      if (showAmounts) {
        const amt = C.pagoRowAmounts(f.pct, modelo.precioBase, ficha.moneda, doc.exchangeRate);
        partes.push(C.fmtMoney(ficha.moneda === "USD" ? amt.usd : amt.mxn, ficha.moneda));
        if (ficha.mostrarConversion) partes.push("Aprox. " + C.fmtMoney(ficha.moneda === "USD" ? amt.mxn : amt.usd, ficha.moneda === "USD" ? "MXN" : "USD"));
      }
      return h("li", {}, [
        h("b", { style: tsN(ficha.estiloPagoConcepto, 16 * kp, 600, 14, 16), text: pct + "% " + String(comoOracion(f.concepto || "")).toLowerCase() }),
        partes.length ? h("span", { class: "fn-sub", style: tsN(ficha.estiloPagoMomento, 14 * kp, 400, 14, 13), text: partes.join(" · ") }) : null,
      ]);
    });
    return h("div", { class: "fn-pago" }, [
      h("div", { class: "fn-etq", text: "Esquema de pago" + (nombre ? " · " + nombre : "") }),
      h("div", { class: "fn-bar" }, segs),
      h("ul", { style: "grid-template-columns:repeat(" + Math.min(Math.max(det.length, 1), 3) + ",1fr)" }, det),
    ]);
  }

  // En varias fichas guardadas la ciudad y el tipo de propiedad se capturaron al revés
  // (ciudad = "DEPARTAMENTOS"). Al mostrarlas se acomodan solas; los datos no se tocan.
  const TIPOS_RE = /^(casas?|departamentos?|deptos?\.?|terrenos?|lotes?|villas?|townhouses?|penthouses?|locales?|local|oficinas?|condominios?)(\s|$)/i;
  function ciudadYTipo(ficha) {
    let ciudad = ficha.ciudad || "", tipo = ficha.tipoPropiedad || "";
    if (TIPOS_RE.test(String(ciudad).trim()) && !TIPOS_RE.test(String(tipo).trim())) { const x = ciudad; ciudad = tipo; tipo = x; }
    return { ciudad: ciudad, tipo: tipo };
  }

  // Gastos aproximados: acepta la forma vieja (un concepto) y la nueva (lista con interruptores y leyenda editable).
  function gastosDe(ficha) {
    const gc = ficha.gastosCierre;
    if (!gc || !gc.activo) return null;
    const items = Array.isArray(gc.items)
      ? gc.items.filter(function (it) { return it && it.activo !== false; })
      : [{ concepto: gc.concepto, monto: gc.monto }];
    if (!items.length) return null;
    return { items: items, leyenda: typeof gc.leyenda === "string" ? gc.leyenda : ((window.Store && Store.DEFAULT_LEYENDA_GASTOS) || "Esta es una simulación de referencia; el monto real puede variar.") };
  }

  function renderFichaPageNueva(ficha, doc, isFirst) {
    const gs = globalScaleOf(doc);
    const eg = doc.estilosGlobales || {};
    const t = temaDe(doc);
    const body = [];

    // Proyecto: nombre, ciudad destacada, tipo · entrega
    const ub = ciudadYTipo(ficha);
    const tipoEntrega = [comoOracion(ub.tipo), comoOracion(ficha.entrega)].filter(Boolean).join(" · ");
    body.push(h("div", { class: "fn-proy" }, [
      h("h1", { class: "fn-nombre", style: tsN(ficha.estiloTitulo, 56 * gs, 500, 14, 34), text: comoTitulo(ficha.desarrollo) || "Nombre del desarrollo" }),
      h("div", { class: "fn-rayas", "aria-hidden": "true" }, [h("span"), h("span")]),
      ub.ciudad ? h("p", { class: "fn-ciudad", style: tsN(ficha.estiloEyebrow, 26 * gs, 600, 14, 13.5), text: comoTitulo(ub.ciudad) }) : null,
      tipoEntrega ? h("p", { class: "fn-tipo", style: tsN(ficha.estiloTipoBadge, 18 * gs, 400, 14, 12.5), text: tipoEntrega }) : null,
    ]));

    // Fotos: la principal (alto elegible) y las tres de abajo
    function celda(g, cls) {
      if (g && g.src) {
        const im = img(g.src, cls);
        im.style.objectPosition = (g.posX != null ? g.posX : 50) + "% " + (g.posY != null ? g.posY : 50) + "%";
        return im;
      }
      return h("div", { class: cls + " ph", "data-label": "imagen" });
    }
    const gal = ficha.galeria || [];
    const m0 = celda(gal[0], "fn-m0");
    m0.style.aspectRatio = ALTURA_FOTO[ficha.alturaFoto] || ALTURA_FOTO.media;
    body.push(h("div", { class: "fn-mos" }, [m0, h("div", { class: "fn-mr" }, [celda(gal[1], ""), celda(gal[2], ""), celda(gal[3], "")])]));

    // Botones: los tres iguales, de contorno, con su ícono al inicio
    const visibles = (ficha.botones || []).filter(function (b) { return b.visible; });
    if (visibles.length) {
      body.push(h("div", { class: "fn-ctas" }, visibles.map(function (b) {
        return h("a", { class: "fn-btn", href: b.enlace || "#", style: tsN(b.estilo, 16 * gs, 500, 14, 15) }, [iconoN(iconoDeBoton(b.texto), 20), document.createTextNode(comoOracion(b.texto || "Botón"))]);
      })));
    }

    // Franja destacada: después de los botones
    if (ficha.franjaActiva) {
      body.push(h("div", { class: "fn-franja", style: tsN(ficha.estiloFranja, 16 * gs, 500, 14, 13) }, [
        h("i", { class: "fn-dot tc" }), h("span", { text: comoOracion(ficha.franjaTexto || "Característica destacada") }), h("i", { class: "fn-dot tc" }),
      ]));
    }

    // Modelos, alternando el lado del plano
    const varios = (ficha.modelos || []).length > 1;
    (ficha.modelos || []).forEach(function (m, i) {
      if (i > 0) body.push(h("div", { class: "fn-sep" }));
      body.push(renderModeloN(ficha, m, doc, gs, i % 2 === 1, varios));
    });

    // Gastos aproximados
    const g = gastosDe(ficha);
    if (g) {
      body.push(h("section", { class: "fn-gastos" }, [h("p", { class: "fn-etq", text: "Gastos aproximados" })].concat(g.items.map(function (it) {
        return h("div", { class: "fn-gr" }, [
          h("span", { text: comoOracion((it.concepto || "").trim().replace(/:\s*$/, "")) || "Gastos aproximados de cierre" }),
          h("b", { text: it.monto ? C.fmtMoney(it.monto, ficha.moneda) : "$_______" }),
        ]);
      })).concat(g.leyenda ? [h("p", { class: "fn-gn", text: g.leyenda })] : [])));
    }

    // Texto legal y sello
    body.push(h("p", { class: "fn-legal", text: comoOracion(ficha.avisoLegal || Store.DEFAULT_LEGAL) }));
    const logoSello = (typeof doc.brandLogo === "string" && !doc.brandLogo) ? null : img(doc.brandLogo || (t.nombre === "claro" ? LOGO_TINTA_URI : LOGO_DATA_URI), "fn-sl-logo" + (doc.brandLogo ? " custom" : ""));
    const wm = wordmarkSrc(t.ink);
    body.push(h("footer", { class: "fn-sello" }, [
      logoSello, logoSello ? h("span", { class: "fn-sl-sep" }) : null,
      h("span", { class: "fn-sl-txt", text: "Hecho con" }),
      wm ? h("img", { class: "fn-sl-wd", src: wm, alt: "Propentia" }) : h("b", { text: "Propentia" }),
    ]));

    const nodes = [];
    if (isFirst) {
      const hdr = renderBrandHeader(doc);
      const logo = hdr.querySelector(".f-brand-logo");
      if (logo) logo.style.height = Math.round(64 * ((eg.tamanoLogo || 100) / 100)) + "px";
      nodes.push(hdr);
    }
    nodes.push(h("div", { class: "fn-body" + (isFirst ? "" : " no-header") }, body));
    return h("div", { class: "ficha-page fn tema-" + t.nombre, style: estiloPaginaN(doc) }, nodes);
  }

  function renderFichaPage(ficha, doc, isFirst) {
    if (esNuevo(doc)) return renderFichaPageNueva(ficha, doc, isFirst);
    const body = [];
    const gs = globalScaleOf(doc);

    // Title block sits above the main image, centered, full width.
    body.push(renderTitleBlock(ficha, gs));

    // Fixed 4-slot mosaic — 1 wide image on top (the main/hero image), 3 in
    // a row below. The count and arrangement are not configurable on
    // purpose, so this always renders the same shape (with placeholders for
    // anything not uploaded yet) instead of a variable-length strip.
    function galleryCell(g) {
      if (g && g.src) {
        const im = img(g.src, "");
        im.style.objectPosition = (g.posX != null ? g.posX : 50) + "% " + (g.posY != null ? g.posY : 50) + "%";
        return im;
      }
      return ph("", "imagen");
    }
    const gal = ficha.galeria || [];
    body.push(h("div", { class: "f-gallery" }, [
      h("div", { class: "f-gallery-main" }, [galleryCell(gal[0])]),
      h("div", { class: "f-gallery-row" }, [galleryCell(gal[1]), galleryCell(gal[2]), galleryCell(gal[3])]),
    ]));

    // Legal disclaimer is not optional — always present.
    body.push(h("div", { class: "f-legal", text: ficha.avisoLegal || Store.DEFAULT_LEGAL }));

    const visibleBotones = ficha.botones.filter(function (b) { return b.visible; });
    if (visibleBotones.length) {
      body.push(h("div", { class: "f-buttons" }, visibleBotones.map(function (b) {
        return h("a", {
          class: "f-btn",
          href: b.enlace || "#",
          style: "background:" + (b.color || "#2A2621") + ";color:" + (b.colorTexto || "#F1ECE2") + ";" + textStyleCss(b.estilo, 15 * gs),
        }, [document.createTextNode(b.texto || "BOTÓN"), h("span", { class: "f-btn-arrow", text: "→" })]);
      })));
    }

    body.push(h("div", { class: "f-rule" }));

    // Up to 10 modelos, each stacked in the same full block — never side by
    // side. With 2+ on one page, a plain hairline (same weight as every
    // other divider on the page) reads as too weak to tell where one
    // modelo ends and the next begins — the page turns into one dense wall
    // of specs/precio/tabla-de-pago. A heavier divider only between
    // modelos (never used for the title/botones/franja rules) gives the
    // eye an actual break in that specific case — color/grosor editable in
    // modo diseñador (see .f-rule-model's CSS default for the fallback).
    const modelDividerStyle = "background:" + (ficha.colorDivisorModelo || "#2A2621") + ";height:" + (ficha.grosorDivisorModelo || 2) + "px;";
    ficha.modelos.forEach(function (m, i) {
      if (i > 0) body.push(h("div", { class: "f-rule f-rule-model", style: modelDividerStyle }));
      body.push(renderModelBlock(ficha, m, doc, gs));
    });

    // Gastos aproximados: uno o varios conceptos (cierre, HOA…), cada uno con su monto; solo los prendidos.
    // Un concepto en blanco usa el texto de siempre; la leyenda es editable (vacía = sin leyenda).
    const gastos = gastosDe(ficha);
    if (gastos) {
      gastos.items.forEach(function (it) {
        body.push(h("div", { class: "f-closing" }, [
          h("span", { class: "lbl", text: ((it.concepto || "").trim().replace(/:\s*$/, "") || "Gastos aproximados de cierre") + ":" }),
          h("span", { class: "amt", text: it.monto ? C.fmtMoney(it.monto, ficha.moneda) : "$_______" }),
        ]));
      });
      if (gastos.leyenda) body.push(h("div", { class: "f-closing-note", text: gastos.leyenda }));
    }

    if (ficha.franjaActiva) {
      body.push(h("div", { class: "f-ribbon" }, [
        h("div", { class: "txt", style: textStyleCss(ficha.estiloFranja, 13 * gs), text: ficha.franjaTexto || "CARACTERÍSTICA DESTACADA" }),
      ]));
    }

    const nodes = [];
    if (isFirst) nodes.push(renderBrandHeader(doc));
    nodes.push(h("div", { class: "f-body" + (isFirst ? "" : " no-header") }, body));

    const eg = doc.estilosGlobales || { paperColor: "#F1ECE2", textScale: 100 };
    const pageStyle = [];
    if (eg.paperColor) pageStyle.push("background-color:" + eg.paperColor);
    if (eg.paperImage) pageStyle.push("background-image:url('" + eg.paperImage + "'); background-size:cover; background-position:top center;");
    // "Escala de texto global" used to be a CSS `zoom` on the whole page —
    // same bug as escalas.specs/pago had: html2canvas mis-measures text
    // under `zoom`, causing glyph spacing artifacts across the entire
    // document. Every scalable element above now takes `gs` as an explicit
    // multiplier on its own font-size instead, so nothing here needs zoom.
    // Always set the three font vars explicitly, even for the default (""
    // = Newsreader/Archivo) option — eg.fontFamily is "" (falsy) for that
    // case, and skipping the push then would silently fall back to the
    // app UI's own --font-display/--font-mono instead of the ficha's.
    {
      const fo = findFontOption(eg.fontFamily);
      pageStyle.push("--font-display:" + fo.display, "--font-body:" + fo.body, "--font-mono:" + fo.mono);
    }

    return h("div", { class: "ficha-page", style: pageStyle.join(";") }, nodes);
  }

  function renderMapBlock(mapa, gs) {
    gs = gs || 1;
    // The map image is painted as a CSS background (like the header photo)
    // rather than an <img> child: html2canvas has a known issue drawing an
    // <img> inside an overflow:hidden/rounded container at the wrong size,
    // which bled the map past the page's right edge in the exported PDF.
    const wrap = mapa.imagen
      ? h("div", { class: "map-canvas-wrap has-image", style: "background-image:url('" + mapa.imagen + "');" })
      : h("div", { class: "map-canvas-wrap ph", "data-label": "mapa" });
    (mapa.pines || []).forEach(function (p) {
      const scale = (p.scale || 100) / 100;
      // Scale is applied to the label itself (transform), not to the
      // absolutely-positioned wrapper (zoom) — html2canvas can miscompute
      // the page's captured width when `zoom` sits on a positioned element,
      // cutting off or overflowing the exported PDF page.
      const pin = h("div", { class: "map-pin", style: "left:" + p.x + "%; top:" + p.y + "%;" }, [
        h("div", {
          class: "label", text: p.nombre || "",
          style: "background:" + (p.bgColor || "#FFFFFF") + "; color:" + (p.textColor || "#171512") + "; transform:scale(" + scale + ");",
        }),
      ]);
      wrap.appendChild(pin);
    });
    // The city name IS the heading now — typed directly where "Mapa" used
    // to sit as a fixed label, instead of a separate small franja above
    // the canvas plus a generic "Mapa"/"Mapas" title at the page level.
    const nodes = [h("div", { class: "f-h1", style: "font-size:" + (34 * gs) + "px", text: mapa.etiqueta || "Mapa" })];
    nodes.push(wrap);
    return h("div", { class: "f-map-block" }, nodes);
  }

  function renderMapPage(doc) {
    // Up to MAX_MAPAS maps stacked on the same page — each with its own
    // image, pins, and its own heading (the city name).
    const gs = globalScaleOf(doc);
    const mapas = (doc.mapas && doc.mapas.length) ? doc.mapas : [{ imagen: null, pines: [], etiqueta: "" }];
    const blocks = [];
    mapas.forEach(function (mapa, i) {
      if (i > 0) blocks.push(h("div", { class: "f-rule" }));
      blocks.push(renderMapBlock(mapa, gs));
    });
    if (esNuevo(doc)) {
      return h("div", { class: "ficha-page f-map-page fn tema-" + temaDe(doc).nombre, style: estiloPaginaN(doc) }, [
        h("div", { class: "fn-body no-header" }, blocks),
      ]);
    }
    const eg = doc.estilosGlobales || { paperColor: "#F1ECE2", textScale: 100 };
    const mapPageStyle = [];
    if (eg.paperColor) mapPageStyle.push("background-color:" + eg.paperColor);
    if (eg.paperImage) mapPageStyle.push("background-image:url('" + eg.paperImage + "'); background-size:cover; background-position:top center;");
    {
      const fo = findFontOption(eg.fontFamily);
      mapPageStyle.push("--font-display:" + fo.display, "--font-body:" + fo.body, "--font-mono:" + fo.mono);
    }
    return h("div", { class: "ficha-page f-map-page", style: mapPageStyle.join(";") }, [
      h("div", { class: "f-body no-header" }, blocks),
    ]);
  }

  // ---------- Cuadro comparativo (diseño C: una fila por propiedad, como los modelos de la ficha) ----------
  // filas = [{ ficha, mi (índice del modelo), fi (índice de la foto) }]. Siempre en el estilo nuevo.
  // Nada se inventa: lo que no esté capturado se muestra como «—».
  function ciudadBaseN(c) {
    const partes = String(c || "").split(" - ");
    return comoTitulo(partes[partes.length - 1].trim());
  }
  function listaConY(a) { return a.length < 2 ? (a[0] || "") : a.slice(0, -1).join(", ") + " y " + a[a.length - 1]; }
  // «Precio desde»: con tabla por nivel manda el nivel más barato; si no, el precio base.
  function precioDesdeDe(modelo) {
    if (modelo.mostrarTablaNivel) {
      const ps = (modelo.niveles || []).map(function (n) { return C.num(n.precio); }).filter(function (v) { return v > 0; });
      if (ps.length) return Math.min.apply(null, ps);
    }
    return C.num(modelo.precioBase) || 0;
  }
  function renderComparativoPage(filas, doc) {
    const eg = doc.estilosGlobales || {};
    const t = temaDe(doc);
    const gs = globalScaleOf(doc);
    const ciudades = [];
    filas.forEach(function (f) { const c = ciudadBaseN(ciudadYTipo(f.ficha).ciudad); if (c && ciudades.indexOf(c) < 0) ciudades.push(c); });

    const rows = [];
    filas.forEach(function (fila, i) {
      const ficha = fila.ficha;
      const modelo = (ficha.modelos || [])[fila.mi] || (ficha.modelos || [])[0] || {};
      const nm = nombreModeloN(modelo.nombre);
      const gal = (ficha.galeria || []).filter(function (g) { return g && g.src; });
      const foto = (ficha.galeria || [])[fila.fi] && (ficha.galeria || [])[fila.fi].src ? (ficha.galeria || [])[fila.fi].src : (gal[0] && gal[0].src);
      const desde = precioDesdeDe(modelo);
      const p = desde ? precioN(desde, ficha, doc) : null;
      const area = C.num(modelo.superficieM2) || 0;
      const sup = area ? C.fmtSurface(modelo.superficieM2, ficha.unidadSuperficie).replace(/M²/g, "m²").replace(/SQ FT/g, "sq ft") : "";
      const pf = modelo.pagos && modelo.pagos.tipo !== "entrega_inmediata" && (modelo.pagos.filas || []).filter(function (f) { return C.num(f.pct) > 0; })[0];
      const ub = ciudadYTipo(ficha);
      const tipoEntrega = [comoOracion(ub.tipo), comoOracion(ficha.entrega)].filter(Boolean).join(" · ");
      if (i > 0) rows.push(h("div", { class: "fn-sep" }));
      rows.push(h("article", { class: "fn-cr" + (i % 2 === 1 ? " flip" : "") }, [
        h("div", { class: "fn-cr-ph" }, [foto ? img(foto, "fn-cr-foto") : h("div", { class: "fn-cr-foto ph", "data-label": "imagen" })]),
        h("div", { class: "fn-cr-info" }, [
          h("div", {}, [
            h("h2", { class: "fn-cr-nom", text: comoTitulo(ficha.desarrollo) || "Proyecto" }),
            nm.titulo ? h("p", { class: "fn-cr-mdl", text: nm.titulo + (nm.sub ? " · " + nm.sub : "") }) : null,
            ub.ciudad ? h("p", { class: "fn-cr-cty", text: ciudadBaseN(ub.ciudad) }) : null,
            tipoEntrega ? h("p", { class: "fn-cr-tip", text: tipoEntrega }) : null,
          ]),
          h("div", { class: "fn-specs" }, [
            h("span", {}, [iconoN("recamara", 24), h("b", { text: modelo.habitaciones || "—" })]),
            h("span", {}, [iconoN("bano", 24), h("b", { text: modelo.banos || "—" })]),
            h("span", {}, [iconoN("plano", 24), h("b", { text: sup || "—" })]),
          ]),
          h("div", { class: "fn-precio" }, [
            h("span", { class: "fn-etq", text: "Precio desde" }),
            h("span", { class: "fn-pv", style: "font-size:28px;line-height:34px;font-weight:600;", text: p ? p.main : "—" }),
            p && ficha.mostrarConversion ? h("span", { class: "fn-sub", text: p.sub }) : null,
          ]),
          h("div", { class: "fn-mini" }, [
            h("div", {}, [h("span", { class: "fn-etq", text: "Precio por m²" }), h("b", { text: desde && area ? C.fmtMoney(desde / area, ficha.moneda) : "—" })]),
            h("div", {}, [h("span", { class: "fn-etq", text: "Primer pago" }), h("b", { text: pf ? C.num(pf.pct) + "% " + String(comoOracion(pf.concepto || "")).toLowerCase() : "—" })]),
          ]),
        ]),
      ]));
    });

    const body = [
      h("div", { class: "fn-proy" }, [
        h("h1", { class: "fn-nombre", style: "font-size:" + Math.round(48 * gs) + "px;font-weight:500;", text: "Propiedades" }),
        h("div", { class: "fn-rayas", "aria-hidden": "true" }, [h("span"), h("span")]),
        ciudades.length ? h("p", { class: "fn-ciudad", style: "font-size:" + Math.round(22 * gs) + "px;font-weight:600;", text: listaConY(ciudades) }) : null,
        h("p", { class: "fn-tipo", style: "font-size:16px;", text: "El modelo elegido de cada propiedad, con sus valores tal como se capturaron." }),
      ]),
    ].concat(rows);
    body.push(h("p", { class: "fn-legal", text: "Valores tal como se capturaron en cada ficha. No es una recomendación de inversión. Precios sujetos a cambio y a disponibilidad." }));
    const logoSello = (typeof doc.brandLogo === "string" && !doc.brandLogo) ? null : img(doc.brandLogo || (t.nombre === "claro" ? LOGO_TINTA_URI : LOGO_DATA_URI), "fn-sl-logo" + (doc.brandLogo ? " custom" : ""));
    const wm = wordmarkSrc(t.ink);
    body.push(h("footer", { class: "fn-sello" }, [
      logoSello, logoSello ? h("span", { class: "fn-sl-sep" }) : null,
      h("span", { class: "fn-sl-txt", text: "Hecho con" }),
      wm ? h("img", { class: "fn-sl-wd", src: wm, alt: "Propentia" }) : h("b", { text: "Propentia" }),
    ]));

    // Encabezado del documento, con el título propio del comparativo.
    const hdr = renderBrandHeader(Object.assign({}, doc, { tituloEncabezado: "Cuadro\ncomparativo" }));
    const logo = hdr.querySelector(".f-brand-logo");
    if (logo) logo.style.height = Math.round(64 * ((eg.tamanoLogo || 100) / 100)) + "px";
    return h("div", { class: "ficha-page fn fn-cmp tema-" + t.nombre, style: estiloPaginaN(doc) }, [hdr, h("div", { class: "fn-body" }, body)]);
  }

  window.FichaRender = {
    h: h,
    icon: icon,
    textStyleCss: textStyleCss,
    renderFichaPage: renderFichaPage,
    renderComparativoPage: renderComparativoPage,
    renderMapPage: renderMapPage,
    FONT_OPTIONS: FONT_OPTIONS,
    esNuevo: esNuevo,
    iconoN: iconoN,
    ciudadYTipo: ciudadYTipo,
  };
})();
