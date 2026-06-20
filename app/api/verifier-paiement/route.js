import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(request) {
  try {
    const body = await request.json();
    const { transaction_id } = body;

    // 1. Vérifier le statut réel auprès de FedaPay
    const fedaResponse = await fetch(
      `https://api.fedapay.com/v1/transactions/${transaction_id}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.FEDAPAY_SECRET_KEY}`,
        },
      }
    );

    const fedaData = await fedaResponse.json();
    const status = fedaData['v1/transaction']?.status;

    if (status !== 'approved') {
      return NextResponse.json({ success: false, status });
    }

    // 2. Récupérer la commande liée à cette transaction
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, products(title, file_url, vendor_id)')
      .eq('fedapay_id', transaction_id)
      .single();

    if (orderError || !order) {
      throw new Error('Commande introuvable');
    }

    // 3. Mettre à jour le statut de la commande
    await supabase
      .from('orders')
      .update({ payment_status: 'completed', delivery_status: 'delivered' })
      .eq('id', order.id);

    // 4. Envoyer l'email avec le produit
    await resend.emails.send({
      from: 'DigiZone Africa <onboarding@resend.dev>',
      to: order.buyer_email,
      subject: `Ton produit "${order.products.title}" est prêt ! 🎉`,
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
          <h1 style="color: #f5a623;">Merci pour ton achat ! 🎉</h1>
          <p>Voici ton produit : <strong>${order.products.title}</strong></p>
          <p>Montant payé : ${order.amount} FCFA</p>
          <p style="margin-top: 20px; color: #888;">
            Si tu as des questions, contacte le vendeur directement.
          </p>
          <p style="margin-top: 30px; font-size: 12px; color: #aaa;">
            DigiZone Africa — La marketplace digitale francophone
          </p>
        </div>
      `,
    });

    // 5. Mettre à jour la commission du vendeur
    await supabase.from('commissions').insert([
      {
        order_id: order.id,
        vendor_id: order.vendor_id,
        amount: order.platform_commission,
        source: order.products.title,
      },
    ]);

    return NextResponse.json({ success: true, delivered: true });

  } catch (error) {
    console.error('ERREUR VÉRIFICATION PAIEMENT:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}