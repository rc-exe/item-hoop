import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Package, ArrowUpDown, Bell, Star, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";

// Mock data
const userItems = [
  {
    id: 1,
    title: "Vintage Camera",
    category: "Electronics",
    status: "available",
    views: 24,
    requests: 3,
    image: "/src/assets/sample-camera.jpg"
  },
  {
    id: 2,
    title: "Guitar",
    category: "Musical Instruments", 
    status: "exchanged",
    views: 18,
    requests: 5,
    image: "/src/assets/sample-guitar.jpg"
  }
];

const exchangeRequests = [
  {
    id: 1,
    itemRequested: "Vintage Camera",
    itemOffered: "Professional Headphones",
    requesterName: "Sarah Chen",
    status: "pending",
    date: "2024-01-15"
  },
  {
    id: 2,
    itemRequested: "Guitar",
    itemOffered: "Art Supplies Set",
    requesterName: "Mike Rodriguez",
    status: "accepted",
    date: "2024-01-12"
  }
];

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="hero-title text-3xl text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Manage your items and exchanges</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">+2 from last month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Exchanges</CardTitle>
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">2 pending requests</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">142</div>
              <p className="text-xs text-muted-foreground">+15% this week</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.8</div>
              <p className="text-xs text-muted-foreground">Based on 15 reviews</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="items" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="items">My Items</TabsTrigger>
            <TabsTrigger value="requests">Exchange Requests</TabsTrigger>
            <TabsTrigger value="history">Exchange History</TabsTrigger>
          </TabsList>

          <TabsContent value="items" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="section-title text-xl">Your Listed Items</h2>
              <Link to="/list-item">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Item
                </Button>
              </Link>
            </div>

            <div className="grid gap-6">
              {userItems.map((item) => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <img 
                        src={item.image} 
                        alt={item.title}
                        className="w-24 h-24 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-lg">{item.title}</h3>
                          <Badge variant={item.status === 'available' ? 'default' : 'secondary'}>
                            {item.status}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-3">{item.category}</p>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <span>{item.views} views</span>
                          <span>{item.requests} requests</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button variant="ghost" size="sm">View</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="requests" className="space-y-6">
            <h2 className="text-xl font-semibold">Exchange Requests</h2>
            
            <div className="grid gap-4">
              {exchangeRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{request.requesterName}</h3>
                          <Badge variant={request.status === 'pending' ? 'outline' : 'default'}>
                            {request.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Wants to exchange <strong>{request.itemOffered}</strong> for your <strong>{request.itemRequested}</strong>
                        </p>
                        <p className="text-xs text-muted-foreground">{request.date}</p>
                      </div>
                      {request.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">Decline</Button>
                          <Button size="sm">Accept</Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <h2 className="text-xl font-semibold">Exchange History</h2>
            <Card>
              <CardContent className="p-6 text-center">
                <ArrowUpDown className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No completed exchanges yet</h3>
                <p className="text-muted-foreground">Start exchanging items to see your history here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;