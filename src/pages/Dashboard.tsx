import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { MarketOverview } from '@/components/MarketOverview'

// Mock data for demonstration
const mockPortfolio = {
  totalValue: 105420.50,
  cashBalance: 25420.50,
  totalGainLoss: 5420.50,
  totalGainLossPercent: 5.42,
  investedValue: 80000.00
}

const mockTopHoldings = [
  { symbol: 'AAPL', companyName: 'Apple Inc.', shares: 50, value: 8750.00, gainLoss: 750.00, gainLossPercent: 9.38 },
  { symbol: 'GOOGL', companyName: 'Alphabet Inc.', shares: 25, value: 6875.00, gainLoss: -125.00, gainLossPercent: -1.79 },
  { symbol: 'MSFT', companyName: 'Microsoft Corp.', shares: 30, value: 12450.00, gainLoss: 1450.00, gainLossPercent: 13.18 },
  { symbol: 'TSLA', companyName: 'Tesla Inc.', shares: 15, value: 3825.00, gainLoss: -175.00, gainLossPercent: -4.38 }
]

const mockRecentTransactions = [
  { id: '1', symbol: 'AAPL', type: 'buy', shares: 10, price: 175.00, date: '2024-01-15' },
  { id: '2', symbol: 'GOOGL', type: 'sell', shares: 5, price: 275.00, date: '2024-01-14' },
  { id: '3', symbol: 'MSFT', type: 'buy', shares: 15, price: 415.00, date: '2024-01-13' }
]

export function Dashboard() {
  const [portfolio] = useState(mockPortfolio)
  const [topHoldings] = useState(mockTopHoldings)
  const [recentTransactions] = useState(mockRecentTransactions)

  return (
    <div className="p-6 space-y-6">
      {/* Portfolio Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${portfolio.totalValue.toLocaleString()}</div>
            <div className="flex items-center space-x-1 text-sm">
              {portfolio.totalGainLoss >= 0 ? (
                <ArrowUpRight className="h-4 w-4 text-green-600" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-600" />
              )}
              <span className={portfolio.totalGainLoss >= 0 ? "text-green-600" : "text-red-600"}>
                ${Math.abs(portfolio.totalGainLoss).toLocaleString()} ({Math.abs(portfolio.totalGainLossPercent)}%)
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${portfolio.cashBalance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Available for trading</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Invested Value</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${portfolio.investedValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">In {topHoldings.length} positions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Change</CardTitle>
            {portfolio.totalGainLoss >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${portfolio.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${Math.abs(portfolio.totalGainLoss).toLocaleString()}
            </div>
            <p className={`text-xs ${portfolio.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {portfolio.totalGainLoss >= 0 ? '+' : '-'}{Math.abs(portfolio.totalGainLossPercent)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Market Overview */}
      <MarketOverview />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Holdings */}
        <Card>
          <CardHeader>
            <CardTitle>Top Holdings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topHoldings.map((holding) => (
                <div key={holding.symbol} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">{holding.symbol}</span>
                    </div>
                    <div>
                      <div className="font-medium">{holding.symbol}</div>
                      <div className="text-sm text-gray-500">{holding.shares} shares</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${holding.value.toLocaleString()}</div>
                    <div className={`text-sm ${holding.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {holding.gainLoss >= 0 ? '+' : ''}${holding.gainLoss.toLocaleString()} ({holding.gainLossPercent}%)
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Badge variant={transaction.type === 'buy' ? 'default' : 'secondary'}>
                      {transaction.type.toUpperCase()}
                    </Badge>
                    <div>
                      <div className="font-medium">{transaction.symbol}</div>
                      <div className="text-sm text-gray-500">{transaction.shares} shares</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${transaction.price.toFixed(2)}</div>
                    <div className="text-sm text-gray-500">{transaction.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}