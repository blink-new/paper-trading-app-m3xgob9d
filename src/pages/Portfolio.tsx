import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  PieChart,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

// Mock portfolio data
const mockHoldings = [
  { 
    symbol: 'AAPL', 
    companyName: 'Apple Inc.', 
    shares: 50, 
    averagePrice: 160.00,
    currentPrice: 175.00, 
    totalValue: 8750.00, 
    gainLoss: 750.00, 
    gainLossPercent: 9.38,
    allocation: 28.5
  },
  { 
    symbol: 'MSFT', 
    companyName: 'Microsoft Corp.', 
    shares: 30, 
    averagePrice: 380.00,
    currentPrice: 415.00, 
    totalValue: 12450.00, 
    gainLoss: 1050.00, 
    gainLossPercent: 9.21,
    allocation: 40.5
  },
  { 
    symbol: 'GOOGL', 
    companyName: 'Alphabet Inc.', 
    shares: 25, 
    averagePrice: 280.00,
    currentPrice: 275.00, 
    totalValue: 6875.00, 
    gainLoss: -125.00, 
    gainLossPercent: -1.79,
    allocation: 22.4
  },
  { 
    symbol: 'TSLA', 
    companyName: 'Tesla Inc.', 
    shares: 15, 
    averagePrice: 270.00,
    currentPrice: 255.00, 
    totalValue: 3825.00, 
    gainLoss: -225.00, 
    gainLossPercent: -5.56,
    allocation: 12.5
  }
]

const portfolioSummary = {
  totalValue: 31900.00,
  totalCost: 30450.00,
  totalGainLoss: 1450.00,
  totalGainLossPercent: 4.76,
  cashBalance: 25420.50
}

export function Portfolio() {
  const [holdings] = useState(mockHoldings)
  const [summary] = useState(portfolioSummary)

  const totalPortfolioValue = summary.totalValue + summary.cashBalance

  return (
    <div className="p-6 space-y-6">
      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPortfolioValue.toLocaleString()}</div>
            <div className="flex items-center space-x-1 text-sm">
              {summary.totalGainLoss >= 0 ? (
                <ArrowUpRight className="h-4 w-4 text-green-600" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-600" />
              )}
              <span className={summary.totalGainLoss >= 0 ? "text-green-600" : "text-red-600"}>
                ${Math.abs(summary.totalGainLoss).toLocaleString()} ({Math.abs(summary.totalGainLossPercent)}%)
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Invested Value</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${summary.totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {((summary.totalValue / totalPortfolioValue) * 100).toFixed(1)}% of portfolio
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${summary.cashBalance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {((summary.cashBalance / totalPortfolioValue) * 100).toFixed(1)}% of portfolio
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Holdings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {holdings.map((holding) => (
              <div key={holding.symbol} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="font-bold text-sm">{holding.symbol}</span>
                    </div>
                    <div>
                      <div className="font-semibold text-lg">{holding.symbol}</div>
                      <div className="text-sm text-gray-500">{holding.companyName}</div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-xl font-bold">${holding.totalValue.toLocaleString()}</div>
                    <div className={`flex items-center space-x-1 text-sm ${holding.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {holding.gainLoss >= 0 ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      <span>
                        {holding.gainLoss >= 0 ? '+' : ''}${holding.gainLoss.toFixed(2)} ({holding.gainLossPercent}%)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">Shares</div>
                    <div className="font-medium">{holding.shares}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Avg. Price</div>
                    <div className="font-medium">${holding.averagePrice.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Current Price</div>
                    <div className="font-medium">${holding.currentPrice.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Allocation</div>
                    <div className="font-medium">{holding.allocation}%</div>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Portfolio Allocation</span>
                    <span>{holding.allocation}%</span>
                  </div>
                  <Progress value={holding.allocation} className="h-2" />
                </div>

                <div className="flex space-x-2 mt-4">
                  <Button variant="outline" size="sm">
                    Buy More
                  </Button>
                  <Button variant="outline" size="sm">
                    Sell
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {holdings.length === 0 && (
            <div className="text-center py-12">
              <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Holdings Yet</h3>
              <p className="text-gray-500 mb-4">Start building your portfolio by buying some stocks.</p>
              <Button>Start Trading</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}