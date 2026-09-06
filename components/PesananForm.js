'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function PesananForm() {
  const [produkList, setProdukList] = useState([]);
  const [produkId, setProdukId] = useState('');
  const [warnaTerpilih, setWarnaTerpilih] = useState('');
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
    const totalSudahAda = daftarPesanan
      .filter((item) => item.produk_id === produk.id)
      .reduce((sum, item) => sum + item.jumlah, 0);
    return produk.stok - totalSudahAda;
  }

  const produkDipilih = produkList.find((p) => p.id === produkId);
  const daftarWarnaDipilih =
    produkDipilih && produkDipilih.warna
      ? produkDipilih.warna.split(',').map((w) => w.trim()).filter(Boolean)
      : [];

  function handleTambahKeDaftar() {
    setPesan('');
    if (!produkId) {
      setPesan('Pilih produk dulu.');
      return;
    }
    const produk = produkList.find((p) => p.id === produkId);
    if (!produk) return;

    const daftarWarnaProduk = produk.warna
      ? produk.warna.split(',').map((w) => w.trim()).filter(Boolean)
      : [];
    if (daftarWarnaProduk.length > 0 && !warnaTerpilih) {
      setPesan('Pilih warna dulu.');
      return;
    }

    const sisa = sisaStok(produk);
    if (Number(jumlah) > sisa) {
      setPesan('Stok tidak cukup. Sisa stok: ' + sisa + ' dus.');
      return;
    }

    const warnaDipakai = daftarWarnaProduk.length > 0 ? warnaTerpilih : '';

    setDaftarPesanan((prev) => {
      const existing = prev.find(
        (item) => item.produk_id === produk.id && item.warna === warnaDipakai
      );
      if (existing) {
        return prev.map((item) =>
          item.produk_id === produk.id && item.warna === warnaDipakai
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
          warna: warnaDipakai,
          jumlah: Number(jumlah),
        },
      ];
    });

    setProdukId('');
    setWarnaTerpilih('');
    setJumlah(1);
  }

  function hapusDariDaftar(produk_id, warna) {
    setDaftarPesanan((prev) =>
      prev.filter((item) => !(item.produk_id === produk_id && item.warna === warna))
    );
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
      warna: item.warna || null,
    }));

    const { error: insertError } = await supabase.from('transaksi').insert(baris);

    if (insertError) {
      setLoading(false);
      setPesan('Gagal menyimpan pesanan: ' + insertError.message);
      return;
    }

    const jumlahPerProduk = {};
    daftarPesanan.forEach((item) => {
      jumlahPerProduk[item.produk_id] = (jumlahPerProduk[item.produk_id] || 0) + item.jumlah;
    });

    for (const produkIdKey of Object.keys(jumlahPerProduk)) {
      const produk = produkList.find((p) => p.id === produkIdKey);
      if (!produk) continue;
      await supabase
        .from('produk')
        .update({ stok: produk.stok - jumlahPerProduk[produkIdKey] })
        .eq('id', produkIdKey);
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
          <select
            value={produkId}
            onChange={(e) => {
              setProdukId(e.target.value);
              setWarnaTerpilih('');
            }}
          >
            <option value="">-- Pilih produk --</option>
            {produkList.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nama} (stok: {p.stok})
              </option>
            ))}
          </select>
        </label>

        {daftarWarnaDipilih.length > 0 && (
          <label>
            Warna
            <select value={warnaTerpilih} onChange={(e) => setWarnaTerpilih(e.target.value)}>
              <option value="">-- Pilih warna --</option>
              {daftarWarnaDipilih.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </label>
        )}

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
            <div className="cart-item" key={item.produk_id + '-' + item.warna}>
              <div className="cart-item-info">
                <div className="cart-item-nama">
                  {item.nama}
                  {item.warna ? ' - ' + item.warna : ''} × {item.jumlah} dus
                </div>
                <div className="cart-item-spek">{item.ukuran}</div>
              </div>
              <div className="cart-item-subtotal">
                Rp{(item.harga_per_dus * item.jumlah).toLocaleString('id-ID')}
              </div>
              <button
                type="button"
                onClick={() => hapusDariDaftar(item.produk_id, item.warna)}
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
          <a
            href={'/admin/faktur/' + lastKode}
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