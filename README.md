# RVSN Football Store

Production-ready football ecommerce website foundation built with Next.js 15 App Router, TypeScript, Tailwind CSS, Firebase, Framer Motion, and a premium football ecommerce aesthetic.

## Scripts

```bash
npm run dev
npm run build
npm run typecheck
```

## Firebase Hosting Deployment

This project is configured for static Firebase Hosting. Next.js exports the production site into the `out` folder, and `firebase.json` deploys that folder.

Set these values in `.env.local` before building:

```bash
NEXT_PUBLIC_SITE_URL=https://your-firebase-hosting-domain.web.app
NEXT_PUBLIC_SITE_NAME=RVSN
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_FUNCTIONS_REGION=us-central1
```

Build and deploy hosting only:

```bash
npm run build
npm run hosting:deploy
```

Also add your Firebase Hosting domain to Firebase Authentication -> Settings -> Authorized domains.

## Firebase Environment

Copy `.env.example` to `.env.local` and fill in Firebase values when the project is connected.

Client SDK variables use the `NEXT_PUBLIC_FIREBASE_*` prefix. Server-only Firebase Admin variables use
`FIREBASE_ADMIN_*` and must never be exposed to the browser.

Checkout uses the existing cart and order types. Cash on delivery can save orders to Firestore when Firebase auth is
configured. Stripe online payment is handled by Firebase Cloud Functions.

## Stripe Cloud Functions

Install function dependencies once:

```bash
npm --prefix functions install
```

Set production secrets before deployment:

```bash
firebase functions:secrets:set STRIPE_SECRET_KEY
firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
```

Set `APP_URL`, `STRIPE_CURRENCY`, and `ADMIN_NOTIFICATION_EMAIL` in your Functions environment. Deploy with:

```bash
npm run functions:deploy
```

Configure the Stripe webhook endpoint to:

`https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/stripeWebhook`

Required Stripe webhook events:

`checkout.session.completed`, `payment_intent.payment_failed`.

Successful payments create documents in `orders`, `payments`, `checkoutSessions`, and `adminNotifications`.
Stripe Checkout prices are recalculated from Firestore `products`, so seed product documents before testing live payment.

## Firestore Collections

The ecommerce data layer is typed under `src/types/ecommerce.ts` and uses these top-level collections:

`products`, `categories`, `users`, `orders`, `payments`, `checkoutSessions`, `adminNotifications`, `paymentFailures`,
`reviews`, `wishlist`, `cart`.

## Changing Images

Hero image: replace `public/images/hero/hero-football-store.png`.

Product images: replace files in `public/images/products/`, then update each product's `imageUrl` in
`src/config/products.ts` if you use different filenames.

Club logos: replace files in `public/images/clubs/`, then update each club's `logoUrl` in `src/config/home.ts` if
you use different filenames.

Homepage product cards use `src/config/home.ts`. Product listing/detail pages use `src/config/products.ts`.
