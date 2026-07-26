# PayHere Payments

RVSN now includes a PayHere online payment foundation for Vercel deployments.

## Flow

1. Checkout creates a Firestore order with `paymentMethod: "payhere"` and `paymentStatus: "unpaid"`.
2. The browser calls `/api/payhere/create-checkout`.
3. The Vercel API route creates the PayHere checkout hash using the server-only merchant secret.
4. The browser posts the checkout form to PayHere.
5. PayHere calls `/api/payhere/notify`.
6. The notification route verifies `md5sig`, checks the order amount/currency, then marks the order `paid`.

## Vercel Environment Variables

```env
PAYHERE_MODE=sandbox
PAYHERE_MERCHANT_ID=
PAYHERE_MERCHANT_SECRET=
PAYHERE_CURRENCY=LKR
PAYHERE_ALLOWED_ORIGINS=https://your-vercel-domain.vercel.app,http://localhost:3000
NEXT_PUBLIC_SITE_URL=https://your-vercel-domain.vercel.app
```

The PayHere values are server-only. Do not prefix them with `NEXT_PUBLIC_`.

## Firebase Admin Requirement

The PayHere notification route updates Firestore from the server, so Vercel also needs Firebase Admin variables:

```env
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=
FIREBASE_ADMIN_STORAGE_BUCKET=
```

## PayHere Dashboard

Use sandbox while testing. When the merchant account is ready for live payments:

```env
PAYHERE_MODE=production
```

Then redeploy the Vercel project.
