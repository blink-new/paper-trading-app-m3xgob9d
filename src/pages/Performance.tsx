import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Target,
  Award,
  Activity
} from 'lucide-react'

// Mock performance data
const portfolioPerformance = [
  { date: '2024-01-01', value: 100000, benchmark: 100000 },
  { date: '2024-01-15', value: 102500, benchmark: 101200 },
  { date: '2024-02-01', value: 98750, benchmark: 99800 },
  { date: '2024-02-15', value: 104200, benchmark: 102100 },
  { date: '2024-03-01', value: 106800, benchmark: 103500 },
  { date: '2024-03-15', value: 105420, benchmark: 104200 }
]

const allocationData = [
  { name: 'Technology', value: 45, color: '#10B981' },
  { name: 'Healthcare', value: 20, color: '#3B82F6' },
  { name: 'Finance', value: 15, color: '#8B5CF6' },
  { name: 'Consumer', value: 12, color: '#F59E0B' },
  { name: 'Cash', value: 8, color: '#6B7280' }
]

const transactions = [
  { date: '2024-03-15', symbol: 'AAPL', type: 'buy', shares: 10, price: 175.00, total: 1750.00 },
  { date: '2024-03-14', symbol: 'GOOGL', type: 'sell', shares: 5, price: 275.00, total: 1375.00 },
  { date: '2024-03-13', symbol: 'MSFT', type: 'buy', shares: 15, price: 415.00, total: 6225.00 },
  { date: '2024-03-12', symbol: 'TSLA', type: 'sell', shares: 8, price: 255.00, total: 2040.00 },
  { date: '2024-03-11', symbol: 'NVDA', type: 'buy', shares: 3, price: 875.00, total: 2625.00 }
]

const performanceMetrics = {
  totalReturn: 5420.50,
  totalReturnPercent: 5.42,
  annualizedReturn: 12.8,
  sharpeRatio: 1.45,
  maxDrawdown: -4.2,
  winRate: 68.5,
  totalTrades: 27,
  avgHoldingPeriod: 18
}

export function Performance() {
  const [timeframe, setTimeframe] = useState('3M')

  const formatCurrency = (value: number) => `$${value.toLocaleString()}`
  const formatPercent = (value: number) => `${value.toFixed(2)}%`

  return (
    <div className="p-6 space-y-6">
      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Return</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${performanceMetrics.totalReturn.toLocaleString()}
            </div>
            <p className="text-xs text-green-600">
              +{performanceMetrics.totalReturnPercent}% since inception
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annualized Return</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performanceMetrics.annualizedReturn}%</div>
            <p className="text-xs text-muted-foreground">vs 8.2% S&P 500</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sharpe Ratio</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performanceMetrics.sharpeRatio}</div>
            <p className="text-xs text-muted-foreground">Risk-adjusted return</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performanceMetrics.winRate}%</div>
            <p className="text-xs text-muted-foreground">
              {Math.round(performanceMetrics.totalTrades * performanceMetrics.winRate / 100)} of {performanceMetrics.totalTrades} trades
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Portfolio Performance Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Portfolio Performance</CardTitle>
              <div className="flex space-x-2">
                {['1M', '3M', '6M', '1Y', 'ALL'].map((period) => (
                  <Badge
                    key={period}
                    variant={timeframe === period ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setTimeframe(period)}
                  >
                    {period}
                  </Badge>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={portfolioPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    `$${value.toLocaleString()}`,
                    name === 'value' ? 'Portfolio' : 'S&P 500'
                  ]}
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="benchmark" 
                  stroke="#6B7280" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Asset Allocation */}
        <Card>
          <CardHeader>
            <CardTitle>Asset Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={allocationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {allocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {allocationData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Additional Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Max Drawdown</span>
              <span className="font-medium text-red-600">{performanceMetrics.maxDrawdown}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Volatility</span>
              <span className="font-medium">14.2%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Beta</span>
              <span className="font-medium">1.15</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Alpha</span>
              <span className="font-medium text-green-600">+2.8%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Avg. Holding Period</span>
              <span className="font-medium">{performanceMetrics.avgHoldingPeriod} days</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Recent Transactions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.map((transaction, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Badge variant={transaction.type === 'buy' ? 'default' : 'secondary'}>
                    {transaction.type.toUpperCase()}
                  </Badge>
                  <div>
                    <div className="font-medium">{transaction.symbol}</div>
                    <div className="text-sm text-gray-500">{transaction.shares} shares @ ${transaction.price}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">${transaction.total.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">{transaction.date}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}