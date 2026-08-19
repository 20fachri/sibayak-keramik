'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function PesananForm() {
  const [produkList, setProdukList] = useState([]);
  const [produkId, setProdukId] = useState('');
  const [jumlah, setJumlah] = useState(1);
  const [daftarPesanan, setDaftarPesanan] = useState([]);
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

  function sisaStok(produk) {
    const sudahAda = daftarPesanan.find((item) => item.produk_id === produk.id);
    return produk.stok - (sudahAda?.jumlah || 0);
  }

  function handleTambahKeDaftar() {
    setPesan('');
    if (!produkId) {
      setPesan('Pilih produk dulu.');
      return;
    }
    const produk = produkList.find((p) => p.id === produkId);
    if (!produk) return;

    const sisa = sisaStok(produk);
    if (Number(jumlah) > sisa) {
      setPesan(`Stok tidak cukup. Sisa stok: ${sisa} dus.`);
      return;
    }

    setDaftarPesanan((prev) => {
      const existing = prev.find((item) => item.produk_id === produk.id);
      if (existing) {
        return prev.map((item) =>
          item.produk_id === produk.id
            ? { ...item, jumlah: item.jumlah + Number(jumlah) }
            : item
        );
      }
      return [
        ...prev,
        {
          produk_id: produk.id,
          nama: produk.nama,
          ukuran: produk.ukuran,
          harga_per_dus: produk.harga_per_dus,
          jumlah: Number(jumlah),
        },
      ];
    });

    setProdukId('');
    setJumlah(1);
  }

  function hapusDariDaftar(produk_id) {
    setDaftarPesanan((prev) => prev.filter((item) => item.produk_id !== produk_id));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setPesan('');
    setLastKode('');

    if (daftarPesanan.length === 0) {
      setPesan('Tambahkan minimal 1 produk ke daftar pesanan dulu.');
      return;
    }

    setLoading(true);
    const kodePesanan = 'PSN-' + Date.now();

    const baris = daftarPesanan.map((item) => ({
      kode_pesanan: kodePesanan,
      produk_id: item.produk_id,
      jumlah_dus: item.jumlah,
      harga_saat_itu: item.harga_per_dus,
      nama_pembeli: namaPembeli,
    }));

    const { error: insertError } = await supabase.from('transaksi').insert(baris);

    if (insertError) {
      setLoading(false);
      setPesan('Gagal menyimpan pesanan: ' + insertError.message);
      return;
    }

    for (const item of daftarPesanan) {
      const produk = produkList.find((p) => p.id === item.produk_id);
      if (!produk) continue;
      await supabase
        .from('produk')
        .update({ stok: produk.stok - item.jumlah })
        .eq('id', item.produk_id);
    }

    setLoading(false);
    setPesan('Pesanan berhasil disimpan.');
    setLastKode(kodePesanan);
    setDaftarPesanan([]);
    setNamaPembeli('');
    loadProduk();
  }

  const totalKeseluruhan = daftarPesanan.reduce(
    (sum, item) => sum + item.harga_per_dus * item.jumlah,
    0
  );

  return (
    <div style={{ maxWidth: 460, marginTop: 24 }}>
      <div className="login-form" style={{ marginBottom: 16 }}>
        <label>
          Produk
          <select value={produkId} onChange={(e) => setProdukId(e.target.value)}>
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
          <input type="number" min="1" value={jumlah} onChange={(e) => setJumlah(e.target.value)} />
        </label>

        <button type="button" onClick={handleTambahKeDaftar} className="btn-pesan">
          + Tambah ke Daftar Pesanan
        </button>
      </div>

      {daftarPesanan.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          {daftarPesanan.map((item) => (
            <div className="cart-item" key={item.produk_id}>
              <div className="cart-item-info">
                <div className="cart-item-nama">
                  {item.nama} × {item.jumlah} dus
                </div>
                <div className="cart-item-spek">{item.ukuran}</div>
              </div>
              <div className="cart-item-subtotal">
                Rp{(item.harga_per_dus * item.jumlah).toLocaleString('id-ID')}
              </div>
              <button
                type="button"
                onClick={() => hapusDariDaftar(item.produk_id)}
                className="cart-item-remove"
              >
                ✕
              </button>
            </div>
          ))}
          <div className="cart-total">Total: Rp{totalKeseluruhan.toLocaleString('id-ID')}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="login-form">
        <label>
          Nama pembeli (opsional)
          <input type="text" value={namaPembeli} onChange={(e) => setNamaPembeli(e.target.value)} />
        </label>

        {pesan && <div className="scaffold-note">{pesan}</div>}
        {lastKode && (
          
            href={`/admin/faktur/${lastKode}`}
            target="_blank"
            className="btn-pesan"
            style={{ textAlign: 'center' }}
          >
            Lihat &amp; Cetak Bon
          </a>
        )}

        <button type="submit" className="btn-pesan" disabled={loading || daftarPesanan.length === 0}>
          {loading ? 'Menyimpan...' : 'Simpan Pesanan'}
        </button>
      </form>
    </div>
  );
}