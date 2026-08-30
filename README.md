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
- All data is mock/demo data included in the bundle
- State resets on refresh (intentional for demo purposes)
- Optimised for desktop demonstration; responsive on tablet/mobile
