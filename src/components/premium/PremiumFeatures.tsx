
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Crown, Star, Zap, Eye, MessageSquare, Users, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PremiumFeaturesProps {
  userTier?: 'free' | 'premium' | 'vip';
}

export function PremiumFeatures({ userTier = 'free' }: PremiumFeaturesProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>('premium');
  const { toast } = useToast();

  const plans = [
    {
      id: 'premium',
      name: 'Premium',
      price: '$9.99/month',
      icon: <Star className="h-5 w-5" />,
      features: [
        'Unlimited likes',
        'See who liked you',
        'Advanced filters',
        'Read receipts',
        'Priority support'
      ],
      color: 'text-yellow-600'
    },
    {
      id: 'vip',
      name: 'VIP',
      price: '$19.99/month',
      icon: <Crown className="h-5 w-5" />,
      features: [
        'All Premium features',
        'Unlimited rewinds',
        'Monthly boost',
        'Profile verification',
        'Exclusive events access',
        'VIP badge'
      ],
      color: 'text-purple-600'
    }
  ];

  const premiumFeatures = [
    {
      icon: <Eye className="h-5 w-5" />,
      title: 'See Who Liked You',
      description: 'View all the people who have liked your profile',
      tier: 'premium'
    },
    {
      icon: <Zap className="h-5 w-5" />,
      title: 'Super Likes',
      description: 'Send super likes to stand out from the crowd',
      tier: 'premium'
    },
    {
      icon: <MessageSquare className="h-5 w-5" />,
      title: 'Read Receipts',
      description: 'See when your messages have been read',
      tier: 'premium'
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: 'Exclusive Events',
      description: 'Access to VIP-only meetups and events',
      tier: 'vip'
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: 'Profile Verification',
      description: 'Get a verified badge on your profile',
      tier: 'vip'
    }
  ];

  const handleUpgrade = (planId: string) => {
    toast({
      title: "Upgrade initiated",
      description: `Redirecting to payment for ${planId} plan...`,
    });
    // Here you would integrate with a payment processor
  };

  return (
    <div className="space-y-6">
      {userTier === 'free' && (
        <Card className="border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-600" />
              Unlock Premium Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Get unlimited access to all features and find your perfect match faster
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
                  Upgrade Now
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle className="text-center text-2xl">Choose Your Plan</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  {plans.map((plan) => (
                    <Card 
                      key={plan.id}
                      className={`cursor-pointer transition-all ${
                        selectedPlan === plan.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedPlan(plan.id)}
                    >
                      <CardHeader>
                        <CardTitle className={`flex items-center gap-2 ${plan.color}`}>
                          {plan.icon}
                          {plan.name}
                        </CardTitle>
                        <p className="text-2xl font-bold">{plan.price}</p>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                        <Button 
                          className="w-full mt-4"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpgrade(plan.id);
                          }}
                        >
                          Choose {plan.name}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {premiumFeatures.map((feature, index) => (
          <Card key={index} className="relative">
            {(userTier === 'free' || (feature.tier === 'vip' && userTier === 'premium')) && (
              <Badge className="absolute -top-2 -right-2 bg-yellow-500">
                Premium
              </Badge>
            )}
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="text-primary">{feature.icon}</div>
                <div>
                  <h3 className="font-medium">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
