# OMUSIBA Operations

**Engineering & Supply Management — Demo Application**

A frontend-only demo of a custom internal business operations platform designed for OMUSIBA Engineering & Suppliers Ltd, a Zambian engineering and supply company.

## Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Build for Production

```bash
npm run build
```

Output is in `dist/`.

## Deploy to Vercel

1. Push the repository to GitHub.
2. Import the project in [vercel.com](https://vercel.com).
3. Framework preset: **Vite**
4. No environment variables required.
5. Deploy.

Or use the Vercel CLI:

```bash
npm i -g vercel
vercel --prod
```

## Stack

- React 19 + TypeScript
- Vite 8
- Tailwind CSS 4
- React Router
- Recharts
- Lucide Icons

## Notes

- **Frontend only** — no backend, no database, no API keys
- Seeded with realistic demo data; all creation, editing, workflow and
  payment actions are fully interactive
- State is held in a shared React context and persisted to `localStorage`,
  so records you create survive a page refresh
- Use **Reset Demo Data** (top-right user menu) to restore the original dataset
- Fully responsive across desktop, tablet and smartphone (tables collapse to
  cards, sidebar becomes a drawer, forms go single-column with sticky actions)

## Interactive demo flow

Dashboard → New Request → open it → Create Quotation (add line items) → save →
Mark Accepted → Create Project from Quotation → add tasks / materials → detect
shortage → Create Purchase Request → Approve → Convert to PO → Mark Received →
Create Invoice → Record Payment → see balances and receivables update.
