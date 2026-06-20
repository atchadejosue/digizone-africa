'use client';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    document.title = "DigiZone Africa — Marketplace Digitale";
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    console.log('DONNÉES PRODUITS:', data);
    console.log('ERREUR:', error);

    if (!error) setProducts(data || []);
    setLoading(false);
  };

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <div style={styles.logo}>
          Digi<span style={{ color: '#f5a623' }}>Zone</span>
        </div>
        <div>
          <button style={styles.btnGhost} onClick={() => router.push('/inscription')}>
            Mon espace
          </button>
          <button style={styles.btnPrimary} onClick={() => router.push('/inscription')}>
            Vendre ici →
          </button>
        </div>
      </nav>

      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>
          Vends ton savoir.<br />
          <span style={{ color: '#f5a623' }}>Gagne partout.</span>
        </h1>
        <p style={styles.heroSub}>
          La marketplace des produits digitaux en Afrique francophone.
        </p>
        <button style={styles.btnPrimaryLg} onClick={() => router.push('/inscription')}>
          Commencer à vendre →
        </button>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Produits disponibles</h2>

        {loading && <p style={{ color: '#6b6b80' }}>Chargement des produits...</p>}

        {!loading && products.length === 0 && (
          <p style={{ color: '#6b6b80' }}>
            Aucun produit publié pour le moment. Sois le premier vendeur ! 🚀
          </p>
        )}

        <div style={styles.grid}>
          {products.map((product) => (
            <div
              key={product.id}
              style={styles.card}
              onClick={() => router.push(`/produit/${product.id}`)}
            >
              <div style={styles.thumb}>📦</div>
              <div style={styles.cardBody}>
                <div style={styles.category}>{product.category}</div>
                <div style={styles.cardTitle}>{product.title}</div>
                <div style={styles.price}>
                  {Number(product.price).toLocaleString()} FCFA
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { background: '#0f0f14', minHeight: '100vh', color: '#f0ede8', fontFamily: 'sans-serif' },
  nav: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '1rem 5%', borderBottom: '1px solid #2a2a3a',
  },
  logo: { fontSize: '1.4rem', fontWeight: '800' },
  btnGhost: {
    background: 'transparent', border: '1px solid #2a2a3a', color: '#f0ede8',
    padding: '8px 16px', borderRadius: '8px', marginRight: '0.5rem', cursor: 'pointer',
  },
  btnPrimary: {
    background: '#f5a623', border: 'none', color: '#0a0a0a',
    padding: '9px 18px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer',
  },
  hero: { padding: '4rem 5%', textAlign: 'center' },
  heroTitle: { fontSize: '2.8rem', fontWeight: '800', marginBottom: '1rem', lineHeight: 1.1 },
  heroSub: { color: '#6b6b80', fontSize: '1.1rem', marginBottom: '2rem' },
  btnPrimaryLg: {
    background: '#f5a623', border: 'none', color: '#0a0a0a',
    padding: '14px 28px', borderRadius: '10px', fontWeight: '700',
    fontSize: '1rem', cursor: 'pointer',
  },
  section: { padding: '2rem 5% 4rem' },
  sectionTitle: { fontSize: '1.8rem', fontWeight: '800', marginBottom: '1.5rem' },
  grid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem',
  },
  card: {
    background: '#1c1c28', border: '1px solid #2a2a3a', borderRadius: '16px',
    overflow: 'hidden', cursor: 'pointer',
  },
  thumb: {
    height: '120px', background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem',
  },
  cardBody: { padding: '14px 16px' },
  category: { fontSize: '0.65rem', color: '#f5a623', textTransform: 'uppercase', fontWeight: '700', marginBottom: '6px' },
  cardTitle: { fontSize: '0.95rem', fontWeight: '700', marginBottom: '8px' },
  price: { fontSize: '1.1rem', fontWeight: '800', color: '#f5a623' },
};