import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { MessageCircle, Star, CheckCircle, Clock, Check, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './ui/use-toast';
import { ChatWindow } from './ChatWindow';
import { toast as sonnerToast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';

interface Exchange {
  id: string;
  status: string;
  created_at: string;
  owner_item: {
    title: string;
    images: string[];
  };
  requester_item?: {
    title: string;
    images: string[];
  };
  owner: {
    id: string;
    username: string;
    avatar_url: string;
  };
  requester: {
    id: string;
    username: string;
    avatar_url: string;
  };
  message?: string;
}

interface ExchangeManagementProps {
  exchange: Exchange;
  currentUserId: string;
  onUpdate: () => void;
}

export const ExchangeManagement = ({ exchange, currentUserId, onUpdate }: ExchangeManagementProps) => {
  const { toast } = useToast();
  const [showChat, setShowChat] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('');
  const [rating, setRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [loading, setLoading] = useState(false);

  const isOwner = exchange.owner.id === currentUserId;
  const otherUser = isOwner ? exchange.requester : exchange.owner;

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary', text: 'Pending' },
      accepted: { variant: 'default', text: 'Accepted' },
      rejected: { variant: 'destructive', text: 'Rejected' },
      completed: { variant: 'default', text: 'Completed' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <Badge variant={config.variant as any}>
        {config.text}
      </Badge>
    );
  };

  const completeExchange = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('complete-exchange', {
        body: {
          exchange_id: exchange.id,
          completion_notes: completionNotes
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Exchange marked as completed",
      });
      
      onUpdate();
    } catch (error) {
      console.error('Error completing exchange:', error);
      toast({
        title: "Error",
        description: "Failed to complete exchange",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExchangeResponse = async (action: 'accept' | 'reject') => {
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('respond-to-exchange', {
        body: { exchange_id: exchange.id, action }
      });

      if (error) throw error;
      
      sonnerToast.success(`Exchange request ${action}ed successfully`);
      onUpdate();
    } catch (error) {
      console.error(`Error ${action}ing exchange:`, error);
      sonnerToast.error(`Failed to ${action} exchange request`);
    } finally {
      setLoading(false);
    }
  };

  const rateExchange = async () => {
    if (rating === 0) {
      toast({
        title: "Error",
        description: "Please select a rating",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('rate-exchange', {
        body: {
          exchange_id: exchange.id,
          rating,
          comment: ratingComment
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Rating submitted successfully",
      });
      
      onUpdate();
    } catch (error) {
      console.error('Error rating exchange:', error);
      toast({
        title: "Error",
        description: "Failed to submit rating",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg">
                {exchange.owner_item.title} 
                {exchange.requester_item && ` ↔ ${exchange.requester_item.title}`}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                With {otherUser.username}
              </p>
            </div>
            {getStatusBadge(exchange.status)}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {exchange.message && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm">{exchange.message}</p>
            </div>
          )}

          <div className="flex items-center flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowChat(true)}
              className="flex items-center space-x-1"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Chat</span>
            </Button>

            {exchange.status === 'pending' && isOwner && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExchangeResponse('reject')}
                  disabled={loading}
                  className="flex items-center space-x-1"
                >
                  <X className="h-4 w-4" />
                  <span>Decline</span>
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleExchangeResponse('accept')}
                  disabled={loading}
                  className="flex items-center space-x-1"
                >
                  <Check className="h-4 w-4" />
                  <span>Accept</span>
                </Button>
              </>
            )}

            {exchange.status === 'pending' && !isOwner && (
              <Badge variant="secondary" className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>Awaiting response</span>
              </Badge>
            )}

            {exchange.status === 'accepted' && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" className="flex items-center space-x-1">
                    <CheckCircle className="h-4 w-4" />
                    <span>Complete</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Complete Exchange</DialogTitle>
                    <DialogDescription>
                      Mark this exchange as completed. Both parties will be notified.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="notes">Completion Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        value={completionNotes}
                        onChange={(e) => setCompletionNotes(e.target.value)}
                        placeholder="Add any notes about the exchange..."
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={completeExchange} disabled={loading}>
                      {loading ? 'Completing...' : 'Complete Exchange'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            {exchange.status === 'completed' && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center space-x-1">
                    <Star className="h-4 w-4" />
                    <span>Rate</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Rate Your Experience</DialogTitle>
                    <DialogDescription>
                      How was your exchange with {otherUser.username}?
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Rating</Label>
                      <div className="flex space-x-1 mt-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Button
                            key={star}
                            variant={rating >= star ? "default" : "outline"}
                            size="sm"
                            onClick={() => setRating(star)}
                          >
                            <Star className="h-4 w-4" />
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="comment">Comment (Optional)</Label>
                      <Textarea
                        id="comment"
                        value={ratingComment}
                        onChange={(e) => setRatingComment(e.target.value)}
                        placeholder="Share your experience..."
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={rateExchange} disabled={loading}>
                      {loading ? 'Submitting...' : 'Submit Rating'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardContent>
      </Card>

      {showChat && (
        <ChatWindow
          receiverId={otherUser.id}
          receiverName={otherUser.username}
          receiverAvatar={otherUser.avatar_url}
          exchangeId={exchange.id}
          onClose={() => setShowChat(false)}
        />
      )}
    </>
  );
};