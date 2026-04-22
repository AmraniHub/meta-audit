import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { auditData } = body

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'mad',
          product_data: {
            name: 'Meta Ads Account Audit',
            description:
              '5-layer AI audit: Money Model · Signal · Structure · Creative · Bid/Budget — powered by AmraniAds',
          },
          unit_amount: 49900, // 499 MAD in centimes
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${appUrl}/audit/run?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/`,
    metadata: {
      auditData: JSON.stringify(auditData).slice(0, 500), // Stripe metadata limit
    },
  })

  return NextResponse.json({ url: session.url })
}
