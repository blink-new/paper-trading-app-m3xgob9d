import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Search, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react'
import { StockChart } from '@/components/StockChart'

// Mock stock data
const mockStocks = [
  { symbol: 'AAPL', companyName: 'Apple Inc.', currentPrice: 175.00, change: 2.50, changePercent: 1.45, volume: 45000000 },
  { symbol: 'GOOGL', companyName: 'Alphabet Inc.', currentPrice: 275.00, change: -1.25, changePercent: -0.45, volume: 25000000 },
  { symbol: 'MSFT', companyName: 'Microsoft Corp.', currentPrice: 415.00, change: 5.75, changePercent: 1.41, volume: 30000000 },
  { symbol: 'TSLA', companyName: 'Tesla Inc.', currentPrice: 255.00, change: -8.50, changePercent: -3.23, volume: 55000000 },
  { symbol: 'AMZN', companyName: 'Amazon.com Inc.', currentPrice: 145.00, change: 1.80, changePercent: 1.26, volume: 35000000 },
  { symbol: 'NVDA', companyName: 'NVIDIA Corp.', currentPrice: 875.00, change: 15.25, changePercent: 1.77, volume: 40000000 }
]

export function Trading() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStock, setSelectedStock] = useState<any>(null)
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy')
  const [shares, setShares] = useState('')
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false)
  const [chartStock, setChartStock] = useState<any>(null)
  const [isChartDialogOpen, setIsChartDialogOpen] = useState(false)

  const filteredStocks = mockStocks.filter(stock => 
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.companyName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handlePlaceOrder = () => {
    if (!selectedStock || !shares) return
    
    const totalAmount = parseFloat(shares) * selectedStock.currentPrice
    console.log(`${orderType.toUpperCase()} ${shares} shares of ${selectedStock.symbol} at $${selectedStock.currentPrice} = $${totalAmount.toFixed(2)}`)
    
    // Reset form
    setShares('')
    setIsOrderDialogOpen(false)
    setSelectedStock(null)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Search Bar */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search stocks by symbol or company name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stock List */}
      <Card>
        <CardHeader>
          <CardTitle>Available Stocks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredStocks.map((stock) => (
              <div key={stock.symbol} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="font-bold text-sm">{stock.symbol}</span>
                  </div>
                  <div>
                    <div className="font-semibold">{stock.symbol}</div>
                    <div className="text-sm text-gray-500">{stock.companyName}</div>
                    <div className="text-xs text-gray-400">Vol: {(stock.volume / 1000000).toFixed(1)}M</div>
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setChartStock(stock)
                        setIsChartDialogOpen(true)
                      }}
                    >
                      <BarChart3 className="h-4 w-4" />
                    </Button>
                    
                    <Dialog open={isOrderDialogOpen && selectedStock?.symbol === stock.symbol} onOpenChange={setIsOrderDialogOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="default"
                          onClick={() => {
                            setSelectedStock(stock)
                            setOrderType('buy')
                          }}
                        >
                          Buy
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Place Order - {selectedStock?.symbol}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                              <div className="font-semibold">{selectedStock?.symbol}</div>
                              <div className="text-sm text-gray-500">{selectedStock?.companyName}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold">${selectedStock?.currentPrice.toFixed(2)}</div>
                              <div className={`text-sm ${selectedStock?.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {selectedStock?.change >= 0 ? '+' : ''}${selectedStock?.change.toFixed(2)} ({selectedStock?.changePercent}%)
                              </div>
                            </div>
                          </div>

                          <Tabs value={orderType} onValueChange={(value) => setOrderType(value as 'buy' | 'sell')}>
                            <TabsList className="grid w-full grid-cols-2">
                              <TabsTrigger value="buy">Buy</TabsTrigger>
                              <TabsTrigger value="sell">Sell</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="buy" className="space-y-4">
                              <div>
                                <Label htmlFor="shares">Number of Shares</Label>
                                <Input
                                  id="shares"
                                  type="number"
                                  placeholder="Enter number of shares"
                                  value={shares}
                                  onChange={(e) => setShares(e.target.value)}
                                />
                              </div>
                              
                              {shares && selectedStock && (
                                <div className="p-4 bg-blue-50 rounded-lg">
                                  <div className="flex justify-between items-center">
                                    <span>Total Cost:</span>
                                    <span className="font-bold text-lg">
                                      ${(parseFloat(shares) * selectedStock.currentPrice).toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              )}
                              
                              <Button 
                                onClick={handlePlaceOrder} 
                                className="w-full"
                                disabled={!shares || parseFloat(shares) <= 0}
                              >
                                Place Buy Order
                              </Button>
                            </TabsContent>
                            
                            <TabsContent value="sell" className="space-y-4">
                              <div>
                                <Label htmlFor="shares">Number of Shares</Label>
                                <Input
                                  id="shares"
                                  type="number"
                                  placeholder="Enter number of shares"
                                  value={shares}
                                  onChange={(e) => setShares(e.target.value)}
                                />
                              </div>
                              
                              {shares && selectedStock && (
                                <div className="p-4 bg-green-50 rounded-lg">
                                  <div className="flex justify-between items-center">
                                    <span>Total Proceeds:</span>
                                    <span className="font-bold text-lg">
                                      ${(parseFloat(shares) * selectedStock.currentPrice).toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              )}
                              
                              <Button 
                                onClick={handlePlaceOrder} 
                                className="w-full"
                                disabled={!shares || parseFloat(shares) <= 0}
                              >
                                Place Sell Order
                              </Button>
                            </TabsContent>
                          </Tabs>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setSelectedStock(stock)
                        setOrderType('sell')
                        setIsOrderDialogOpen(true)
                      }}
                    >
                      Sell
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stock Chart Dialog */}
      <Dialog open={isChartDialogOpen} onOpenChange={setIsChartDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Stock Chart - {chartStock?.symbol}</DialogTitle>
          </DialogHeader>
          {chartStock && (
            <StockChart
              symbol={chartStock.symbol}
              companyName={chartStock.companyName}
              currentPrice={chartStock.currentPrice}
              change={chartStock.change}
              changePercent={chartStock.changePercent}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}