
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, AlertTriangle, Flag, Eye, Lock, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function SafetyCenter() {
  const [reportType, setReportType] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const { toast } = useToast();

  const safetyFeatures = [
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Profile Verification',
      description: 'Verify your identity to build trust',
      action: 'Verify Now'
    },
    {
      icon: <Eye className="h-6 w-6" />,
      title: 'Privacy Controls',
      description: 'Control who can see your profile and information',
      action: 'Manage Privacy'
    },
    {
      icon: <Lock className="h-6 w-6" />,
      title: 'Block & Report',
      description: 'Block users and report inappropriate behavior',
      action: 'Learn More'
    },
    {
      icon: <Phone className="h-6 w-6" />,
      title: 'Emergency Contacts',
      description: 'Add trusted contacts for safety check-ins',
      action: 'Add Contacts'
    }
  ];

  const handleReport = () => {
    if (!reportType || !reportDetails.trim()) {
      toast({
        title: "Please fill all fields",
        description: "Report type and details are required",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Report submitted",
      description: "Thank you for helping keep our community safe. We'll review this report.",
    });

    setReportType('');
    setReportDetails('');
  };

  return (
    <div className="space-y-6">
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Shield className="h-5 w-5" />
            Safety Center
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-blue-700">
            Your safety is our priority. Use these tools to stay safe while connecting with others.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {safetyFeatures.map((feature, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="text-primary">{feature.icon}</div>
                <div className="flex-1">
                  <h3 className="font-medium mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{feature.description}</p>
                  <Button variant="outline" size="sm">
                    {feature.action}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5" />
            Report Something
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">What would you like to report?</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="harassment">Harassment or bullying</SelectItem>
                  <SelectItem value="fake-profile">Fake profile</SelectItem>
                  <SelectItem value="inappropriate-content">Inappropriate content</SelectItem>
                  <SelectItem value="spam">Spam or scam</SelectItem>
                  <SelectItem value="safety-concern">Safety concern</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Details</label>
              <Textarea
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                placeholder="Please provide details about what you're reporting..."
                className="mt-1"
                rows={4}
              />
            </div>

            <Button onClick={handleReport} className="w-full">
              Submit Report
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-800">Safety Tips</h4>
              <ul className="text-sm text-amber-700 mt-2 space-y-1">
                <li>• Meet in public places for first dates</li>
                <li>• Tell friends about your plans</li>
                <li>• Trust your instincts</li>
                <li>• Don't share personal information too quickly</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
