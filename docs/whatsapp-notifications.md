# WhatsApp Notifications

This project now has a WhatsApp notification foundation for order events.

## What Is Wired

- Checkout sends an `order_placed` notification after a cash-on-delivery order is saved.
- Admin order status changes send an `order_status_changed` notification after Firestore updates.
- The site does not fail checkout or admin updates if WhatsApp is not configured.

## Required Backend

WhatsApp messages require a private access token, so they must be sent from a secure backend:

- Vercel API route
- Firebase Cloud Functions
- any private server endpoint

Set this frontend variable to that backend endpoint:

```env
NEXT_PUBLIC_WHATSAPP_NOTIFICATION_ENDPOINT=/api/whatsapp/order
```

If the frontend is hosted somewhere else, use the full Vercel API URL:

```env
NEXT_PUBLIC_WHATSAPP_NOTIFICATION_ENDPOINT=https://your-vercel-domain.vercel.app/api/whatsapp/order
```

The Vercel route lives at `src/app/api/whatsapp/order/route.ts` and uses `src/lib/notifications/whatsapp-server.ts` to send messages through WhatsApp Cloud API.

## Server Environment Variables

```env
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_ADMIN_PHONE_NUMBER=
WHATSAPP_ALLOWED_ORIGINS=https://your-vercel-domain.vercel.app,http://localhost:3000
```

Phone numbers should be in international format, for example:

```txt
94721666552
```

## Events

`order_placed`

- Sends admin message: new order details.
- Sends customer message: order is waiting for approval.

`order_status_changed`

- Sends customer status updates:
  - `pending`: waiting for approval
  - `approved`: order confirmed
  - `processing`: waiting for shipment
  - `shipped`: delivering
  - `delivered`: delivered
  - `cancelled`: cancelled

## Production Note

For real customer notifications, WhatsApp usually requires approved template messages for business-initiated conversations. The current helper uses text messages as a development foundation; template messages can be added next when the WhatsApp Business account is ready.

## Vercel Deployment

Add these variables in Vercel Project Settings:

- `NEXT_PUBLIC_WHATSAPP_NOTIFICATION_ENDPOINT=/api/whatsapp/order`
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_ACCESS_TOKEN`
- `WHATSAPP_ADMIN_PHONE_NUMBER`
- `WHATSAPP_ALLOWED_ORIGINS`

The normal `npm run build` is now Vercel-ready. For Firebase static hosting later, use:

```bash
npm run build:firebase
```
