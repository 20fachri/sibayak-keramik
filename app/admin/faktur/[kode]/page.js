'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function FakturPage() {
  const params = useParams();
  const kode = params.kode;
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);
  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);

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
    if (!session) return;
    async function load() {
      const { data } = await supabase
        .from('transaksi')
        .select('*, produk(nama, ukuran)')
        .eq('kode_pesanan', kode);
      setItems(data || []);
      setLoadingItems(false);
    }
    load();
  }, [session, kode]);

  if (checking || (session && loadingItems)) {
    return (
      <div className="container">
        <p>Memuat...</p>
      </div>
    );
  }

  if (!session) return null;

  const total = items.reduce((sum, item) => sum + item.subtotal, 0);
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
                <td>Rp{item.harga_saat_itu.toLocaleString('id-ID')}</td>
                <td>Rp{item.subtotal.toLocaleString('id-ID')}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="faktur-total">Total: Rp{total.toLocaleString('id-ID')}</div>

        <div className="faktur-signatures">
          <div className="faktur-signature-block">
            <div className="faktur-signature-caption">Dibuat oleh,</div>
            <div className="faktur-signature-line"></div>
            <div className="faktur-signature-label">Pemilik Sibayak Keramik</div>
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
    </div>
  );
}