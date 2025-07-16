import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Plus,
  Trash2,
  Eye
} from 'lucide-react'

// Mock watchlist data
const mockWatchlist = [
  { 
    symbol: 'NFLX', 
    companyName: 'Netflix Inc.', 
    currentPrice: 485.50, 
    change: 12.30, 
    changePercent: 2.60,
    volume: 8500000,
    marketCap: 215000000000
  },
  { 
    symbol: 'AMD', 
    companyName: 'Advanced Micro Devices', 
    currentPrice: 165.75, 
    change: -3.25, 
    changePercent: -1.92,
    volume: 45000000,
    marketCap: 268000000000
  },
  { 
    symbol: 'SHOP', 
    companyName: 'Shopify Inc.', 
    currentPrice: 75.20, 
    change: 1.85, 
    changePercent: 2.52,
    volume: 12000000,
    marketCap: 94000000000
  },
  { 
    symbol: 'COIN', 
    companyName: 'Coinbase Global Inc.', 
    currentPrice: 245.80, 
    change: -8.90, 
    changePercent: -3.49,
    volume: 15000000,
    marketCap: 62000000000
  }
]

// Mock search results
const mockSearchResults = [
  { symbol: 'META', companyName: 'Meta Platforms Inc.', currentPrice: 485.20, change: 5.80, changePercent: 1.21 },
  { symbol: 'UBER', companyName: 'Uber Technologies Inc.', currentPrice: 68.45, change: -1.25, changePercent: -1.79 },
  { symbol: 'SPOT', companyName: 'Spotify Technology SA', currentPrice: 185.30, change: 3.45, changePercent: 1.90 }
]

export function Watchlist() {
  const [watchlist, setWatchlist] = useState(mockWatchlist)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = () => {
    if (!searchTerm.trim()) return
    
    setIsSearching(true)
    // Simulate API call
    setTimeout(() => {
      const filtered = mockSearchResults.filter(stock => 
        stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.companyName.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setSearchResults(filtered)
      setIsSearching(false)
    }, 500)
  }

  const addToWatchlist = (stock: any) => {
    const isAlreadyInWatchlist = watchlist.some(item => item.symbol === stock.symbol)
    if (!isAlreadyInWatchlist) {
      setWatchlist([...watchlist, { ...stock, volume: 10000000, marketCap: 50000000000 }])
    }
    setSearchResults([])
    setSearchTerm('')
  }

  const removeFromWatchlist = (symbol: string) => {
    setWatchlist(watchlist.filter(item => item.symbol !== symbol))
  }

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1000000000000) {
      return `$${(marketCap / 1000000000000).toFixed(1)}T`
    } else if (marketCap >= 1000000000) {
      return `$${(marketCap / 1000000000).toFixed(1)}B`
    } else {
      return `$${(marketCap / 1000000).toFixed(1)}M`
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Add to Watchlist */}
      <Card>
        <CardHeader>
          <CardTitle>Add to Watchlist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search stocks to add to watchlist..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="font-medium text-sm text-gray-700">Search Results</h4>
              {searchResults.map((stock) => (
                <div key={stock.symbol} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="font-bold text-xs">{stock.symbol}</span>
                    </div>
                    <div>
                      <div className="font-medium">{stock.symbol}</div>
                      <div className="text-sm text-gray-500">{stock.companyName}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="font-medium">${stock.currentPrice.toFixed(2)}</div>
                      <div className={`text-sm ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {stock.change >= 0 ? '+' : ''}${stock.change.toFixed(2)} ({stock.changePercent}%)
                      </div>
                    </div>
                    <Button size="sm" onClick={() => addToWatchlist(stock)}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Watchlist */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5" />
            <span>Your Watchlist ({watchlist.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {watchlist.length > 0 ? (
            <div className="space-y-4">
              {watchlist.map((stock) => (
                <div key={stock.symbol} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="font-bold text-sm">{stock.symbol}</span>
                    </div>
                    <div>
                      <div className="font-semibold">{stock.symbol}</div>
                      <div className="text-sm text-gray-500">{stock.companyName}</div>
                      <div className="flex items-center space-x-4 text-xs text-gray-400 mt-1">
                        <span>Vol: {(stock.volume / 1000000).toFixed(1)}M</span>
                        <span>Cap: {formatMarketCap(stock.marketCap)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-xl font-bold">${stock.currentPrice.toFixed(2)}</div>
                      <div className={`flex items-center space-x-1 text-sm ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {stock.change >= 0 ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                        <span>
                          {stock.change >= 0 ? '+' : ''}${stock.change.toFixed(2)} ({stock.changePercent}%)
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button variant="default" size="sm">
                        Trade
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => removeFromWatchlist(stock.symbol)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Your Watchlist is Empty</h3>
              <p className="text-gray-500 mb-4">Add stocks you want to monitor to your watchlist.</p>
              <Badge variant="secondary">Start by searching for stocks above</Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}