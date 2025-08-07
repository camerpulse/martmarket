import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Award, 
  Package, 
  Star, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  FileText,
  Truck
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TesterProfile {
  id: string;
  tester_status: string;
  specialization: string[];
  reputation_score: number;
  samples_received: number;
  reports_submitted: number;
  quality_rating: number;
}

interface SampleRequest {
  id: string;
  status: string;
  sample_description: string;
  requested_at: string;
  assigned_at?: string;
  shipped_at?: string;
  received_at?: string;
  priority_level: string;
  estimated_value_usd?: number;
  products: {
    title: string;
    price_btc: number;
  };
  vendor_profiles: {
    store_name: string;
  };
}

const TesterDashboard = () => {
  const { user } = useAuth();
  const [testerProfile, setTesterProfile] = useState<TesterProfile | null>(null);
  const [sampleRequests, setSampleRequests] = useState<SampleRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user) {
      loadTesterData();
    }
  }, [user]);

  const loadTesterData = async () => {
    try {
      setLoading(true);
      
      // Load tester profile
      const { data: profileData, error: profileError } = await supabase
        .from('platform_testers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      setTesterProfile(profileData);

      // Load sample requests if tester exists
      if (profileData) {
        const { data: requestsData, error: requestsError } = await supabase
          .from('sample_requests')
          .select('*')
          .eq('tester_id', user.id)
          .order('created_at', { ascending: false });

        if (requestsError) throw requestsError;
        
        // Get additional data separately
        const requestsWithDetails = await Promise.all(
          requestsData?.map(async (request) => {
            const [productResult, vendorResult] = await Promise.all([
              supabase.from('products').select('title, price_btc').eq('id', request.product_id).single(),
              supabase.from('vendor_profiles').select('store_name').eq('vendor_id', request.vendor_id).single()
            ]);
            
            return {
              ...request,
              products: {
                title: productResult.data?.title || 'Unknown Product',
                price_btc: productResult.data?.price_btc || 0,
              },
              vendor_profiles: {
                store_name: vendorResult.data?.store_name || 'Unknown Vendor',
              },
            };
          }) || []
        );

        setSampleRequests(requestsWithDetails);
      }
    } catch (error) {
      console.error('Error loading tester data:', error);
      toast.error('Failed to load tester dashboard');
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (requestId: string, status: string) => {
    try {
      const updateData: any = { status };
      
      if (status === 'received') {
        updateData.received_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('sample_requests')
        .update(updateData)
        .eq('id', requestId);

      if (error) throw error;
      
      toast.success(`Sample request marked as ${status}`);
      loadTesterData();
    } catch (error) {
      console.error('Error updating request status:', error);
      toast.error('Failed to update request status');
    }
  };

  if (loading) {
    return <div className="container mx-auto p-6">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Please Login</h2>
            <p className="text-muted-foreground">
              You need to be logged in to access the tester dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!testerProfile) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Marketplace
            </Link>
          </Button>
        </div>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Become a Platform Tester</h2>
            <p className="text-muted-foreground mb-6">
              Join our exclusive tester program and help verify product quality while earning rewards.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-muted/20 rounded-lg">
                <Package className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Free Samples</h3>
                <p className="text-sm text-muted-foreground">
                  Receive free product samples from verified vendors
                </p>
              </div>
              <div className="p-4 bg-muted/20 rounded-lg">
                <Star className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Build Reputation</h3>
                <p className="text-sm text-muted-foreground">
                  Earn reputation points for quality testing reports
                </p>
              </div>
              <div className="p-4 bg-muted/20 rounded-lg">
                <Award className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Platform Impact</h3>
                <p className="text-sm text-muted-foreground">
                  Help maintain marketplace quality and trust
                </p>
              </div>
            </div>
            <Button 
              onClick={() => setActiveTab('apply')}
              className="mr-4"
            >
              Apply to Become a Tester
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Marketplace
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold mb-2">Tester Dashboard</h1>
              <p className="text-muted-foreground">Platform Quality Assurance</p>
            </div>
          </div>
          <Badge variant={
            testerProfile.tester_status === 'active' ? 'default' :
            testerProfile.tester_status === 'pending' ? 'secondary' : 'outline'
          }>
            {testerProfile.tester_status.charAt(0).toUpperCase() + testerProfile.tester_status.slice(1)} Tester
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="samples">Samples</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Reputation Score</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{testerProfile.reputation_score}</div>
                <Progress value={(testerProfile.reputation_score / 1000) * 100} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Samples Received</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{testerProfile.samples_received}</div>
                <p className="text-xs text-muted-foreground">
                  Total samples tested
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Reports Submitted</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{testerProfile.reports_submitted}</div>
                <p className="text-xs text-muted-foreground">
                  Quality reports filed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Quality Rating</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{testerProfile.quality_rating.toFixed(1)}</div>
                <p className="text-xs text-muted-foreground">
                  Out of 10.0
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Sample Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {sampleRequests.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No samples yet</h3>
                  <p className="text-muted-foreground">
                    You'll see your assigned sample requests here once vendors submit them.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sampleRequests.slice(0, 5).map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <Package className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div>
                          <h4 className="font-medium">{request.products?.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            by {request.vendor_profiles?.store_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Requested: {new Date(request.requested_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={
                          request.status === 'completed' ? 'default' :
                          request.status === 'shipped' ? 'secondary' :
                          request.status === 'assigned' ? 'outline' : 'secondary'
                        }>
                          {request.status}
                        </Badge>
                        {request.status === 'shipped' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-2"
                            onClick={() => updateRequestStatus(request.id, 'received')}
                          >
                            Mark as Received
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="samples" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Sample Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {sampleRequests.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No samples assigned</h3>
                  <p className="text-muted-foreground">
                    Wait for vendors to submit sample requests that match your specialization.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sampleRequests.map((request) => (
                    <Card key={request.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-lg">{request.products?.title}</h3>
                            <p className="text-muted-foreground">by {request.vendor_profiles?.store_name}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant={
                              request.status === 'completed' ? 'default' :
                              request.status === 'shipped' ? 'secondary' :
                              request.status === 'received' ? 'outline' : 'secondary'
                            }>
                              {request.status}
                            </Badge>
                            {request.priority_level === 'high' && (
                              <Badge variant="destructive" className="ml-2">High Priority</Badge>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-sm mb-4">{request.sample_description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Requested:</span>
                            <p className="text-muted-foreground">
                              {new Date(request.requested_at).toLocaleDateString()}
                            </p>
                          </div>
                          {request.assigned_at && (
                            <div>
                              <span className="font-medium">Assigned:</span>
                              <p className="text-muted-foreground">
                                {new Date(request.assigned_at).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                          {request.shipped_at && (
                            <div>
                              <span className="font-medium">Shipped:</span>
                              <p className="text-muted-foreground">
                                {new Date(request.shipped_at).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                          {request.estimated_value_usd && (
                            <div>
                              <span className="font-medium">Est. Value:</span>
                              <p className="text-muted-foreground">
                                ${request.estimated_value_usd}
                              </p>
                            </div>
                          )}
                        </div>

                        {request.status === 'shipped' && (
                          <div className="mt-4 pt-4 border-t">
                            <Button
                              onClick={() => updateRequestStatus(request.id, 'received')}
                              className="mr-2"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Mark as Received
                            </Button>
                          </div>
                        )}

                        {request.status === 'received' && (
                          <div className="mt-4 pt-4 border-t">
                            <Alert>
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription>
                                Please submit your testing report within 7 days of receiving the sample.
                              </AlertDescription>
                            </Alert>
                            <Button className="mt-2">
                              <FileText className="h-4 w-4 mr-2" />
                              Submit Test Report
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Testing Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No reports yet</h3>
                <p className="text-muted-foreground">
                  Your submitted testing reports will appear here.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tester Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Specialization Areas</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {testerProfile.specialization?.map((spec, index) => (
                      <Badge key={index} variant="outline">{spec}</Badge>
                    )) || <p className="text-muted-foreground">No specializations set</p>}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <p className="capitalize">{testerProfile.tester_status}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Quality Rating</label>
                    <p>{testerProfile.quality_rating.toFixed(1)}/10.0</p>
                  </div>
                </div>
                
                <Button variant="outline">Edit Profile</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TesterDashboard;