
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Bot, Send, Sparkles, MessageSquare, Heart, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function AIAssistant() {
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState([
    {
      id: 1,
      type: 'ai',
      content: "Hi! I'm your AI dating assistant. I can help you improve your profile, suggest conversation starters, or give dating advice. What would you like help with?",
      timestamp: new Date()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const { toast } = useToast();

  const suggestions = [
    {
      icon: <MessageSquare className="h-4 w-4" />,
      title: "Conversation Starters",
      description: "Get personalized icebreakers for your matches"
    },
    {
      icon: <Heart className="h-4 w-4" />,
      title: "Profile Optimization",
      description: "Tips to make your profile more attractive"
    },
    {
      icon: <Users className="h-4 w-4" />,
      title: "Dating Advice",
      description: "Expert guidance for successful connections"
    }
  ];

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = {
      id: conversation.length + 1,
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setConversation(prev => [...prev, userMessage]);
    setMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "Based on your interests, here are some great conversation starters: 'I noticed you love hiking - what's your favorite trail?' or 'Your travel photos are amazing! Which destination surprised you the most?'",
        "To improve your profile, I recommend adding more photos that show your personality and interests. Also, try writing a bio that tells a story rather than just listing facts.",
        "For successful dating, remember to be authentic, ask open-ended questions, and listen actively. Quality connections come from genuine interest in the other person.",
        "I see you're interested in meeting like-minded people. Consider joining group activities or events related to your hobbies - it's a natural way to connect with compatible people."
      ];

      const aiResponse = {
        id: conversation.length + 2,
        type: 'ai',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date()
      };

      setConversation(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 2000);
  };

  const handleSuggestionClick = (suggestion: typeof suggestions[0]) => {
    setMessage(`Help me with ${suggestion.title.toLowerCase()}`);
    toast({
      title: "Suggestion selected",
      description: `I'll help you with ${suggestion.title.toLowerCase()}`,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Dating Assistant
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <Sparkles className="h-3 w-3 mr-1" />
              Premium
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Get personalized advice and tips to improve your dating experience
          </p>
        </CardContent>
      </Card>

      {/* Quick Suggestions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {suggestions.map((suggestion, index) => (
          <Card 
            key={index} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleSuggestionClick(suggestion)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="text-primary">{suggestion.icon}</div>
                <div>
                  <h3 className="font-medium text-sm">{suggestion.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {suggestion.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chat Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Chat with AI Assistant</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Messages */}
            <div className="h-64 overflow-y-auto space-y-3 p-3 bg-gray-50 rounded-lg">
              {conversation.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      msg.type === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-white border'
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <div className={`text-xs mt-1 ${
                      msg.type === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    }`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border p-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask me anything about dating..."
                className="flex-1"
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!message.trim() || isTyping}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
