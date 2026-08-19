'use client';

import { useState } from 'react';

export default function ProductCard({ product, onAddToCart }) {
  const [jumlah, setJumlah] = useState(1);

  function handleTambah() {
    onAddToCart(product, Number(jumlah));
    setJumlah(1);
  }

  return (
    <div className="product-card">
      {product.foto_url ? (
        <img src={product.foto_url} alt={product.nama} className="thumb-foto" />
      ) : (
        <div className="thumb" />
      )}
      <div className="nama">{product.nama}</div>
      <div className="spek">
        {product.ukuran} · {product.isi_per_dus}
      </div>
      <div className="stok">Stok: {product.stok} dus</div>

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