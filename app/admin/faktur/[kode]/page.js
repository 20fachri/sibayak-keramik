'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

function formatRupiah(angka) {
  return 'Rp' + angka.toLocaleString('id-ID');
}

export default function FakturPage() {
  const params = useParams();
  const kode = params.kode;
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);
  const [items, setItems] = useState([]);
  const [pembayaran, setPembayaran] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [jumlahBayar, setJumlahBayar] = useState('');
  const [catatanBayar, setCatatanBayar] = useState('');
  const [pesan, setPesan] = useState('');
  const [loadingSimpan, setLoadingSimpan] = useState(false);

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
      loadData();
    }
  }, [session]);

  async function loadData() {
    setLoadingData(true);
    const [resItems, resBayar] = await Promise.all([
      supabase.from('transaksi').select('*, produk(nama, ukuran)').eq('kode_pesanan', kode),
      supabase.from('pembayaran').select('*').eq('kode_pesanan', kode).order('tanggal_bayar'),
    ]);
    setItems(resItems.data || []);
    setPembayaran(resBayar.data || []);
    setLoadingData(false);
  }

  async function handleCatatPembayaran(e) {
    e.preventDefault();
    setPesan('');
    const jumlah = Number(jumlahBayar);
    if (!jumlah || jumlah <= 0) {
      setPesan('Isi jumlah pembayaran yang benar.');
      return;
    }
    setLoadingSimpan(true);
    const { error } = await supabase.from('pembayaran').insert({
      kode_pesanan: kode,
      jumlah_bayar: jumlah,
      catatan: catatanBayar,
    });
    setLoadingSimpan(false);
    if (error) {
      setPesan('Gagal menyimpan: ' + error.message);
      return;
    }
    setJumlahBayar('');
    setCatatanBayar('');
    loadData();
  }

  if (checking || (session && loadingData)) {
    return (
      <div className="container">
        <p>Memuat...</p>
      </div>
    );
  }

  if (!session) return null;

  const total = items.reduce((sum, item) => sum + item.subtotal, 0);
  const totalDibayar = pembayaran.reduce((sum, p) => sum + p.jumlah_bayar, 0);
  const sisa = total - totalDibayar;
  const status = sisa <= 0 ? 'Lunas' : totalDibayar > 0 ? 'Dibayar Sebagian' : 'Belum Dibayar';

  const namaPembeli = items[0]?.nama_pembeli;
  const tanggal = items[0]?.tanggal
    ? new Date(items[0].tanggal).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';

  return (
    <div className="container">
      <div className="faktur-box">
        <div className="faktur-header">
          <div className="faktur-brand">
            <img src="/logo.png" alt="Logo Sibayak Keramik" className="faktur-logo" />
            <div>
              <div className="faktur-brand-name">SIBAYAK KERAMIK</div>
              <div className="faktur-brand-tagline">Keramik &amp; Ubin Bahan Bangunan</div>
            </div>
          </div>
          <div className="faktur-info">
            <div>No: {kode}</div>
            <div>Tanggal: {tanggal}</div>
            {namaPembeli && <div>Pembeli: {namaPembeli}</div>}
          </div>
        </div>

        <table className="faktur-table">
          <thead>
            <tr>
              <th>Produk</th>
              <th>Jml</th>
              <th>Harga</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>
                  {item.produk?.nama} ({item.produk?.ukuran})
                </td>
                <td>{item.jumlah_dus}</td>
                <td>{formatRupiah(item.harga_saat_itu)}</td>
                <td>{formatRupiah(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="faktur-total">Total: {formatRupiah(total)}</div>

        <div className="faktur-status-bayar">
          <div>
            Status: <strong>{status}</strong>
          </div>
          <div>Sudah dibayar: {formatRupiah(totalDibayar)}</div>
          <div>Sisa tagihan: {formatRupiah(Math.max(sisa, 0))}</div>
        </div>

        {pembayaran.length > 0 && (
          <div className="faktur-riwayat">
            <div className="faktur-riwayat-title">Riwayat Pembayaran</div>
            {pembayaran.map((p) => (
              <div key={p.id} className="faktur-riwayat-item">
                <span>{new Date(p.tanggal_bayar).toLocaleDateString('id-ID')}</span>
                <span>{formatRupiah(p.jumlah_bayar)}</span>
                {p.catatan && <span className="faktur-riwayat-catatan">{p.catatan}</span>}
              </div>
            ))}
          </div>
        )}

        <div className="faktur-signatures">
          <div className="faktur-signature-block">
            <div className="faktur-signature-caption" style={{ marginBottom: '2mm' }}>
              Dibuat oleh,
            </div>
            <img src="/ttd-amri.png" alt="Tanda tangan Amri" className="faktur-stempel-placeholder" />
            <div className="faktur-signature-line"></div>
            <div className="faktur-signature-label">Amri</div>
          </div>
          <div className="faktur-signature-block">
            <div className="faktur-signature-caption">Diterima oleh,</div>
            <div className="faktur-signature-line"></div>
            <div className="faktur-signature-label">( Nama Jelas )</div>
          </div>
        </div>
      </div>

      <button onClick={() => window.print()} className="btn-pesan no-print" style={{ marginTop: 16 }}>
        Cetak / Simpan sebagai PDF
      </button>

      {sisa > 0 && (
        <div className="no-print catat-bayar-box">
          <div className="cart-title">Catat Pembayaran Baru</div>
          <form onSubmit={handleCatatPembayaran} className="login-form">
            <label>
              Jumlah bayar
              <input
                type="number"
                min="1"
                value={jumlahBayar}
                onChange={(e) => setJumlahBayar(e.target.value)}
                required
              />
            </label>
            <label>
              Catatan (opsional)
              <input type="text" value={catatanBayar} onChange={(e) => setCatatanBayar(e.target.value)} />
            </label>
            {pesan && <div className="scaffold-note">{pesan}</div>}
            <button type="submit" className="btn-pesan" disabled={loadingSimpan}>
              {loadingSimpan ? 'Menyimpan...' : 'Simpan Pembayaran'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}