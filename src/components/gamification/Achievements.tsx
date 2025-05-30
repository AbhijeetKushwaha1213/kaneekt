
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, Target, Zap, Heart, MessageCircle, Users, Calendar } from 'lucide-react';

export function Achievements() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const achievements = [
    {
      id: 'first_match',
      title: 'First Connection',
      description: 'Made your first match',
      icon: <Heart className="h-6 w-6" />,
      progress: 100,
      completed: true,
      category: 'social',
      points: 50,
      rarity: 'common'
    },
    {
      id: 'conversationalist',
      title: 'Conversationalist',
      description: 'Send 100 messages',
      icon: <MessageCircle className="h-6 w-6" />,
      progress: 75,
      completed: false,
      category: 'communication',
      points: 100,
      rarity: 'rare'
    },
    {
      id: 'popular',
      title: 'Popular Profile',
      description: 'Receive 50 likes',
      icon: <Star className="h-6 w-6" />,
      progress: 90,
      completed: false,
      category: 'profile',
      points: 150,
      rarity: 'rare'
    },
    {
      id: 'social_butterfly',
      title: 'Social Butterfly',
      description: 'Join 5 group events',
      icon: <Users className="h-6 w-6" />,
      progress: 40,
      completed: false,
      category: 'events',
      points: 200,
      rarity: 'epic'
    },
    {
      id: 'streak_master',
      title: 'Streak Master',
      description: 'Log in for 30 consecutive days',
      icon: <Zap className="h-6 w-6" />,
      progress: 60,
      completed: false,
      category: 'engagement',
      points: 300,
      rarity: 'legendary'
    }
  ];

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'social', label: 'Social' },
    { id: 'communication', label: 'Communication' },
    { id: 'profile', label: 'Profile' },
    { id: 'events', label: 'Events' },
    { id: 'engagement', label: 'Engagement' }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory);

  const totalPoints = achievements.filter(a => a.completed).reduce((sum, a) => sum + a.points, 0);
  const completedCount = achievements.filter(a => a.completed).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{totalPoints}</div>
              <div className="text-sm text-muted-foreground">Total Points</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{completedCount}/{achievements.length}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">#{Math.floor(Math.random() * 1000) + 1}</div>
              <div className="text-sm text-muted-foreground">Global Rank</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAchievements.map(achievement => (
              <Card 
                key={achievement.id} 
                className={`relative ${achievement.completed ? 'bg-green-50 border-green-200' : ''}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${achievement.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{achievement.title}</h3>
                        <Badge className={`text-xs ${getRarityColor(achievement.rarity)} text-white`}>
                          {achievement.rarity}
                        </Badge>
                        {achievement.completed && (
                          <Badge className="text-xs bg-green-500 text-white">
                            ✓ Completed
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {achievement.description}
                      </p>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Progress</span>
                          <span>{achievement.progress}%</span>
                        </div>
                        <Progress value={achievement.progress} className="h-2" />
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-muted-foreground">
                          {achievement.points} points
                        </span>
                        {achievement.completed && (
                          <span className="text-xs text-green-600 font-medium">
                            Earned!
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
