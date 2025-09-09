import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Star, Calendar, MapPin, Package, ArrowUpDown, MessageSquare, Settings } from "lucide-react";
import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";

// Mock user data
const mockUser = {
  id: 1,
  name: "Sarah Chen",
  username: "@sarahc",
  avatar: "/src/assets/sample-camera.jpg",
  bio: "Photography enthusiast and vintage collector. Love finding unique items and giving them new life through exchanges!",
  location: "San Francisco, CA",
  joinedDate: "June 2023",
  rating: 4.8,
  totalExchanges: 23,
  activeItems: 8,
  stats: {
    totalItems: 45,
    successfulExchanges: 23,
    rating: 4.8,
    responseTime: "2 hours"
  }
};

const userItems = [
  {
    id: 1,
    title: "Vintage Canon Camera",
    category: "Electronics",
    image: "/src/assets/sample-camera.jpg",
    status: "available",
    views: 127,
    requests: 3
  },
  {
    id: 2,
    title: "Art Supply Set",
    category: "Art & Crafts",
    image: "/src/assets/sample-books.jpg",
    status: "exchanged",
    views: 89,
    requests: 5
  },
  {
    id: 3,
    title: "Vintage Vinyl Records",
    category: "Music",
    image: "/src/assets/sample-guitar.jpg",
    status: "available",
    views: 156,
    requests: 7
  },
  {
    id: 4,
    title: "Designer Handbag",
    category: "Fashion",
    image: "/src/assets/sample-camera.jpg",
    status: "pending",
    views: 203,
    requests: 12
  }
];

const reviews = [
  {
    id: 1,
    reviewer: "Mike Rodriguez",
    rating: 5,
    comment: "Great communication and the item was exactly as described. Smooth exchange!",
    date: "2024-01-08",
    itemExchanged: "Vintage Camera for Art Supplies"
  },
  {
    id: 2,
    reviewer: "Emma Wilson",
    rating: 5,
    comment: "Sarah was very responsive and the exchange went perfectly. Highly recommend!",
    date: "2024-01-02",
    itemExchanged: "Books for Photography Equipment"
  },
  {
    id: 3,
    reviewer: "Alex Johnson",
    rating: 4,
    comment: "Item was in good condition as promised. Would exchange again.",
    date: "2023-12-20",
    itemExchanged: "Musical Instrument for Electronics"
  }
];

const Profile = () => {
  const { username } = useParams();
  const isOwnProfile = !username; // If no username in URL, it's the current user's profile

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex flex-col items-center md:items-start">
                <Avatar className="w-24 h-24 mb-4">
                  <AvatarImage src={mockUser.avatar} />
                  <AvatarFallback className="text-2xl">SC</AvatarFallback>
                </Avatar>
                
                <div className="text-center md:text-left">
                  <h1 className="text-2xl font-bold mb-1">{mockUser.name}</h1>
                  <p className="text-muted-foreground mb-2">{mockUser.username}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {mockUser.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Joined {mockUser.joinedDate}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 mb-4">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{mockUser.rating}</span>
                    <span className="text-muted-foreground">({mockUser.totalExchanges} exchanges)</span>
                  </div>
                </div>
              </div>

              <div className="flex-1">
                <div className="mb-4">
                  <p className="text-muted-foreground leading-relaxed">{mockUser.bio}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">{mockUser.stats.totalItems}</div>
                    <div className="text-xs text-muted-foreground">Total Items</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">{mockUser.stats.successfulExchanges}</div>
                    <div className="text-xs text-muted-foreground">Exchanges</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">{mockUser.stats.rating}</div>
                    <div className="text-xs text-muted-foreground">Rating</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">{mockUser.stats.responseTime}</div>
                    <div className="text-xs text-muted-foreground">Response Time</div>
                  </div>
                </div>

                <div className="flex gap-3">
                  {isOwnProfile ? (
                    <Button variant="outline">
                      <Settings className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <>
                      <Button>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Message
                      </Button>
                      <Button variant="outline">
                        <ArrowUpDown className="w-4 h-4 mr-2" />
                        Propose Exchange
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Content */}
        <Tabs defaultValue="items" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="items">Items ({userItems.length})</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="items" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userItems.map((item) => (
                <Card key={item.id} className="group hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="aspect-square rounded-lg overflow-hidden mb-3 bg-muted relative">
                      <img 
                        src={item.image} 
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <Badge 
                        className="absolute top-2 right-2" 
                        variant={item.status === 'available' ? 'default' : 
                                item.status === 'exchanged' ? 'secondary' : 'outline'}
                      >
                        {item.status}
                      </Badge>
                    </div>
                    
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{item.category}</p>
                    
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{item.views} views</span>
                      <span>{item.requests} requests</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold">{review.reviewer}</h3>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${
                              i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
                            }`} 
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">{review.date}</span>
                  </div>
                  
                  <p className="text-muted-foreground mb-2">{review.comment}</p>
                  <p className="text-xs text-muted-foreground">Exchange: {review.itemExchanged}</p>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest exchanges and interactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <Package className="w-5 h-5 text-primary" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Listed new item: Vintage Camera</p>
                      <p className="text-xs text-muted-foreground">2 days ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <ArrowUpDown className="w-5 h-5 text-green-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Completed exchange with Mike Rodriguez</p>
                      <p className="text-xs text-muted-foreground">1 week ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Received 5-star review from Emma Wilson</p>
                      <p className="text-xs text-muted-foreground">2 weeks ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Profile;