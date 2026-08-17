const NOMOR_WA_TOKO = '6285358564197';

function formatRupiah(angka) {
  return 'Rp' + angka.toLocaleString('id-ID');
}

export default function ProductCard({ product }) {
  const pesanText = encodeURIComponent(
    `Halo, saya mau tanya/pesan produk: ${product.nama} (${product.ukuran})`
  );
  const waLink = `https://wa.me/${NOMOR_WA_TOKO}?text=${pesanText}`;

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
      <div className="harga">{formatRupiah(product.harga_per_dus)} / dus</div>
      <div className="stok">Stok: {product.stok} dus</div>
      <a className="btn-pesan" href={waLink} target="_blank" rel="noopener noreferrer">
        Pesan via WhatsApp
      </a>
    </div>
  );
}