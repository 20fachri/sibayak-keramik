'use client';

import { useState } from 'react';

export default function ProductCard({ product, onAddToCart }) {
  const [jumlah, setJumlah] = useState(1);
  const daftarWarna = product.warna
    ? product.warna.split(',').map((w) => w.trim()).filter(Boolean)
    : [];
  const [warna, setWarna] = useState(daftarWarna[0] || '');

  function handleTambah() {
    if (daftarWarna.length > 0 && !warna) {
      return;
    }
    onAddToCart(product, Number(jumlah), warna);
    setJumlah(1);
  }

  return (
    <div className="product-card">
      {product.foto_url ? (
        <img src={product.foto_url} alt={product.nama} className="thumb-foto" />
      ) : (
        <div className="thumb" />
      )}
      {product.kategori && <div className="kategori-badge">{product.kategori}</div>}
      <div className="nama">{product.nama}</div>
      <div className="spek">
        {product.ukuran} · {product.isi_per_dus}
      </div>
      <div className="stok">Stok: {product.stok} dus</div>

      {daftarWarna.length > 0 && (
        <select value={warna} onChange={(e) => setWarna(e.target.value)} className="warna-select">
          {daftarWarna.map((w) => (
            <option key={w} value={w}>
              {w}
            </option>
          ))}
        </select>
      )}

      <div className="qty-row">
        <input
          type="number"
          min="1"
          max={product.stok}
          value={jumlah}
          onChange={(e) => setJumlah(e.target.value)}
        />
        <button onClick={handleTambah} className="btn-pesan">
          Tambah ke Keranjang
        </button>
      </div>
    </div>
  );
}