import { blink } from '@/blink/client'
import type { UserSubscription, RealMoneyPortfolio, RealMoneyHolding, RealMoneyTransaction, AccountType } from '@/types/trading'

class SubscriptionService {
  private getStorageKey(userId: string, type: string): string {
    return `subscription_${userId}_${type}`
  }

  // Subscription Management
  async getUserSubscription(userId: string): Promise<UserSubscription> {
    const key = this.getStorageKey(userId, 'subscription')
    const stored = localStorage.getItem(key)
    
    if (stored) {
      return JSON.parse(stored)
    }
    
    // Create initial free subscription
    const subscription: UserSubscription = {
      id: `sub_${userId}`,
      userId,
      plan: 'free',
      status: 'active',
      realMoneyEnabled: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    localStorage.setItem(key, JSON.stringify(subscription))
    return subscription
  }

  async updateSubscription(userId: string, updates: Partial<UserSubscription>): Promise<UserSubscription> {
    const subscription = await this.getUserSubscription(userId)
    const updated = {
      ...subscription,
      ...updates,
      updatedAt: new Date().toISOString()
    }
    
    const key = this.getStorageKey(userId, 'subscription')
    localStorage.setItem(key, JSON.stringify(updated))
    return updated
  }

  async startTrial(userId: string): Promise<UserSubscription> {
    const trialEndsAt = new Date()
    trialEndsAt.setDate(trialEndsAt.getDate() + 7) // 7-day trial
    
    return this.updateSubscription(userId, {
      plan: 'trial',
      status: 'active',
      trialEndsAt: trialEndsAt.toISOString(),
      realMoneyEnabled: true
    })
  }

  async upgradeToPremium(userId: string): Promise<UserSubscription> {
    const subscriptionEndsAt = new Date()
    subscriptionEndsAt.setMonth(subscriptionEndsAt.getMonth() + 1) // 1 month subscription
    
    return this.updateSubscription(userId, {
      plan: 'premium',
      status: 'active',
      subscriptionEndsAt: subscriptionEndsAt.toISOString(),
      realMoneyEnabled: true
    })
  }

  async checkTrialExpiry(userId: string): Promise<boolean> {
    const subscription = await this.getUserSubscription(userId)
    
    if (subscription.plan === 'trial' && subscription.trialEndsAt) {
      const now = new Date()
      const trialEnd = new Date(subscription.trialEndsAt)
      
      if (now > trialEnd) {
        await this.updateSubscription(userId, {
          status: 'expired',
          realMoneyEnabled: false
        })
        return true
      }
    }
    
    return false
  }

  async isRealMoneyEnabled(userId: string): Promise<boolean> {
    const subscription = await this.getUserSubscription(userId)
    await this.checkTrialExpiry(userId) // Check if trial expired
    
    return subscription.realMoneyEnabled && subscription.status === 'active'
  }

  async getTrialDaysRemaining(userId: string): Promise<number> {
    const subscription = await this.getUserSubscription(userId)
    
    if (subscription.plan === 'trial' && subscription.trialEndsAt) {
      const now = new Date()
      const trialEnd = new Date(subscription.trialEndsAt)
      const diffTime = trialEnd.getTime() - now.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      return Math.max(0, diffDays)
    }
    
    return 0
  }

  // Real Money Portfolio Management
  async getRealMoneyPortfolio(userId: string): Promise<RealMoneyPortfolio> {
    const key = this.getStorageKey(userId, 'real_portfolio')
    const stored = localStorage.getItem(key)
    
    if (stored) {
      return JSON.parse(stored)
    }
    
    // Create initial real money portfolio with $0
    const portfolio: RealMoneyPortfolio = {
      id: `real_portfolio_${userId}`,
      userId,
      cashBalance: 0,
      totalValue: 0,
      totalGainLoss: 0,
      totalGainLossPercent: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    localStorage.setItem(key, JSON.stringify(portfolio))
    return portfolio
  }

  async updateRealMoneyPortfolio(userId: string, updates: Partial<RealMoneyPortfolio>): Promise<RealMoneyPortfolio> {
    const portfolio = await this.getRealMoneyPortfolio(userId)
    const updated = {
      ...portfolio,
      ...updates,
      updatedAt: new Date().toISOString()
    }
    
    const key = this.getStorageKey(userId, 'real_portfolio')
    localStorage.setItem(key, JSON.stringify(updated))
    return updated
  }

  async addFunds(userId: string, amount: number): Promise<RealMoneyPortfolio> {
    const portfolio = await this.getRealMoneyPortfolio(userId)
    return this.updateRealMoneyPortfolio(userId, {
      cashBalance: portfolio.cashBalance + amount
    })
  }

  // Real Money Holdings
  async getRealMoneyHoldings(userId: string): Promise<RealMoneyHolding[]> {
    const key = this.getStorageKey(userId, 'real_holdings')
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : []
  }

  async updateRealMoneyHolding(userId: string, symbol: string, shares: number, price: number, type: 'buy' | 'sell'): Promise<void> {
    const holdings = await this.getRealMoneyHoldings(userId)
    const existingIndex = holdings.findIndex(h => h.symbol === symbol)
    
    if (type === 'buy') {
      if (existingIndex >= 0) {
        // Update existing holding
        const existing = holdings[existingIndex]
        const totalShares = existing.shares + shares
        const totalCost = (existing.shares * existing.averagePrice) + (shares * price)
        const newAveragePrice = totalCost / totalShares
        
        holdings[existingIndex] = {
          ...existing,
          shares: totalShares,
          averagePrice: newAveragePrice,
          updatedAt: new Date().toISOString()
        }
      } else {
        // Create new holding
        const holding: RealMoneyHolding = {
          id: `real_holding_${userId}_${symbol}_${Date.now()}`,
          userId,
          symbol,
          companyName: symbol, // This would come from stock data in real implementation
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
            holdings[existingIndex] = {
              ...existing,
              shares: existing.shares - shares,
              updatedAt: new Date().toISOString()
            }
          }
        }
      }
    }
    
    const key = this.getStorageKey(userId, 'real_holdings')
    localStorage.setItem(key, JSON.stringify(holdings))
  }

  // Real Money Transactions
  async getRealMoneyTransactions(userId: string): Promise<RealMoneyTransaction[]> {
    const key = this.getStorageKey(userId, 'real_transactions')
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : []
  }

  async addRealMoneyTransaction(userId: string, transaction: Omit<RealMoneyTransaction, 'id' | 'createdAt'>): Promise<RealMoneyTransaction> {
    const transactions = await this.getRealMoneyTransactions(userId)
    const newTransaction: RealMoneyTransaction = {
      ...transaction,
      id: `real_txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    }
    
    transactions.unshift(newTransaction)
    
    const key = this.getStorageKey(userId, 'real_transactions')
    localStorage.setItem(key, JSON.stringify(transactions))
    return newTransaction
  }

  // Trading fees calculation
  calculateTradingFees(amount: number): number {
    // $0.99 per trade + 0.1% of trade value
    return 0.99 + (amount * 0.001)
  }

  // Real Money Trading
  async executeRealMoneyTrade(userId: string, symbol: string, shares: number, price: number, type: 'buy' | 'sell'): Promise<{ success: boolean; message: string; transaction?: RealMoneyTransaction }> {
    const isEnabled = await this.isRealMoneyEnabled(userId)
    if (!isEnabled) {
      return { success: false, message: 'Real money trading is not enabled. Please upgrade to premium or start a trial.' }
    }

    const portfolio = await this.getRealMoneyPortfolio(userId)
    const totalAmount = shares * price
    const fees = this.calculateTradingFees(totalAmount)
    const totalCost = totalAmount + fees

    if (type === 'buy') {
      if (portfolio.cashBalance < totalCost) {
        return { success: false, message: 'Insufficient funds for real money trade' }
      }

      // Update cash balance
      await this.updateRealMoneyPortfolio(userId, {
        cashBalance: portfolio.cashBalance - totalCost
      })

      // Update holdings
      await this.updateRealMoneyHolding(userId, symbol, shares, price, 'buy')

      // Add transaction
      const transaction = await this.addRealMoneyTransaction(userId, {
        userId,
        symbol,
        companyName: symbol,
        type: 'buy',
        shares,
        price,
        totalAmount,
        fees
      })

      return { 
        success: true, 
        message: `Successfully bought ${shares} shares of ${symbol} for $${totalAmount.toFixed(2)} (fees: $${fees.toFixed(2)})`,
        transaction
      }
    } else {
      // Check if user has enough shares to sell
      const holdings = await this.getRealMoneyHoldings(userId)
      const holding = holdings.find(h => h.symbol === symbol)
      
      if (!holding || holding.shares < shares) {
        return { success: false, message: 'Insufficient shares to sell' }
      }

      const netAmount = totalAmount - fees

      // Update cash balance
      await this.updateRealMoneyPortfolio(userId, {
        cashBalance: portfolio.cashBalance + netAmount
      })

      // Update holdings
      await this.updateRealMoneyHolding(userId, symbol, shares, price, 'sell')

      // Add transaction
      const transaction = await this.addRealMoneyTransaction(userId, {
        userId,
        symbol,
        companyName: symbol,
        type: 'sell',
        shares,
        price,
        totalAmount,
        fees
      })

      return { 
        success: true, 
        message: `Successfully sold ${shares} shares of ${symbol} for $${netAmount.toFixed(2)} (fees: $${fees.toFixed(2)})`,
        transaction
      }
    }
  }
}

export const subscriptionService = new SubscriptionService()