/* =========================================================
   MotoCare — app.js
   ========================================================= */
const { useState, useEffect, useContext, createContext } = React;

// ─── MOCK DATA ────────────────────────────────────────────
const MOCK_USERS = [
  { id: 1, nama: 'Budi Santoso', email: 'budi@email.com', password: '123456', telepon: '081234567890', poin: 1250, totalServis: 8 },
  { id: 2, nama: 'Ani Rahayu',   email: 'ani@email.com',  password: '123456', telepon: '082345678901', poin: 640,  totalServis: 4 },
];

const UNIT_MOTORS = [
  { id: 1, userId: 1, merk: 'Suzuki', model: 'Address',        tahun: 2023, plat: 'B 1234 ABC', warna: 'Merah',  km: 18500 },
  { id: 2, userId: 1, merk: 'Yamaha', model: 'YZF-R15',        tahun: 2021, plat: 'B 5678 XYZ', warna: 'Biru',   km: 9200  },
  { id: 3, userId: 2, merk: 'Honda',  model: 'Kharisma 125 D', tahun: 2005, plat: 'D 9999 AAA', warna: 'Silver', km: 22000 },
];

const JENIS_SERVIS = [
  { id: 'rutin',       nama: 'Service Rutin', icon: '🔧', desc: 'Tune-up, ganti oli, cek rem & ban', durasi: '1–2 jam', estimasi: 'Rp 150.000 – Rp 350.000' },
  { id: 'besar',       nama: 'Service Besar', icon: '⚙️', desc: 'Ganti boring, Custom noken As, Ganti dan Setting ECU', durasi: '4 hari', estimasi: 'Rp 10.000.000 - Rp 25.000.000' },
  { id: 'kelistrikan', nama: 'Kelistrikan',   icon: '⚡', desc: 'Cas aki, ganti Biled, Urut kabel Fullwave', durasi: '6 jam', estimasi: 'Rp 600.000 - Rp 1.500.000' },
];

const SLOT_WAKTU  = ['08:00','09:00','10:00','11:00','13:00','14:00','15:00','16:00'];
const PENUH_SLOT  = ['10:00','14:00'];

const STATUS_LIST = [
  { id: 1, label: 'Menunggu Antrean',     icon: '🕐', warna: 'text-gray-500',   bg: 'bg-gray-100'   },
  { id: 2, label: 'Sedang Diperiksa',     icon: '🔍', warna: 'text-blue-600',   bg: 'bg-blue-50'    },
  { id: 3, label: 'Menunggu Persetujuan', icon: '⏳', warna: 'text-yellow-600', bg: 'bg-yellow-50'  },
  { id: 4, label: 'Sedang Dikerjakan',    icon: '🔧', warna: 'text-orange-600', bg: 'bg-orange-50'  },
  { id: 5, label: 'Selesai',              icon: '✅', warna: 'text-green-600',  bg: 'bg-green-50'   },
  { id: 6, label: 'Sudah Diambil',        icon: '🏠', warna: 'text-purple-600', bg: 'bg-purple-50'  },
];

const INIT_BOOKINGS = [
  { id: 'BK-2025-001', userId: 1, motorId: 1, jenisServis: 'rutin',       tanggal: '2025-07-25', waktu: '09:00', status: 3, catatan: 'Oli terasa berat' },
  { id: 'BK-2025-002', userId: 1, motorId: 2, jenisServis: 'kelistrikan', tanggal: '2025-06-10', waktu: '10:00', status: 6, catatan: '' },
];

const INIT_RIWAYAT = [
  { id: 'RW-001', userId: 1, motorId: 1, jenisServis: 'besar',       tanggal: '2024-12-15', sparepart: ['Ganti Boring','Noken As Racing','Seting ECU'], catatan: 'Tarikan mesin jauh lebih responsif', biaya: 14500000 },
  { id: 'RW-002', userId: 1, motorId: 1, jenisServis: 'rutin',       tanggal: '2024-09-03', sparepart: ['Oli Mesin 1L'],                                catatan: 'Normal, performa baik',               biaya: 280000  },
  { id: 'RW-003', userId: 1, motorId: 2, jenisServis: 'kelistrikan', tanggal: '2025-02-20', sparepart: ['Lampu Biled H4','Fullwave Kit'],               catatan: 'Lampu jauh lebih terang',             biaya: 950000  },
  { id: 'RW-004', userId: 1, motorId: 1, jenisServis: 'rutin',       tanggal: '2025-04-10', sparepart: ['Oli Mesin 1L','Filter Oli'],                   catatan: '',                                    biaya: 310000  },
];

const SPAREPART_DATA = [
  { id:1, nama:'Oli Mesin Suzuki Ecstar',  kategori:'Pelumas',     harga:72000,   stok:'Tersedia', desc:'Oli semi-sintetis 10W-40 resmi Suzuki, cocok untuk Address dan Satria.',          kompatibel:['Address','Satria F150','GSX-R150'],    img:'🛢️' },
  { id:2, nama:'Oli Mesin Yamalube Sport', kategori:'Pelumas',     harga:78000,   stok:'Tersedia', desc:'Oli full-sintetis 10W-40 khusus mesin sport, cocok YZF-R15 dan MT-15.',           kompatibel:['YZF-R15','MT-15','Aerox 155'],         img:'🛢️' },
  { id:3, nama:'Busi Iridium NGK',         kategori:'Pengapian',   harga:85000,   stok:'Tersedia', desc:'Busi iridium performa tinggi, pengapian lebih stabil dan bersih.',               kompatibel:['YZF-R15','Address','Kharisma 125 D'],  img:'⚡' },
  { id:4, nama:'Filter Udara Address',     kategori:'Filter',      harga:48000,   stok:'Tersedia', desc:'Filter udara original Suzuki untuk Address, cegah debu masuk ruang bakar.',      kompatibel:['Address'],                             img:'🌀' },
  { id:5, nama:'Kampas Rem Cakram Depan',  kategori:'Pengereman',  harga:95000,   stok:'Terbatas', desc:'Kampas rem cakram depan racing, material sinter anti-panas untuk track & harian.',kompatibel:['YZF-R15','Address','Kharisma 125 D'],  img:'🔴' },
  { id:6, nama:'Aki MF Yuasa GTZ7S',       kategori:'Kelistrikan', harga:320000,  stok:'Tersedia', desc:'Aki maintenance-free 6Ah, cocok untuk motor sport 150cc.',                       kompatibel:['YZF-R15','Address','Kharisma 125 D'],  img:'🔋' },
  { id:7, nama:'Lampu Biled H4 Mini',      kategori:'Kelistrikan', harga:350000,  stok:'Tersedia', desc:'Lampu Biled H4 projector mini, terang setara HID tanpa perlu relay tambahan.',   kompatibel:['Kharisma 125 D','Address'],            img:'💡' },
  { id:8, nama:'Fullwave Kit Kharisma',    kategori:'Kelistrikan', harga:185000,  stok:'Terbatas', desc:'Kit konversi fullwave untuk Kharisma 125, mengubah pengisian setengah gelombang menjadi penuh.', kompatibel:['Kharisma 125 D'],   img:'⚡' },
  { id:9, nama:'Filter Oli Suzuki',        kategori:'Filter',      harga:38000,   stok:'Tersedia', desc:'Filter oli original Suzuki, ganti setiap 2× penggantian oli mesin.',              kompatibel:['Address','Satria F150'],               img:'🌀' },
  { id:10,nama:'Boring Kit R15',           kategori:'Mesin',       harga:1850000, stok:'Terbatas', desc:'Boring kit oversize untuk YZF-R15, material forged piston untuk performa lebih tinggi.',        kompatibel:['YZF-R15'],              img:'⚙️' },
];

const ESTIMASI_DATA = [
  { komponen:'Oli Mesin',     intervalKm:3000,  icon:'🛢️' },
  { komponen:'Service Rutin', intervalKm:6000,  icon:'🔧' },
  { komponen:'Busi',          intervalKm:12000, icon:'⚡' },
  { komponen:'Filter Udara',  intervalKm:10000, icon:'🌀' },
  { komponen:'Kampas Rem',    intervalKm:15000, icon:'🔴' },
  { komponen:'Aki',           intervalKm:24000, icon:'🔋' },
  { komponen:'Filter Oli',    intervalKm:6000,  icon:'🌀' },
];

const LOYALTY_LEVELS = [
  { level:'Bronze',   min:0,    max:499,   emoji:'🥉', benefits:['Diskon 5% service rutin','Reminder servis gratis'] },
  { level:'Silver',   min:500,  max:999,   emoji:'🥈', benefits:['Diskon 10% semua service','Prioritas antrean','Reminder gratis'] },
  { level:'Gold',     min:1000, max:1999,  emoji:'🥇', benefits:['Diskon 15% semua service','Prioritas antrean','Cek gratis 1×/bulan','Hadiah ulang tahun'] },
  { level:'Platinum', min:2000, max:99999, emoji:'💎', benefits:['Diskon 20% semua service','Antrean prioritas utama','Cek gratis 2×/bulan','Free service ringan 1×/tahun'] },
];

// ─── HELPERS ─────────────────────────────────────────────
const fmtRupiah   = n => 'Rp ' + n.toLocaleString('id-ID');
const fmtTanggal  = s => new Date(s).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' });
const getJenis    = id => JENIS_SERVIS.find(j => j.id === id);
const getStatus   = id => STATUS_LIST.find(s => s.id === id);
const kmNext      = (km, iv) => (Math.floor(km / iv) + 1) * iv;
const getLoyalty  = poin => [...LOYALTY_LEVELS].reverse().find(l => poin >= l.min) || LOYALTY_LEVELS[0];
let _uid = 200;
const uid = () => ++_uid;

// ─── CONTEXT ─────────────────────────────────────────────
const Ctx = createContext(null);
const useApp = () => useContext(Ctx);

// ─── ICON ─────────────────────────────────────────────────
const PATHS = {
  home:    "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  book:    "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  history: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  parts:   "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
  profile: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  back:    "M15 19l-7-7 7-7",
  bell:    "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
  plus:    "M12 4v16m8-8H4",
  check:   "M5 13l4 4L19 7",
  logout:  "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1",
  eye:     "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
  eyeoff:  "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21",
  x:       "M6 18L18 6M6 6l12 12",
  edit:    "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
  trash:   "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
  search:  "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  trophy:  "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
};
const Icon = ({ name, cls = 'w-5 h-5' }) => (
  <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={PATHS[name] || ''} />
  </svg>
);

// ─── SHARED COMPONENTS ───────────────────────────────────

const Header = ({ title, onBack, right }) => (
  <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 sticky top-0 z-40">
    <div className="flex items-center gap-2">
      {onBack && (
        <button onClick={onBack} className="p-1 -ml-1">
          <Icon name="back" cls="w-5 h-5 text-gray-600" />
        </button>
      )}
      <span className="font-semibold text-gray-800">{title}</span>
    </div>
    {right || <div className="w-6" />}
  </div>
);

const BottomNav = ({ tab, setTab }) => {
  const nav = [
    { id:'home',      label:'Home',      icon:'home'    },
    { id:'booking',   label:'Booking',   icon:'book'    },
    { id:'riwayat',   label:'Riwayat',   icon:'history' },
    { id:'sparepart', label:'Sparepart', icon:'parts'   },
    { id:'profil',    label:'Profil',    icon:'profile' },
  ];
  return (
    <nav className="bottom-nav">
      <div className="flex">
        {nav.map(n => (
          <button
            key={n.id}
            onClick={() => setTab(n.id)}
            className={`flex-1 flex flex-col items-center py-2 gap-0.5 text-xs font-medium transition-colors ${tab === n.id ? 'text-blue-600' : 'text-gray-400'}`}
          >
            <Icon name={n.icon} cls="w-5 h-5" />
            {n.label}
            {tab === n.id && <span className="w-1 h-1 rounded-full bg-blue-600" />}
          </button>
        ))}
      </div>
    </nav>
  );
};

// ─── HALAMAN: LOGIN / REGISTER ────────────────────────────
const HalamanAuth = () => {
  const { login, register } = useApp();
  const [mode, setMode]         = useState('login');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [nama, setNama]         = useState('');
  const [telepon, setTelepon]   = useState('');
  const [showPass, setShowPass] = useState(false);
  const [err, setErr]           = useState('');

  const submit = () => {
    setErr('');
    if (mode === 'login') {
      const ok = login(email.trim(), password);
      if (!ok) setErr('Email atau password salah.');
    } else {
      if (!nama || !email || !password || !telepon) { setErr('Semua kolom wajib diisi.'); return; }
      if (password.length < 6) { setErr('Password minimal 6 karakter.'); return; }
      register({ nama, email: email.trim(), password, telepon });
    }
  };

  return (
    <div className="auth-bg flex flex-col justify-center px-6 py-10 relative">
      <div className="mb-8 text-center relative z-10">
        {/* Logo */}
        <div className="inline-flex items-center gap-2 mb-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
            </svg>
          </div>
          <span className="logo-text text-2xl"><span className="logo-moto">Moto</span><span className="logo-care">Care</span></span>
        </div>
        <p className="text-sm text-gray-400">Servis motor, tanpa ribet.</p>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative z-10">
        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          <button onClick={() => { setMode('login'); setErr(''); }} className={`flex-1 py-1.5 rounded-md text-sm font-medium transition ${mode==='login' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}>Masuk</button>
          <button onClick={() => { setMode('register'); setErr(''); }} className={`flex-1 py-1.5 rounded-md text-sm font-medium transition ${mode==='register' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}>Daftar</button>
        </div>

        {mode === 'register' && (
          <div className="mb-3">
            <label className="text-xs text-gray-500 mb-1 block">Nama Lengkap</label>
            <input value={nama} onChange={e => setNama(e.target.value)} placeholder="Contoh: Budi Santoso" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-400" />
          </div>
        )}

        <div className="mb-3">
          <label className="text-xs text-gray-500 mb-1 block">Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="email@contoh.com" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-400" />
        </div>

        {mode === 'register' && (
          <div className="mb-3">
            <label className="text-xs text-gray-500 mb-1 block">No. Telepon</label>
            <input value={telepon} onChange={e => setTelepon(e.target.value)} type="tel" placeholder="08xxxxxxxxxx" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-400" />
          </div>
        )}

        <div className="mb-4">
          <label className="text-xs text-gray-500 mb-1 block">Password</label>
          <div className="relative">
            <input value={password} onChange={e => setPassword(e.target.value)} type={showPass ? 'text' : 'password'} placeholder="••••••" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm pr-10 focus:ring-2 focus:ring-blue-300 focus:border-blue-400" />
            <button onClick={() => setShowPass(!showPass)} className="absolute right-3 top-2.5 text-gray-400">
              <Icon name={showPass ? 'eyeoff' : 'eye'} cls="w-4 h-4" />
            </button>
          </div>
        </div>

        {err && <p className="text-red-500 text-xs mb-3">{err}</p>}

        <button onClick={submit} className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 active:scale-95 transition">
          {mode === 'login' ? 'Masuk' : 'Buat Akun'}
        </button>

      </div>
    </div>
  );
};

// ─── HALAMAN: PILIH / TAMBAH MOTOR ───────────────────────
const HalamanMotor = ({ onSelesai }) => {
  const { user, motors, addMotor, deleteMotor } = useApp();
  const myMotors = motors.filter(m => m.userId === user.id);
  const [tambah, setTambah] = useState(myMotors.length === 0);
  const [form, setForm]     = useState({ merk:'', model:'', tahun:'', plat:'', warna:'', km:'' });
  const [err, setErr]       = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const simpan = () => {
    if (!form.merk || !form.model || !form.tahun || !form.plat || !form.km) { setErr('Semua kolom wajib diisi.'); return; }
    if (myMotors.length >= 5) { setErr('Maksimal 5 motor per akun.'); return; }
    addMotor({ ...form, tahun: +form.tahun, km: +form.km });
    setForm({ merk:'', model:'', tahun:'', plat:'', warna:'', km:'' });
    setTambah(false);
    setErr('');
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
            </svg>
          </div>
          <span className="logo-text text-xl"><span className="logo-moto">Moto</span><span className="logo-care">Care</span></span>
        </div>
        <h2 className="font-bold text-gray-800 text-base">Tambahkan Motor Anda</h2>
        <p className="text-sm text-gray-500">Motor bisa ditambah atau diganti kapan saja</p>
      </div>

      {myMotors.map(m => (
        <div key={m.id} className="bg-white border border-gray-200 rounded-xl p-4 mb-3 flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-800">{m.merk} {m.model} <span className="text-gray-400 font-normal">({m.tahun})</span></p>
            <p className="text-xs text-gray-500">{m.plat} · {m.km.toLocaleString('id-ID')} km</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => onSelesai(m.id)} className="bg-blue-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg">Pilih</button>
            <button onClick={() => deleteMotor(m.id)} className="text-red-400 text-xs px-2 py-1.5 rounded-lg border border-red-100">Hapus</button>
          </div>
        </div>
      ))}

      {myMotors.length === 0 && !tambah && (
        <p className="text-center text-gray-400 text-sm py-6">Belum ada motor. Tambahkan dulu.</p>
      )}

      {!tambah && myMotors.length < 5 && (
        <button onClick={() => setTambah(true)} className="w-full border-2 border-dashed border-gray-300 rounded-xl py-3 text-sm text-gray-500 flex items-center justify-center gap-2 mt-2">
          <Icon name="plus" cls="w-4 h-4" /> Tambah Motor
        </button>
      )}

      {tambah && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 mt-3">
          <p className="font-semibold text-gray-800 mb-3">Tambah Motor Baru</p>
          {[['Merk','merk','Contoh: Honda'],['Model','model','Contoh: Beat Street'],['Tahun','tahun','Contoh: 2021'],['No. Plat','plat','Contoh: B 1234 ABC'],['Warna','warna','Contoh: Hitam'],['Kilometer','km','Contoh: 15000']].map(([lb,k,ph]) => (
            <div key={k} className="mb-2">
              <label className="text-xs text-gray-500 block mb-1">{lb}</label>
              <input value={form[k]} onChange={e => set(k, e.target.value)} placeholder={ph} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-300" />
            </div>
          ))}
          {err && <p className="text-red-500 text-xs mb-2">{err}</p>}
          <div className="flex gap-2 mt-3">
            <button onClick={() => { setTambah(false); setErr(''); }} className="flex-1 border border-gray-200 rounded-lg py-2 text-sm text-gray-600">Batal</button>
            <button onClick={simpan} className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-semibold">Simpan</button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── HALAMAN: HOME ────────────────────────────────────────
const HalamanHome = ({ setTab, setDetailBookingId }) => {
  const { user, motors, bookings, selectedMotorId, setSelectedMotorId } = useApp();
  const myMotors   = motors.filter(m => m.userId === user.id);
  const motor      = myMotors.find(m => m.id === selectedMotorId) || myMotors[0];
  const activeBook = bookings.find(b => b.userId === user.id && b.motorId === motor?.id && b.status < 5);
  const loyalty    = getLoyalty(user.poin);

  // reminder: komponen yang sudah dekat
  const reminders = motor ? ESTIMASI_DATA.filter(e => {
    const sisa = kmNext(motor.km, e.intervalKm) - motor.km;
    return sisa <= 500;
  }) : [];

  return (
    <div className="page fade-in">
      {/* Header */}
      <div className="home-header px-4 pt-5 pb-10">
        <div className="flex justify-between items-center mb-3">
          {/* Logo putih */}
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
              </svg>
            </div>
            <span className="logo-text logo-white text-lg"><span className="logo-moto">Moto</span><span className="logo-care">Care</span></span>
          </div>
          <button onClick={() => setTab('profil')} className="bg-white bg-opacity-20 border border-white border-opacity-20 rounded-full w-9 h-9 flex items-center justify-center text-white font-bold text-sm">
            {user.nama[0]}
          </button>
        </div>
        <p className="text-blue-100 text-xs mb-0.5">Halo,</p>
        <p className="text-white font-bold text-xl">{user.nama.split(' ')[0]} 👋</p>
        {/* Loyalty chip */}
        <div className="mt-2 inline-flex items-center gap-1.5 bg-white bg-opacity-15 border border-white border-opacity-20 rounded-full px-3 py-1">
          <span className="text-sm">{loyalty.emoji}</span>
          <span className="text-white text-xs font-medium">{loyalty.level} · {user.poin} poin</span>
        </div>
      </div>

      {/* Motor card (overlap) */}
      <div className="px-4 -mt-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-500 font-medium">Motor Dipilih</p>
            <button onClick={() => setTab('profil')} className="text-xs text-blue-600">Ganti</button>
          </div>
          {motor ? (
            <>
              {/* chip list motor */}
              {myMotors.length > 1 && (
                <div className="scroll-x flex gap-2 mb-3">
                  {myMotors.map(m => (
                    <button key={m.id} onClick={() => setSelectedMotorId(m.id)}
                      className={`flex-shrink-0 px-3 py-1 rounded-full text-xs border font-medium transition ${selectedMotorId === m.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200'}`}>
                      {m.merk} {m.model}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className="text-3xl">🏍️</div>
                <div>
                  <p className="font-semibold text-gray-800">{motor.merk} {motor.model}</p>
                  <p className="text-xs text-gray-500">{motor.plat} · {motor.km.toLocaleString('id-ID')} km · {motor.tahun}</p>
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-400">Belum ada motor. <button onClick={() => setTab('profil')} className="text-blue-600">Tambah →</button></p>
          )}
        </div>
      </div>

      {/* Reminder */}
      {reminders.length > 0 && (
        <div className="mx-4 mt-3 bg-yellow-50 border border-yellow-200 rounded-xl p-3">
          <p className="text-xs font-semibold text-yellow-700 mb-1">⚠️ Perlu Perhatian</p>
          {reminders.map(r => (
            <p key={r.komponen} className="text-xs text-yellow-700">• {r.icon} {r.komponen} hampir waktunya diganti</p>
          ))}
        </div>
      )}

      {/* Status aktif */}
      {activeBook && (
        <div className="mx-4 mt-3 border border-blue-200 bg-blue-50 rounded-xl p-4">
          <p className="text-xs text-blue-600 font-semibold mb-1">Servis Aktif</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-800 text-sm">{getJenis(activeBook.jenisServis)?.nama}</p>
              <p className="text-xs text-gray-500">{fmtTanggal(activeBook.tanggal)} · {activeBook.waktu}</p>
              <div className="mt-1">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatus(activeBook.status)?.bg} ${getStatus(activeBook.status)?.warna}`}>
                  {getStatus(activeBook.status)?.icon} {getStatus(activeBook.status)?.label}
                </span>
              </div>
            </div>
            <button onClick={() => { setDetailBookingId(activeBook.id); setTab('booking'); }} className="text-blue-600 text-xs font-medium border border-blue-200 px-3 py-1.5 rounded-lg">Lihat</button>
          </div>
        </div>
      )}

      {/* Shortcut grid */}
      <div className="px-4 mt-4">
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => setTab('booking')} className="bg-blue-600 text-white rounded-xl p-4 text-left">
            <div className="text-2xl mb-2">📅</div>
            <p className="font-semibold text-sm">Booking Servis</p>
            <p className="text-xs text-blue-200 mt-0.5">Jadwalkan servis motor</p>
          </button>
          <button onClick={() => setTab('sparepart')} className="bg-white border border-gray-200 rounded-xl p-4 text-left">
            <div className="text-2xl mb-2">🔩</div>
            <p className="font-semibold text-sm text-gray-800">Katalog Sparepart</p>
            <p className="text-xs text-gray-400 mt-0.5">Cek harga & ketersediaan</p>
          </button>
          <button onClick={() => setTab('riwayat')} className="bg-white border border-gray-200 rounded-xl p-4 text-left">
            <div className="text-2xl mb-2">📋</div>
            <p className="font-semibold text-sm text-gray-800">Riwayat Servis</p>
            <p className="text-xs text-gray-400 mt-0.5">Arsip servis kendaraan</p>
          </button>
          <button onClick={() => setTab('estimasi')} className="bg-white border border-gray-200 rounded-xl p-4 text-left">
            <div className="text-2xl mb-2">📊</div>
            <p className="font-semibold text-sm text-gray-800">Estimasi Perawatan</p>
            <p className="text-xs text-gray-400 mt-0.5">Jadwal ganti komponen</p>
          </button>
        </div>
      </div>

      {/* Notifikasi */}
      <div className="px-4 mt-4 mb-2">
        <p className="text-sm font-semibold text-gray-700 mb-2">Notifikasi</p>
        <div className="space-y-2">
          {motor && ESTIMASI_DATA.slice(0,3).map(e => {
            const sisa = kmNext(motor.km, e.intervalKm) - motor.km;
            if (sisa > 1500) return null;
            return (
              <div key={e.komponen} className="bg-orange-50 border border-orange-100 rounded-lg p-3 flex gap-2">
                <span>{e.icon}</span>
                <p className="text-xs text-orange-700">{e.komponen} {motor.merk} {motor.model} Anda perlu diganti dalam {sisa.toLocaleString('id-ID')} km lagi.</p>
              </div>
            );
          })}
          <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 flex gap-2">
            <span>🔔</span>
            <p className="text-xs text-gray-600">Selamat datang di MotoCare! Booking servis pertama Anda.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── HALAMAN: BOOKING SERVIS ──────────────────────────────
const HalamanBooking = ({ detailId, setDetailId }) => {
  const { user, motors, bookings, addBooking, selectedMotorId } = useApp();
  const myMotors = motors.filter(m => m.userId === user.id);

  // Jika ada detailId, tampilkan detail booking
  if (detailId) {
    const bk = bookings.find(b => b.id === detailId);
    const motor = bk ? motors.find(m => m.id === bk.motorId) : null;
    const jenis = bk ? getJenis(bk.jenisServis) : null;
    const st    = bk ? getStatus(bk.status) : null;
    if (!bk) return <div className="p-8 text-center text-gray-400">Booking tidak ditemukan.</div>;
    return (
      <div className="page fade-in">
        <Header title="Detail Booking" onBack={() => setDetailId(null)} />
        <div className="px-4 py-4 space-y-3">
          <div className={`${st.bg} border rounded-xl p-4 text-center`}>
            <p className="text-2xl mb-1">{st.icon}</p>
            <p className={`font-bold text-base ${st.warna}`}>{st.label}</p>
          </div>
          {/* Timeline */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-500 mb-3">PROGRESS SERVIS</p>
            <div className="status-line space-y-4 pl-10">
              {STATUS_LIST.map(s => {
                const done    = s.id < bk.status;
                const current = s.id === bk.status;
                return (
                  <div key={s.id} className="relative flex items-start gap-3 min-h-[28px]">
                    <div className={`absolute -left-10 w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 z-10 ${
                      done    ? 'bg-green-500 border-green-500 text-white' :
                      current ? 'bg-blue-600 border-blue-600 text-white' :
                                'bg-white border-gray-300 text-gray-400'
                    }`}>
                      {done ? '✓' : s.icon}
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${current ? 'text-blue-600' : done ? 'text-gray-500' : 'text-gray-300'}`}>{s.label}</p>
                      {current && <p className="text-xs text-gray-400">Sedang berlangsung</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {/* Info booking */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-500 mb-3">INFO BOOKING</p>
            {[
              ['No. Booking', bk.id],
              ['Motor', `${motor?.merk} ${motor?.model}`],
              ['Jenis Servis', jenis?.nama],
              ['Tanggal', fmtTanggal(bk.tanggal)],
              ['Waktu', bk.waktu],
              ['Catatan', bk.catatan || '-'],
            ].map(([k,v]) => (
              <div key={k} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-xs text-gray-500">{k}</span>
                <span className="text-xs font-medium text-gray-800 text-right max-w-[60%]">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // List booking user
  const myBookings = bookings.filter(b => b.userId === user.id).sort((a,b) => b.id.localeCompare(a.id));
  const [showForm, setShowForm] = useState(false);

  if (showForm) {
    return <FormBooking onBatal={() => setShowForm(false)} onSelesai={(id) => { setShowForm(false); setDetailId(id); }} />;
  }

  return (
    <div className="page fade-in">
      <Header title="Booking Servis" right={
        myMotors.length > 0 && (
          <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg font-medium">+ Baru</button>
        )
      } />

      {myBookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="text-5xl mb-3">📅</div>
          <p className="font-semibold text-gray-700 mb-1">Belum ada booking</p>
          <p className="text-sm text-gray-400 mb-5">Jadwalkan servis motor Anda sekarang</p>
          {myMotors.length > 0
            ? <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl">Booking Sekarang</button>
            : <p className="text-sm text-orange-500">Tambahkan motor di menu Profil terlebih dahulu.</p>
          }
        </div>
      ) : (
        <div className="px-4 py-4 space-y-3">
          {myMotors.length > 0 && (
            <button onClick={() => setShowForm(true)} className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl mb-2">+ Booking Servis Baru</button>
          )}
          {myBookings.map(bk => {
            const motor = motors.find(m => m.id === bk.motorId);
            const jenis = getJenis(bk.jenisServis);
            const st    = getStatus(bk.status);
            return (
              <button key={bk.id} onClick={() => setDetailId(bk.id)} className="w-full bg-white border border-gray-200 rounded-xl p-4 text-left hover:border-blue-300 transition">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{jenis?.icon} {jenis?.nama}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{motor?.merk} {motor?.model} · {fmtTanggal(bk.tanggal)}</p>
                    <p className="text-xs text-gray-400">{bk.id}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st?.bg} ${st?.warna}`}>{st?.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── FORM BOOKING (multi-step) ────────────────────────────
const FormBooking = ({ onBatal, onSelesai }) => {
  const { user, motors, addBooking, selectedMotorId } = useApp();
  const myMotors = motors.filter(m => m.userId === user.id);

  const [step, setStep]     = useState(1);
  const [motorId, setMotorId]   = useState(selectedMotorId || myMotors[0]?.id);
  const [jenis, setJenis]       = useState('');
  const [tanggal, setTanggal]   = useState('');
  const [waktu, setWaktu]       = useState('');
  const [catatan, setCatatan]   = useState('');

  const motor  = motors.find(m => m.id === motorId);
  const jenisO = getJenis(jenis);

  // Batas tanggal: mulai besok
  const minTgl = new Date(); minTgl.setDate(minTgl.getDate()+1);
  const minStr = minTgl.toISOString().split('T')[0];

  const konfirmasi = () => {
    const id = `BK-${Date.now()}`;
    addBooking({ id, userId: user.id, motorId, jenisServis: jenis, tanggal, waktu, status: 1, catatan });
    onSelesai(id);
  };

  const steps = ['Motor','Jenis','Jadwal','Konfirmasi'];

  return (
    <div className="page fade-in">
      <Header title="Booking Servis" onBack={step === 1 ? onBatal : () => setStep(s => s-1)} />

      {/* Step indicator */}
      <div className="px-4 py-4 flex items-center gap-1">
        {steps.map((s,i) => (
          <React.Fragment key={s}>
            <div className={`step-dot ${i+1 < step ? 'done' : i+1 === step ? 'active' : 'inactive'}`}>
              {i+1 < step ? '✓' : i+1}
            </div>
            <span className={`text-xs flex-1 text-center ${i+1 === step ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>{s}</span>
            {i < steps.length-1 && <div className={`h-px flex-1 ${i+1 < step ? 'bg-green-400' : 'bg-gray-200'}`} />}
          </React.Fragment>
        ))}
      </div>

      <div className="px-4">
        {/* Step 1: Pilih Motor */}
        {step === 1 && (
          <div>
            <p className="text-sm text-gray-600 mb-3">Pilih motor yang akan diservis:</p>
            {myMotors.map(m => (
              <button key={m.id} onClick={() => setMotorId(m.id)}
                className={`w-full border rounded-xl p-4 mb-2 text-left transition ${motorId === m.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}>
                <p className="font-semibold text-gray-800">🏍️ {m.merk} {m.model}</p>
                <p className="text-xs text-gray-500">{m.plat} · {m.km.toLocaleString('id-ID')} km</p>
              </button>
            ))}
            <button onClick={() => setStep(2)} disabled={!motorId} className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl mt-3 disabled:opacity-40">Lanjut</button>
          </div>
        )}

        {/* Step 2: Jenis Servis */}
        {step === 2 && (
          <div>
            <p className="text-sm text-gray-600 mb-3">Pilih jenis servis:</p>
            {JENIS_SERVIS.map(j => (
              <button key={j.id} onClick={() => setJenis(j.id)}
                className={`w-full border rounded-xl p-4 mb-2 text-left transition ${jenis === j.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}>
                <p className="font-semibold text-gray-800">{j.icon} {j.nama}</p>
                <p className="text-xs text-gray-500 mt-0.5">{j.desc}</p>
                <div className="flex gap-3 mt-2">
                  <span className="text-xs text-gray-400">⏱ {j.durasi}</span>
                  <span className="text-xs text-gray-400">💰 {j.estimasi}</span>
                </div>
              </button>
            ))}
            <button onClick={() => setStep(3)} disabled={!jenis} className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl mt-3 disabled:opacity-40">Lanjut</button>
          </div>
        )}

        {/* Step 3: Tanggal & Waktu */}
        {step === 3 && (
          <div>
            <div className="mb-4">
              <label className="text-sm text-gray-600 block mb-1.5">Tanggal Servis</label>
              <input type="date" value={tanggal} min={minStr} onChange={e => { setTanggal(e.target.value); setWaktu(''); }}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-300" />
            </div>
            {tanggal && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Pilih Waktu</p>
                <div className="grid grid-cols-4 gap-2">
                  {SLOT_WAKTU.map(s => {
                    const penuh = PENUH_SLOT.includes(s);
                    return (
                      <button key={s} disabled={penuh} onClick={() => setWaktu(s)}
                        className={`py-2 rounded-lg text-sm border font-medium transition ${
                          penuh       ? 'bg-gray-100 text-gray-300 border-gray-100 cursor-not-allowed' :
                          waktu === s ? 'bg-blue-600 text-white border-blue-600' :
                                       'bg-white text-gray-700 border-gray-200 hover:border-blue-400'
                        }`}>
                        {penuh ? <span className="text-xs">{s}<br/>Penuh</span> : s}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            <div className="mt-4">
              <label className="text-sm text-gray-600 block mb-1.5">Catatan (opsional)</label>
              <textarea value={catatan} onChange={e => setCatatan(e.target.value)} rows={2} placeholder="Contoh: mesin terasa kasar saat di gas" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-300 resize-none" />
            </div>
            <button onClick={() => setStep(4)} disabled={!tanggal || !waktu} className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl mt-3 disabled:opacity-40">Lanjut</button>
          </div>
        )}

        {/* Step 4: Konfirmasi */}
        {step === 4 && (
          <div>
            <p className="text-sm text-gray-600 mb-3">Periksa detail booking Anda:</p>
            <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
              {[
                ['Motor',        `${motor?.merk} ${motor?.model} (${motor?.plat})`],
                ['Jenis Servis', `${jenisO?.icon} ${jenisO?.nama}`],
                ['Tanggal',      fmtTanggal(tanggal)],
                ['Waktu',        waktu],
                ['Estimasi Biaya', jenisO?.estimasi],
                ['Estimasi Durasi', jenisO?.durasi],
                ['Catatan',      catatan || '-'],
              ].map(([k,v]) => (
                <div key={k} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="text-xs text-gray-500">{k}</span>
                  <span className="text-xs font-medium text-gray-800 text-right max-w-[55%]">{v}</span>
                </div>
              ))}
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-4">
              <p className="text-xs text-blue-700">ℹ️ Estimasi biaya dan durasi bisa berubah tergantung kondisi kendaraan saat pemeriksaan.</p>
            </div>
            <button onClick={konfirmasi} className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl">Konfirmasi Booking</button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── HALAMAN: RIWAYAT SERVIS ──────────────────────────────
const HalamanRiwayat = () => {
  const { user, motors, riwayat } = useApp();
  const myMotors = motors.filter(m => m.userId === user.id);
  const [filterMotor, setFilterMotor] = useState('semua');
  const [detail, setDetail] = useState(null);

  const myRiwayat = riwayat
    .filter(r => r.userId === user.id)
    .filter(r => filterMotor === 'semua' || r.motorId === filterMotor)
    .sort((a, b) => b.tanggal.localeCompare(a.tanggal));

  if (detail) {
    const motor = motors.find(m => m.id === detail.motorId);
    const jenis = getJenis(detail.jenisServis);
    return (
      <div className="page fade-in">
        <Header title="Detail Riwayat" onBack={() => setDetail(null)} />
        <div className="px-4 py-4 space-y-3">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <p className="text-2xl mb-1">✅</p>
            <p className="font-bold text-green-700">{jenis?.nama}</p>
            <p className="text-xs text-green-600 mt-0.5">{fmtTanggal(detail.tanggal)}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-500 mb-3">DETAIL SERVIS</p>
            {[
              ['Motor',    `${motor?.merk} ${motor?.model}`],
              ['No. Plat', motor?.plat],
              ['Tanggal',  fmtTanggal(detail.tanggal)],
              ['Jenis',    jenis?.nama],
              ['Biaya',    fmtRupiah(detail.biaya)],
              ['Catatan',  detail.catatan || '-'],
            ].map(([k,v]) => (
              <div key={k} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-xs text-gray-500">{k}</span>
                <span className="text-xs font-medium text-gray-800">{v}</span>
              </div>
            ))}
          </div>
          {detail.sparepart.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-500 mb-2">SPAREPART DIGANTI</p>
              {detail.sparepart.map(s => (
                <div key={s} className="flex items-center gap-2 py-1.5 border-b border-gray-50 last:border-0">
                  <span className="text-green-500 text-xs">✓</span>
                  <span className="text-sm text-gray-700">{s}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="page fade-in">
      <Header title="Riwayat Servis" />
      {/* Filter motor */}
      {myMotors.length > 1 && (
        <div className="scroll-x flex gap-2 px-4 py-3 border-b border-gray-100">
          <button onClick={() => setFilterMotor('semua')}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs border font-medium transition ${filterMotor === 'semua' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200'}`}>
            Semua Motor
          </button>
          {myMotors.map(m => (
            <button key={m.id} onClick={() => setFilterMotor(m.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs border font-medium transition ${filterMotor === m.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200'}`}>
              {m.merk} {m.model}
            </button>
          ))}
        </div>
      )}

      {myRiwayat.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center px-6">
          <div className="text-5xl mb-3">📋</div>
          <p className="font-semibold text-gray-700 mb-1">Belum ada riwayat</p>
          <p className="text-sm text-gray-400">Riwayat servis akan muncul setelah Anda melakukan servis.</p>
        </div>
      ) : (
        <div className="px-4 py-3 space-y-3">
          {myRiwayat.map(r => {
            const motor = motors.find(m => m.id === r.motorId);
            const jenis = getJenis(r.jenisServis);
            return (
              <button key={r.id} onClick={() => setDetail(r)} className="w-full bg-white border border-gray-200 rounded-xl p-4 text-left hover:border-blue-300 transition">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{jenis?.icon} {jenis?.nama}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{motor?.merk} {motor?.model} · {fmtTanggal(r.tanggal)}</p>
                    {r.sparepart.length > 0 && (
                      <p className="text-xs text-gray-400 mt-1">Ganti: {r.sparepart.join(', ')}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-800">{fmtRupiah(r.biaya)}</p>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Selesai</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── HALAMAN: KATALOG SPAREPART ───────────────────────────
const HalamanSparepart = () => {
  const [cari, setCari]           = useState('');
  const [kategori, setKategori]   = useState('Semua');
  const [detail, setDetail]       = useState(null);

  const kategoriList = ['Semua', ...new Set(SPAREPART_DATA.map(s => s.kategori))];

  const filtered = SPAREPART_DATA.filter(s => {
    const cocokKategori = kategori === 'Semua' || s.kategori === kategori;
    const cocokCari     = s.nama.toLowerCase().includes(cari.toLowerCase()) || s.kompatibel.some(k => k.toLowerCase().includes(cari.toLowerCase()));
    return cocokKategori && cocokCari;
  });

  if (detail) {
    return (
      <div className="page fade-in">
        <Header title="Detail Sparepart" onBack={() => setDetail(null)} />
        <div className="px-4 py-4">
          <div className="bg-gray-50 rounded-xl p-8 text-center text-6xl mb-4">{detail.img}</div>
          <h2 className="font-bold text-gray-800 text-lg mb-1">{detail.nama}</h2>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{detail.kategori}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${detail.stok === 'Tersedia' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{detail.stok}</span>
          </div>
          <p className="text-xl font-bold text-blue-600 mb-4">{fmtRupiah(detail.harga)}</p>
          <div className="bg-white border border-gray-200 rounded-xl p-4 mb-3">
            <p className="text-xs font-semibold text-gray-500 mb-2">DESKRIPSI</p>
            <p className="text-sm text-gray-700">{detail.desc}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-500 mb-2">COCOK UNTUK</p>
            {detail.kompatibel.map(k => (
              <div key={k} className="flex items-center gap-2 py-1.5 border-b border-gray-50 last:border-0">
                <span className="text-blue-500 text-xs">🏍️</span>
                <span className="text-sm text-gray-700">{k}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-3">
            <p className="text-xs text-blue-700">ℹ️ Harga dapat berubah. Hubungi bengkel untuk konfirmasi ketersediaan terkini.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page fade-in">
      <Header title="Katalog Sparepart" />
      {/* Search */}
      <div className="px-4 pt-3 pb-2">
        <div className="relative">
          <input value={cari} onChange={e => setCari(e.target.value)} placeholder="Cari nama atau model motor..." className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-300" />
          <svg className="absolute left-3 top-3 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
      {/* Filter kategori */}
      <div className="scroll-x flex gap-2 px-4 pb-3">
        {kategoriList.map(k => (
          <button key={k} onClick={() => setKategori(k)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs border font-medium transition ${kategori === k ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200'}`}>
            {k}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-3xl mb-2">🔍</p>
          <p className="text-sm">Sparepart tidak ditemukan.</p>
        </div>
      ) : (
        <div className="px-4 pb-4 grid grid-cols-2 gap-3">
          {filtered.map(s => (
            <button key={s.id} onClick={() => setDetail(s)} className="bg-white border border-gray-200 rounded-xl p-3 text-left hover:border-blue-300 transition">
              <div className="text-3xl mb-2 text-center">{s.img}</div>
              <p className="text-xs font-semibold text-gray-800 leading-tight">{s.nama}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.kategori}</p>
              <p className="text-sm font-bold text-blue-600 mt-1.5">{fmtRupiah(s.harga)}</p>
              <span className={`text-xs px-1.5 py-0.5 rounded-full mt-1 inline-block ${s.stok === 'Tersedia' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{s.stok}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── HALAMAN: ESTIMASI PERAWATAN ──────────────────────────
const HalamanEstimasi = ({ setTab }) => {
  const { user, motors, selectedMotorId, setSelectedMotorId } = useApp();
  const myMotors = motors.filter(m => m.userId === user.id);
  const motor    = myMotors.find(m => m.id === selectedMotorId) || myMotors[0];

  return (
    <div className="page fade-in">
      <Header title="Estimasi Perawatan" />
      {/* Pilih motor */}
      {myMotors.length > 1 && (
        <div className="scroll-x flex gap-2 px-4 py-3 border-b border-gray-100">
          {myMotors.map(m => (
            <button key={m.id} onClick={() => setSelectedMotorId(m.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs border font-medium transition ${selectedMotorId === m.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200'}`}>
              {m.merk} {m.model}
            </button>
          ))}
        </div>
      )}

      {!motor ? (
        <div className="text-center py-16 px-6">
          <p className="text-4xl mb-3">🏍️</p>
          <p className="text-sm text-gray-500">Tambahkan motor di menu <button onClick={() => setTab('profil')} className="text-blue-600">Profil</button> terlebih dahulu.</p>
        </div>
      ) : (
        <div className="px-4 py-4">
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 mb-4 flex items-center gap-3">
            <span className="text-2xl">🏍️</span>
            <div>
              <p className="font-semibold text-gray-800 text-sm">{motor.merk} {motor.model}</p>
              <p className="text-xs text-gray-500">Kilometer saat ini: <span className="font-semibold text-gray-700">{motor.km.toLocaleString('id-ID')} km</span></p>
            </div>
          </div>

          <p className="text-xs font-semibold text-gray-500 mb-3">JADWAL PERAWATAN</p>
          <div className="space-y-3">
            {ESTIMASI_DATA.map(e => {
              const kmBerikutnya = kmNext(motor.km, e.intervalKm);
              const sisa         = kmBerikutnya - motor.km;
              const persen       = Math.min(100, Math.round((1 - sisa / e.intervalKm) * 100));
              const warnaSisa    = sisa <= 500 ? 'text-red-600' : sisa <= 1000 ? 'text-orange-500' : 'text-green-600';
              const warnaBar     = sisa <= 500 ? 'bg-red-500' : sisa <= 1000 ? 'bg-orange-400' : 'bg-blue-500';

              return (
                <div key={e.komponen} className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{e.icon}</span>
                      <span className="font-semibold text-gray-800 text-sm">{e.komponen}</span>
                    </div>
                    <span className={`text-xs font-semibold ${warnaSisa}`}>
                      {sisa <= 0 ? 'Segera ganti!' : `${sisa.toLocaleString('id-ID')} km lagi`}
                    </span>
                  </div>
                  <div className="progress-bar-track">
                    <div className={`progress-bar-fill ${warnaBar}`} style={{ width: `${persen}%` }} />
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5">
                    Berikutnya pada <span className="font-medium text-gray-600">{kmBerikutnya.toLocaleString('id-ID')} km</span> · Interval setiap {e.intervalKm.toLocaleString('id-ID')} km
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-3">
            <p className="text-xs text-blue-700">💡 Angka di atas adalah estimasi umum. Kondisi jalan dan cara berkendara dapat mempengaruhi jadwal perawatan.</p>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── HALAMAN: LOYALTY MEMBERSHIP ─────────────────────────
const HalamanLoyalty = () => {
  const { user } = useApp();
  const loyalty     = getLoyalty(user.poin);
  const levelIdx    = LOYALTY_LEVELS.findIndex(l => l.level === loyalty.level);
  const nextLevel   = LOYALTY_LEVELS[levelIdx + 1];
  const poinTarget  = nextLevel ? nextLevel.min : loyalty.max;
  const persen      = nextLevel ? Math.min(100, Math.round((user.poin - loyalty.min) / (nextLevel.min - loyalty.min) * 100)) : 100;

  return (
    <div className="page fade-in">
      <Header title="Loyalty Member" />
      <div className="px-4 py-4 space-y-4">

        {/* Card member */}
        <div className="bg-blue-600 rounded-2xl p-5 text-white">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-blue-200 text-xs">Member Level</p>
              <p className="text-2xl font-bold mt-0.5">{loyalty.emoji} {loyalty.level}</p>
            </div>
            <p className="text-sm text-blue-200">MotoCare</p>
          </div>
          <p className="text-blue-100 text-sm font-medium">{user.nama}</p>
          <p className="text-xl font-bold mt-1">{user.poin.toLocaleString('id-ID')} <span className="text-sm font-normal text-blue-200">poin</span></p>
        </div>

        {/* Progress ke level berikutnya */}
        {nextLevel && (
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex justify-between mb-2">
              <p className="text-xs text-gray-600 font-medium">Menuju level <span className="font-bold text-blue-600">{nextLevel.emoji} {nextLevel.level}</span></p>
              <p className="text-xs text-gray-500">{user.poin} / {nextLevel.min} poin</p>
            </div>
            <div className="progress-bar-track">
              <div className="progress-bar-fill" style={{ width: `${persen}%` }} />
            </div>
            <p className="text-xs text-gray-400 mt-1.5">Butuh <span className="font-semibold text-gray-600">{(nextLevel.min - user.poin).toLocaleString('id-ID')} poin</span> lagi</p>
          </div>
        )}

        {/* Benefit level saat ini */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-gray-500 mb-3">BENEFIT LEVEL {loyalty.level.toUpperCase()}</p>
          {loyalty.benefits.map(b => (
            <div key={b} className="flex items-start gap-2 py-1.5 border-b border-gray-50 last:border-0">
              <span className="text-green-500 text-sm mt-0.5">✓</span>
              <span className="text-sm text-gray-700">{b}</span>
            </div>
          ))}
        </div>

        {/* Semua level */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-gray-500 mb-3">SEMUA LEVEL</p>
          {LOYALTY_LEVELS.map(l => (
            <div key={l.level} className={`flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0 ${l.level === loyalty.level ? 'opacity-100' : 'opacity-50'}`}>
              <div className="flex items-center gap-2">
                <span className="text-lg">{l.emoji}</span>
                <span className={`text-sm font-semibold ${l.level === loyalty.level ? 'text-blue-600' : 'text-gray-700'}`}>{l.level}</span>
                {l.level === loyalty.level && <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">Anda di sini</span>}
              </div>
              <span className="text-xs text-gray-400">{l.min.toLocaleString('id-ID')}+ poin</span>
            </div>
          ))}
        </div>

        {/* Cara dapat poin */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-gray-500 mb-2">CARA DAPAT POIN</p>
          <p className="text-xs text-gray-600">• Service Rutin → <strong>50 poin</strong></p>
          <p className="text-xs text-gray-600 mt-1">• Service Besar → <strong>150 poin</strong></p>
          <p className="text-xs text-gray-600 mt-1">• Kelistrikan → <strong>80 poin</strong></p>
          <p className="text-xs text-gray-600 mt-1">• Referral teman → <strong>100 poin</strong></p>
        </div>
      </div>
    </div>
  );
};

// ─── HALAMAN: PROFIL ──────────────────────────────────────
const HalamanProfil = ({ setTab }) => {
  const { user, motors, logout, addMotor, deleteMotor, setSelectedMotorId, selectedMotorId } = useApp();
  const myMotors  = motors.filter(m => m.userId === user.id);
  const [tambah, setTambah] = useState(false);
  const [form, setForm]     = useState({ merk:'', model:'', tahun:'', plat:'', warna:'', km:'' });
  const [err, setErr]       = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const simpan = () => {
    if (!form.merk || !form.model || !form.tahun || !form.plat || !form.km) { setErr('Semua kolom wajib diisi.'); return; }
    if (myMotors.length >= 5) { setErr('Maksimal 5 motor per akun.'); return; }
    addMotor({ ...form, tahun: +form.tahun, km: +form.km });
    setForm({ merk:'', model:'', tahun:'', plat:'', warna:'', km:'' });
    setTambah(false);
    setErr('');
  };

  return (
    <div className="page fade-in">
      <Header title="Profil" />
      <div className="px-4 py-4 space-y-4">

        {/* Info user */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-lg">
            {user.nama[0]}
          </div>
          <div>
            <p className="font-semibold text-gray-800">{user.nama}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
            <p className="text-xs text-gray-500">{user.telepon}</p>
          </div>
        </div>

        {/* Motor saya */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-700">Motor Saya ({myMotors.length}/5)</p>
            {myMotors.length < 5 && (
              <button onClick={() => setTambah(!tambah)} className="text-xs text-blue-600 font-medium">+ Tambah</button>
            )}
          </div>

          {myMotors.length === 0 && (
            <p className="text-xs text-gray-400 py-2">Belum ada motor. Klik "+ Tambah" untuk menambahkan.</p>
          )}

          {myMotors.map(m => (
            <div key={m.id} className={`border rounded-xl p-3 mb-2 last:mb-0 flex items-center justify-between transition ${selectedMotorId === m.id ? 'border-blue-400 bg-blue-50' : 'border-gray-200'}`}>
              <button onClick={() => setSelectedMotorId(m.id)} className="flex items-center gap-2 flex-1 text-left">
                <span className="text-xl">🏍️</span>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{m.merk} {m.model}</p>
                  <p className="text-xs text-gray-500">{m.plat} · {m.km.toLocaleString('id-ID')} km</p>
                </div>
                {selectedMotorId === m.id && <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full ml-1">Aktif</span>}
              </button>
              <button onClick={() => { if (window.confirm(`Hapus ${m.merk} ${m.model}?`)) deleteMotor(m.id); }} className="text-red-400 text-xs ml-2 p-1">✕</button>
            </div>
          ))}

          {tambah && (
            <div className="border border-gray-200 rounded-xl p-3 mt-3">
              <p className="text-sm font-semibold text-gray-700 mb-2">Motor Baru</p>
              {[['Merk','merk','Honda / Yamaha'],['Model','model','Beat Street'],['Tahun','tahun','2022'],['No. Plat','plat','B 1234 ABC'],['Warna','warna','Hitam'],['Kilometer','km','12000']].map(([lb,k,ph]) => (
                <div key={k} className="mb-2">
                  <label className="text-xs text-gray-500 block mb-0.5">{lb}</label>
                  <input value={form[k]} onChange={e => set(k, e.target.value)} placeholder={ph} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-300" />
                </div>
              ))}
              {err && <p className="text-red-500 text-xs mb-2">{err}</p>}
              <div className="flex gap-2 mt-2">
                <button onClick={() => { setTambah(false); setErr(''); }} className="flex-1 border border-gray-200 rounded-lg py-2 text-sm text-gray-600">Batal</button>
                <button onClick={simpan} className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-semibold">Simpan</button>
              </div>
            </div>
          )}
        </div>

        {/* Shortcut */}
        <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
          <button onClick={() => setTab('estimasi')} className="w-full flex items-center justify-between px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">
            <span>📊 Estimasi Perawatan</span><span className="text-gray-300">›</span>
          </button>
          <button onClick={() => setTab('loyalty')} className="w-full flex items-center justify-between px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">
            <span>🥇 Loyalty Member</span><span className="text-gray-300">›</span>
          </button>
          <button onClick={() => setTab('riwayat')} className="w-full flex items-center justify-between px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">
            <span>📋 Riwayat Servis</span><span className="text-gray-300">›</span>
          </button>
        </div>

        <button onClick={logout} className="w-full border border-red-200 text-red-500 font-semibold py-3 rounded-xl text-sm">
          Keluar dari Akun
        </button>
      </div>
    </div>
  );
};

// ─── APP ROOT ─────────────────────────────────────────────
const App = () => {
  const [user, setUser]           = useState(null);
  const [motors, setMotors]       = useState(UNIT_MOTORS);
  const [bookings, setBookings]   = useState(INIT_BOOKINGS);
  const [riwayat, setRiwayat]     = useState(INIT_RIWAYAT);
  const [selectedMotorId, setSelectedMotorId] = useState(null);
  const [tab, setTab]             = useState('home');
  const [detailBookingId, setDetailBookingId] = useState(null);
  const [motorSetup, setMotorSetup] = useState(false);

  const login = (email, password) => {
    const u = MOCK_USERS.find(u => u.email === email && u.password === password);
    if (!u) return false;
    setUser(u);
    const myMotors = motors.filter(m => m.userId === u.id);
    setSelectedMotorId(myMotors[0]?.id || null);
    setMotorSetup(myMotors.length === 0);
    return true;
  };

  const register = (data) => {
    const newUser = { ...data, id: uid(), poin: 0, totalServis: 0 };
    MOCK_USERS.push(newUser);
    setUser(newUser);
    setMotorSetup(true);
  };

  const logout = () => {
    setUser(null);
    setTab('home');
    setDetailBookingId(null);
    setMotorSetup(false);
  };

  const addMotor = (data) => {
    const m = { ...data, id: uid(), userId: user.id };
    setMotors(prev => {
      const updated = [...prev, m];
      if (!selectedMotorId) setSelectedMotorId(m.id);
      return updated;
    });
  };

  const deleteMotor = (id) => {
    setMotors(prev => prev.filter(m => m.id !== id));
    if (selectedMotorId === id) {
      const remaining = motors.filter(m => m.userId === user.id && m.id !== id);
      setSelectedMotorId(remaining[0]?.id || null);
    }
  };

  const addBooking = (bk) => setBookings(prev => [...prev, bk]);

  const ctx = { user, motors, bookings, riwayat, selectedMotorId, setSelectedMotorId, login, register, logout, addMotor, deleteMotor, addBooking };

  if (!user) return <Ctx.Provider value={ctx}><HalamanAuth /></Ctx.Provider>;

  if (motorSetup) {
    return (
      <Ctx.Provider value={ctx}>
        <HalamanMotor onSelesai={(motorId) => { setSelectedMotorId(motorId); setMotorSetup(false); }} />
      </Ctx.Provider>
    );
  }

  const renderPage = () => {
    switch (tab) {
      case 'home':      return <HalamanHome setTab={setTab} setDetailBookingId={(id) => { setDetailBookingId(id); setTab('booking'); }} />;
      case 'booking':   return <HalamanBooking detailId={detailBookingId} setDetailId={setDetailBookingId} />;
      case 'riwayat':   return <HalamanRiwayat />;
      case 'sparepart': return <HalamanSparepart />;
      case 'profil':    return <HalamanProfil setTab={setTab} />;
      case 'estimasi':  return <HalamanEstimasi setTab={setTab} />;
      case 'loyalty':   return <HalamanLoyalty />;
      default:          return <HalamanHome setTab={setTab} setDetailBookingId={() => {}} />;
    }
  };

  const navTab = ['home','booking','riwayat','sparepart','profil'].includes(tab) ? tab : 'profil';

  return (
    <Ctx.Provider value={ctx}>
      <div className="app-shell">
        {renderPage()}
        <BottomNav tab={navTab} setTab={(t) => { setDetailBookingId(null); setTab(t); }} />
      </div>
    </Ctx.Provider>
  );
};

// ─── MOUNT ────────────────────────────────────────────────
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
