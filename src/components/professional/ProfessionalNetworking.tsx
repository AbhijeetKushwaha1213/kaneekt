
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Briefcase, Building, Users, Handshake, Search, Filter } from 'lucide-react';
import { UserCard } from '@/components/ui/user-card';
import { USERS } from '@/data/mock-data';

export function ProfessionalNetworking() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('all');

  const industries = [
    'Technology', 'Healthcare', 'Finance', 'Education', 'Marketing',
    'Design', 'Engineering', 'Sales', 'Consulting', 'Media'
  ];

  const networkingEvents = [
    {
      id: 1,
      title: 'Tech Professionals Mixer',
      date: '2024-02-15',
      location: 'Innovation Hub',
      attendees: 45,
      industry: 'Technology'
    },
    {
      id: 2,
      title: 'Healthcare Leaders Summit',
      date: '2024-02-20',
      location: 'Medical Center',
      attendees: 30,
      industry: 'Healthcare'
    },
    {
      id: 3,
      title: 'Finance & Investment Forum',
      date: '2024-02-25',
      location: 'Business District',
      attendees: 60,
      industry: 'Finance'
    }
  ];

  const professionalUsers = USERS.map(user => ({
    ...user,
    industry: industries[Math.floor(Math.random() * industries.length)],
    position: [
      'Software Engineer', 'Product Manager', 'Designer', 'Marketing Manager',
      'Sales Director', 'Data Scientist', 'Consultant', 'Analyst'
    ][Math.floor(Math.random() * 8)],
    company: [
      'TechCorp', 'InnovateLab', 'DesignStudio', 'DataDriven Inc.',
      'SalesForce Pro', 'Consulting Partners', 'Creative Agency'
    ][Math.floor(Math.random() * 7)]
  }));

  const filteredUsers = professionalUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.position.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesIndustry = selectedIndustry === 'all' || user.industry === selectedIndustry;
    return matchesSearch && matchesIndustry;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Professional Networking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Connect with professionals in your industry and expand your network
          </p>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, industry, or position..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">All Industries</option>
                {industries.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Networking Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Upcoming Networking Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {networkingEvents.map(event => (
              <Card key={event.id} className="border-l-4 border-l-primary">
                <CardContent className="p-4">
                  <h3 className="font-medium mb-2">{event.title}</h3>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div>📅 {new Date(event.date).toLocaleDateString()}</div>
                    <div>📍 {event.location}</div>
                    <div>👥 {event.attendees} attendees</div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <Badge variant="secondary">{event.industry}</Badge>
                    <Button size="sm">Join Event</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Professional Connections */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Handshake className="h-5 w-5" />
            Professionals Near You ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No professionals found matching your criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredUsers.slice(0, 12).map(user => (
                <div key={user.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{user.name}</h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {user.position}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-sm">
                      <Building className="h-3 w-3" />
                      <span className="truncate">{user.company}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {user.industry}
                    </Badge>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">Connect</Button>
                    <Button size="sm" variant="outline" className="flex-1">Message</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
