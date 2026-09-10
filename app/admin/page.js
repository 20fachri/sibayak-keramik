'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function PembukuanPage() {
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);
  const [transaksi, setTransaksi] = useState([]);
  const [pembayaran, setPembayaran] = useState([]);
  const [role, setRole] = useState(null);
  const [loadingExport, setLoadingExport] = useState(false);
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
      loadPembayaran();
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

  async function loadPembayaran() {
    const { data } = await supabase.from('pembayaran').select('*');
    setPembayaran(data || []);
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
      'Yakin mau hapus baris ini? Aksi ini tidak bisa dibatalkan, dan stok TIDAK otomatis dikembalikan.'
    );
    if (!yakin) return;
    const { error } = await supabase.from('transaksi').delete().eq('id', id);
    if (error) {
      alert('Gagal menghapus: ' + error.message);
      return;
    }
    loadTransaksi();
  }

  async function handleExportExcel(kelompokPesananArg, urutanKodeArg, statusBayarFn, totalTagihanPerKodeArg, totalDibayarPerKodeArg, totalBulanIniArg, bulanTerpilihArg) {
    setLoadingExport(true);
    try {
      const resLogo = await fetch('/logo.png');
      const blobLogo = await resLogo.blob();
      const base64Logo = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blobLogo);
      });

      const [tahun, bulanAngka] = bulanTerpilihArg.split('-');
      const namaBulan = new Date(Number(tahun), Number(bulanAngka) - 1, 1).toLocaleDateString('id-ID', {
        month: 'long',
        year: 'numeric',
      });

      let baris = '';
      let nomor = 1;
      let totalDibayarBulanIni = 0;

      urutanKodeArg.forEach((kodePesanan) => {
        const itemsGroup = kelompokPesananArg[kodePesanan];
        const totalGroup = itemsGroup.reduce((sum, t) => sum + t.subtotal, 0);
        const dibayarGroup = totalDibayarPerKodeArg[kodePesanan] || 0;
        const sisaGroup = totalGroup - dibayarGroup;
        const status = statusBayarFn(kodePesanan);
        const namaPembeli = itemsGroup[0].nama_pembeli || '-';
        const tanggalGroup = new Date(itemsGroup[0].tanggal).toLocaleDateString('id-ID');
        totalDibayarBulanIni += dibayarGroup;

        baris +=
          '<tr>' +
          '<td>' + nomor + '</td>' +
          '<td>' + tanggalGroup + '</td>' +
          '<td>' + namaPembeli + '</td>' +
          '<td>' + totalGroup + '</td>' +
          '<td>' + dibayarGroup + '</td>' +
          '<td>' + Math.max(sisaGroup, 0) + '</td>' +
          '<td>' + status + '</td>' +
          '</tr>';
        nomor++;
      });

      const html =
        '<html><head><meta charset="UTF-8"></head><body>' +
        '<table border="1" cellspacing="0" cellpadding="4">' +
        '<tr><td rowspan="2"><img src="' + base64Logo + '" width="70" /></td>' +
        '<td colspan="6" style="font-size:18px;font-weight:bold;">SIBAYAK KERAMIK</td></tr>' +
        '<tr><td colspan="6">Laporan Rekapitulasi Bulanan - ' + namaBulan + '</td></tr>' +
        '<tr><td colspan="7"></td></tr>' +
        '<tr>' +
        '<th>No</th><th>Tanggal</th><th>Pembeli</th><th>Total Tagihan (Rp)</th>' +
        '<th>Sudah Dibayar (Rp)</th><th>Sisa (Rp)</th><th>Status</th>' +
        '</tr>' +
        baris +
        '<tr><td colspan="3"><b>Total Keseluruhan</b></td>' +
        '<td><b>' + totalBulanIniArg + '</b></td>' +
        '<td><b>' + totalDibayarBulanIni + '</b></td>' +
        '<td></td><td></td></tr>' +
        '</table></body></html>';

      const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'laporan-' + namaBulan.replace(' ', '-') + '.xls';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Gagal membuat laporan: ' + err.message);
    }
    setLoadingExport(false);
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

  const totalTagihanPerKode = {};
  transaksi.forEach((t) => {
    totalTagihanPerKode[t.kode_pesanan] = (totalTagihanPerKode[t.kode_pesanan] || 0) + t.subtotal;
  });

  const totalDibayarPerKode = {};
  pembayaran.forEach((p) => {
    totalDibayarPerKode[p.kode_pesanan] = (totalDibayarPerKode[p.kode_pesanan] || 0) + p.jumlah_bayar;
  });

  function statusBayar(kodePesanan) {
    const tagihan = totalTagihanPerKode[kodePesanan] || 0;
    const dibayar = totalDibayarPerKode[kodePesanan] || 0;
    if (dibayar >= tagihan) return 'Lunas';
    if (dibayar > 0) return 'Sebagian';
    return 'Belum Bayar';
  }

  function kelasStatus(status) {
    if (status === 'Lunas') return 'status-badge status-lunas';
    if (status === 'Sebagian') return 'status-badge status-sebagian';
    return 'status-badge status-belum-bayar';
  }

  const kelompokPesanan = {};
  const urutanKode = [];
  transaksiBulanIni.forEach((t) => {
    if (!kelompokPesanan[t.kode_pesanan]) {
      kelompokPesanan[t.kode_pesanan] = [];
      urutanKode.push(t.kode_pesanan);
    }
    kelompokPesanan[t.kode_pesanan].push(t);
  });

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

      <a
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

      <button
        onClick={() =>
          handleExportExcel(
            kelompokPesanan,
            urutanKode,
            statusBayar,
            totalTagihanPerKode,
            totalDibayarPerKode,
            totalBulanIni,
            bulanTerpilih
          )
        }
        className="btn-pesan"
        disabled={loadingExport}
        style={{ marginBottom: 16 }}
      >
        {loadingExport ? 'Membuat laporan...' : 'Export Excel'}
      </button>

      <div style={{ marginTop: 20 }}>
        {urutanKode.map((kodePesanan) => {
          const itemsGroup = kelompokPesanan[kodePesanan];
          const totalGroup = itemsGroup.reduce((sum, t) => sum + t.subtotal, 0);
          const status = statusBayar(kodePesanan);
          const namaPembeli = itemsGroup[0].nama_pembeli || '-';
          const tanggalGroup = new Date(itemsGroup[0].tanggal).toLocaleDateString('id-ID');

          return (
            <div className="pesanan-group" key={kodePesanan}>
              <div className="pesanan-group-header">
                <div>
                  <strong>{namaPembeli}</strong>
                  <span className="pesanan-group-tanggal"> · {tanggalGroup}</span>
                </div>
                <div className="pesanan-group-aksi">
                  <span className={kelasStatus(status)}>{status}</span>
                  <a href={'/admin/faktur/' + kodePesanan} target="_blank" className="hapus-btn">
                    Lihat Bon
                  </a>
                </div>
              </div>

              <table className="faktur-table" style={{ fontSize: 13 }}>
                <tbody>
                  {itemsGroup.map((t) => (
                    <tr key={t.id}>
                      <td>
                        {t.produk?.nama}
                        {t.warna ? ' - ' + t.warna : ''}
                      </td>
                      <td>{t.jumlah_dus} dus</td>
                      <td>Rp{t.subtotal.toLocaleString('id-ID')}</td>
                      {role === 'super_admin' && (
                        <td style={{ textAlign: 'right' }}>
                          <button onClick={() => handleHapus(t.id)} className="hapus-btn">
                            Hapus
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="pesanan-group-total">
                Total pesanan: Rp{totalGroup.toLocaleString('id-ID')}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}