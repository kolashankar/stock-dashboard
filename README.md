# Stock Market Dashboard

A full-stack React.js application for tracking stock market data with PostgreSQL backend.

## Features

- Real-time stock data visualization
- Company listings and search
- Interactive charts with price and volume data
- Market overview with top gainers/losers
- Responsive design for all devices
- PostgreSQL database with optimized queries

## Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn

## Environment Setup

1. Copy the environment template:
\`\`\`bash
cp .env.example .env.local
\`\`\`

2. Update `.env.local` with your PostgreSQL connection details:
\`\`\`env
DATABASE_URL="postgresql://username:password@localhost:5432/stock_dashboard"
POSTGRES_HOST="localhost"
POSTGRES_PORT="5432"
POSTGRES_DB="stock_dashboard"
POSTGRES_USER="your_username"
POSTGRES_PASSWORD="your_password"
\`\`\`

## Database Setup

1. Create a PostgreSQL database named `stock_dashboard`

2. Initialize the database (runs migrations and seeds data):
\`\`\`bash
npm run db:init
\`\`\`

### Available Database Commands

- `npm run db:migrate` - Run database migrations only
- `npm run db:seed` - Seed database with sample data only
- `npm run db:init` - Full initialization (migrate + seed)
- `npm run db:reset` - Reset database (drops all tables)
- `npm run db:status` - Check database connection

## Development

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## API Endpoints

### Companies
- `GET /api/companies` - Get all companies
- `GET /api/companies/[id]` - Get company by ID
- `GET /api/companies/search?q=query&sector=sector` - Search companies

### Stocks
- `GET /api/stocks/[companyId]` - Get stock chart data
- `GET /api/stocks/[companyId]/summary` - Get stock summary

### Market
- `GET /api/market/overview` - Get market overview
- `GET /api/sectors` - Get all sectors
- `GET /api/health` - Health check

## Database Schema

### Companies Table
- `id` - Primary key
- `name` - Company name
- `symbol` - Stock symbol
- `sector` - Business sector
- `market_cap` - Market capitalization
- `created_at`, `updated_at` - Timestamps

### Stock Data Table
- `id` - Primary key
- `company_id` - Foreign key to companies
- `date` - Trading date
- `open`, `high`, `low`, `close` - OHLC prices
- `volume` - Trading volume
- `created_at` - Timestamp

## Production Deployment

1. Set production environment variables
2. Run database initialization: `npm run db:init`
3. Build the application: `npm run build`
4. Start the production server: `npm start`

## Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **UI**: Tailwind CSS, shadcn/ui components
- **Charts**: Recharts
- **Backend**: Next.js API routes
- **Database**: PostgreSQL with pg driver
- **Deployment**: Vercel (recommended)
