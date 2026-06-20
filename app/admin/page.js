'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Admin() {
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    const { data: vendorsData } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    const { data: productsData } = await supabase
      .from('products')
      .select('*, users(shop_name)')
      .order('created_at', { ascending: false });

    const { data: ordersData } = await supabase
      .from('orders')
      .select('*, products(title)')
      .order('created_at', { ascending: false });

    setVendors(vendorsData || []);
    setProducts(productsData || []);
    setOrders(ordersData || []);
    setLoading(false);
  };

  const approveVendor = async (id) => {
    await supabase.from('users').update({ status: 'active' }).eq('id', id);
    fetchAllData();
  };

  const suspendVendor = async (id) => {
    await supabase.from('users').update({ status: 'suspended' }).eq('id', id);
    fetchAllData();
  };

  const approveProduct = async (id) => {
    await supabase.from('products').update({ status: 'active' }).eq('id', id);
    fetchAllData();
  };

  const rejectProduct = async (id) => {
    await supabase.from('products').update({ status: 'rejected' }).eq('id', id);
    fetchAllData();
  };

  // Calculs des KPIs
  const totalRevenue = orders
    .filter(o => o.payment_status === 'completed')
    .reduce((sum, o) => sum + Number(o.platform_commission || 0), 0);

  const totalSalesVolume = orders
    .filter(o => o.payment_status === 'completed')
    .reduce((sum, o) => sum + Number(o.amount || 0), 0);

  const pendingVendors = vendors.filter(v => v.status === 'pending').length;
  const pendingProducts = products.filter(p => p.status === 'pending').length;

  if (loading) {
    return <div style={styles.loading}>Chargement du panel admin...</div>;
  }

  return (
    <div style={styles.page}>
      <div style={styles.sidebar}>
        <div style={styles.logo}>Digi<span style={{ color: '#f5a623' }}>Zone</span> <span style={styles.adminTag}>Admin</span></div>
        <div style={styles.navItem(activeTab === 'overview')} onClick={() => setActiveTab('overview')}>
          📊 Vue d'ensemble
        </div>
        <div style={styles.navItem(activeTab === 'vendors')} onClick={() => setActiveTab('vendors')}>
          👥 Vendeurs {pendingVendors > 0 && <span style={styles.badge}>{pendingVendors}</span>}
        </div>
        <div style={styles.navItem(activeTab === 'products')} onClick={() => setActiveTab('products')}>
          📦 Produits {pendingProducts > 0 && <span style={styles.badge}>{pendingProducts}</span>}
        </div>
        <div style={styles.navItem(activeTab === 'orders')} onClick={() => setActiveTab('orders')}>
          🛍️ Commandes
        </div>
      </div>

      <div style={styles.main}>

        {activeTab === 'overview' && (
          <>
            <h1 style={styles.pageTitle}>Vue d'ensemble</h1>
            <div style={styles.kpiGrid}>
              <div style={styles.kpiCard}>
                <div style={styles.kpiLabel}>Mes commissions totales</div>
                <div style={styles.kpiValue}>{totalRevenue.toLocaleString()} FCFA</div>
              </div>
              <div style={styles.kpiCard}>
                <div style={styles.kpiLabel}>Volume de ventes</div>
                <div style={styles.kpiValue}>{totalSalesVolume.toLocaleString()} FCFA</div>
              </div>
              <div style={styles.kpiCard}>
                <div style={styles.kpiLabel}>Vendeurs inscrits</div>
                <div style={styles.kpiValue}>{vendors.length}</div>
              </div>
              <div style={styles.kpiCard}>
                <div style={styles.kpiLabel}>Produits publiés</div>
                <div style={styles.kpiValue}>{products.length}</div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'vendors' && (
          <>
            <h1 style={styles.pageTitle}>Gestion des vendeurs ({vendors.length})</h1>
            {vendors.map((vendor) => (
              <div key={vendor.id} style={styles.row}>
                <div style={styles.rowInfo}>
                  <div style={styles.rowName}>{vendor.shop_name || vendor.full_name}</div>
                  <div style={styles.rowMeta}>{vendor.email} · {vendor.country} · {vendor.status}</div>
                </div>
                <div style={styles.rowActions}>
                  {vendor.status === 'pending' && (
                    <button style={styles.btnSuccess} onClick={() => approveVendor(vendor.id)}>
                      ✓ Valider
                    </button>
                  )}
                  {vendor.status === 'active' && (
                    <button style={styles.btnDanger} onClick={() => suspendVendor(vendor.id)}>
                      ⏸ Suspendre
                    </button>
                  )}
                  {vendor.status === 'suspended' && (
                    <button style={styles.btnSuccess} onClick={() => approveVendor(vendor.id)}>
                      ↺ Réactiver
                    </button>
                  )}
                </div>
              </div>
            ))}
          </>
        )}

        {activeTab === 'products' && (
          <>
            <h1 style={styles.pageTitle}>Gestion des produits ({products.length})</h1>
            {products.map((product) => (
              <div key={product.id} style={styles.row}>
                <div style={styles.rowInfo}>
                  <div style={styles.rowName}>{product.title}</div>
                  <div style={styles.rowMeta}>
                    {product.category} · {Number(product.price).toLocaleString()} FCFA ·
                    Par {product.users?.shop_name || 'Inconnu'} · {product.status}
                  </div>
                </div>
                <div style={styles.rowActions}>
                  {product.status === 'pending' && (
                    <>
                      <button style={styles.btnSuccess} onClick={() => approveProduct(product.id)}>
                        ✓ Approuver
                      </button>
                      <button style={styles.btnDanger} onClick={() => rejectProduct(product.id)}>
                        ✕ Rejeter
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </>
        )}

        {activeTab === 'orders' && (
          <>
            <h1 style={styles.pageTitle}>Toutes les commandes ({orders.length})</h1>
            {orders.map((order) => (
              <div key={order.id} style={styles.row}>
                <div style={styles.rowInfo}>
                  <div style={styles.rowName}>{order.products?.title || 'Produit inconnu'}</div>
                  <div style={styles.rowMeta}>
                    {order.buyer_email} · {Number(order.amount).toLocaleString()} FCFA ·
                    Commission: {Number(order.platform_commission).toLocaleString()} FCFA · {order.payment_status}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

      </div>
    </div>
  );
}

const styles = {
  page: { display: 'flex', minHeight: '100vh', background: '#0f0f14', fontFamily: 'sans-serif' },
  sidebar: { width: '220px', background: '#0a0a0a', borderRight: '1px solid #2a2a3a', padding: '1.5rem 1rem' },
  logo: { color: '#f0ede8', fontSize: '1.2rem', fontWeight: '800', marginBottom: '2rem' },
  adminTag: { fontSize: '0.6rem', background: '#ff4757', color: 'white', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px' },
  navItem: (active) => ({
    display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px',
    borderRadius: '8px', cursor: 'pointer', marginBottom: '4px', fontSize: '0.85rem',
    color: active ? '#f5a623' : '#6b6b80',
    background: active ? 'rgba(245,166,35,0.1)' : 'transparent',
  }),
  badge: { background: '#ff4757', color: 'white', fontSize: '0.62rem', padding: '1px 6px', borderRadius: '10px', marginLeft: 'auto' },
  main: { flex: 1, padding: '2rem' },
  pageTitle: { color: '#f0ede8', fontSize: '1.6rem', fontWeight: '800', marginBottom: '1.5rem' },
  kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' },
  kpiCard: { background: '#1c1c28', border: '1px solid #2a2a3a', borderRadius: '14px', padding: '1.25rem' },
  kpiLabel: { color: '#6b6b80', fontSize: '0.72rem', marginBottom: '8px', textTransform: 'uppercase' },
  kpiValue: { color: '#f5a623', fontSize: '1.5rem', fontWeight: '800' },
  row: {
    background: '#1c1c28', border: '1px solid #2a2a3a', borderRadius: '12px',
    padding: '14px 16px', marginBottom: '0.6rem', display: 'flex',
    justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem',
  },
  rowInfo: { flex: 1 },
  rowName: { color: '#f0ede8', fontSize: '0.9rem', fontWeight: '600', marginBottom: '3px' },
  rowMeta: { color: '#6b6b80', fontSize: '0.75rem' },
  rowActions: { display: 'flex', gap: '6px' },
  btnSuccess: {
    background: 'rgba(0,232,150,0.1)', border: '1px solid rgba(0,232,150,0.3)', color: '#00e896',
    padding: '6px 12px', borderRadius: '7px', fontSize: '0.75rem', cursor: 'pointer',
  },
  btnDanger: {
    background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.3)', color: '#ff4757',
    padding: '6px 12px', borderRadius: '7px', fontSize: '0.75rem', cursor: 'pointer',
  },
  loading: {
    background: '#0f0f14', color: '#f0ede8', minHeight: '100vh',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif',
  },
};