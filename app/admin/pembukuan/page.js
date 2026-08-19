'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function PembukuanPage() {
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);
  const [transaksi, setTransaksi] = useState([]);
  const [role, setRole] = useState(null);
  const [bulanTerpilih, setBulanTerpilih] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.push('/login');
      } else {
        setSession(data.session);
      }
      setChecking(false);
    });
  }, [router]);

  useEffect(() => {
    if (session) {
      loadTransaksi();
      loadRole();
    }
  }, [session]);

  async function loadTransaksi() {
    const { data } = await supabase
      .from('transaksi')
      .select('*, produk(nama, ukuran)')
      .order('tanggal', { ascending: false });
    setTransaksi(data || []);
  }

  async function loadRole() {
    const { data } = await supabase
      .from('admin_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .single();
    setRole(data?.role || 'admin');
  }

  async function handleHapus(id) {
    const yakin = window.confirm(
      'Yakin mau hapus transaksi ini? Aksi ini tidak bisa dibatalkan, dan stok TIDAK otomatis dikembalikan.'
    );
    if (!yakin) return;
    const { error } = await supabase.from('transaksi').delete().eq('id', id);
    if (error) {
      alert('Gagal menghapus: ' + error.message);
      return;
    }
    loadTransaksi();
  }

  if (checking) {
    return (
      <div className="container">
        <p>Memeriksa sesi...</p>
      </div>
    );
  }

  if (!session) return null;

  const perBulan = {};
  transaksi.forEach((t) => {
    const d = new Date(t.tanggal);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!perBulan[key]) perBulan[key] = [];
    perBulan[key].push(t);
  });

  const daftarBulan = Object.keys(perBulan).sort().reverse();
  const transaksiBulanIni = perBulan[bulanTerpilih] || [];
  const totalBulanIni = transaksiBulanIni.reduce((sum, t) => sum + t.subtotal, 0);

  return (
    <div className="container">
      <header className="site-header">
        <a href="/" className="brand-link">
          <img src="/logo.png" alt="Logo Sibayak Keramik" className="site-logo" />
          <div>
            <div className="wordmark">Sibayak Keramik</div>
            <div className="tagline">Keramik &amp; Ubin Bahan Bangunan</div>
          </div>
        </a>
      </header>

      
        href="/admin"
        style={{
          fontSize: 13,
          color: 'var(--muted)',
          textDecoration: 'none',
          display: 'inline-block',
          marginBottom: 12,
        }}
      >
        ← Kembali ke Dashboard
      </a>

      <h1 className="page-title">Pembukuan</h1>

      <label style={{ display: 'block', marginBottom: 16 }}>
        Pilih bulan:{' '}
        <select value={bulanTerpilih} onChange={(e) => setBulanTerpilih(e.target.value)}>
          {daftarBulan.length === 0 && <option value={bulanTerpilih}>{bulanTerpilih}</option>}
          {daftarBulan.map((key) => {
            const [y, m] = key.split('-');
            const label = new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('id-ID', {
              month: 'long',
              year: 'numeric',
            });
            return (
              <option key={key} value={key}>
                {label}
              </option>
            );
          })}
        </select>
      </label>

      <div className="scaffold-note">
        Total penjualan bulan ini: <strong>Rp{totalBulanIni.toLocaleString('id-ID')}</strong> dari{' '}
        {transaksiBulanIni.length} transaksi
      </div>

      <table className="faktur-table" style={{ marginTop: 16, fontSize: 13 }}>
        <thead>
          <tr>
            <th>Tanggal</th>
            <th>Produk</th>
            <th>Jumlah</th>
            <th>Pembeli</th>
            <th>Subtotal</th>
            {role === 'super_admin' && <th>Aksi</th>}
          </tr>
        </thead>
        <tbody>
          {transaksiBulanIni.map((t) => (
            <tr key={t.id}>
              <td>{new Date(t.tanggal).toLocaleDateString('id-ID')}</td>
              <td>{t.produk?.nama}</td>
              <td>{t.jumlah_dus} dus</td>
              <td>{t.nama_pembeli || '-'}</td>
              <td>Rp{t.subtotal.toLocaleString('id-ID')}</td>
              {role === 'super_admin' && (
                <td>
                  <button onClick={() => handleHapus(t.id)} className="hapus-btn">
                    Hapus
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}