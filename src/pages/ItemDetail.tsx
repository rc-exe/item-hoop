import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ArrowUpDown, Heart, Share2, Flag, Star, Calendar, Eye, MessageSquare } from "lucide-react";
import { useParams } from "react-router-dom";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";

// Mock item data
const mockItem = {
  id: 1,
  title: "Vintage Canon AE-1 Camera",
  description: "Beautiful vintage Canon AE-1 35mm film camera in excellent working condition. This classic camera has been well-maintained and includes the original 50mm f/1.8 lens. Perfect for film photography enthusiasts or collectors. Some minor cosmetic wear as expected from age, but all functions work perfectly. Comes with camera strap and lens cap.",
  category: "Electronics",
  condition: "Good",
  images: [
    "/src/assets/sample-camera.jpg",
    "/src/assets/sample-camera.jpg",
    "/src/assets/sample-camera.jpg"
  ],
  owner: {
    name: "Sarah Chen",
    avatar: "/src/assets/sample-camera.jpg",
    rating: 4.8,
    totalExchanges: 23,
    joinedDate: "2023-06-15"
  },
  lookingFor: "Art supplies, vintage books, musical instruments, or photography equipment",
  postedDate: "2024-01-10",
  views: 127,
  isWishlisted: false,
  tags: ["vintage", "photography", "film camera", "canon"]
};

const relatedItems = [
  {
    id: 2,
    title: "Professional Headphones",
    image: "/src/assets/sample-camera.jpg",
    owner: "Mike Rodriguez"
  },
  {
    id: 3,
    title: "Art Supplies Set",
    image: "/src/assets/sample-books.jpg",
    owner: "Emma Wilson"
  },
  {
    id: 4,
    title: "Vintage Vinyl Records",
    image: "/src/assets/sample-guitar.jpg",
    owner: "Alex Johnson"
  }
];

const ItemDetail = () => {
  const { id } = useParams();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(mockItem.isWishlisted);
  const { toast } = useToast();

  const handleExchangeRequest = () => {
    toast({
      title: "Exchange request sent!",
      description: "Sarah Chen will be notified of your interest in this item.",
    });
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast({
      title: isWishlisted ? "Removed from wishlist" : "Added to wishlist",
      description: isWishlisted ? 
        "Item removed from your wishlist" : 
        "You'll be notified if this item becomes available for exchange",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-muted">
              <img 
                src={mockItem.images[currentImageIndex]} 
                alt={mockItem.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            {mockItem.images.length > 1 && (
              <div className="flex gap-2">
                {mockItem.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      currentImageIndex === index ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img 
                      src={image} 
                      alt={`${mockItem.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Item Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">{mockItem.title}</h1>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {mockItem.views} views
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Posted {mockItem.postedDate}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={handleWishlist}>
                    <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Flag className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-2 mb-4">
                <Badge variant="secondary">{mockItem.category}</Badge>
                <Badge variant="outline">{mockItem.condition}</Badge>
                {mockItem.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">#{tag}</Badge>
                ))}
              </div>
            </div>

            {/* Owner Info */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={mockItem.owner.avatar} />
                    <AvatarFallback>{mockItem.owner.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold">{mockItem.owner.name}</h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        {mockItem.owner.rating}
                      </span>
                      <span>{mockItem.owner.totalExchanges} exchanges</span>
                      <span>Joined {mockItem.owner.joinedDate}</span>
                    </div>
                  </div>
                  
                  <Button variant="outline" size="sm">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Exchange Actions */}
            <div className="space-y-3">
              <Button className="w-full" size="lg" onClick={handleExchangeRequest}>
                <ArrowUpDown className="w-5 h-5 mr-2" />
                Request Exchange
              </Button>
              <Button variant="outline" className="w-full">
                Make Offer
              </Button>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold mb-3">Description</h3>
              <p className="text-muted-foreground leading-relaxed">{mockItem.description}</p>
            </div>

            {/* Looking For */}
            <div>
              <h3 className="font-semibold mb-3">Owner is looking for</h3>
              <p className="text-muted-foreground">{mockItem.lookingFor}</p>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Related Items */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Other items from {mockItem.owner.name}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedItems.map((item) => (
              <Card key={item.id} className="group hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="aspect-square rounded-lg overflow-hidden mb-3 bg-muted">
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">by {item.owner}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ItemDetail;