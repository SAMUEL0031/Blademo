/* ================================================
   Purchase Tracker — Application Logic
   ================================================ */

'use strict';

/* ---------- State ---------- */
const STORAGE_KEY = 'purchaseTracker_v1';

let transactions = loadTransactions();
let editingId = null;   // null = mode tambah, string = mode edit

/* ---------- DOM Refs ---------- */
const navBtns        = document.querySelectorAll('.nav-btn');
const pages          = document.querySelectorAll('.page');

const summaryBalance = document.getElementById('summary-balance');
const summaryIncome  = document.getElementById('summary-income');
const summaryExpense = document.getElementById('summary-expense');

const tbodyRecent    = document.getElementById('tbody-recent');
const tbodyAll       = document.getElementById('tbody-all');
const emptyRecent    = document.getElementById('empty-recent');
const emptyAll       = document.getElementById('empty-all');

const modalBackdrop  = document.getElementById('modal-backdrop');
const modalTitle     = document.getElementById('modal-title');
const formTransaksi  = document.getElementById('form-transaksi');
const btnOpenModal   = document.getElementById('btn-open-modal');
const btnOpenModal2  = document.getElementById('btn-open-modal-2');
const btnCloseModal  = document.getElementById('btn-close-modal');
const btnCancel      = document.getElementById('btn-cancel');

const inputKeterangan = document.getElementById('input-keterangan');
const inputKategori   = document.getElementById('input-kategori');
const inputNominal    = document.getElementById('input-nominal');
const inputTanggal    = document.getElementById('input-tanggal');

const toast = document.getElementById('toast');

/* ================================================
   Navigation
   ================================================ */
navBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.page;
    navBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    pages.forEach(p => {
      p.classList.toggle('active', p.id === 'page-' + target);
    });
    if (target === 'transaksi') renderAll();
  });
});

/* ================================================
   Modal
   ================================================ */
function openModal(mode, data) {
  editingId = null;
  modalTitle.textContent = 'Tambah Transaksi';
  formTransaksi.reset();
  inputTanggal.value = todayISO();
  clearErrors();

  if (mode === 'edit' && data) {
    editingId = data.id;
    modalTitle.textContent = 'Edit Transaksi';
    setRadio('jenis', data.jenis);
    inputKeterangan.value = data.keterangan;
    inputKategori.value   = data.kategori;
    inputNominal.value    = data.nominal;
    inputTanggal.value    = data.tanggal;
  }

  modalBackdrop.classList.add('open');
  inputKeterangan.focus();
}

function closeModal() {
  modalBackdrop.classList.remove('open');
  editingId = null;
  clearErrors();
}

btnOpenModal.addEventListener('click',  () => openModal('add'));
btnOpenModal2.addEventListener('click', () => openModal('add'));
btnCloseModal.addEventListener('click', closeModal);
btnCancel.addEventListener('click',     closeModal);

// close when clicking backdrop
modalBackdrop.addEventListener('click', e => {
  if (e.target === modalBackdrop) closeModal();
});

/* ================================================
   Form Submit — Tambah & Edit
   ================================================ */
formTransaksi.addEventListener('submit', e => {
  e.preventDefault();
  if (!validateForm()) return;

  const jenis       = getRadio('jenis');
  const keterangan  = inputKeterangan.value.trim();
  const kategori    = inputKategori.value;
  const nominal     = parseFloat(inputNominal.value);
  const tanggal     = inputTanggal.value;

  if (editingId) {
    // Update existing
    const idx = transactions.findIndex(t => t.id === editingId);
    if (idx !== -1) {
      transactions[idx] = { id: editingId, jenis, keterangan, kategori, nominal, tanggal };
    }
    showToast('Transaksi berhasil diperbarui!');
  } else {
    // Add new
    const newTransaction = {
      id: generateId(),
      jenis,
      keterangan,
      kategori,
      nominal,
      tanggal,
    };
    transactions.unshift(newTransaction);
    showToast('Transaksi berhasil ditambahkan!');
  }

  saveTransactions();
  renderDashboard();
  renderAll();
  closeModal();
});

/* ================================================
   Delete
   ================================================ */
function deleteTransaction(id) {
  if (!confirm('Hapus transaksi ini?')) return;
  transactions = transactions.filter(t => t.id !== id);
  saveTransactions();
  renderDashboard();
  renderAll();
  showToast('Transaksi dihapus.');
}

/* ================================================
   Render — Dashboard
   ================================================ */
function renderDashboard() {
  const { totalIncome, totalExpense, balance } = calcSummary();
  summaryBalance.textContent = formatRp(balance);
  summaryIncome.textContent  = formatRp(totalIncome);
  summaryExpense.textContent = formatRp(totalExpense);

  // Recent: last 5
  const recent = transactions.slice(0, 5);
  tbodyRecent.innerHTML = '';

  if (recent.length === 0) {
    emptyRecent.style.display = 'block';
  } else {
    emptyRecent.style.display = 'none';
    recent.forEach(t => {
      tbodyRecent.insertAdjacentHTML('beforeend', buildRowSimple(t));
    });
  }
}

function buildRowSimple(t) {
  const isIncome = t.jenis === 'pemasukan';
  return `
    <tr>
      <td>${formatTanggal(t.tanggal)}</td>
      <td>${escHtml(t.keterangan)}</td>
      <td class="col-kategori">${escHtml(t.kategori)}</td>
      <td><span class="badge badge--${isIncome ? 'income' : 'expense'}">${capitalize(t.jenis)}</span></td>
      <td class="text-right nominal--${isIncome ? 'income' : 'expense'}">
        ${isIncome ? '+' : '-'} ${formatRp(t.nominal)}
      </td>
    </tr>`;
}

/* ================================================
   Render — Semua Transaksi
   ================================================ */
function renderAll() {
  tbodyAll.innerHTML = '';

  if (transactions.length === 0) {
    emptyAll.style.display = 'block';
  } else {
    emptyAll.style.display = 'none';
    transactions.forEach(t => {
      tbodyAll.insertAdjacentHTML('beforeend', buildRowFull(t));
    });
  }
}

function buildRowFull(t) {
  const isIncome = t.jenis === 'pemasukan';
  return `
    <tr>
      <td>${formatTanggal(t.tanggal)}</td>
      <td>${escHtml(t.keterangan)}</td>
      <td class="col-kategori">${escHtml(t.kategori)}</td>
      <td><span class="badge badge--${isIncome ? 'income' : 'expense'}">${capitalize(t.jenis)}</span></td>
      <td class="text-right nominal--${isIncome ? 'income' : 'expense'}">
        ${isIncome ? '+' : '-'} ${formatRp(t.nominal)}
      </td>
      <td class="text-center" style="white-space:nowrap;">
        <button class="btn btn--edit" onclick="handleEdit('${t.id}')">Edit</button>
        <button class="btn btn--danger" onclick="deleteTransaction('${t.id}')">Hapus</button>
      </td>
    </tr>`;
}

/* ================================================
   Edit Handler (exposed globally for inline onclick)
   ================================================ */
function handleEdit(id) {
  const t = transactions.find(t => t.id === id);
  if (!t) return;

  // switch to dashboard page to keep context, or just open modal wherever
  openModal('edit', t);
}

/* ================================================
   Calculation
   ================================================ */
function calcSummary() {
  let totalIncome  = 0;
  let totalExpense = 0;

  transactions.forEach(t => {
    if (t.jenis === 'pemasukan') totalIncome  += t.nominal;
    else                          totalExpense += t.nominal;
  });

  return { totalIncome, totalExpense, balance: totalIncome - totalExpense };
}

/* ================================================
   Validation
   ================================================ */
function validateForm() {
  let valid = true;
  clearErrors();

  if (!inputKeterangan.value.trim()) {
    markError(inputKeterangan);
    valid = false;
  }

  if (!inputKategori.value) {
    markError(inputKategori);
    valid = false;
  }

  const nom = parseFloat(inputNominal.value);
  if (!inputNominal.value || isNaN(nom) || nom <= 0) {
    markError(inputNominal);
    valid = false;
  }

  if (!inputTanggal.value) {
    markError(inputTanggal);
    valid = false;
  }

  return valid;
}

function markError(el) {
  el.classList.add('error');
}

function clearErrors() {
  [inputKeterangan, inputKategori, inputNominal, inputTanggal].forEach(el => {
    el.classList.remove('error');
  });
}

/* ================================================
   Persistence — localStorage
   ================================================ */
function loadTransactions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveTransactions() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

/* ================================================
   Helpers
   ================================================ */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function formatRp(number) {
  return 'Rp ' + Number(number).toLocaleString('id-ID');
}

function formatTanggal(iso) {
  if (!iso) return '-';
  const [y, m, d] = iso.split('-');
  const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
  return `${parseInt(d)} ${months[parseInt(m) - 1]} ${y}`;
}

function todayISO() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getRadio(name) {
  const el = document.querySelector(`input[name="${name}"]:checked`);
  return el ? el.value : null;
}

function setRadio(name, value) {
  const el = document.querySelector(`input[name="${name}"][value="${value}"]`);
  if (el) el.checked = true;
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

let toastTimer = null;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

/* ================================================
   Init
   ================================================ */
(function init() {
  renderDashboard();
  renderAll();

  // Keyboard: Esc closes modal
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });
})();
