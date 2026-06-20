'use client';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';

export default function NouveauProduit() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    title: '',
    short_description: '',
    description: '',
    category: '',
    price: '',
    delivery_mode: 'auto',
    vendor_email: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data: vendorData, error: vendorError } = await supabase
        .from('users')
        .select('id')
        .eq('email', form.vendor_email)
        .single();

      if (vendorError || !vendorData) {
        throw new Error('Vendeur introuvable. Vérifie ton email d\'inscription.');
      }

      const { error: insertError } = await supabase.from('products').insert([
        {
          vendor_id: vendorData.id,
          title: form.title,
          short_description: form.short_description,
          description: form.description,
          category: form.category,
          price: parseFloat(form.price),
          delivery_mode: form.delivery_mode,
          status: 'active',
        },
      ]);

      if (insertError) throw insertError;

      setSuccess(true);
      setTimeout(() => {
        router.push('/');
      }, 3000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
          <h1 style={styles.title}>Produit publié !</h1>
          <p style={styles.subtitle}>
            Ton produit est en ligne. Tu vas être redirigé...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Ajouter un produit</h1>
        <p style={styles.subtitle}>Publie ton produit digital sur DigiZone</p>

        <form onSubmit={handleSubmit}>
          <input
            style={styles.input}
            type="email"
            name="vendor_email"
            placeholder="Ton email vendeur (celui de l'inscription)"
            value={form.vendor_email}
            onChange={handleChange}
            required
          />
          <input
            style={styles.input}
            type="text"
            name="title"
            placeholder="Titre du produit"
            value={form.title}
            onChange={handleChange}
            required
          />
          <select
            style={styles.input}
            name="category"
            value={form.category}
            onChange={handleChange}
            required
          >
            <option value="">-- Catégorie --</option>
            <option value="📚 Ebook">📚 Ebook</option>
            <option value="🎓 Formation">🎓 Formation</option>
            <option value="🎨 Template">🎨 Template</option>
            <option value="🎵 Beats & Sons">🎵 Beats & Sons</option>
            <option value="💻 Logiciel">💻 Logiciel</option>
            <option value="🤖 Prompts IA">🤖 Prompts IA</option>
            <option value="📊 Business">📊 Business</option>
          </select>
          <textarea
            style={{ ...styles.input, minHeight: '70px', resize: 'vertical' }}
            name="short_description"
            placeholder="Description courte (max 200 caractères)"
            value={form.short_description}
            onChange={handleChange}
            maxLength={200}
            required
          />
          <textarea
            style={{ ...styles.input, minHeight: '140px', resize: 'vertical' }}
            name="description"
            placeholder="Description complète du produit"
            value={form.description}
            onChange={handleChange}
            required
          />
          <input
            style={styles.input}
            type="number"
            name="price"
            placeholder="Prix en FCFA"
            value={form.price}
            onChange={handleChange}
            required
          />
          <select
            style={styles.input}
            name="delivery_mode"
            value={form.delivery_mode}
            onChange={handleChange}
          >
            <option value="auto">⚡ Livraison automatique</option>
            <option value="whatsapp">💬 Livraison via WhatsApp</option>
            <option value="link">🔗 Lien externe</option>
          </select>

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Publication en cours...' : 'Publier mon produit →'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    background: '#0f0f14',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    fontFamily: 'sans-serif',
  },
  card: {
    background: '#1c1c28',
    border: '1px solid #2a2a3a',
    borderRadius: '20px',
    padding: '2.5rem',
    width: '100%',
    maxWidth: '480px',
  },
  title: {
    color: '#f0ede8',
    fontSize: '1.8rem',
    fontWeight: '800',
    marginBottom: '0.5rem',
  },
  subtitle: {
    color: '#6b6b80',
    fontSize: '0.9rem',
    marginBottom: '1.5rem',
  },
  input: {
    width: '100%',
    background: '#15151e',
    border: '1.5px solid #2a2a3a',
    borderRadius: '10px',
    padding: '12px 14px',
    color: '#f0ede8',
    fontSize: '0.9rem',
    marginBottom: '1rem',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'sans-serif',
  },
  button: {
    width: '100%',
    background: '#f5a623',
    border: 'none',
    color: '#0a0a0a',
    padding: '14px',
    borderRadius: '12px',
    fontWeight: '800',
    fontSize: '1rem',
    cursor: 'pointer',
    marginTop: '0.5rem',
  },
  error: {
    color: '#ff4757',
    fontSize: '0.82rem',
    marginBottom: '1rem',
  },
};