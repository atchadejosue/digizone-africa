import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { amount, email, phone, description } = body;

    const response = await fetch('https://api.fedapay.com/v1/transactions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.FEDAPAY_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: description || 'Achat DigiZone',
        amount: amount,
        currency: { iso: 'XOF' },
        customer: {
          email: email,
          phone_number: { number: phone, country: 'bj' },
        },
        callback_url: 'http://localhost:3000/confirmation',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erreur lors de la création de la transaction');
    }

    const tokenResponse = await fetch(
      `https://api.fedapay.com/v1/transactions/${data['v1/transaction'].id}/token`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.FEDAPAY_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const tokenData = await tokenResponse.json();

    return NextResponse.json({
      success: true,
      payment_url: tokenData.url,
      transaction_id: data['v1/transaction'].id,
    });

  } catch (error) {
    console.error('ERREUR FEDAPAY COMPLÈTE:', error);
    return NextResponse.json(
      { success: false, error: error.message, details: String(error) },
      { status: 500 }
    );
  }
}