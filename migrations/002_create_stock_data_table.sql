-- Create stock_data table
CREATE TABLE IF NOT EXISTS stock_data (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    open DECIMAL(10,2) NOT NULL,
    high DECIMAL(10,2) NOT NULL,
    low DECIMAL(10,2) NOT NULL,
    close DECIMAL(10,2) NOT NULL,
    volume BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure unique combination of company and date
    UNIQUE(company_id, date)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_stock_data_company_id ON stock_data(company_id);
CREATE INDEX IF NOT EXISTS idx_stock_data_date ON stock_data(date DESC);
CREATE INDEX IF NOT EXISTS idx_stock_data_company_date ON stock_data(company_id, date DESC);

-- Create index for volume-based queries
CREATE INDEX IF NOT EXISTS idx_stock_data_volume ON stock_data(volume DESC);
