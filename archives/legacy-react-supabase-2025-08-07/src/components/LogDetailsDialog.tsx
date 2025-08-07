import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Eye, 
  Code, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock,
  FileText,
  Settings,
  Undo2,
  Play
} from 'lucide-react';

interface LogDetailsDialogProps {
  log: {
    id: string;
    action_type: string;
    severity: string;
    title: string;
    description: string;
    created_at: string;
    success: boolean;
    risk_level: number;
    error_details?: any;
    fix_applied?: any;
    rollback_data?: any;
    rollback_available?: boolean;
    target_system?: string;
    execution_time_ms?: number;
  };
  onRollback?: (logId: string) => void;
  onReApply?: (logId: string) => void;
}

export function LogDetailsDialog({ log, onRollback, onReApply }: LogDetailsDialogProps) {
  const [open, setOpen] = useState(false);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500 bg-red-100';
      case 'warning': return 'text-amber-500 bg-amber-100';
      case 'info': return 'text-blue-500 bg-blue-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  const formatJson = (obj: any) => {
    if (!obj) return 'No data available';
    return JSON.stringify(obj, null, 2);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {log.success ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            {log.title}
            <Badge className={getSeverityColor(log.severity)} variant="secondary">
              {log.severity}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Error Details</TabsTrigger>
            <TabsTrigger value="fix">Fix Applied</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Action Type:</span>
                    <span className="font-medium">{log.action_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Risk Level:</span>
                    <span className="font-medium">{log.risk_level}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Target System:</span>
                    <span className="font-medium">{log.target_system || 'General'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Execution Time:</span>
                    <span className="font-medium">{log.execution_time_ms || 'N/A'}ms</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Timeline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Created: {new Date(log.created_at).toLocaleString()}</span>
                  </div>
                  {log.rollback_available && (
                    <div className="flex items-center gap-2 text-sm text-amber-600">
                      <Undo2 className="h-4 w-4" />
                      <span>Rollback Available</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{log.description}</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Error Details
                </CardTitle>
                <CardDescription>Technical details about the error or issue</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] w-full">
                  <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto">
                    {formatJson(log.error_details)}
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fix">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Fix Applied
                </CardTitle>
                <CardDescription>Details about the automated fix that was applied</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] w-full">
                  <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto">
                    {formatJson(log.fix_applied)}
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actions" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {log.rollback_available && onRollback && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-amber-600">Rollback Available</CardTitle>
                    <CardDescription>Undo the changes made by this action</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      variant="outline" 
                      onClick={() => onRollback(log.id)}
                      className="w-full"
                    >
                      <Undo2 className="h-4 w-4 mr-2" />
                      Rollback Changes
                    </Button>
                  </CardContent>
                </Card>
              )}

              {onReApply && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Re-apply Fix</CardTitle>
                    <CardDescription>Apply the same fix again if needed</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      variant="outline" 
                      onClick={() => onReApply(log.id)}
                      className="w-full"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Re-apply Fix
                    </Button>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Export Data</CardTitle>
                  <CardDescription>Download log data for analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      const data = JSON.stringify(log, null, 2);
                      const blob = new Blob([data], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `heavenly-fire-log-${log.id}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="w-full"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Download JSON
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}