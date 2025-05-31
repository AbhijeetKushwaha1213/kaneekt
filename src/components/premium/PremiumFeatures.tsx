
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Crown, Star, Zap, Heart, Eye, MessageCircle, Shield, Infinity } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface PremiumTier {
  id: 'free' | 'premium' | 'vip';
  name: string;
  price: string;
  features: string[];
  icon: React.ReactNode;
  color: string;
}

export function PremiumFeatures() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentTier, setCurrentTier] = useState<'free' | 'premium' | 'vip'>('free');
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const tiers: PremiumTier[] = [
    {
      id: 'free',
      name: 'Free',
      price: '$0/month',
      features: [
        '5 likes per day',
        'Basic filters',
        'Limited messaging',
        'Standard support'
      ],
      icon: <Heart className="h-6 w-6" />,
      color: 'bg-gray-500'
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '$9.99/month',
      features: [
        'Unlimited likes',
        'Advanced filters',
        'Unlimited messaging',
        'See who liked you',
        'Boost your profile',
        'Priority support'
      ],
      icon: <Star className="h-6 w-6" />,
      color: 'bg-blue-500'
    },
    {
      id: 'vip',
      name: 'VIP',
      price: '$19.99/month',
      features: [
        'Everything in Premium',
        'Super likes',
        'Message before matching',
        'Priority in discovery',
        'Advanced analytics',
        'Exclusive events access',
        'VIP badge',
        '24/7 premium support'
      ],
      icon: <Crown className="h-6 w-6" />,
      color: 'bg-purple-500'
    }
  ];

  useEffect(() => {
    loadUserTier();
  }, [user]);

  const loadUserTier = async () => {
    if (!user) return;

    try {
      // For now, use localStorage to simulate premium features
      const savedTier = localStorage.getItem(`premium_tier_${user.id}`);
      const savedExpires = localStorage.getItem(`premium_expires_${user.id}`);
      
      if (savedTier) {
        setCurrentTier(savedTier as 'free' | 'premium' | 'vip');
      }
      if (savedExpires) {
        setExpiresAt(savedExpires);
      }
    } catch (error) {
      console.error('Error loading user tier:', error);
    } finally {
      setLoading(false);
    }
  };

  const upgradeTier = async (newTier: 'premium' | 'vip') => {
    if (!user) return;

    try {
      const expirationDate = new Date();
      expirationDate.setMonth(expirationDate.getMonth() + 1);

      // For now, store in localStorage (in real app would update database)
      localStorage.setItem(`premium_tier_${user.id}`, newTier);
      localStorage.setItem(`premium_expires_${user.id}`, expirationDate.toISOString());

      setCurrentTier(newTier);
      setExpiresAt(expirationDate.toISOString());

      toast({
        title: 'Upgrade successful!',
        description: `You are now a ${newTier.toUpperCase()} member!`,
      });
    } catch (error) {
      console.error('Error upgrading tier:', error);
      toast({
        title: 'Upgrade failed',
        description: 'Please try again later.',
        variant: 'destructive'
      });
    }
  };

  const getDaysRemaining = () => {
    if (!expiresAt) return 0;
    const now = new Date();
    const expires = new Date(expiresAt);
    const diffTime = expires.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Status */}
      {currentTier !== 'free' && (
        <Card className="border-gold bg-gradient-to-r from-yellow-50 to-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${tiers.find(t => t.id === currentTier)?.color} text-white`}>
                  {tiers.find(t => t.id === currentTier)?.icon}
                </div>
                <div>
                  <h3 className="font-semibold">
                    {tiers.find(t => t.id === currentTier)?.name} Member
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {getDaysRemaining()} days remaining
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-gold text-gold-foreground">
                Active
              </Badge>
            </div>
            
            {expiresAt && (
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Subscription Progress</span>
                  <span>{30 - getDaysRemaining()}/30 days</span>
                </div>
                <Progress value={((30 - getDaysRemaining()) / 30) * 100} />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Premium Plans */}
      <div>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Zap className="h-6 w-6 text-yellow-500" />
          Premium Plans
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((tier) => (
            <Card 
              key={tier.id}
              className={`relative overflow-hidden ${
                currentTier === tier.id 
                  ? 'ring-2 ring-primary border-primary' 
                  : tier.id === 'vip' 
                    ? 'border-purple-200 bg-gradient-to-b from-purple-50 to-white'
                    : tier.id === 'premium'
                      ? 'border-blue-200 bg-gradient-to-b from-blue-50 to-white'
                      : ''
              }`}
            >
              {tier.id === 'vip' && (
                <div className="absolute top-0 right-0 bg-purple-500 text-white px-3 py-1 text-xs font-medium rounded-bl-lg">
                  MOST POPULAR
                </div>
              )}
              
              <CardHeader className="text-center">
                <div className={`w-12 h-12 ${tier.color} rounded-full flex items-center justify-center text-white mx-auto mb-3`}>
                  {tier.icon}
                </div>
                <CardTitle className="text-xl">{tier.name}</CardTitle>
                <div className="text-2xl font-bold">{tier.price}</div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Button
                  className="w-full"
                  variant={currentTier === tier.id ? "outline" : "default"}
                  disabled={currentTier === tier.id}
                  onClick={() => tier.id !== 'free' && upgradeTier(tier.id)}
                >
                  {currentTier === tier.id 
                    ? 'Current Plan' 
                    : tier.id === 'free' 
                      ? 'Free Plan' 
                      : `Upgrade to ${tier.name}`
                  }
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Premium Features Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Eye className="h-8 w-8 text-blue-500" />
            <div>
              <h3 className="font-medium">See Who Likes You</h3>
              <p className="text-sm text-muted-foreground">Premium+</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Infinity className="h-8 w-8 text-green-500" />
            <div>
              <h3 className="font-medium">Unlimited Likes</h3>
              <p className="text-sm text-muted-foreground">Premium+</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <MessageCircle className="h-8 w-8 text-purple-500" />
            <div>
              <h3 className="font-medium">Message First</h3>
              <p className="text-sm text-muted-foreground">VIP Only</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-orange-500" />
            <div>
              <h3 className="font-medium">Priority Support</h3>
              <p className="text-sm text-muted-foreground">Premium+</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
