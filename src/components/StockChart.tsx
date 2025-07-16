import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react'

interface StockChartProps {
  symbol: string
  companyName: string
  currentPrice: number
  change: number
  changePercent: number
}

interface ChartDataPoint {
  time: string
  price: number
  volume: number
}

// Generate realistic historical data
const generateHistoricalData = (currentPrice: number, days: number): ChartDataPoint[] => {
  const data: ChartDataPoint[] = []
  let price = currentPrice
  const now = new Date()
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    
    // Add some realistic price movement
    const volatility = 0.02 // 2% daily volatility
    const randomChange = (Math.random() - 0.5) * 2 * volatility
    price = price * (1 + randomChange)
    
    // Ensure price doesn't go negative
    price = Math.max(price, currentPrice * 0.5)
    
    data.push({
      time: date.toISOString().split('T')[0],
      price: parseFloat(price.toFixed(2)),
      volume: Math.floor(Math.random() * 50000000) + 10000000
    })
  }
  
  // Ensure the last price matches current price
  if (data.length > 0) {
    data[data.length - 1].price = currentPrice
  }
  
  return data
}

export function StockChart({ symbol, companyName, currentPrice, change, changePercent }: StockChartProps) {
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '3M' | '1Y'>('1M')
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    
    // Simulate API call delay
    setTimeout(() => {
      const days = {
        '1D': 1,
        '1W': 7,
        '1M': 30,
        '3M': 90,
        '1Y': 365
      }[timeframe]
      
      const data = generateHistoricalData(currentPrice, days)
      setChartData(data)
      setIsLoading(false)
    }, 500)
  }, [symbol, currentPrice, timeframe])

  const minPrice = Math.min(...chartData.map(d => d.price))
  const maxPrice = Math.max(...chartData.map(d => d.price))
  const priceRange = maxPrice - minPrice

  // Calculate SVG path for the price line
  const createPath = (data: ChartDataPoint[], width: number, height: number) => {
    if (data.length === 0) return ''
    
    const points = data.map((point, index) => {
      const x = (index / (data.length - 1)) * width
      const y = height - ((point.price - minPrice) / priceRange) * height
      return `${x},${y}`
    })
    
    return `M ${points.join(' L ')}`
  }

  const chartWidth = 800
  const chartHeight = 300

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">{symbol}</CardTitle>
            <p className="text-gray-600">{companyName}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">${currentPrice.toFixed(2)}</div>
            <div className={`flex items-center space-x-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span className="font-medium">
                {change >= 0 ? '+' : ''}${change.toFixed(2)} ({changePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Timeframe Selector */}
        <div className="flex space-x-2">
          {(['1D', '1W', '1M', '3M', '1Y'] as const).map((period) => (
            <Button
              key={period}
              variant={timeframe === period ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeframe(period)}
            >
              {period}
            </Button>
          ))}
        </div>

        {/* Chart */}
        <div className="relative">
          {isLoading ? (
            <div className="flex items-center justify-center h-80 bg-gray-50 rounded-lg">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-pulse" />
                <p className="text-gray-500">Loading chart data...</p>
              </div>
            </div>
          ) : (
            <div className="bg-white border rounded-lg p-4">
              <svg
                width="100%"
                height={chartHeight}
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="overflow-visible"
              >
                {/* Grid lines */}
                <defs>
                  <pattern id="grid" width="40" height="30" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 30" fill="none" stroke="#f0f0f0" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
                
                {/* Price line */}
                <path
                  d={createPath(chartData, chartWidth, chartHeight)}
                  fill="none"
                  stroke={change >= 0 ? "#10B981" : "#EF4444"}
                  strokeWidth="2"
                  className="drop-shadow-sm"
                />
                
                {/* Area fill */}
                <path
                  d={`${createPath(chartData, chartWidth, chartHeight)} L ${chartWidth},${chartHeight} L 0,${chartHeight} Z`}
                  fill={`url(#gradient-${change >= 0 ? 'green' : 'red'})`}
                  opacity="0.1"
                />
                
                {/* Gradient definitions */}
                <defs>
                  <linearGradient id="gradient-green" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.3"/>
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0"/>
                  </linearGradient>
                  <linearGradient id="gradient-red" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#EF4444" stopOpacity="0.3"/>
                    <stop offset="100%" stopColor="#EF4444" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                
                {/* Data points */}
                {chartData.map((point, index) => {
                  const x = (index / (chartData.length - 1)) * chartWidth
                  const y = chartHeight - ((point.price - minPrice) / priceRange) * chartHeight
                  
                  return (
                    <circle
                      key={index}
                      cx={x}
                      cy={y}
                      r="3"
                      fill={change >= 0 ? "#10B981" : "#EF4444"}
                      className="opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <title>{`${point.time}: $${point.price.toFixed(2)}`}</title>
                    </circle>
                  )
                })}
              </svg>
              
              {/* Price labels */}
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>${minPrice.toFixed(2)}</span>
                <span>${maxPrice.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Chart Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">High</div>
            <div className="font-bold text-green-600">${maxPrice.toFixed(2)}</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">Low</div>
            <div className="font-bold text-red-600">${minPrice.toFixed(2)}</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">Range</div>
            <div className="font-bold">${priceRange.toFixed(2)}</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">Avg Volume</div>
            <div className="font-bold">
              {chartData.length > 0 
                ? `${(chartData.reduce((sum, d) => sum + d.volume, 0) / chartData.length / 1000000).toFixed(1)}M`
                : '0M'
              }
            </div>
          </div>
        </div>

        {/* Market Indicators */}
        <div className="flex flex-wrap gap-2">
          <Badge variant={change >= 0 ? "default" : "destructive"}>
            {change >= 0 ? "Bullish" : "Bearish"}
          </Badge>
          <Badge variant="outline">
            Vol: {chartData.length > 0 ? `${(chartData[chartData.length - 1]?.volume / 1000000).toFixed(1)}M` : '0M'}
          </Badge>
          <Badge variant="outline">
            {timeframe} Chart
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}