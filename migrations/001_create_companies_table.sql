-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    symbol VARCHAR(20) NOT NULL UNIQUE,
    sector VARCHAR(100) NOT NULL,
    market_cap BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on symbol for faster lookups
CREATE INDEX IF NOT EXISTS idx_companies_symbol ON companies(symbol);

-- Create index on sector for filtering
CREATE INDEX IF NOT EXISTS idx_companies_sector ON companies(sector);

-- Create index on market_cap for sorting
CREATE INDEX IF NOT EXISTS idx_companies_market_cap ON companies(market_cap DESC);
