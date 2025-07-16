import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Activity } from 'lucide-react'

interface MarketIndex {
  name: string
  symbol: string
  value: number
  change: number
  changePercent: number
}

const mockMarketData: MarketIndex[] = [
  { name: 'S&P 500', symbol: 'SPX', value: 4756.50, change: 23.45, changePercent: 0.49 },
  { name: 'Dow Jones', symbol: 'DJI', value: 37863.80, change: -45.20, changePercent: -0.12 },
  { name: 'NASDAQ', symbol: 'IXIC', value: 14944.83, change: 67.12, changePercent: 0.45 },
  { name: 'Russell 2000', symbol: 'RUT', value: 2042.18, change: 8.75, changePercent: 0.43 }
]

// Generate mini chart data
const generateMiniChartData = (currentValue: number, points: number = 20): number[] => {
  const data: number[] = []
  let value = currentValue
  
  for (let i = points; i >= 0; i--) {
    const volatility = 0.005 // 0.5% volatility
    const randomChange = (Math.random() - 0.5) * 2 * volatility
    value = value * (1 + randomChange)
    data.push(value)
  }
  
  // Ensure the last value matches current value
  data[data.length - 1] = currentValue
  return data
}

export function MarketOverview() {
  const [marketData, setMarketData] = useState<MarketIndex[]>(mockMarketData)
  const [chartData, setChartData] = useState<Record<string, number[]>>({})

  useEffect(() => {
    // Generate chart data for each index
    const charts: Record<string, number[]> = {}
    marketData.forEach(index => {
      charts[index.symbol] = generateMiniChartData(index.value)
    })
    setChartData(charts)
  }, [marketData])

  const createMiniChart = (data: number[], isPositive: boolean) => {
    if (data.length === 0) return null
    
    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min
    
    const width = 100
    const height = 40
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * width
      const y = height - ((value - min) / range) * height
      return `${x},${y}`
    })
    
    return (
      <svg width={width} height={height} className="overflow-visible">
        <path
          d={`M ${points.join(' L ')}`}
          fill="none"
          stroke={isPositive ? "#10B981" : "#EF4444"}
          strokeWidth="1.5"
          className="drop-shadow-sm"
        />
        <path
          d={`M ${points.join(' L ')} L ${width},${height} L 0,${height} Z`}
          fill={isPositive ? "#10B981" : "#EF4444"}
          opacity="0.1"
        />
      </svg>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="h-5 w-5" />
          <span>Market Overview</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {marketData.map((index) => (
            <div key={index.symbol} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-semibold">{index.name}</div>
                    <div className="text-sm text-gray-500">{index.symbol}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{index.value.toLocaleString()}</div>
                    <div className={`flex items-center space-x-1 text-sm ${index.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {index.change >= 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      <span>
                        {index.change >= 0 ? '+' : ''}{index.change.toFixed(2)} ({index.changePercent.toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Mini Chart */}
                <div className="flex justify-center">
                  {chartData[index.symbol] && createMiniChart(chartData[index.symbol], index.change >= 0)}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Market Status */}
        <div className="mt-6 flex items-center justify-between p-4 bg-green-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="font-medium text-green-800">Market Open</span>
          </div>
          <div className="text-sm text-green-700">
            Trading hours: 9:30 AM - 4:00 PM EST
          </div>
        </div>
      </CardContent>
    </Card>
  )
}