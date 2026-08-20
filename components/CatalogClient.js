'use client';

import { useState, useMemo, useEffect } from 'react';
import ProductCard from './ProductCard';
import Cart from './Cart';

const PER_HALAMAN = 12;

export default function CatalogClient({ products, errorMessage }) {
  const [cart, setCart] = useState([]);
  const [cari, setCari] = useState('');
  const [kategoriTerpilih, setKategoriTerpilih] = useState('Semua');
  const [halaman, setHalaman] = useState(1);

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

  useEffect(() => {
    setHalaman(1);
  }, [cari, kategoriTerpilih]);

  const totalHalaman = Math.max(1, Math.ceil(produkTersaring.length / PER_HALAMAN));
  const produkDitampilkan = produkTersaring.slice(
    (halaman - 1) * PER_HALAMAN,
    halaman * PER_HALAMAN
  );

  function gantiHalaman(h) {
    setHalaman(h);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

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
      <header className="site-header">
        <a href="/" className="brand-link">
          <img src="/logo.png" alt="Logo Sibayak Keramik" className="site-logo" />
          <div>
            <div className="wordmark">Sibayak Keramik</div>
            <div className="tagline">Keramik &amp; Ubin Bahan Bangunan</div>
          </div>
        </a>
        <input
          type="text"
          placeholder="Cari produk..."
          value={cari}
          onChange={(e) => setCari(e.target.value)}
          className="header-search"
        />
      </header>

      {errorMessage && (
        <div className="scaffold-note">Gagal mengambil data produk: {errorMessage}.</div>
      )}
      {!errorMessage && products.length === 0 && (
        <div className="scaffold-note">Belum ada produk.</div>
      )}

      {cart.length > 0 && (
        <Cart items={cart} onUpdateJumlah={updateJumlah} onRemove={removeItem} />
      )}

      {daftarKategori.length > 1 && (
        <div className="filter-bar">
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
        </div>
      )}

      {produkTersaring.length === 0 && (
        <div className="scaffold-note">Tidak ada produk yang cocok.</div>
      )}

      <div className="product-grid">
        {produkDitampilkan.map((product) => (
          <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
        ))}
      </div>

      {totalHalaman > 1 && (
        <div className="pagination">
          <button onClick={() => gantiHalaman(halaman - 1)} disabled={halaman === 1}>
            ‹ Sebelumnya
          </button>
          <span>
            Halaman {halaman} dari {totalHalaman}
          </span>
          <button onClick={() => gantiHalaman(halaman + 1)} disabled={halaman === totalHalaman}>
            Selanjutnya ›
          </button>
        </div>
      )}
    </>
  );
}