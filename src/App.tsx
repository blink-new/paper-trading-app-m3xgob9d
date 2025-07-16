import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { Dashboard } from '@/pages/Dashboard'
import { Portfolio } from '@/pages/Portfolio'
import { Trading } from '@/pages/Trading'
import { RealMoneyTrading } from '@/pages/RealMoneyTrading'
import { Watchlist } from '@/pages/Watchlist'
import { Performance } from '@/pages/Performance'
import { PremiumUpgrade } from '@/components/PremiumUpgrade'
import { blink } from '@/blink/client'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />
      case 'portfolio':
        return <Portfolio />
      case 'trading':
        return <Trading />
      case 'real-money':
        return <RealMoneyTrading userId={user.id} />
      case 'watchlist':
        return <Watchlist />
      case 'performance':
        return <Performance />
      case 'premium':
        return <PremiumUpgrade userId={user.id} />
      default:
        return <Dashboard />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Paper Trading Simulator...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center max-w-md mx-auto px-6">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to TradeSim</h1>
            <p className="text-gray-600 mb-8">
              Practice trading with virtual money using real market data. 
              Perfect your investment strategy risk-free with our paper trading simulator.
            </p>
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <span>✓ $100,000 virtual starting balance</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <span>✓ Real-time market data simulation</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <span>✓ Portfolio tracking & analytics</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1 lg:ml-64">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}

export default App