'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function PesananForm() {
  const [produkList, setProdukList] = useState([]);
  const [produkId, setProdukId] = useState('');
  const [jumlah, setJumlah] = useState(1);
  const [namaPembeli, setNamaPembeli] = useState('');
  const [pesan, setPesan] = useState('');
  const [lastKode, setLastKode] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProduk();
  }, []);

  async function loadProduk() {
    const { data } = await supabase.from('produk').select('*').order('nama');
    setProdukList(data || []);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setPesan('');
    setLastKode('');
    if (!produkId) {
      setPesan('Pilih produk dulu.');
      return;
    }
    const produk = produkList.find((p) => p.id === produkId);
    if (!produk) return;

    if (Number(jumlah) > produk.stok) {
      setPesan(`Stok tidak cukup. Sisa stok: ${produk.stok} dus.`);
      return;
    }

    setLoading(true);
    const kodePesanan = 'PSN-' + Date.now();

    const { error: insertError } = await supabase.from('transaksi').insert({
      kode_pesanan: kodePesanan,
      produk_id: produk.id,
      jumlah_dus: Number(jumlah),
      harga_saat_itu: produk.harga_per_dus,
      nama_pembeli: namaPembeli,
    });

    if (insertError) {
      setLoading(false);
      setPesan('Gagal menyimpan pesanan: ' + insertError.message);
      return;
    }

    const { error: updateError } = await supabase
      .from('produk')
      .update({ stok: produk.stok - Number(jumlah) })
      .eq('id', produk.id);

    setLoading(false);

    if (updateError) {
      setPesan('Pesanan tersimpan, tapi gagal mengurangi stok: ' + updateError.message);
      return;
    }

    setPesan('Pesanan berhasil disimpan.');
    setLastKode(kodePesanan);
    setJumlah(1);
    setNamaPembeli('');
    setProdukId('');
    loadProduk();
  }

  return (
    <form onSubmit={handleSubmit} className="login-form" style={{ maxWidth: 400, marginTop: 24 }}>
      <label>
        Produk
        <select value={produkId} onChange={(e) => setProdukId(e.target.value)} required>
          <option value="">-- Pilih produk --</option>
          {produkList.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nama} (stok: {p.stok})
            </option>
          ))}
        </select>
      </label>

      <label>
        Jumlah (dus)
        <input
          type="number"
          min="1"
          value={jumlah}
          onChange={(e) => setJumlah(e.target.value)}
          required
        />
      </label>

      <label>
        Nama pembeli (opsional)
        <input type="text" value={namaPembeli} onChange={(e) => setNamaPembeli(e.target.value)} />
      </label>

      {pesan && <div className="scaffold-note">{pesan}</div>}
      {lastKode && (
        <a href={`/admin/faktur/${lastKode}`} target="_blank" className="btn-pesan" style={{ textAlign: 'center' }}>
          Lihat &amp; Cetak Bon
        </a>
      )}

      <button type="submit" className="btn-pesan" disabled={loading}>
        {loading ? 'Menyimpan...' : 'Simpan Pesanan'}
      </button>
    </form>
  );
}