import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

async function seedStockData() {
  console.log("Starting to seed stock data...")

  try {
    // Get all companies
    const companies = await sql`SELECT id, symbol FROM companies ORDER BY id`
    console.log(`Found ${companies.length} companies to seed`)

    // Generate 30 days of stock data for each company
    const stockData = []
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 30)

    for (const company of companies) {
      let basePrice = Math.random() * 2000 + 100 // Random base price between 100-2100

      for (let i = 0; i < 30; i++) {
        const date = new Date(startDate)
        date.setDate(date.getDate() + i)

        // Generate realistic price movements
        const change = (Math.random() - 0.5) * 0.1 // ±5% change
        basePrice = Math.max(basePrice * (1 + change), 10) // Minimum price of 10

        const open = Math.round(basePrice * 100) / 100
        const high = Math.round(open * (1 + Math.random() * 0.05) * 100) / 100
        const low = Math.round(open * (1 - Math.random() * 0.05) * 100) / 100
        const close = Math.round((low + (high - low) * Math.random()) * 100) / 100
        const volume = Math.floor(Math.random() * 10000000) + 100000

        stockData.push({
          company_id: company.id,
          date: date.toISOString().split("T")[0],
          open_price: open,
          high_price: high,
          low_price: low,
          close_price: close,
          volume: volume,
        })
      }
    }

    // Insert stock data in batches
    console.log(`Inserting ${stockData.length} stock data records...`)

    for (const data of stockData) {
      await sql`
        INSERT INTO stock_data (company_id, date, open_price, high_price, low_price, close_price, volume)
        VALUES (${data.company_id}, ${data.date}, ${data.open_price}, ${data.high_price}, ${data.low_price}, ${data.close_price}, ${data.volume})
        ON CONFLICT (company_id, date) DO NOTHING
      `
    }

    console.log("Stock data seeding completed successfully!")
  } catch (error) {
    console.error("Error seeding stock data:", error)
    throw error
  }
}

seedStockData().catch(console.error)
