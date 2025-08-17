-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for companies table
DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON companies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create view for latest stock prices
CREATE OR REPLACE VIEW latest_stock_prices AS
SELECT DISTINCT ON (company_id)
    company_id,
    date,
    open,
    high,
    low,
    close,
    volume
FROM stock_data
ORDER BY company_id, date DESC;

-- Create view for stock performance (daily change)
CREATE OR REPLACE VIEW stock_performance AS
WITH ranked_data AS (
    SELECT 
        company_id,
        date,
        close,
        LAG(close) OVER (PARTITION BY company_id ORDER BY date) as prev_close,
        ROW_NUMBER() OVER (PARTITION BY company_id ORDER BY date DESC) as rn
    FROM stock_data
)
SELECT 
    company_id,
    date,
    close as current_price,
    prev_close as previous_close,
    (close - prev_close) as change,
    CASE 
        WHEN prev_close > 0 THEN ((close - prev_close) / prev_close) * 100
        ELSE 0
    END as change_percent
FROM ranked_data
WHERE rn = 1 AND prev_close IS NOT NULL;
