import React, { useState, useEffect } from 'react';
import { supabase } from '@/api/supabaseClient';
import { profilesApi, friendsApi, notificationsApi } from '@/api/supabaseClient';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Search, UserPlus, UserCheck, UserX, Shield, Star, Trophy, Swords, X } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import UserProfileModal from '@/components/social/UserProfileModal';

const AVATAR_PRESETS = {
  avatar1:'🦁', avatar2:'🐯', avatar3:'🦊', avatar4:'🐺', avatar5:'🦅',
  avatar6:'🐉', avatar7:'🦄', avatar8:'🐻', avatar9:'🦈', avatar10:'🍆',
  avatar11:'🐸', avatar12:'🦉',
};

function AvatarDisplay({ profile, size = 'md' }) {
  const sizeClass = size === 'sm' ? 'w-9 h-9 text-lg' : 'w-11 h-11 text-2xl';
  if (profile?.custom_avatar_url) {
    return <Avatar className={sizeClass}><AvatarImage src={profile.custom_avatar_url} /><AvatarFallback>{AVATAR_PRESETS[profile.avatar_id] || '🦁'}</AvatarFallback></Avatar>;
  }
  return <div className={`${sizeClass} rounded-full bg-muted flex items-center justify-center`}>{AVATAR_PRESETS[profile?.avatar_id] || '🦁'}</div>;
}

export default function Friends() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [viewProfile, setViewProfile] = useState(null);
  const [myProfile, setMyProfile] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (user?.id) {
      profilesApi.getByUserId(user.id).then(setMyProfile).catch(() => {});
    }
  }, [user?.id]);

  const { data: friends = [] } = useQuery({
    queryKey: ['friends', user?.id],
    queryFn: () => friendsApi.getMyFriends(user.id),
    enabled: !!user?.id,
  });

  const { data: pendingRequests = [] } = useQuery({
    queryKey: ['friend-requests', user?.id],
    queryFn: () => friendsApi.getPendingReceived(user.id),
    enabled: !!user?.id,
  });

  // Get profiles for pending requesters
  const { data: pendingProfiles = [] } = useQuery({
    queryKey: ['pending-profiles', pendingRequests.map(r => r.requester_id)],
    queryFn: async () => {
      if (!pendingRequests.length) return [];
      const ids = pendingRequests.map(r => r.requester_id);
      const { data } = await supabase.from('user_profiles').select('*').in('created_by', ids);
      return data || [];
    },
    enabled: pendingRequests.length > 0,
  });

  // Get profiles for accepted friends
  const { data: friendProfiles = [] } = useQuery({
    queryKey: ['friend-profiles', friends.map(f => f.id)],
    queryFn: async () => {
      if (!friends.length) return [];
      const otherIds = friends.map(f => f.requester_id === user.id ? f.recipient_id : f.requester_id);
      const { data } = await supabase.from('user_profiles').select('*').in('created_by', otherIds);
      return data || [];
    },
    enabled: friends.length > 0,
  });

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const results = await profilesApi.searchByUsername(searchQuery.trim());
      setSearchResults(results.filter(p => p.created_by !== user?.id));
    } catch { toast.error('Search failed'); }
    finally { setIsSearching(false); }
  };

  const handleAddFriend = async (targetProfile) => {
    try {
      const rel = await friendsApi.getRelationship(user.id, targetProfile.created_by);
      if (rel) { toast.info('Friend request already exists'); return; }
      await friendsApi.sendRequest(user.id, targetProfile.created_by);
      await notificationsApi.send({
        recipient_id: targetProfile.created_by,
        sender_id: user.id,
        sender_username: myProfile?.username || 'Someone',
        type: 'friend_request',
        title: 'New Friend Request',
        body: `@${myProfile?.username || 'Someone'} sent you a friend request!`,
        read: false,
      });
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      toast.success(`Friend request sent to @${targetProfile.username}!`);
    } catch (err) {
      toast.error('Failed to send friend request');
    }
  };

  const handleAccept = async (friendRow) => {
    try {
      await friendsApi.accept(friendRow.id);
      const senderProfile = pendingProfiles.find(p => p.created_by === friendRow.requester_id);
      await notificationsApi.send({
        recipient_id: friendRow.requester_id,
        sender_id: user.id,
        sender_username: myProfile?.username,
        type: 'friend_accepted',
        title: 'Friend Request Accepted',
        body: `@${myProfile?.username} accepted your friend request!`,
        read: false,
      });
      queryClient.invalidateQueries({ queryKey: ['friends', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['friend-requests', user?.id] });
      toast.success('Friend request accepted!');
    } catch { toast.error('Failed to accept request'); }
  };

  const handleDecline = async (friendRow) => {
    try {
      await friendsApi.remove(friendRow.id);
      queryClient.invalidateQueries({ queryKey: ['friend-requests', user?.id] });
      toast.success('Request declined');
    } catch { toast.error('Failed to decline'); }
  };

  const handleBlock = async (friendRow) => {
    try {
      await friendsApi.block(friendRow.id);
      queryClient.invalidateQueries({ queryKey: ['friends', user?.id] });
      toast.success('User blocked');
    } catch { toast.error('Failed to block'); }
  };

  const handleRemoveFriend = async (friendRow) => {
    try {
      await friendsApi.remove(friendRow.id);
      queryClient.invalidateQueries({ queryKey: ['friends', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['friend-profiles'] });
      toast.success('Friend removed');
    } catch { toast.error('Failed to remove friend'); }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6 pb-24 md:pb-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <Users className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-heading font-bold">Friends</h1>
        </div>
        <p className="text-sm text-muted-foreground">Search players, add friends, manage your squad</p>
      </motion.div>

      {/* Search */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><Search className="w-4 h-4 text-primary" /> Find Players</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Search by username..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={isSearching} size="sm">
              {isSearching ? <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : <Search className="w-4 h-4" />}
            </Button>
          </div>
          {searchResults.length > 0 && (
            <div className="mt-3 space-y-2">
              {searchResults.map(profile => (
                <div key={profile.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                  <button onClick={() => setViewProfile(profile)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
                    <AvatarDisplay profile={profile} />
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{profile.display_name}</p>
                      <p className="text-xs text-muted-foreground">@{profile.username}</p>
                    </div>
                    <div className="flex gap-1 ml-auto">
                      <Badge variant="secondary" className="text-xs">Lv {profile.level}</Badge>
                      <Badge variant="outline" className="text-xs">{profile.xp} XP</Badge>
                    </div>
                  </button>
                  <Button size="sm" variant="outline" onClick={() => handleAddFriend(profile)} className="gap-1 flex-shrink-0">
                    <UserPlus className="w-3.5 h-3.5" /> Add
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs: Friends / Requests */}
      <Tabs defaultValue="friends">
        <TabsList className="w-full">
          <TabsTrigger value="friends" className="flex-1">
            Friends {friendProfiles.length > 0 && <Badge className="ml-1.5 text-xs" variant="secondary">{friendProfiles.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex-1">
            Requests {pendingRequests.length > 0 && <Badge className="ml-1.5 text-xs bg-primary text-primary-foreground">{pendingRequests.length}</Badge>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="friends" className="mt-4 space-y-2">
          {friendProfiles.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No friends yet. Search for players to add!</p>
            </div>
          ) : (
            friendProfiles.map(profile => {
              const friendRow = friends.find(f =>
                f.requester_id === profile.created_by || f.recipient_id === profile.created_by
              );
              return (
                <div key={profile.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:border-primary/20 transition-all">
                  <button onClick={() => setViewProfile(profile)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
                    <AvatarDisplay profile={profile} />
                    <div className="min-w-0">
                      <p className="font-medium text-sm">{profile.display_name}</p>
                      <p className="text-xs text-muted-foreground">@{profile.username}</p>
                    </div>
                    <div className="flex gap-1 ml-auto mr-2">
                      <Badge variant="secondary" className="text-xs">Lv {profile.level}</Badge>
                      <Badge variant="outline" className="text-xs hidden sm:inline-flex">{profile.xp} XP</Badge>
                    </div>
                  </button>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="w-8 h-8 text-muted-foreground hover:text-destructive" onClick={() => handleRemoveFriend(friendRow)}>
                      <X className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="w-8 h-8 text-muted-foreground hover:text-amber-500" onClick={() => handleBlock(friendRow)}>
                      <Shield className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="requests" className="mt-4 space-y-2">
          {pendingRequests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <UserPlus className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No pending friend requests</p>
            </div>
          ) : (
            pendingRequests.map(req => {
              const senderProfile = pendingProfiles.find(p => p.created_by === req.requester_id);
              return (
                <div key={req.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
                  <button onClick={() => senderProfile && setViewProfile(senderProfile)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
                    <AvatarDisplay profile={senderProfile} />
                    <div>
                      <p className="font-medium text-sm">{senderProfile?.display_name || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">@{senderProfile?.username || '...'}</p>
                    </div>
                  </button>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleAccept(req)} className="gap-1">
                      <UserCheck className="w-3.5 h-3.5" /> Accept
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDecline(req)} className="gap-1">
                      <UserX className="w-3.5 h-3.5" /> Decline
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </TabsContent>
      </Tabs>

      {viewProfile && (
        <UserProfileModal profile={viewProfile} onClose={() => setViewProfile(null)} currentUserId={user?.id} myProfile={myProfile} />
      )}
    </div>
  );
}
