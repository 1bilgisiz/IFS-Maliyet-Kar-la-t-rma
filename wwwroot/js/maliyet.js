let tumVeri = [];
let chart;

// Custom dropdown state
let secenekler = [];           // { key, site, part, konf, tanim }
let secilen = null;            // { key, site, part, konf, tanim }
let aktifListe = [];           // dropdown'da gösterilen son liste
let aktifIndex = -1;           // klavye ile seçim

function trMoney(x) {
  const n = Number(x ?? 0);
  return n.toLocaleString("tr-TR", { maximumFractionDigits: 2 });
}

function toast(msg) {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = msg;
  el.style.display = "block";
  clearTimeout(window.__t);
  window.__t = setTimeout(() => (el.style.display = "none"), 2200);
}

// JSON key uyumu için küçük yardımcılar (snake_case veya PascalCase gelirse de çalışsın)
function val(r, ...keys) {
  for (const k of keys) {
    if (r && r[k] !== undefined && r[k] !== null) return r[k];
  }
  return null;
}

function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function getQueryString() {
  // Backend şu an sabit bile olsa ileride parametreli olursa hazır dursun
  return window.location.search || "";
}

async function veriCek() {
  const listeDurum = document.getElementById("listeDurum");
  if (listeDurum) listeDurum.textContent = "Veri çekiliyor...";

  const url = `/api/maliyet${getQueryString()}`;
  const res = await fetch(url);

  if (!res.ok) {
    const txt = await res.text();
    toast("API hata: " + txt);
    if (listeDurum) listeDurum.textContent = "Hata";
    return;
  }

  tumVeri = await res.json();
  if (listeDurum) listeDurum.textContent = `${tumVeri.length.toLocaleString("tr-TR")} satır`;
  toast("Veri geldi ✅");

  secenekleriHazirla();
  render();           // ilk yüklemede tüm veri görünür (istersen boş da bırakırız)
}

function secenekleriHazirla() {
  const uniq = new Map();

  for (const r of tumVeri) {
    const site = val(r, "site", "Site") ?? "";
    const part = val(r, "malzeme_no", "malzemeNo", "Malzeme_No") ?? "";
    const konf = val(r, "konf_id", "konfId", "Konf_Id") ?? "";
    const tanim = val(r, "malzeme_tanim", "malzemeTanim", "Malzeme_Tanim") ?? "";

    const key = `${site}||${part}||${konf}`;
    if (!uniq.has(key)) uniq.set(key, { key, site, part, konf, tanim });
  }

  secenekler = Array.from(uniq.values()).sort((a, b) =>
    String(a.part ?? "").localeCompare(String(b.part ?? ""), "tr")
  );
}

function filtreSecenek(q) {
  const s = (q || "").trim().toLowerCase();
  if (!s) return secenekler.slice(0, 12);

  return secenekler
    .filter(x => (`${x.part} ${x.tanim} ${x.site}`).toLowerCase().includes(s))
    .slice(0, 20);
}

/* ===== Dropdown render / kontrol ===== */

function dropGoster(list) {
  const dropdown = document.getElementById("secimDropdown");
  if (!dropdown) return;

  aktifListe = list;
  aktifIndex = -1;

  if (!list.length) {
    dropdown.classList.add("hidden");
    dropdown.innerHTML = "";
    return;
  }

  dropdown.innerHTML = list.map(x => `
    <div class="acItem" data-key="${escapeHtml(x.key)}">
      <div class="acCode">${escapeHtml(x.part)}</div>
      <div class="acText">${escapeHtml(x.tanim ?? "")}</div>
      <div class="acSite">${escapeHtml(x.site ?? "")}</div>
    </div>
  `).join("");

  dropdown.classList.remove("hidden");
}

function dropGizle() {
  const dropdown = document.getElementById("secimDropdown");
  dropdown?.classList.add("hidden");
}

function dropdownAcikMi() {
  const dropdown = document.getElementById("secimDropdown");
  return dropdown && !dropdown.classList.contains("hidden");
}

function dropdownAktifSatirGuncelle() {
  const dropdown = document.getElementById("secimDropdown");
  if (!dropdown) return;

  const items = Array.from(dropdown.querySelectorAll(".acItem"));
  items.forEach((el, i) => {
    if (i === aktifIndex) el.style.background = "rgba(255,255,255,.07)";
    else el.style.background = "";
  });

  // aktif öğe görünür kalsın
  const activeEl = items[aktifIndex];
  if (activeEl) activeEl.scrollIntoView({ block: "nearest" });
}

function secimiUygula(x) {
  const input = document.getElementById("secimArama");
  const btn = document.getElementById("btnGetir");

  secilen = x;

  if (input) {
    input.value = `${x.part} • ${x.tanim ?? ""} • ${x.site}`.trim();
  }

  if (btn) btn.disabled = false;

  dropGizle();
}

/* ===== Filtreleme / KPI / Tablo / Chart ===== */

function filtreliVeri() {
  // Seçim varsa yalnız onu getir
  if (secilen) {
    return tumVeri.filter(r => {
      const site = String(val(r, "site", "Site") ?? "");
      const part = String(val(r, "malzeme_no", "malzemeNo", "Malzeme_No") ?? "");
      const konf = String(val(r, "konf_id", "konfId", "Konf_Id") ?? "");

      return site === String(secilen.site ?? "") &&
        part === String(secilen.part ?? "") &&
        konf === String(secilen.konf ?? "");
    });
  }

  // seçim yoksa tüm veri
  return tumVeri;
}

function kpiBas(data) {
  const toplam = data.reduce((a, r) => a + Number(val(r, "toplam_maliyet_tr", "Toplam_Maliyet_Tr", "toplamMaliyetTr") ?? 0), 0);
  const malz = data.reduce((a, r) => a + Number(val(r, "malzeme_mlyt_tr", "Malzeme_Mlyt_Tr", "malzemeMlytTr") ?? 0), 0);
  const isc = data.reduce((a, r) => a + Number(val(r, "toplam_iscilik_tr", "Toplam_Iscilik_Tr", "toplamIscilikTr") ?? 0), 0);
  const fas = data.reduce((a, r) => a + Number(val(r, "toplam_fason_mlyt_tr", "Toplam_Fason_Mlyt_Tr", "toplamFasonMlytTr") ?? 0), 0);

  const elToplam = document.getElementById("kpiToplam");
  const elMalz = document.getElementById("kpiMalzeme");
  const elIsc = document.getElementById("kpiIscilik");
  const elFas = document.getElementById("kpiFason");
  const elSatir = document.getElementById("kpiSatir");

  if (elToplam) elToplam.textContent = trMoney(toplam);
  if (elMalz) elMalz.textContent = trMoney(malz);
  if (elIsc) elIsc.textContent = trMoney(isc);
  if (elFas) elFas.textContent = trMoney(fas);

  if (elSatir) {
    const tag = secilen ? "Seçili malzeme" : "Tüm veri";
    elSatir.textContent = `${data.length.toLocaleString("tr-TR")} satır • ${tag}`;
  }
}

function tabloBas(data) {
  const tbody = document.querySelector("#tbl tbody");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (!data.length) {
    tbody.innerHTML = `<tr><td class="empty" colspan="8">Kayıt bulunamadı</td></tr>`;
    return;
  }

  const limit = 2000;
  const view = data.slice(0, limit);

  for (const r of view) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${val(r, "site", "Site") ?? ""}</td>
      <td>${val(r, "malzeme_no", "malzemeNo", "Malzeme_No") ?? ""}</td>
      <td>${val(r, "konf_id", "konfId", "Konf_Id") ?? ""}</td>
      <td>${val(r, "malzeme_tanim", "malzemeTanim", "Malzeme_Tanim") ?? ""}</td>
      <td class="num">${trMoney(val(r, "toplam_maliyet_tr", "Toplam_Maliyet_Tr", "toplamMaliyetTr"))}</td>
      <td class="num">${trMoney(val(r, "malzeme_mlyt_tr", "Malzeme_Mlyt_Tr", "malzemeMlytTr"))}</td>
      <td class="num">${trMoney(val(r, "toplam_iscilik_tr", "Toplam_Iscilik_Tr", "toplamIscilikTr"))}</td>
      <td class="num">${trMoney(val(r, "toplam_fason_mlyt_tr", "Toplam_Fason_Mlyt_Tr", "toplamFasonMlytTr"))}</td>
    `;
    tbody.appendChild(tr);
  }

  if (data.length > limit) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td class="empty" colspan="8">Not: Performans için ilk ${limit.toLocaleString("tr-TR")} satır gösteriliyor. (Toplam: ${data.length.toLocaleString("tr-TR")})</td>`;
    tbody.appendChild(tr);
  }
}

function chartBas(data) {
  // HTML'de canvas yoksa çık (sen şimdilik chart göstermiyorsun gibi)
  const canvas = document.getElementById("siteChart");
  if (!canvas || typeof Chart === "undefined") return;

  const bySite = new Map();
  for (const r of data) {
    const k = val(r, "site", "Site") ?? "Bilinmiyor";
    const v = Number(val(r, "toplam_maliyet_tr", "Toplam_Maliyet_Tr", "toplamMaliyetTr") ?? 0);
    bySite.set(k, (bySite.get(k) ?? 0) + v);
  }

  const labels = Array.from(bySite.keys());
  const values = Array.from(bySite.values());

  if (chart) chart.destroy();
  chart = new Chart(canvas, {
    type: "bar",
    data: { labels, datasets: [{ label: "Toplam Maliyet (₺)", data: values }] },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (c) => ` ${trMoney(c.raw)} ₺` } }
      },
      scales: { y: { ticks: { callback: (v) => Number(v).toLocaleString("tr-TR") } } }
    }
  });
}

function render() {
  const data = filtreliVeri();
  kpiBas(data);
  tabloBas(data);
  chartBas(data);
}

/* ===== Actions ===== */

function csvIndir() {
  const data = filtreliVeri();
  if (!data.length) return toast("CSV için veri yok");

  const cols = [
    ["site", "Site", ["site", "Site"]],
    ["malzeme_no", "Malzeme No", ["malzeme_no", "malzemeNo", "Malzeme_No"]],
    ["konf_id", "Konf Id", ["konf_id", "konfId", "Konf_Id"]],
    ["malzeme_tanim", "Malzeme Tanım", ["malzeme_tanim", "malzemeTanim", "Malzeme_Tanim"]],
    ["toplam_maliyet_tr", "Toplam TR", ["toplam_maliyet_tr", "toplamMaliyetTr", "Toplam_Maliyet_Tr"]],
    ["malzeme_mlyt_tr", "Malzeme TR", ["malzeme_mlyt_tr", "malzemeMlytTr", "Malzeme_Mlyt_Tr"]],
    ["toplam_iscilik_tr", "İşçilik TR", ["toplam_iscilik_tr", "toplamIscilikTr", "Toplam_Iscilik_Tr"]],
    ["toplam_fason_mlyt_tr", "Fason TR", ["toplam_fason_mlyt_tr", "toplamFasonMlytTr", "Toplam_Fason_Mlyt_Tr"]],
  ];

  const esc = (s) => `"${String(s ?? "").replaceAll('"', '""')}"`;
  const header = cols.map(c => esc(c[1])).join(",");

  const rows = data.map(r => cols.map(c => esc(val(r, ...c[2]))).join(","));
  const csv = [header, ...rows].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "maliyet.csv";
  a.click();
  URL.revokeObjectURL(a.href);

  toast("CSV indirildi ✅");
}

function temizle() {
  const input = document.getElementById("secimArama");
  const btn = document.getElementById("btnGetir");

  secilen = null;
  if (input) input.value = "";
  if (btn) btn.disabled = true;

  dropGizle();
  render();
  toast("Seçim temizlendi");
}

function secimiGetir() {
  if (!secilen) return toast("Listeden bir malzeme seçmelisin");
  render();
  toast("Seçim uygulandı ✅");
}

/* ===== Events ===== */

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("secimArama");
  const dropdown = document.getElementById("secimDropdown");
  const btnGetir = document.getElementById("btnGetir");

  document.getElementById("btnTemizle")?.addEventListener("click", temizle);
  document.getElementById("btnCSV")?.addEventListener("click", csvIndir);
  btnGetir?.addEventListener("click", secimiGetir);

  // input yazdıkça dropdown filtrele
  input?.addEventListener("input", () => {
    const list = filtreSecenek(input.value);

    // kullanıcı yazmaya başladıysa eski seçimi iptal et (çok önemli UX)
    secilen = null;
    if (btnGetir) btnGetir.disabled = true;

    dropGoster(list);
  });

  // klavye kontrolleri
  input?.addEventListener("keydown", (e) => {
    if (!dropdownAcikMi()) {
      // aşağı ok ile aç
      if (e.key === "ArrowDown") {
        const list = filtreSecenek(input.value);
        dropGoster(list);
        e.preventDefault();
      }
      return;
    }

    if (e.key === "Escape") {
      dropGizle();
      e.preventDefault();
      return;
    }

    if (e.key === "ArrowDown") {
      aktifIndex = Math.min(aktifIndex + 1, aktifListe.length - 1);
      dropdownAktifSatirGuncelle();
      e.preventDefault();
      return;
    }

    if (e.key === "ArrowUp") {
      aktifIndex = Math.max(aktifIndex - 1, 0);
      dropdownAktifSatirGuncelle();
      e.preventDefault();
      return;
    }

    if (e.key === "Enter") {
      // aktif yoksa ilkini seç
      const pick = aktifListe[aktifIndex >= 0 ? aktifIndex : 0];
      if (pick) secimiUygula(pick);
      e.preventDefault();
      return;
    }
  });

  // dropdown click
  dropdown?.addEventListener("click", (e) => {
    const item = e.target.closest(".acItem");
    if (!item) return;

    const key = item.getAttribute("data-key");
    const x = secenekler.find(s => s.key === key);
    if (!x) return;

    secimiUygula(x);
  });

  // dışarı tıklayınca kapat
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".acWrap")) dropGizle();
  });

  veriCek();
});