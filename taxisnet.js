/*!
 * TAXISnet Old UI — taxisnet.js
 * Συμπεριφορές components χωρίς εξαρτήσεις (vanilla JS, ES5+).
 * Auto-init μέσω data-attributes. Δημόσιο API: window.TX
 */
(function (window, document) {
  "use strict";

  var TX = {};

  /* ----------------------------------------------------------------------
     Helpers
     ---------------------------------------------------------------------- */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function on(el, ev, fn) { el.addEventListener(ev, fn); }

  /* ----------------------------------------------------------------------
     Tabs — <div data-tx-tabs> με .tx-tabs__btn[aria-controls]
     ---------------------------------------------------------------------- */
  TX.tabs = {
    select: function (root, btn) {
      $$(".tx-tabs__btn", root).forEach(function (b) {
        var selected = b === btn;
        b.setAttribute("aria-selected", selected ? "true" : "false");
        b.tabIndex = selected ? 0 : -1;
        var panel = document.getElementById(b.getAttribute("aria-controls"));
        if (panel) panel.hidden = !selected;
      });
    },
    init: function (root) {
      var btns = $$(".tx-tabs__btn", root);
      if (!btns.length) return;
      var list = $(".tx-tabs__list", root);
      if (list) list.setAttribute("role", "tablist");
      btns.forEach(function (btn, i) {
        btn.setAttribute("role", "tab");
        var panel = document.getElementById(btn.getAttribute("aria-controls"));
        if (panel) { panel.setAttribute("role", "tabpanel"); panel.tabIndex = 0; }
        if (!btn.hasAttribute("aria-selected")) btn.setAttribute("aria-selected", i === 0 ? "true" : "false");
        on(btn, "click", function () { TX.tabs.select(root, btn); });
        on(btn, "keydown", function (e) {
          var d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
          if (!d) return;
          e.preventDefault();
          var next = btns[(i + d + btns.length) % btns.length];
          next.focus();
          TX.tabs.select(root, next);
        });
      });
      TX.tabs.select(root, btns.filter(function (b) { return b.getAttribute("aria-selected") === "true"; })[0] || btns[0]);
    }
  };

  /* ----------------------------------------------------------------------
     Accordion — <div data-tx-accordion [data-tx-single]>
     ---------------------------------------------------------------------- */
  TX.accordion = {
    init: function (root) {
      var single = root.hasAttribute("data-tx-single");
      var btns = $$(".tx-acc__btn", root);
      btns.forEach(function (btn) {
        var panel = document.getElementById(btn.getAttribute("aria-controls"));
        var open = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", open ? "true" : "false");
        if (panel) panel.hidden = !open;
        on(btn, "click", function () {
          var isOpen = btn.getAttribute("aria-expanded") === "true";
          if (single && !isOpen) {
            btns.forEach(function (b) {
              b.setAttribute("aria-expanded", "false");
              var p = document.getElementById(b.getAttribute("aria-controls"));
              if (p) p.hidden = true;
            });
          }
          btn.setAttribute("aria-expanded", isOpen ? "false" : "true");
          if (panel) panel.hidden = isOpen;
        });
      });
    }
  };

  /* ----------------------------------------------------------------------
     Modal — button[data-tx-modal-open="id"], .tx-modal#id
     ---------------------------------------------------------------------- */
  var lastFocused = null;
  TX.modal = {
    open: function (id) {
      var m = typeof id === "string" ? document.getElementById(id) : id;
      if (!m) return;
      lastFocused = document.activeElement;
      m.classList.add("tx-is-open");
      m.setAttribute("aria-hidden", "false");
      var focusable = $$("button, [href], input, select, textarea", m).filter(function (el) { return !el.disabled; });
      if (focusable[0]) focusable[0].focus();
    },
    close: function (id) {
      var m = typeof id === "string" ? document.getElementById(id) : id;
      if (!m) return;
      m.classList.remove("tx-is-open");
      m.setAttribute("aria-hidden", "true");
      if (lastFocused) lastFocused.focus();
    },
    init: function () {
      $$("[data-tx-modal-open]").forEach(function (btn) {
        on(btn, "click", function (e) {
          e.preventDefault();
          TX.modal.open(btn.getAttribute("data-tx-modal-open"));
        });
      });
      $$(".tx-modal").forEach(function (m) {
        m.setAttribute("role", "dialog");
        m.setAttribute("aria-modal", "true");
        m.setAttribute("aria-hidden", m.classList.contains("tx-is-open") ? "false" : "true");
        on(m, "click", function (e) {
          if (e.target === m || e.target.hasAttribute("data-tx-modal-close")) TX.modal.close(m);
        });
      });
      on(document, "keydown", function (e) {
        if (e.key !== "Escape") return;
        $$(".tx-modal.tx-is-open").forEach(function (m) { TX.modal.close(m); });
      });
    }
  };

  /* ----------------------------------------------------------------------
     Dismiss — [data-tx-dismiss] κλείνει τον πλησιέστερο πρόγονο-στόχο
     ---------------------------------------------------------------------- */
  TX.dismiss = {
    init: function () {
      $$("[data-tx-dismiss]").forEach(function (btn) {
        on(btn, "click", function () {
          var sel = btn.getAttribute("data-tx-dismiss");
          var target = sel ? btn.closest(sel) : btn.parentNode;
          if (target) target.parentNode.removeChild(target);
        });
      });
    }
  };

  /* ----------------------------------------------------------------------
     Ταξινόμηση πίνακα — <th data-tx-sort="text|number|date">
     ---------------------------------------------------------------------- */
  function cellValue(row, index, type) {
    var cell = row.cells[index];
    var raw = cell ? (cell.getAttribute("data-tx-value") || cell.textContent).trim() : "";
    if (type === "number") return parseFloat(raw.replace(/\./g, "").replace(",", ".").replace(/[^\d.\-]/g, "")) || 0;
    if (type === "date") {
      var m = raw.match(/(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})/);
      return m ? new Date(+m[3], +m[2] - 1, +m[1]).getTime() : 0;
    }
    return raw.toLocaleLowerCase("el-GR");
  }

  TX.sortTable = {
    init: function (table) {
      $$("th[data-tx-sort]", table).forEach(function (th, i) {
        var index = th.cellIndex;
        th.tabIndex = 0;
        function run() {
          var type = th.getAttribute("data-tx-sort") || "text";
          var asc = th.getAttribute("aria-sort") !== "ascending";
          var tbody = table.tBodies[0];
          var rows = Array.prototype.slice.call(tbody.rows);
          rows.sort(function (a, b) {
            var va = cellValue(a, index, type), vb = cellValue(b, index, type);
            return (va < vb ? -1 : va > vb ? 1 : 0) * (asc ? 1 : -1);
          });
          rows.forEach(function (r) { tbody.appendChild(r); });
          $$("th[data-tx-sort]", table).forEach(function (o) { o.removeAttribute("aria-sort"); });
          th.setAttribute("aria-sort", asc ? "ascending" : "descending");
        }
        on(th, "click", run);
        on(th, "keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); run(); } });
      });
    }
  };

  /* ----------------------------------------------------------------------
     Validation — <form data-tx-validate>
     Κανόνες: required, data-tx-rule="afm|amka|iban|email|number"
     ---------------------------------------------------------------------- */
  TX.validators = {
    afm: function (v) {                      // ΑΦΜ: 9 ψηφία, modulo 11
      if (!/^\d{9}$/.test(v)) return false;
      var sum = 0;
      for (var i = 0; i < 8; i++) sum += parseInt(v.charAt(i), 10) * Math.pow(2, 8 - i);
      return (sum % 11) % 10 === parseInt(v.charAt(8), 10);
    },
    amka: function (v) {                     // ΑΜΚΑ: 11 ψηφία + Luhn
      if (!/^\d{11}$/.test(v)) return false;
      var sum = 0, dbl = false;
      for (var i = v.length - 1; i >= 0; i--) {
        var d = parseInt(v.charAt(i), 10);
        if (dbl) { d *= 2; if (d > 9) d -= 9; }
        sum += d; dbl = !dbl;
      }
      return sum % 10 === 0;
    },
    iban: function (v) {                     // IBAN: mod-97
      v = v.replace(/\s+/g, "").toUpperCase();
      if (!/^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(v)) return false;
      var re = (v.slice(4) + v.slice(0, 4)).replace(/[A-Z]/g, function (c) { return c.charCodeAt(0) - 55; });
      var rem = "";
      for (var i = 0; i < re.length; i++) rem = String(parseInt(rem + re.charAt(i), 10) % 97);
      return rem === "1";
    },
    email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); },
    number: function (v) { return /^-?\d+([.,]\d+)?$/.test(v); }
  };

  var MSG = {
    required: "Το πεδίο είναι υποχρεωτικό.",
    afm: "Μη έγκυρος Α.Φ.Μ.",
    amka: "Μη έγκυρος Α.Μ.Κ.Α.",
    iban: "Μη έγκυρος αριθμός IBAN.",
    email: "Μη έγκυρη διεύθυνση e-mail.",
    number: "Επιτρέπονται μόνο αριθμοί."
  };

  function fieldError(field, msg) {
    var wrap = field.closest(".tx-field__control") || field.parentNode;
    var box = wrap.querySelector(".tx-error-msg");
    if (msg) {
      field.classList.add("tx-is-invalid");
      field.setAttribute("aria-invalid", "true");
      if (!box) {
        box = document.createElement("span");
        box.className = "tx-error-msg";
        wrap.appendChild(box);
      }
      box.textContent = msg;
    } else {
      field.classList.remove("tx-is-invalid");
      field.removeAttribute("aria-invalid");
      if (box) box.parentNode.removeChild(box);
    }
  }

  TX.validate = {
    field: function (field) {
      var v = (field.value || "").trim();
      if (field.hasAttribute("required") && !v) { fieldError(field, MSG.required); return false; }
      var rule = field.getAttribute("data-tx-rule");
      if (rule && v && TX.validators[rule] && !TX.validators[rule](v)) {
        fieldError(field, field.getAttribute("data-tx-message") || MSG[rule]);
        return false;
      }
      fieldError(field, null);
      return true;
    },
    form: function (form) {
      var fields = $$("input, select, textarea", form).filter(function (f) {
        return f.hasAttribute("required") || f.hasAttribute("data-tx-rule");
      });
      var ok = true, first = null;
      fields.forEach(function (f) {
        if (!TX.validate.field(f)) { ok = false; if (!first) first = f; }
      });
      var summary = $(".tx-alert--error[data-tx-summary]", form);
      if (summary) summary.hidden = ok;
      if (first) first.focus();
      return ok;
    },
    init: function (form) {
      $$("input, select, textarea", form).forEach(function (f) {
        on(f, "blur", function () {
          if (f.hasAttribute("required") || f.hasAttribute("data-tx-rule")) TX.validate.field(f);
        });
      });
      on(form, "submit", function (e) {
        if (!TX.validate.form(form)) e.preventDefault();
      });
    }
  };

  /* ----------------------------------------------------------------------
     Μάσκες εισόδου — data-tx-mask="digits|amount|iban"
     ---------------------------------------------------------------------- */
  TX.mask = {
    init: function (input) {
      var type = input.getAttribute("data-tx-mask");
      on(input, "input", function () {
        var v = input.value;
        if (type === "digits") input.value = v.replace(/\D/g, "");
        else if (type === "amount") input.value = v.replace(/[^\d,]/g, "");
        else if (type === "iban") input.value = v.toUpperCase().replace(/[^A-Z0-9]/g, "").replace(/(.{4})/g, "$1 ").trim();
      });
    }
  };

  /* ----------------------------------------------------------------------
     Toasts — TX.toast("κείμενο", "success|error|info", ms)
     ---------------------------------------------------------------------- */
  TX.toast = function (text, kind, ms) {
    var host = $(".tx-toasts");
    if (!host) {
      host = document.createElement("div");
      host.className = "tx-toasts";
      host.setAttribute("role", "status");
      host.setAttribute("aria-live", "polite");
      document.body.appendChild(host);
    }
    var t = document.createElement("div");
    t.className = "tx-toast" + (kind && kind !== "info" ? " tx-toast--" + kind : "");
    t.textContent = text;
    host.appendChild(t);
    window.setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, ms || 3500);
    return t;
  };

  /* ----------------------------------------------------------------------
     Auto-init
     ---------------------------------------------------------------------- */
  TX.init = function (ctx) {
    ctx = ctx || document;
    $$("[data-tx-tabs]", ctx).forEach(TX.tabs.init);
    $$("[data-tx-accordion]", ctx).forEach(TX.accordion.init);
    $$("table[data-tx-sortable]", ctx).forEach(TX.sortTable.init);
    $$("form[data-tx-validate]", ctx).forEach(TX.validate.init);
    $$("[data-tx-mask]", ctx).forEach(TX.mask.init);
    TX.modal.init();
    TX.dismiss.init();
  };

  if (document.readyState === "loading") {
    on(document, "DOMContentLoaded", function () { TX.init(); });
  } else {
    TX.init();
  }

  window.TX = TX;
})(window, document);
