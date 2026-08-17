'use client';

const NOMOR_WA_TOKO = '6285358564197';

function formatRupiah(angka) {
  return 'Rp' + angka.toLocaleString('id-ID');
}

export default function Cart({ items, onUpdateJumlah, onRemove }) {
  const total = items.reduce((sum, item) => sum + item.harga_per_dus * item.jumlah, 0);

  let teks = 'Halo, saya mau pesan:\n';
  items.forEach((item) => {
    teks += `- ${item.nama} (${item.ukuran}) x${item.jumlah} dus\n`;
  });
  teks += `\nTotal: ${formatRupiah(total)}`;
  const waLink = `https://wa.me/${6285358564197}?text=${encodeURIComponent(teks)}`;

  return (
    <div className="cart-box">
      <div className="cart-title">Keranjang Belanja</div>
      {items.map((item) => (
        <div key={item.produk_id} className="cart-item">
          <div className="cart-item-info">
            <div className="cart-item-nama">{item.nama}</div>
            <div className="cart-item-spek">{item.ukuran}</div>
          </div>
          <input
            type="number"
            min="0"
            value={item.jumlah}
            onChange={(e) => onUpdateJumlah(item.produk_id, Number(e.target.value))}
            className="cart-item-qty"
          />
          <div className="cart-item-subtotal">{formatRupiah(item.harga_per_dus * item.jumlah)}</div>
          <button onClick={() => onRemove(item.produk_id)} className="cart-item-remove">
            ✕
          </button>
        </div>
      ))}
      <div className="cart-total">Total: {formatRupiah(total)}</div>
      <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn-pesan cart-checkout">
        Pesan via WhatsApp
      </a>
    </div>
  );
}