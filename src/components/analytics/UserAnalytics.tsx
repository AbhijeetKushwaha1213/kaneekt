
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Eye, Heart, MessageCircle, Users, TrendingUp, Calendar } from 'lucide-react';

interface UserAnalyticsProps {
  userId: string;
}

export function UserAnalytics({ userId }: UserAnalyticsProps) {
  // Mock data - in real app this would come from backend
  const analytics = {
    profileViews: {
      total: 1234,
      thisWeek: 89,
      growth: 12.5
    },
    likes: {
      received: 456,
      sent: 321,
      matches: 23
    },
    messages: {
      sent: 178,
      received: 203,
      conversations: 45
    },
    engagement: {
      profileCompleteness: 85,
      responseRate: 78,
      averageResponseTime: '2h 15m'
    }
  };

  const stats = [
    {
      icon: <Eye className="h-5 w-5" />,
      label: 'Profile Views',
      value: analytics.profileViews.total,
      change: `+${analytics.profileViews.growth}%`,
      changeType: 'positive' as const
    },
    {
      icon: <Heart className="h-5 w-5" />,
      label: 'Likes Received',
      value: analytics.likes.received,
      change: '+15',
      changeType: 'positive' as const
    },
    {
      icon: <MessageCircle className="h-5 w-5" />,
      label: 'Messages Sent',
      value: analytics.messages.sent,
      change: '+8',
      changeType: 'positive' as const
    },
    {
      icon: <Users className="h-5 w-5" />,
      label: 'Matches',
      value: analytics.likes.matches,
      change: '+3',
      changeType: 'positive' as const
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Your Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-2 text-primary">
                  {stat.icon}
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
                <Badge variant="secondary" className="mt-1 text-xs">
                  {stat.change}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Profile Completeness</span>
                <span>{analytics.engagement.profileCompleteness}%</span>
              </div>
              <Progress value={analytics.engagement.profileCompleteness} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Response Rate</span>
                <span>{analytics.engagement.responseRate}%</span>
              </div>
              <Progress value={analytics.engagement.responseRate} className="h-2" />
            </div>
            
            <div className="pt-2">
              <div className="text-sm text-muted-foreground">Average Response Time</div>
              <div className="text-lg font-medium">{analytics.engagement.averageResponseTime}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Profile Views</span>
                <span className="font-medium">{analytics.profileViews.thisWeek}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">New Conversations</span>
                <span className="font-medium">7</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Messages Exchanged</span>
                <span className="font-medium">42</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">New Matches</span>
                <span className="font-medium">3</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Activity Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div>
                <div className="text-sm font-medium">New match with Sarah</div>
                <div className="text-xs text-muted-foreground">2 hours ago</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div>
                <div className="text-sm font-medium">Received 5 profile views</div>
                <div className="text-xs text-muted-foreground">1 day ago</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <div>
                <div className="text-sm font-medium">Updated profile photos</div>
                <div className="text-xs text-muted-foreground">3 days ago</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
