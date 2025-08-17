import { queryWithErrorHandling } from "../database"
import type { Company, DatabaseCompany } from "../db-types"

export class CompanyRepository {
  // Get all companies
  static async findAll(): Promise<Company[]> {
    const companies = await queryWithErrorHandling<DatabaseCompany>(
      `SELECT id, name, symbol, sector, market_cap, created_at, updated_at 
       FROM companies 
       ORDER BY market_cap DESC`,
      [],
      "CompanyRepository.findAll",
    )

    return companies.map(this.mapToCompany)
  }

  // Get company by ID
  static async findById(id: string): Promise<Company | null> {
    const companies = await queryWithErrorHandling<DatabaseCompany>(
      `SELECT id, name, symbol, sector, market_cap, created_at, updated_at 
       FROM companies 
       WHERE id = $1`,
      [id],
      "CompanyRepository.findById",
    )

    return companies.length > 0 ? this.mapToCompany(companies[0]) : null
  }

  // Get company by symbol
  static async findBySymbol(symbol: string): Promise<Company | null> {
    const companies = await queryWithErrorHandling<DatabaseCompany>(
      `SELECT id, name, symbol, sector, market_cap, created_at, updated_at 
       FROM companies 
       WHERE symbol = $1`,
      [symbol.toUpperCase()],
      "CompanyRepository.findBySymbol",
    )

    return companies.length > 0 ? this.mapToCompany(companies[0]) : null
  }

  // Search companies by name or symbol
  static async search(searchTerm: string, sector?: string): Promise<Company[]> {
    let query_text = `
      SELECT id, name, symbol, sector, market_cap, created_at, updated_at 
      FROM companies 
      WHERE (LOWER(name) LIKE $1 OR LOWER(symbol) LIKE $1)
    `
    const params: any[] = [`%${searchTerm.toLowerCase()}%`]

    if (sector) {
      query_text += ` AND LOWER(sector) = $2`
      params.push(sector.toLowerCase())
    }

    query_text += ` ORDER BY market_cap DESC`

    const companies = await queryWithErrorHandling<DatabaseCompany>(query_text, params, "CompanyRepository.search")

    return companies.map(this.mapToCompany)
  }

  // Get companies by sector
  static async findBySector(sector: string): Promise<Company[]> {
    const companies = await queryWithErrorHandling<DatabaseCompany>(
      `SELECT id, name, symbol, sector, market_cap, created_at, updated_at 
       FROM companies 
       WHERE LOWER(sector) = $1 
       ORDER BY market_cap DESC`,
      [sector.toLowerCase()],
      "CompanyRepository.findBySector",
    )

    return companies.map(this.mapToCompany)
  }

  // Get all unique sectors
  static async getSectors(): Promise<string[]> {
    const result = await queryWithErrorHandling<{ sector: string }>(
      `SELECT DISTINCT sector FROM companies ORDER BY sector`,
      [],
      "CompanyRepository.getSectors",
    )

    return result.map((row) => row.sector)
  }

  // Create new company
  static async create(company: Omit<Company, "id">): Promise<Company> {
    const companies = await queryWithErrorHandling<DatabaseCompany>(
      `INSERT INTO companies (name, symbol, sector, market_cap) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, name, symbol, sector, market_cap, created_at, updated_at`,
      [company.name, company.symbol.toUpperCase(), company.sector, company.marketCap],
      "CompanyRepository.create",
    )

    return this.mapToCompany(companies[0])
  }

  // Update company
  static async update(id: string, updates: Partial<Omit<Company, "id">>): Promise<Company | null> {
    const setParts: string[] = []
    const params: any[] = []
    let paramIndex = 1

    if (updates.name !== undefined) {
      setParts.push(`name = $${paramIndex++}`)
      params.push(updates.name)
    }
    if (updates.symbol !== undefined) {
      setParts.push(`symbol = $${paramIndex++}`)
      params.push(updates.symbol.toUpperCase())
    }
    if (updates.sector !== undefined) {
      setParts.push(`sector = $${paramIndex++}`)
      params.push(updates.sector)
    }
    if (updates.marketCap !== undefined) {
      setParts.push(`market_cap = $${paramIndex++}`)
      params.push(updates.marketCap)
    }

    if (setParts.length === 0) {
      return this.findById(id)
    }

    params.push(id)

    const companies = await queryWithErrorHandling<DatabaseCompany>(
      `UPDATE companies 
       SET ${setParts.join(", ")} 
       WHERE id = $${paramIndex} 
       RETURNING id, name, symbol, sector, market_cap, created_at, updated_at`,
      params,
      "CompanyRepository.update",
    )

    return companies.length > 0 ? this.mapToCompany(companies[0]) : null
  }

  // Delete company
  static async delete(id: string): Promise<boolean> {
    const result = await queryWithErrorHandling(`DELETE FROM companies WHERE id = $1`, [id], "CompanyRepository.delete")

    return result.length > 0
  }

  // Helper method to map database company to domain company
  private static mapToCompany(dbCompany: DatabaseCompany): Company {
    return {
      id: dbCompany.id.toString(),
      name: dbCompany.name,
      symbol: dbCompany.symbol,
      sector: dbCompany.sector,
      marketCap: dbCompany.market_cap,
      createdAt: dbCompany.created_at,
      updatedAt: dbCompany.updated_at,
    }
  }
}
