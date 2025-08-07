import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Brain, Settings, Activity } from 'lucide-react';

export const ComprehensiveAIManagement = () => {
  const [aiSystems] = useState([
    { id: '1', name: 'Recommendation Engine', status: 'active', performance: 94.5 },
    { id: '2', name: 'Fraud Detection', status: 'active', performance: 97.2 },
    { id: '3', name: 'Price Optimization', status: 'training', performance: 88.1 },
  ]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI System Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {aiSystems.map((system) => (
            <div key={system.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">{system.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={system.status === 'active' ? 'default' : 'secondary'}>
                    {system.status}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Performance: {system.performance}%
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline">
                  <Settings className="h-4 w-4" />
                </Button>
                <Switch checked={system.status === 'active'} />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};