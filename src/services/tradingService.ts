import { blink } from '@/blink/client'
import type { Stock, Holding, Transaction, Portfolio, WatchlistItem } from '@/types/trading'

// Mock stock data with realistic prices
const MOCK_STOCKS: Record<string, Stock> = {
  'AAPL': {
    symbol: 'AAPL',
    companyName: 'Apple Inc.',
    currentPrice: 175.00,
    change: 2.50,
    changePercent: 1.45,
    volume: 45000000,
    marketCap: 2800000000000
  },
  'GOOGL': {
    symbol: 'GOOGL',
    companyName: 'Alphabet Inc.',
    currentPrice: 275.00,
    change: -1.25,
    changePercent: -0.45,
    volume: 25000000,
    marketCap: 1700000000000
  },
  'MSFT': {
    symbol: 'MSFT',
    companyName: 'Microsoft Corp.',
    currentPrice: 415.00,
    change: 5.75,
    changePercent: 1.41,
    volume: 30000000,
    marketCap: 3100000000000
  },
  'TSLA': {
    symbol: 'TSLA',
    companyName: 'Tesla Inc.',
    currentPrice: 255.00,
    change: -8.50,
    changePercent: -3.23,
    volume: 55000000,
    marketCap: 800000000000
  },
  'AMZN': {
    symbol: 'AMZN',
    companyName: 'Amazon.com Inc.',
    currentPrice: 145.00,
    change: 1.80,
    changePercent: 1.26,
    volume: 35000000,
    marketCap: 1500000000000
  },
  'NVDA': {
    symbol: 'NVDA',
    companyName: 'NVIDIA Corp.',
    currentPrice: 875.00,
    change: 15.25,
    changePercent: 1.77,
    volume: 40000000,
    marketCap: 2200000000000
  },
  'META': {
    symbol: 'META',
    companyName: 'Meta Platforms Inc.',
    currentPrice: 485.00,
    change: 8.20,
    changePercent: 1.72,
    volume: 28000000,
    marketCap: 1200000000000
  },
  'NFLX': {
    symbol: 'NFLX',
    companyName: 'Netflix Inc.',
    currentPrice: 425.00,
    change: -3.50,
    changePercent: -0.82,
    volume: 15000000,
    marketCap: 180000000000
  }
}

class TradingService {
  private getStorageKey(userId: string, type: string): string {
    return `trading_${userId}_${type}`
  }

  // Portfolio Management
  async getPortfolio(userId: string): Promise<Portfolio> {
    const key = this.getStorageKey(userId, 'portfolio')
    const stored = localStorage.getItem(key)
    
    if (stored) {
      return JSON.parse(stored)
    }
    
    // Create initial portfolio with $100,000
    const portfolio: Portfolio = {
      id: `portfolio_${userId}`,
      userId,
      cashBalance: 100000,
      totalValue: 0,
      totalGainLoss: 0,
      totalGainLossPercent: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    localStorage.setItem(key, JSON.stringify(portfolio))
    return portfolio
  }

  async updatePortfolio(userId: string, updates: Partial<Portfolio>): Promise<Portfolio> {
    const portfolio = await this.getPortfolio(userId)
    const updated = {
      ...portfolio,
      ...updates,
      updatedAt: new Date().toISOString()
    }
    
    const key = this.getStorageKey(userId, 'portfolio')
    localStorage.setItem(key, JSON.stringify(updated))
    return updated
  }

  // Holdings Management
  async getHoldings(userId: string): Promise<Holding[]> {
    const key = this.getStorageKey(userId, 'holdings')
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : []
  }

  async updateHolding(userId: string, symbol: string, shares: number, price: number, type: 'buy' | 'sell'): Promise<void> {
    const holdings = await this.getHoldings(userId)
    const existingIndex = holdings.findIndex(h => h.symbol === symbol)
    
    if (type === 'buy') {
      if (existingIndex >= 0) {
        // Update existing holding
        const existing = holdings[existingIndex]
        const totalShares = existing.shares + shares
        const totalCost = existing.totalCost + (shares * price)
        const newAveragePrice = totalCost / totalShares
        
        holdings[existingIndex] = {
          ...existing,
          shares: totalShares,
          averagePrice: newAveragePrice,
          totalCost,
          updatedAt: new Date().toISOString()
        }
      } else {
        // Create new holding
        const stock = this.getStock(symbol)
        const holding: Holding = {
          id: `holding_${userId}_${symbol}_${Date.now()}`,
          userId,
          symbol,
          companyName: stock?.companyName || symbol,
          shares,
          averagePrice: price,
          currentPrice: price,
          totalValue: shares * price,
          gainLoss: 0,
          gainLossPercent: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        holdings.push(holding)
      }
    } else if (type === 'sell') {
      if (existingIndex >= 0) {
        const existing = holdings[existingIndex]
        if (existing.shares >= shares) {
          if (existing.shares === shares) {
            // Remove holding completely
            holdings.splice(existingIndex, 1)
          } else {
            // Reduce shares
            const remainingShares = existing.shares - shares
            const remainingCost = existing.totalCost - (shares * existing.averagePrice)
            
            holdings[existingIndex] = {
              ...existing,
              shares: remainingShares,
              totalCost: remainingCost,
              updatedAt: new Date().toISOString()
            }
          }
        }
      }
    }
    
    const key = this.getStorageKey(userId, 'holdings')
    localStorage.setItem(key, JSON.stringify(holdings))
  }

  // Transactions Management
  async getTransactions(userId: string): Promise<Transaction[]> {
    const key = this.getStorageKey(userId, 'transactions')
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : []
  }

  async addTransaction(userId: string, transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction> {
    const transactions = await this.getTransactions(userId)
    const newTransaction: Transaction = {
      ...transaction,
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    }
    
    transactions.unshift(newTransaction) // Add to beginning for recent first
    
    const key = this.getStorageKey(userId, 'transactions')
    localStorage.setItem(key, JSON.stringify(transactions))
    return newTransaction
  }

  // Stock Data
  getStock(symbol: string): Stock | null {
    return MOCK_STOCKS[symbol.toUpperCase()] || null
  }

  getAllStocks(): Stock[] {
    return Object.values(MOCK_STOCKS)
  }

  searchStocks(query: string): Stock[] {
    const searchTerm = query.toLowerCase()
    return Object.values(MOCK_STOCKS).filter(stock =>
      stock.symbol.toLowerCase().includes(searchTerm) ||
      stock.companyName.toLowerCase().includes(searchTerm)
    )
  }

  // Trading Operations
  async executeTrade(userId: string, symbol: string, shares: number, type: 'buy' | 'sell'): Promise<{ success: boolean; message: string; transaction?: Transaction }> {
    const stock = this.getStock(symbol)
    if (!stock) {
      return { success: false, message: 'Stock not found' }
    }

    const portfolio = await this.getPortfolio(userId)
    const totalAmount = shares * stock.currentPrice

    if (type === 'buy') {
      if (portfolio.cashBalance < totalAmount) {
        return { success: false, message: 'Insufficient funds' }
      }

      // Update cash balance
      await this.updatePortfolio(userId, {
        cashBalance: portfolio.cashBalance - totalAmount
      })

      // Update holdings
      await this.updateHolding(userId, symbol, shares, stock.currentPrice, 'buy')

      // Add transaction
      const transaction = await this.addTransaction(userId, {
        userId,
        symbol,
        companyName: stock.companyName,
        type: 'buy',
        shares,
        price: stock.currentPrice,
        totalAmount
      })

      return { 
        success: true, 
        message: `Successfully bought ${shares} shares of ${symbol} for $${totalAmount.toFixed(2)}`,
        transaction
      }
    } else {
      // Check if user has enough shares to sell
      const holdings = await this.getHoldings(userId)
      const holding = holdings.find(h => h.symbol === symbol)
      
      if (!holding || holding.shares < shares) {
        return { success: false, message: 'Insufficient shares to sell' }
      }

      // Update cash balance
      await this.updatePortfolio(userId, {
        cashBalance: portfolio.cashBalance + totalAmount
      })

      // Update holdings
      await this.updateHolding(userId, symbol, shares, stock.currentPrice, 'sell')

      // Add transaction
      const transaction = await this.addTransaction(userId, {
        userId,
        symbol,
        companyName: stock.companyName,
        type: 'sell',
        shares,
        price: stock.currentPrice,
        totalAmount
      })

      return { 
        success: true, 
        message: `Successfully sold ${shares} shares of ${symbol} for $${totalAmount.toFixed(2)}`,
        transaction
      }
    }
  }

  // Watchlist Management
  async getWatchlist(userId: string): Promise<WatchlistItem[]> {
    const key = this.getStorageKey(userId, 'watchlist')
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : []
  }

  async addToWatchlist(userId: string, symbol: string): Promise<boolean> {
    const stock = this.getStock(symbol)
    if (!stock) return false

    const watchlist = await this.getWatchlist(userId)
    const exists = watchlist.some(item => item.symbol === symbol)
    
    if (exists) return false

    const item: WatchlistItem = {
      id: `watch_${userId}_${symbol}_${Date.now()}`,
      userId,
      symbol,
      companyName: stock.companyName,
      currentPrice: stock.currentPrice,
      change: stock.change,
      changePercent: stock.changePercent,
      createdAt: new Date().toISOString()
    }

    watchlist.push(item)
    const key = this.getStorageKey(userId, 'watchlist')
    localStorage.setItem(key, JSON.stringify(watchlist))
    return true
  }

  async removeFromWatchlist(userId: string, symbol: string): Promise<boolean> {
    const watchlist = await this.getWatchlist(userId)
    const filtered = watchlist.filter(item => item.symbol !== symbol)
    
    if (filtered.length === watchlist.length) return false

    const key = this.getStorageKey(userId, 'watchlist')
    localStorage.setItem(key, JSON.stringify(filtered))
    return true
  }

  // Portfolio Calculations
  async calculatePortfolioMetrics(userId: string): Promise<{
    totalValue: number;
    totalGainLoss: number;
    totalGainLossPercent: number;
    investedValue: number;
  }> {
    const holdings = await this.getHoldings(userId)
    let totalValue = 0
    let totalCost = 0

    for (const holding of holdings) {
      const stock = this.getStock(holding.symbol)
      if (stock) {
        const currentValue = holding.shares * stock.currentPrice
        totalValue += currentValue
        totalCost += holding.totalCost
      }
    }

    const totalGainLoss = totalValue - totalCost
    const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0

    return {
      totalValue,
      totalGainLoss,
      totalGainLossPercent,
      investedValue: totalValue
    }
  }

  // Update holdings with current prices
  async updateHoldingsWithCurrentPrices(userId: string): Promise<Holding[]> {
    const holdings = await this.getHoldings(userId)
    
    const updatedHoldings = holdings.map(holding => {
      const stock = this.getStock(holding.symbol)
      if (stock) {
        const currentValue = holding.shares * stock.currentPrice
        const gainLoss = currentValue - holding.totalCost
        const gainLossPercent = holding.totalCost > 0 ? (gainLoss / holding.totalCost) * 100 : 0

        return {
          ...holding,
          currentPrice: stock.currentPrice,
          totalValue: currentValue,
          gainLoss,
          gainLossPercent
        }
      }
      return holding
    })

    const key = this.getStorageKey(userId, 'holdings')
    localStorage.setItem(key, JSON.stringify(updatedHoldings))
    return updatedHoldings
  }
}

export const tradingService = new TradingService()