'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function ProduitDetail() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProduct();
  }, []);

  const fetchProduct = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*, users(shop_name, email)')
      .eq('id', params.id)
      .single();

    if (!error) setProduct(data);
    setLoading(false);
  };

  const handleBuy = async (e) => {
    e.preventDefault();
    setPaying(true);
    setError('');

    try {
      const response = await fetch('/api/paiement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: product.price,
          email: buyerEmail,
          phone: buyerPhone,
          description: `Achat: ${product.title}`,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Enregistrer la commande avant de partir vers FedaPay
        await supabase.from('orders').insert([
          {
            product_id: product.id,
            vendor_id: product.vendor_id,
            buyer_email: buyerEmail,
            buyer_phone: buyerPhone,
            amount: product.price,
            platform_commission: product.price * 0.08,
            vendor_amount: product.price * 0.92,
            payment_status: 'pending',
            fedapay_id: data.transaction_id,
          },
        ]);

        window.location.href = data.payment_url;
      } else {
        setError(data.error || 'Erreur lors du paiement');
      }
    } catch (err) {
      setError('Erreur de connexion. Réessaie.');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return <div style={styles.loading}>Chargement...</div>;
  }

  if (!product) {
    return <div style={styles.loading}>Produit introuvable.</div>;
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        <button style={styles.backBtn} onClick={() => router.push('/')}>
          ← Retour à la marketplace
        </button>

        <div style={styles.grid}>

          {/* LEFT - Info produit */}
          <div>
            <div style={styles.thumb}>📦</div>
            <div style={styles.category}>{product.category}</div>
            <h1 style={styles.title}>{product.title}</h1>
            <p style={styles.seller}>
              Par <strong>{product.users?.shop_name || 'Vendeur DigiZone'}</strong>
            </p>
            <p style={styles.description}>
              {product.description || product.short_description}
            </p>
          </div>

          {/* RIGHT - Buy box */}
          <div style={styles.buyBox}>
            <div style={styles.price}>
              {Number(product.price).toLocaleString()} FCFA
            </div>

            <form onSubmit={handleBuy}>
              <input
                style={styles.input}
                type="email"
                placeholder="Ton email (pour recevoir le produit)"
                value={buyerEmail}
                onChange={(e) => setBuyerEmail(e.target.value)}
                required
              />
              <input
                style={styles.input}
                type="tel"
                placeholder="Ton numéro Mobile Money"
                value={buyerPhone}
                onChange={(e) => setBuyerPhone(e.target.value)}
                required
              />

              {error && <p style={styles.error}>{error}</p>}

              <button type="submit" style={styles.buyBtn} disabled={paying}>
                {paying ? 'Redirection...' : `⚡ Acheter maintenant →`}
              </button>
            </form>

            <div style={styles.guarantees}>
              <div>✅ Paiement sécurisé via FedaPay</div>
              <div>⚡ Livraison automatique</div>
              <div>📲 Mobile Money accepté</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { background: '#0f0f14', minHeight: '100vh', color: '#f0ede8', fontFamily: 'sans-serif' },
  container: { maxWidth: '1000px', margin: '0 auto', padding: '2rem' },
  backBtn: {
    background: 'transparent', border: 'none', color: '#6b6b80',
    fontSize: '0.85rem', cursor: 'pointer', marginBottom: '2rem',
  },
  grid: { display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2.5rem' },
  thumb: {
    height: '240px', background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
    borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '4rem', marginBottom: '1.5rem',
  },
  category: { fontSize: '0.7rem', color: '#f5a623', textTransform: 'uppercase', fontWeight: '700', marginBottom: '8px' },
  title: { fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.75rem', lineHeight: 1.2 },
  seller: { color: '#6b6b80', fontSize: '0.9rem', marginBottom: '1.5rem' },
  description: { color: '#9999a8', fontSize: '0.9rem', lineHeight: 1.7 },
  buyBox: {
    background: '#1c1c28', border: '1px solid #2a2a3a', borderRadius: '20px',
    padding: '1.75rem', alignSelf: 'start',
  },
  price: { fontSize: '2rem', fontWeight: '800', color: '#f5a623', marginBottom: '1.25rem' },
  input: {
    width: '100%', background: '#15151e', border: '1.5px solid #2a2a3a', borderRadius: '10px',
    padding: '12px 14px', color: '#f0ede8', fontSize: '0.88rem', marginBottom: '1rem',
    outline: 'none', boxSizing: 'border-box',
  },
  buyBtn: {
    width: '100%', background: '#f5a623', border: 'none', color: '#0a0a0a',
    padding: '15px', borderRadius: '12px', fontWeight: '800', fontSize: '0.95rem', cursor: 'pointer',
  },
  guarantees: {
    marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid #2a2a3a',
    display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.78rem', color: '#6b6b80',
  },
  error: { color: '#ff4757', fontSize: '0.82rem', marginBottom: '1rem' },
  loading: {
    background: '#0f0f14', color: '#f0ede8', minHeight: '100vh',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif',
  },
};