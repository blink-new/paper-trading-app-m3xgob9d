import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Crown, 
  Check, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  Shield,
  Zap,
  Star
} from 'lucide-react'
import { subscriptionService } from '@/services/subscriptionService'
import { blink } from '@/blink/client'
import type { UserSubscription } from '@/types/trading'

interface PremiumUpgradeProps {
  userId: string
  onSubscriptionChange?: (subscription: UserSubscription) => void
}

export function PremiumUpgrade({ userId, onSubscriptionChange }: PremiumUpgradeProps) {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [loading, setLoading] = useState(false)
  const [trialDays, setTrialDays] = useState(0)

  useEffect(() => {
    loadSubscription()
  }, [userId, loadSubscription])

  const loadSubscription = useCallback(async () => {
    try {
      const sub = await subscriptionService.getUserSubscription(userId)
      setSubscription(sub)
      
      if (sub.plan === 'trial') {
        const days = await subscriptionService.getTrialDaysRemaining(userId)
        setTrialDays(days)
      }
    } catch (error) {
      console.error('Failed to load subscription:', error)
    }
  }, [userId])

  const handleStartTrial = async () => {
    setLoading(true)
    try {
      const updatedSub = await subscriptionService.startTrial(userId)
      setSubscription(updatedSub)
      setTrialDays(7)
      onSubscriptionChange?.(updatedSub)
    } catch (error) {
      console.error('Failed to start trial:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpgradeToPremium = async () => {
    setLoading(true)
    try {
      // In a real app, this would integrate with Stripe
      // For demo purposes, we'll simulate the upgrade
      const updatedSub = await subscriptionService.upgradeToPremium(userId)
      setSubscription(updatedSub)
      onSubscriptionChange?.(updatedSub)
    } catch (error) {
      console.error('Failed to upgrade to premium:', error)
    } finally {
      setLoading(false)
    }
  }

  const features = [
    { icon: DollarSign, text: 'Real money trading with live market data' },
    { icon: TrendingUp, text: 'Advanced portfolio analytics & insights' },
    { icon: Shield, text: 'Enhanced security & fraud protection' },
    { icon: Zap, text: 'Instant trade execution' },
    { icon: Star, text: 'Priority customer support' },
    { icon: Crown, text: 'Exclusive premium features' }
  ]

  if (!subscription) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Current Plan Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Crown className="h-5 w-5" />
            <span>Your Plan</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <Badge variant={subscription.plan === 'premium' ? 'default' : subscription.plan === 'trial' ? 'secondary' : 'outline'}>
                  {subscription.plan.toUpperCase()}
                </Badge>
                {subscription.plan === 'trial' && (
                  <div className="flex items-center space-x-1 text-sm text-orange-600">
                    <Clock className="h-4 w-4" />
                    <span>{trialDays} days remaining</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {subscription.plan === 'free' && 'Paper trading only'}
                {subscription.plan === 'trial' && 'Trial access to real money trading'}
                {subscription.plan === 'premium' && 'Full access to all features'}
              </p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold">
                {subscription.plan === 'free' && '$0/month'}
                {subscription.plan === 'trial' && 'FREE TRIAL'}
                {subscription.plan === 'premium' && '$29.99/month'}
              </div>
              {subscription.realMoneyEnabled && (
                <Badge variant="default" className="bg-green-600">
                  Real Money Enabled
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Options */}
      {subscription.plan !== 'premium' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Free Trial Card */}
          {subscription.plan === 'free' && (
            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-blue-600" />
                  <span>7-Day Free Trial</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-2xl font-bold text-blue-600">FREE</div>
                <p className="text-sm text-gray-600">
                  Try real money trading risk-free for 7 days
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center space-x-2 text-sm">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Real money trading access</span>
                  </li>
                  <li className="flex items-center space-x-2 text-sm">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>All premium features</span>
                  </li>
                  <li className="flex items-center space-x-2 text-sm">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>No credit card required</span>
                  </li>
                </ul>
                <Button 
                  onClick={handleStartTrial} 
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? 'Starting Trial...' : 'Start Free Trial'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Premium Plan Card */}
          <Card className="border-2 border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Crown className="h-5 w-5 text-purple-600" />
                <span>Premium Plan</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-2xl font-bold text-purple-600">$29.99/month</div>
              <p className="text-sm text-gray-600">
                Full access to real money trading and premium features
              </p>
              <ul className="space-y-2">
                {features.slice(0, 4).map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2 text-sm">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>{feature.text}</span>
                  </li>
                ))}
              </ul>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    {subscription.plan === 'trial' ? 'Upgrade to Premium' : 'Get Premium'}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Upgrade to Premium</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600">$29.99</div>
                      <div className="text-sm text-gray-600">per month</div>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-medium">What's included:</h4>
                      {features.map((feature, index) => {
                        const Icon = feature.icon
                        return (
                          <div key={index} className="flex items-center space-x-3">
                            <Icon className="h-4 w-4 text-purple-600" />
                            <span className="text-sm">{feature.text}</span>
                          </div>
                        )
                      })}
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="text-sm text-yellow-800">
                        <strong>Demo Mode:</strong> This is a demonstration. In a real app, this would integrate with Stripe for secure payment processing.
                      </div>
                    </div>

                    <Button 
                      onClick={handleUpgradeToPremium}
                      disabled={loading}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      {loading ? 'Processing...' : 'Upgrade Now (Demo)'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Trial Expiry Warning */}
      {subscription.plan === 'trial' && trialDays <= 2 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <div className="font-medium text-orange-800">
                  Your trial expires in {trialDays} day{trialDays !== 1 ? 's' : ''}
                </div>
                <div className="text-sm text-orange-600">
                  Upgrade to premium to continue using real money trading features
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}