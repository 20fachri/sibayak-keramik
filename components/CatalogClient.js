'use client';

import { useState } from 'react';
import ProductCard from './ProductCard';
import Cart from './Cart';

export default function CatalogClient({ products }) {
  const [cart, setCart] = useState([]);

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
      <div className="product-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
        ))}
      </div>
    </>
  );
}