# Το παλιό Taxisnet UI, το ορθόδοξο

Demo: https://markdimi.github.io/taxisnet-old-ui/

Μικρή βιβλιοθήκη components (CSS + HTML + JS) εμπνευσμένη από το **παλιό** design των ελληνικών κυβερνητικών web εφαρμογών της δεκαετίας του 2000 — το legacy look του TAXISnet, όχι το σημερινό myAADE. Χωρίς εξαρτήσεις, χωρίς build step: δύο αρχεία και έτοιμο.

> **Δεν σχετίζεται με την ΑΑΔΕ.** Ανεξάρτητο, ερασιτεχνικό project. Δεν έχει καμία σχέση,
> έγκριση ή υποστήριξη από την Ανεξάρτητη Αρχή Δημοσίων Εσόδων ή οποιονδήποτε άλλο
> δημόσιο φορέα, και δεν περιέχει επίσημα λογότυπα, εθνόσημα ή άλλα assets τους. Είναι
> αναπαραγωγή ενός οπτικού στυλ εποχής (retro CSS), όχι της πλατφόρμας. Δεν συνδέεται με
> κανένα κρατικό σύστημα, δεν στέλνει δεδομένα πουθενά, και **δεν πρέπει να χρησιμοποιηθεί
> με τρόπο που να φαίνεται ως επίσημη υπηρεσία** (π.χ. σελίδα που ζητά κωδικούς TAXISnet).
>
> Τα δεδομένα στη σελίδα επίδειξης είναι φανταστικά.

```
taxisnet-old/
├── taxisnet.css   # η βιβλιοθήκη
├── taxisnet.js    # συμπεριφορές (tabs, modal, validation, sorting…)
├── index.html     # επίδειξη όλων των components μέσα στο πραγματικό «κέλυφος»
└── README.md
```

```html
<link rel="stylesheet" href="taxisnet.css">
<body class="tx-page">…</body>
<script src="taxisnet.js"></script>
```

Όλα τα components ζουν κάτω από `.tx-page` και έχουν prefix `tx-`.

## Από πού προέκυψαν τα χρώματα

Δειγματοληψία pixel από πραγματικό screenshot της σελίδας «Εφαρμογές TAXISnet».
Τα βασικά:

| Token | Τιμή | Πού |
|---|---|---|
| `--tx-page-bg` | `#DAEDF4` | φόντο σελίδας |
| `--tx-content-bg` | `#F2F5F5` | περιοχή περιεχομένου |
| `--tx-teal` / `--tx-teal-dark` | `#408B9A` / `#2C7589` | navbar, tabs, κεφαλίδες πινάκων |
| `--tx-teal-light` | `#4099AB` | ενεργό στοιχείο μενού |
| `--tx-blue-pale` / `--tx-blue-bar` | `#D3E4EA` / `#E3EBEE` | πλαϊνό μενού, μπάρα χρήστη |
| `--tx-yellow` | `#F8FBBA` | λωρίδα μηνυμάτων |
| `--tx-orange` / `--tx-rule` | `#E56D31` / `#D3C89F` | τίτλοι + λεπτή γραμμή |
| `--tx-olive` / `--tx-olive-bg` | `#899370` / `#EBF0DC` | πλαίσιο «Βοήθεια» |
| `--tx-link` | `#6C6C6C` | οι σύνδεσμοι είναι **γκρι bold υπογραμμισμένοι**, όχι μπλε |
| `--tx-zebra` | `#E6E6E6` | εναλλασσόμενες υπο-γραμμές |

Γραμματοσειρά: `Verdana` 11px (fallback DejaVu Sans/Tahoma). Το πλάτος του frame είναι
990px, το πλαϊνό μενού 168px, η στήλη βοήθειας 160px — όσο και στο πρωτότυπο.

Αλλάζεις παλέτα μόνο από τα custom properties στο `:root`.

## Layout

```html
<div class="tx-frame">
  <header class="tx-header">…</header>
  <nav class="tx-nav"><ul class="tx-nav__list">
    <li class="tx-nav__item tx-nav__item--active">
      <a class="tx-nav__link" href="#"><span>Εφαρμογές TAXISnet</span></a>
    </li>
  </ul></nav>
  <div class="tx-strip">…λωρίδα μηνυμάτων…</div>
  <div class="tx-userbar">Α.Φ.Μ.: …</div>
  <div class="tx-layout">
    <aside class="tx-sidebar"><ul class="tx-menu">…</ul></aside>
    <main class="tx-main">
      <h1 class="tx-title">Τίτλος</h1>
      <div class="tx-cols">
        <div class="tx-cols__main">…</div>
        <div class="tx-aside"><section class="tx-help">…</section></div>
      </div>
    </main>
  </div>
  <footer class="tx-footer">…</footer>
</div>
```

Το `<span>` μέσα στο `.tx-nav__link` είναι απαραίτητο: το tab είναι λοξό (`skewX(-20deg)`)
και το span ξε-λοξώνει το κείμενο. Modifiers: `--active`, `--disabled`.

## Components

| Component | Κλάσεις |
|---|---|
| Πλαϊνό μενού | `.tx-menu`, `.tx-menu__link`, `.tx-menu__item--active`, `.tx-menu__sub` |
| Τίτλος / breadcrumb | `.tx-title`, `.tx-title--plain`, `.tx-breadcrumb` |
| Λίστα εφαρμογών | `.tx-applist`, `.tx-applist__link`, `.tx-applist__sub` (ζέβρα αυτόματα) |
| Πλαίσια | `.tx-box`, `.tx-box__title`, `.tx-box__footer` |
| Βοήθεια | `.tx-help` + `--info` / `--warn`, `.tx-help__title`, `.tx-help__body` |
| Alerts | `.tx-alert` + `--success` / `--warn` / `--error` |
| Πίνακες | `.tx-table` (+`--compact`), `.tx-kv`, `.tx-table__num` |
| Φόρμες | `.tx-fieldset`, `.tx-field`, `.tx-label`, `.tx-input`, `.tx-select`, `.tx-textarea`, `.tx-check`, `.tx-req`, `.tx-hint` |
| Κουμπιά | `.tx-btn` + `--primary` / `--danger` / `--sm` / `--link`, `.tx-btnbar` |
| Καρτέλες | `.tx-tabs`, `.tx-tabs__btn`, `.tx-tabs__panel` |
| Accordion | `.tx-acc`, `.tx-acc__btn`, `.tx-acc__panel` |
| Wizard | `.tx-steps`, `--done` / `--current` |
| Σελιδοποίηση | `.tx-pager`, `.tx-pager__link`, `.tx-pager__info` |
| Ενδείξεις | `.tx-badge` + `--success` / `--warn` / `--error` / `--muted` |
| Modal | `.tx-modal`, `.tx-modal__dialog/head/body/foot` |
| Tooltip | `.tx-tip` + `data-tx-tip="…"` |
| Toast | `.tx-toast` (μέσω `TX.toast()`) |
| Φόρτωση | `.tx-loading`, `.tx-bar` + `.tx-bar__fill` |

## JavaScript

Όλα ενεργοποιούνται μόνα τους με data-attributes στο `DOMContentLoaded`.
Για δυναμικό περιεχόμενο: `TX.init(container)`.

| Attribute | Τι κάνει |
|---|---|
| `data-tx-tabs` | καρτέλες με πλήρη πλοήγηση βελών + ARIA |
| `data-tx-accordion` (`data-tx-single`) | accordion, προαιρετικά ένα ανοιχτό |
| `data-tx-modal-open="id"` / `data-tx-modal-close` | άνοιγμα/κλείσιμο modal (Esc & κλικ στο φόντο) |
| `data-tx-dismiss=".tx-alert"` | κλείσιμο του πλησιέστερου προγόνου |
| `data-tx-sortable` + `<th data-tx-sort="text\|number\|date">` | ταξινόμηση πίνακα (ελληνικό collation, δεκαδικό κόμμα) |
| `data-tx-validate` σε `<form>` | έλεγχος στο blur και στο submit |
| `data-tx-rule="afm\|amka\|iban\|email\|number"` | κανόνας ανά πεδίο |
| `data-tx-mask="digits\|amount\|iban"` | μάσκα πληκτρολόγησης |
| `data-tx-message="…"` | δικό σου μήνυμα λάθους |

Οι έλεγχοι είναι οι πραγματικοί αλγόριθμοι: **Α.Φ.Μ.** με modulo 11, **Α.Μ.Κ.Α.** με Luhn,
**IBAN** με mod-97. Γίνονται τοπικά στον browser.

Δημόσιο API:

```js
TX.toast("Η δήλωση υποβλήθηκε.", "success", 4000);
TX.modal.open("m-help");  TX.modal.close("m-help");
TX.validate.form(document.querySelector("form"));
TX.validators.afm("094014201"); // true/false
TX.init(node); // για περιεχόμενο που μπήκε μετά
```

Βάλε ένα `<div class="tx-alert tx-alert--error" data-tx-summary hidden>` μέσα στη φόρμα
και θα εμφανίζεται αυτόματα όταν η υποβολή αποτύχει.

## Σημειώσεις υλοποίησης

- Οι βασικοί κανόνες για links γράφονται με `:where()` ώστε να μένουν σε μηδενική
  specificity και να μην «σκοτώνουν» τα χρώματα των components. Αν προσθέσεις δικούς σου
  κανόνες, κράτα το ίδιο μοτίβο.
- Το `[hidden]` δηλώνεται `display:none !important` επειδή πολλά components είναι `flex`.
- Προσβασιμότητα: ορατό focus, ARIA σε tabs/accordion/modal, πλοήγηση με πληκτρολόγιο,
  σεβασμός στο `prefers-reduced-motion`.
- Το πρωτότυπο ήταν fixed-width. Κάτω από 1010px οι στήλες στοιβάζονται (breakpoint στο
  τέλος του CSS) — σβήσ' το αν θέλεις 100% πιστότητα εποχής.
- Υπάρχει και `@media print` που κρύβει navbar/μενού/κουμπιά, για εκτυπώσεις αποδεικτικών.
- Τα εικονίδια είναι inline SVG data URIs μέσα στο CSS: κανένα εξωτερικό asset, καμία
  χρήση επίσημων λογότυπων. Τα σχήματα στο header είναι απλά γεωμετρικά placeholders —
  αντικατέστησέ τα με δικά σου αρχεία αν χρειάζεται.

## Άδεια

MIT — δες το [LICENSE](LICENSE). Αφορά τον κώδικα αυτού του repo. Ονόματα και σήματα
τρίτων (συμπεριλαμβανομένων δημόσιων φορέων) ανήκουν στους κατόχους τους και δεν
παραχωρούνται από αυτή την άδεια.
