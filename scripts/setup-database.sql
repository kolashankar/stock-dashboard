-- Create a simple SQL script to set up the database schema
-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS stock_data CASCADE;
DROP TABLE IF EXISTS companies CASCADE;

-- Create companies table
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    sector VARCHAR(100) NOT NULL,
    market_cap BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create stock_data table
CREATE TABLE stock_data (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    open_price DECIMAL(10,2) NOT NULL,
    high_price DECIMAL(10,2) NOT NULL,
    low_price DECIMAL(10,2) NOT NULL,
    close_price DECIMAL(10,2) NOT NULL,
    volume BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, date)
);

-- Create indexes for better performance
CREATE INDEX idx_stock_data_company_date ON stock_data(company_id, date DESC);
CREATE INDEX idx_companies_symbol ON companies(symbol);

-- Insert sample companies
INSERT INTO companies (symbol, name, sector, market_cap) VALUES
('RELIANCE', 'Reliance Industries Limited', 'Energy', 1500000000000),
('TCS', 'Tata Consultancy Services', 'Technology', 1200000000000),
('HDFCBANK', 'HDFC Bank Limited', 'Banking', 800000000000),
('INFY', 'Infosys Limited', 'Technology', 700000000000),
('HINDUNILVR', 'Hindustan Unilever Limited', 'FMCG', 600000000000),
('ICICIBANK', 'ICICI Bank Limited', 'Banking', 550000000000),
('KOTAKBANK', 'Kotak Mahindra Bank', 'Banking', 400000000000),
('BHARTIARTL', 'Bharti Airtel Limited', 'Telecom', 450000000000),
('ITC', 'ITC Limited', 'FMCG', 350000000000),
('SBIN', 'State Bank of India', 'Banking', 300000000000),
('LT', 'Larsen & Toubro Limited', 'Infrastructure', 250000000000),
('HCLTECH', 'HCL Technologies Limited', 'Technology', 200000000000);
