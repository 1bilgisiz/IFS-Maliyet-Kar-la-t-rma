let tumVeri = [];
let chart;

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

// JSON key uyumu için küçük yardımcılar
function val(r, ...keys) {
  for (const k of keys) {
    if (r && r[k] !== undefined && r[k] !== null) return r[k];
  }
  return null;
}

function getTepeKod() {
  return (document.getElementById("tepeKod")?.value || "").trim();
}

async function veriCek(tepeKod) {
  const listeDurum = document.getElementById("listeDurum");
  if (listeDurum) listeDurum.textContent = "Veri çekiliyor...";

  const url = `/api/maliyet/liste?tepeKod=${encodeURIComponent(tepeKod)}`;
  const res = await fetch(url);

  if (!res.ok) {
    const txt = await res.text();
    toast("API hata: " + (txt || res.status));
    if (listeDurum) listeDurum.textContent = "Hata";
    tumVeri = [];
    render();
    return;
  }

  tumVeri = await res.json();

  if (listeDurum) {
    const adet = tumVeri.length.toLocaleString("tr-TR");
    listeDurum.textContent = `Tepe Kod: ${tepeKod} • ${adet} satır`;
  }

  toast("Veri geldi ✅");
  render();
}

/* ===== KPI / Tablo / Chart ===== */

function kpiBas(data) {
  const toplam = data.reduce((a, r) => a + Number(val(r, "toplamMaliyetTr", "toplam_maliyet_tr", "Toplam_Maliyet_Tr") ?? 0), 0);
  const malz = data.reduce((a, r) => a + Number(val(r, "malzemeMlytTr", "malzeme_mlyt_tr", "Malzeme_Mlyt_Tr") ?? 0), 0);
  const isc = data.reduce((a, r) => a + Number(val(r, "toplamIscilikTr", "toplam_iscilik_tr", "Toplam_Iscilik_Tr") ?? 0), 0);
  const fas = data.reduce((a, r) => a + Number(val(r, "toplamFasonMlytTr", "toplam_fason_mlyt_tr", "Toplam_Fason_Mlyt_Tr") ?? 0), 0);

  const elToplam = document.getElementById("kpiToplam");
  const elMalz = document.getElementById("kpiMalzeme");
  const elIsc = document.getElementById("kpiIscilik");
  const elFas = document.getElementById("kpiFason");
  const elSatir = document.getElementById("kpiSatir");

  if (elToplam) elToplam.textContent = data.length ? trMoney(toplam) : "-";
  if (elMalz) elMalz.textContent = data.length ? trMoney(malz) : "-";
  if (elIsc) elIsc.textContent = data.length ? trMoney(isc) : "-";
  if (elFas) elFas.textContent = data.length ? trMoney(fas) : "-";

  if (elSatir) elSatir.textContent = data.length ? `${data.length.toLocaleString("tr-TR")} satır` : "-";
}

function tabloBas(data) {
  const tbody = document.querySelector("#tbl tbody");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (!data.length) {
    tbody.innerHTML = `<tr><td class="empty" colspan="8">Veri görmek için tepe kod girip “Getir”e bas.</td></tr>`;
    return;
  }

  const limit = 2000;
  const view = data.slice(0, limit);

  for (const r of view) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${val(r, "site", "Site") ?? ""}</td>
      <td>${val(r, "malzemeNo", "malzeme_no", "Malzeme_No") ?? ""}</td>
      <td>${val(r, "konfId", "konf_id", "Konf_Id") ?? ""}</td>
      <td>${val(r, "malzemeTanim", "malzeme_tanim", "Malzeme_Tanim") ?? ""}</td>
      <td class="num">${trMoney(val(r, "toplamMaliyetTr", "toplam_maliyet_tr", "Toplam_Maliyet_Tr"))}</td>
      <td class="num">${trMoney(val(r, "malzemeMlytTr", "malzeme_mlyt_tr", "Malzeme_Mlyt_Tr"))}</td>
      <td class="num">${trMoney(val(r, "toplamIscilikTr", "toplam_iscilik_tr", "Toplam_Iscilik_Tr"))}</td>
      <td class="num">${trMoney(val(r, "toplamFasonMlytTr", "toplam_fason_mlyt_tr", "Toplam_Fason_Mlyt_Tr"))}</td>
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
  const canvas = document.getElementById("siteChart");
  if (!canvas || typeof Chart === "undefined") return;

  const bySite = new Map();
  for (const r of data) {
    const k = val(r, "site", "Site") ?? "Bilinmiyor";
    const v = Number(val(r, "toplamMaliyetTr", "toplam_maliyet_tr", "Toplam_Maliyet_Tr") ?? 0);
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
  const data = tumVeri || [];
  kpiBas(data);
  tabloBas(data);
  chartBas(data);
}

/* ===== Actions ===== */

function csvIndirExcel() {
  const data = tumVeri || [];
  if (!data.length) return toast("CSV için veri yok");

  const sep = ";";

  const cols = [
    ["Site", (r) => val(r, "site", "Site")],
    ["Malzeme No", (r) => val(r, "malzemeNo", "malzeme_no", "Malzeme_No")],
    ["Konf", (r) => val(r, "konfId", "konf_id", "Konf_Id")],
    ["Tanım", (r) => val(r, "malzemeTanim", "malzeme_tanim", "Malzeme_Tanim")],
    ["Toplam (₺)", (r) => val(r, "toplamMaliyetTr", "toplam_maliyet_tr", "Toplam_Maliyet_Tr")],
    ["Malzeme (₺)", (r) => val(r, "malzemeMlytTr", "malzeme_mlyt_tr", "Malzeme_Mlyt_Tr")],
    ["İşçilik (₺)", (r) => val(r, "toplamIscilikTr", "toplam_iscilik_tr", "Toplam_Iscilik_Tr")],
    ["Fason (₺)", (r) => val(r, "toplamFasonMlytTr", "toplam_fason_mlyt_tr", "Toplam_Fason_Mlyt_Tr")],
  ];

  // Excel için: Türkçe ondalık virgül + binlik nokta
  function trNumber(x) {
    if (x === null || x === undefined || x === "") return "";
    const n = Number(x);
    if (Number.isNaN(n)) return String(x);
    // binlik ayraç ve ondalık virgül
    return n.toLocaleString("tr-TR", { maximumFractionDigits: 6 });
  }

  function esc(s) {
    const str = String(s ?? "");
    // ; veya " veya satır sonu varsa çift tırnakla kaçır
    if (str.includes('"') || str.includes("\n") || str.includes("\r") || str.includes(sep)) {
      return `"${str.replaceAll('"', '""')}"`;
    }
    return str;
  }

  const header = cols.map(c => esc(c[0])).join(sep);

  const rows = data.map(r => {
    return cols.map(([_, fn]) => {
      const v = fn(r);

      // sayısal kolonları TR format yaz
      if (typeof v === "number") return esc(trNumber(v));
      // number string gelirse de çevirmeyi dene
      if (v !== null && v !== undefined && v !== "" && !isNaN(Number(v))) return esc(trNumber(v));

      return esc(v);
    }).join(sep);
  });

  // UTF-8 BOM: Excel Türkçe karakterleri düzgün açsın
  const bom = "\uFEFF";
  const csv = bom + [header, ...rows].join("\r\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "maliyet_excel.csv";
  a.click();
  URL.revokeObjectURL(a.href);

  toast("Excel uyumlu CSV indirildi ✅");
}

function temizle() {
  const input = document.getElementById("tepeKod");
  const btn = document.getElementById("btnGetir");

  if (input) input.value = "";
  if (btn) btn.disabled = true;

  tumVeri = [];
  const listeDurum = document.getElementById("listeDurum");
  if (listeDurum) listeDurum.textContent = "Henüz veri yok";

  render();
  toast("Temizlendi");
}

function getirTik() {
  const tepeKod = getTepeKod();
  if (!tepeKod) return toast("Tepe kod giriniz.");
  veriCek(tepeKod);
}

/* ===== Events ===== */

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("tepeKod");
  const btnGetir = document.getElementById("btnGetir");

  document.getElementById("btnTemizle")?.addEventListener("click", temizle);
  document.getElementById("btnCSV")?.addEventListener("click", csvIndirExcel);
  btnGetir?.addEventListener("click", getirTik);

  input?.addEventListener("input", () => {
    if (btnGetir) btnGetir.disabled = !input.value.trim();
  });

  input?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      if (!btnGetir?.disabled) getirTik();
    }
  });


  render();
});