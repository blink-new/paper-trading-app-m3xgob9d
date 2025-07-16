import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Plus,
  Minus,
  AlertTriangle,
  Shield,
  Clock,
  CreditCard
} from 'lucide-react'
import { subscriptionService } from '@/services/subscriptionService'
import { tradingService } from '@/services/tradingService'
import { blink } from '@/blink/client'
import type { RealMoneyPortfolio, RealMoneyHolding, RealMoneyTransaction, Stock } from '@/types/trading'

interface RealMoneyTradingProps {
  userId: string
}

export function RealMoneyTrading({ userId }: RealMoneyTradingProps) {
  const [portfolio, setPortfolio] = useState<RealMoneyPortfolio | null>(null)
  const [holdings, setHoldings] = useState<RealMoneyHolding[]>([])
  const [transactions, setTransactions] = useState<RealMoneyTransaction[]>([])
  const [isEnabled, setIsEnabled] = useState(false)
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null)
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy')
  const [shares, setShares] = useState('')
  const [loading, setLoading] = useState(false)
  const [addFundsAmount, setAddFundsAmount] = useState('')

  const loadData = useCallback(async () => {
    try {
      const enabled = await subscriptionService.isRealMoneyEnabled(userId)
      setIsEnabled(enabled)
      
      if (enabled) {
        const [portfolioData, holdingsData, transactionsData] = await Promise.all([
          subscriptionService.getRealMoneyPortfolio(userId),
          subscriptionService.getRealMoneyHoldings(userId),
          subscriptionService.getRealMoneyTransactions(userId)
        ])
        
        setPortfolio(portfolioData)
        setHoldings(holdingsData)
        setTransactions(transactionsData)
      }
    } catch (error) {
      console.error('Failed to load real money trading data:', error)
    }
  }, [userId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleAddFunds = async () => {
    const amount = parseFloat(addFundsAmount)
    if (!amount || amount <= 0) return

    setLoading(true)
    try {
      const updatedPortfolio = await subscriptionService.addFunds(userId, amount)
      setPortfolio(updatedPortfolio)
      setAddFundsAmount('')
    } catch (error) {
      console.error('Failed to add funds:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTrade = async () => {
    if (!selectedStock || !shares || !portfolio) return

    const sharesNum = parseInt(shares)
    if (sharesNum <= 0) return

    setLoading(true)
    try {
      const result = await subscriptionService.executeRealMoneyTrade(
        userId,
        selectedStock.symbol,
        sharesNum,
        selectedStock.currentPrice,
        tradeType
      )

      if (result.success) {
        await loadData() // Refresh all data
        setShares('')
        setSelectedStock(null)
      } else {
        alert(result.message)
      }
    } catch (error) {
      console.error('Trade failed:', error)
      alert('Trade failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const calculateTotalCost = () => {
    if (!selectedStock || !shares) return 0
    const sharesNum = parseInt(shares)
    const totalAmount = sharesNum * selectedStock.currentPrice
    const fees = subscriptionService.calculateTradingFees(totalAmount)
    return tradeType === 'buy' ? totalAmount + fees : totalAmount - fees
  }

  const stocks = tradingService.getAllStocks()

  if (!isEnabled) {
    return (
      <div className="p-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center space-x-2">
              <Shield className="h-6 w-6 text-orange-600" />
              <span>Real Money Trading Locked</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Real money trading is only available to premium subscribers and trial users.
            </p>
            <p className="text-sm text-gray-500">
              Upgrade your plan to start trading with real money and access advanced features.
            </p>
            <Button className="bg-purple-600 hover:bg-purple-700">
              View Upgrade Options
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${portfolio?.cashBalance.toLocaleString() || '0'}</div>
            <div className="flex items-center space-x-2 mt-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Funds
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add Funds</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Amount</label>
                      <Input
                        type="number"
                        placeholder="Enter amount"
                        value={addFundsAmount}
                        onChange={(e) => setAddFundsAmount(e.target.value)}
                      />
                    </div>
                    
                    <Alert>
                      <CreditCard className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Demo Mode:</strong> This simulates adding funds. In a real app, this would integrate with payment processors.
                      </AlertDescription>
                    </Alert>

                    <Button 
                      onClick={handleAddFunds}
                      disabled={loading || !addFundsAmount}
                      className="w-full"
                    >
                      {loading ? 'Processing...' : 'Add Funds (Demo)'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${portfolio?.totalValue.toLocaleString() || '0'}</div>
            <p className="text-xs text-muted-foreground">
              {holdings.length} position{holdings.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
            {(portfolio?.totalGainLoss || 0) >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(portfolio?.totalGainLoss || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {(portfolio?.totalGainLoss || 0) >= 0 ? '+' : ''}${portfolio?.totalGainLoss.toLocaleString() || '0'}
            </div>
            <p className={`text-xs ${(portfolio?.totalGainLoss || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {(portfolio?.totalGainLoss || 0) >= 0 ? '+' : ''}{portfolio?.totalGainLossPercent.toFixed(2) || '0'}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Trading Interface */}
      <Card>
        <CardHeader>
          <CardTitle>Real Money Trading</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="trade" className="space-y-4">
            <TabsList>
              <TabsTrigger value="trade">Trade</TabsTrigger>
              <TabsTrigger value="holdings">Holdings</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
            </TabsList>

            <TabsContent value="trade" className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Real Money Trading:</strong> These trades involve real money with trading fees. 
                  All trades are final and cannot be reversed.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Stock Selection */}
                <div className="space-y-4">
                  <h3 className="font-medium">Select Stock</h3>
                  <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto">
                    {stocks.map((stock) => (
                      <Card 
                        key={stock.symbol}
                        className={`cursor-pointer transition-colors ${
                          selectedStock?.symbol === stock.symbol ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => setSelectedStock(stock)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{stock.symbol}</div>
                              <div className="text-sm text-gray-500">{stock.companyName}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">${stock.currentPrice.toFixed(2)}</div>
                              <div className={`text-sm ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {stock.change >= 0 ? '+' : ''}${stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Trade Form */}
                <div className="space-y-4">
                  <h3 className="font-medium">Place Order</h3>
                  
                  {selectedStock ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="font-medium">{selectedStock.symbol}</div>
                        <div className="text-sm text-gray-600">{selectedStock.companyName}</div>
                        <div className="text-lg font-bold">${selectedStock.currentPrice.toFixed(2)}</div>
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          variant={tradeType === 'buy' ? 'default' : 'outline'}
                          onClick={() => setTradeType('buy')}
                          className="flex-1"
                        >
                          Buy
                        </Button>
                        <Button
                          variant={tradeType === 'sell' ? 'default' : 'outline'}
                          onClick={() => setTradeType('sell')}
                          className="flex-1"
                        >
                          Sell
                        </Button>
                      </div>

                      <div>
                        <label className="text-sm font-medium">Shares</label>
                        <Input
                          type="number"
                          placeholder="Number of shares"
                          value={shares}
                          onChange={(e) => setShares(e.target.value)}
                        />
                      </div>

                      {shares && selectedStock && (
                        <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                          <div className="flex justify-between">
                            <span>Shares:</span>
                            <span>{shares}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Price per share:</span>
                            <span>${selectedStock.currentPrice.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>${(parseInt(shares) * selectedStock.currentPrice).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Trading fees:</span>
                            <span>${subscriptionService.calculateTradingFees(parseInt(shares) * selectedStock.currentPrice).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between font-bold border-t pt-2">
                            <span>Total {tradeType === 'buy' ? 'cost' : 'proceeds'}:</span>
                            <span>${calculateTotalCost().toFixed(2)}</span>
                          </div>
                        </div>
                      )}

                      <Button
                        onClick={handleTrade}
                        disabled={loading || !shares || !selectedStock}
                        className="w-full"
                      >
                        {loading ? 'Processing...' : `${tradeType === 'buy' ? 'Buy' : 'Sell'} ${shares} shares`}
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      Select a stock to start trading
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="holdings">
              <div className="space-y-4">
                {holdings.length > 0 ? (
                  holdings.map((holding) => (
                    <Card key={holding.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{holding.symbol}</div>
                            <div className="text-sm text-gray-500">{holding.shares} shares @ ${holding.averagePrice.toFixed(2)}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">${holding.totalValue.toFixed(2)}</div>
                            <div className={`text-sm ${holding.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {holding.gainLoss >= 0 ? '+' : ''}${holding.gainLoss.toFixed(2)} ({holding.gainLossPercent.toFixed(2)}%)
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    No holdings yet. Start trading to build your portfolio.
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="transactions">
              <div className="space-y-4">
                {transactions.length > 0 ? (
                  transactions.map((transaction) => (
                    <Card key={transaction.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
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
                            <div className="font-medium">${transaction.totalAmount.toFixed(2)}</div>
                            <div className="text-sm text-gray-500">
                              Fee: ${transaction.fees.toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-400">
                              {new Date(transaction.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    No transactions yet. Your trading history will appear here.
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}