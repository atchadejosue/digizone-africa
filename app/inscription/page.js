'use client';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';

export default function Inscription() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    shop_name: '',
    country: 'Bénin',
    password: ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error: insertError } = await supabase.from('users').insert([
        {
          email: form.email,
          full_name: form.full_name,
          shop_name: form.shop_name,
          phone: form.phone,
          country: form.country,
          role: 'vendor',
          plan: 'free',
          status: 'pending',
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
          <h1 style={styles.title}>Bienvenue sur DigiZone !</h1>
          <p style={styles.subtitle}>
            Ton compte vendeur a été créé avec succès. Tu vas être redirigé...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Créer mon compte vendeur</h1>
        <p style={styles.subtitle}>Rejoins DigiZone Africa en 2 minutes</p>

        <form onSubmit={handleSubmit}>
          <input
            style={styles.input}
            type="text"
            name="full_name"
            placeholder="Nom complet"
            value={form.full_name}
            onChange={handleChange}
            required
          />
          <input
            style={styles.input}
            type="email"
            name="email"
            placeholder="Adresse email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            style={styles.input}
            type="tel"
            name="phone"
            placeholder="Numéro WhatsApp (+229...)"
            value={form.phone}
            onChange={handleChange}
            required
          />
          <input
            style={styles.input}
            type="text"
            name="shop_name"
            placeholder="Nom de ta boutique"
            value={form.shop_name}
            onChange={handleChange}
            required
          />
          <select
            style={styles.input}
            name="country"
            value={form.country}
            onChange={handleChange}
          >
            <option value="Bénin">🇧🇯 Bénin</option>
            <option value="Sénégal">🇸🇳 Sénégal</option>
            <option value="Côte d'Ivoire">🇨🇮 Côte d'Ivoire</option>
            <option value="Togo">🇹🇬 Togo</option>
            <option value="Burkina Faso">🇧🇫 Burkina Faso</option>
            <option value="Cameroun">🇨🇲 Cameroun</option>
          </select>
          <input
            style={styles.input}
            type="password"
            name="password"
            placeholder="Mot de passe (min. 6 caractères)"
            value={form.password}
            onChange={handleChange}
            required
            minLength={6}
          />

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Création en cours...' : 'Créer mon compte →'}
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
    maxWidth: '440px',
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