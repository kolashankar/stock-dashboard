-- Additional performance indexes and constraints

-- Create partial index for recent stock data (last 90 days)
CREATE INDEX IF NOT EXISTS idx_stock_data_recent 
ON stock_data(company_id, date DESC) 
WHERE date >= CURRENT_DATE - INTERVAL '90 days';

-- Create index for price range queries
CREATE INDEX IF NOT EXISTS idx_stock_data_price_range 
ON stock_data(company_id, high, low);

-- Add check constraints for data integrity
ALTER TABLE stock_data 
ADD CONSTRAINT chk_stock_data_prices 
CHECK (low <= open AND low <= close AND high >= open AND high >= close AND low <= high);

ALTER TABLE stock_data 
ADD CONSTRAINT chk_stock_data_volume 
CHECK (volume >= 0);

ALTER TABLE companies 
ADD CONSTRAINT chk_companies_market_cap 
CHECK (market_cap > 0);

-- Create function to get company stock summary
CREATE OR REPLACE FUNCTION get_company_stock_summary(p_company_id INTEGER)
RETURNS TABLE(
    company_id INTEGER,
    current_price DECIMAL(10,2),
    previous_close DECIMAL(10,2),
    change DECIMAL(10,2),
    change_percent DECIMAL(5,2),
    day_high DECIMAL(10,2),
    day_low DECIMAL(10,2),
    volume BIGINT,
    latest_date DATE
) AS $$
BEGIN
    RETURN QUERY
    WITH latest_two AS (
        SELECT sd.company_id, sd.date, sd.open, sd.high, sd.low, sd.close, sd.volume,
               ROW_NUMBER() OVER (ORDER BY sd.date DESC) as rn
        FROM stock_data sd
        WHERE sd.company_id = p_company_id
        ORDER BY sd.date DESC
        LIMIT 2
    )
    SELECT 
        p_company_id,
        current_data.close as current_price,
        COALESCE(prev_data.close, current_data.close) as previous_close,
        (current_data.close - COALESCE(prev_data.close, current_data.close)) as change,
        CASE 
            WHEN COALESCE(prev_data.close, current_data.close) > 0 
            THEN ROUND(((current_data.close - COALESCE(prev_data.close, current_data.close)) / COALESCE(prev_data.close, current_data.close) * 100)::numeric, 2)
            ELSE 0::DECIMAL(5,2)
        END as change_percent,
        current_data.high as day_high,
        current_data.low as day_low,
        current_data.volume,
        current_data.date as latest_date
    FROM latest_two current_data
    LEFT JOIN latest_two prev_data ON prev_data.rn = 2
    WHERE current_data.rn = 1;
END;
$$ LANGUAGE plpgsql;
