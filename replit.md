# Water-MaaS

Frontend-only Water Monitoring-as-a-Service MVP dashboard for business presentation.

## Stack
- **Runtime:** Node.js 20
- **Frontend:** React 18, TypeScript, Vite
- **UI:** Tailwind CSS, lucide-react, Recharts
- **Data:** Reusable mock data and simulated readings in `src/data/`

## Run locally
```bash
npm install
npm run dev
```

The Replit workflow runs `npm run dev` on port 5000.

## Build
```bash
npm run build
```

## Project structure
- `src/pages/` — overview, factory, station, alerts, maintenance, and reports screens
- `src/components/` — reusable layout, status, factory, and station components
- `src/context/` — shared frontend data context
- `src/data/` — realistic mock factories, stations, alerts, and simulated history
- `src/hooks/` — data and chart hooks prepared for a future API data source

## Scope
This MVP intentionally has no backend, database, authentication, device integration, LINE OA integration, or PDF export. Future integrations should replace the mock data source without changing the screen and component contracts.

## User preferences
- Continue within the current Vite/React architecture.
- Do not redesign from scratch or add backend/integrations until explicitly requested.