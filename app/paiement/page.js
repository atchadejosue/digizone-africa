'use client';
import { useState } from 'react';

export default function Paiement() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    email: '',
    phone: '',
    amount: 100,
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/paiement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseInt(form.amount),
          email: form.email,
          phone: form.phone,
          description: 'Test paiement DigiZone',
        }),
      });

      const data = await response.json();

      if (data.success) {
        window.location.href = data.payment_url;
      } else {
        setError(data.error || 'Erreur lors du paiement');
      }
    } catch (err) {
      setError('Erreur de connexion. Réessaie.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Test Paiement DigiZone</h1>
        <p style={styles.subtitle}>
          ⚠️ Mode RÉEL — Utilise 100 FCFA maximum pour ce test
        </p>

        <form onSubmit={handlePayment}>
          <input
            style={styles.input}
            type="email"
            name="email"
            placeholder="Ton email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            style={styles.input}
            type="tel"
            name="phone"
            placeholder="Ton numéro Mobile Money (ex: 97000000)"
            value={form.phone}
            onChange={handleChange}
            required
          />
          <input
            style={styles.input}
            type="number"
            name="amount"
            placeholder="Montant en FCFA"
            value={form.amount}
            onChange={handleChange}
            required
          />

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Redirection...' : `Payer ${form.amount} FCFA →`}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    background: '#0f0f14', minHeight: '100vh', display: 'flex',
    alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: 'sans-serif',
  },
  card: {
    background: '#1c1c28', border: '1px solid #2a2a3a', borderRadius: '20px',
    padding: '2.5rem', width: '100%', maxWidth: '420px',
  },
  title: { color: '#f0ede8', fontSize: '1.6rem', fontWeight: '800', marginBottom: '0.5rem' },
  subtitle: { color: '#f5a623', fontSize: '0.8rem', marginBottom: '1.5rem' },
  input: {
    width: '100%', background: '#15151e', border: '1.5px solid #2a2a3a', borderRadius: '10px',
    padding: '12px 14px', color: '#f0ede8', fontSize: '0.9rem', marginBottom: '1rem',
    outline: 'none', boxSizing: 'border-box',
  },
  button: {
    width: '100%', background: '#f5a623', border: 'none', color: '#0a0a0a',
    padding: '14px', borderRadius: '12px', fontWeight: '800', fontSize: '1rem', cursor: 'pointer',
  },
  error: { color: '#ff4757', fontSize: '0.82rem', marginBottom: '1rem' },
};