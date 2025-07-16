export interface Stock {
  symbol: string
  companyName: string
  currentPrice: number
  change: number
  changePercent: number
  volume: number
  marketCap: number
}

export interface Holding {
  id: string
  userId: string
  symbol: string
  companyName: string
  shares: number
  averagePrice: number
  currentPrice: number
  totalValue: number
  gainLoss: number
  gainLossPercent: number
  createdAt: string
  updatedAt: string
}

export interface Transaction {
  id: string
  userId: string
  symbol: string
  companyName: string
  type: 'buy' | 'sell'
  shares: number
  price: number
  totalAmount: number
  createdAt: string
}

export interface Portfolio {
  id: string
  userId: string
  cashBalance: number
  totalValue: number
  totalGainLoss: number
  totalGainLossPercent: number
  createdAt: string
  updatedAt: string
}

export interface WatchlistItem {
  id: string
  userId: string
  symbol: string
  companyName: string
  currentPrice: number
  change: number
  changePercent: number
  createdAt: string
}

export interface UserSubscription {
  id: string
  userId: string
  plan: 'free' | 'trial' | 'premium'
  status: 'active' | 'expired' | 'cancelled'
  trialEndsAt?: string
  subscriptionEndsAt?: string
  realMoneyEnabled: boolean
  createdAt: string
  updatedAt: string
}

export interface RealMoneyPortfolio {
  id: string
  userId: string
  cashBalance: number
  totalValue: number
  totalGainLoss: number
  totalGainLossPercent: number
  createdAt: string
  updatedAt: string
}

export interface RealMoneyHolding {
  id: string
  userId: string
  symbol: string
  companyName: string
  shares: number
  averagePrice: number
  currentPrice: number
  totalValue: number
  gainLoss: number
  gainLossPercent: number
  createdAt: string
  updatedAt: string
}

export interface RealMoneyTransaction {
  id: string
  userId: string
  symbol: string
  companyName: string
  type: 'buy' | 'sell'
  shares: number
  price: number
  totalAmount: number
  fees: number
  createdAt: string
}

export type AccountType = 'paper' | 'real'