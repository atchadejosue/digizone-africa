'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function Confirmation() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    const transactionId = searchParams.get('id') || searchParams.get('transaction_id');
    if (transactionId) {
      verifierPaiement(transactionId);
    } else {
      setStatus('error');
    }
  }, []);

  const verifierPaiement = async (transaction_id) => {
    try {
      const response = await fetch('/api/verifier-paiement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transaction_id }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
      } else {
        setStatus('pending');
      }
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {status === 'checking' && (
          <>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
            <h1 style={styles.title}>Vérification du paiement...</h1>
          </>
        )}
        {status === 'success' && (
          <>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
            <h1 style={styles.title}>Paiement confirmé !</h1>
            <p style={styles.subtitle}>
              Ton produit a été envoyé par email. Vérifie ta boîte de réception (et les spams).
            </p>
          </>
        )}
        {status === 'pending' && (
          <>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
            <h1 style={styles.title}>Paiement en attente</h1>
            <p style={styles.subtitle}>
              Si tu as confirmé le paiement sur ton téléphone, patiente quelques secondes et actualise.
            </p>
          </>
        )}
        {status === 'error' && (
          <>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
            <h1 style={styles.title}>Erreur de vérification</h1>
          </>
        )}
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
    padding: '2.5rem', textAlign: 'center', maxWidth: '420px',
  },
  title: { color: '#f0ede8', fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.75rem' },
  subtitle: { color: '#6b6b80', fontSize: '0.88rem', lineHeight: 1.6 },
};