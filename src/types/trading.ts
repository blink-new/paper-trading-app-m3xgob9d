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