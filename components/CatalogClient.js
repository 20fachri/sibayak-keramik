'use client';

import { useState, useMemo } from 'react';
import ProductCard from './ProductCard';
import Cart from './Cart';

export default function CatalogClient({ products }) {
  const [cart, setCart] = useState([]);
  const [cari, setCari] = useState('');
  const [kategoriTerpilih, setKategoriTerpilih] = useState('Semua');

  const daftarKategori = useMemo(() => {
    const unik = [...new Set(products.map((p) => p.kategori).filter(Boolean))];
    return ['Semua', ...unik];
  }, [products]);

  const produkTersaring = useMemo(() => {
    return products.filter((p) => {
      const kataKunci = cari.toLowerCase();
      const cocokCari =
        p.nama.toLowerCase().includes(kataKunci) ||
        (p.ukuran && p.ukuran.toLowerCase().includes(kataKunci));
      const cocokKategori = kategoriTerpilih === 'Semua' || p.kategori === kategoriTerpilih;
      return cocokCari && cocokKategori;
    });
  }, [products, cari, kategoriTerpilih]);

  function addToCart(product, jumlah) {
    setCart((prev) => {
      const existing = prev.find((item) => item.produk_id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.produk_id === product.id ? { ...item, jumlah: item.jumlah + jumlah } : item
        );
      }
      return [
        ...prev,
        {
          produk_id: product.id,
          nama: product.nama,
          ukuran: product.ukuran,
          harga_per_dus: product.harga_per_dus,
          jumlah,
        },
      ];
    });
  }

  function updateJumlah(produk_id, jumlah) {
    if (jumlah <= 0) {
      setCart((prev) => prev.filter((item) => item.produk_id !== produk_id));
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.produk_id === produk_id ? { ...item, jumlah } : item))
    );
  }

  function removeItem(produk_id) {
    setCart((prev) => prev.filter((item) => item.produk_id !== produk_id));
  }

  return (
    <>
      {cart.length > 0 && (
        <Cart items={cart} onUpdateJumlah={updateJumlah} onRemove={removeItem} />
      )}

      <div className="filter-bar">
        <input
          type="text"
          placeholder="Cari produk..."
          value={cari}
          onChange={(e) => setCari(e.target.value)}
          className="filter-search"
        />
        {daftarKategori.length > 1 && (
          <select
            value={kategoriTerpilih}
            onChange={(e) => setKategoriTerpilih(e.target.value)}
            className="filter-select"
          >
            {daftarKategori.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        )}
      </div>

      {produkTersaring.length === 0 && (
        <div className="scaffold-note">Tidak ada produk yang cocok.</div>
      )}

      <div className="product-grid">
        {produkTersaring.map((product) => (
          <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
        ))}
      </div>
    </>
  );
}