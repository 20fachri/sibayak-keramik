import { supabase } from '@/lib/supabaseClient';
import ProductCard from '@/components/ProductCard';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const { data: products, error } = await supabase
    .from('produk')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="container">
      <header className="site-header">
        <a href="/" className="brand-link">
          <img src="/logo.png" alt="Logo Sibayak Keramik" className="site-logo" />
          <div>
            <div className="wordmark">Sibayak Keramik</div>
            <div className="tagline">Keramik &amp; Ubin Bahan Bangunan</div>
          </div>
        </a>
      </header>

      {error && (
        <div className="scaffold-note">
          Gagal mengambil data produk: {error.message}. Pastikan tabel &apos;produk&apos; sudah dibuat.
        </div>
      )}

      {!error && (!products || products.length === 0) && (
        <div className="scaffold-note">
          Belum ada produk. Tambahkan lewat Table Editor di Supabase, tabel &apos;produk&apos;.
        </div>
      )}

      <div className="product-grid">
        {(products || []).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}