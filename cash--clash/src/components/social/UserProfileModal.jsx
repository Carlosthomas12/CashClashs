import React, { useEffect, useState } from 'react';
import { friendsApi, notificationsApi } from '@/api/supabaseClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserPlus, UserCheck, Shield, Star, Trophy, Swords, Zap } from 'lucide-react';
import { toast } from 'sonner';

const AVATAR_PRESETS = {
  avatar1:'🦁', avatar2:'🐯', avatar3:'🦊', avatar4:'🐺', avatar5:'🦅',
  avatar6:'🐉', avatar7:'🦄', avatar8:'🐻', avatar9:'🦈', avatar10:'🍆',
  avatar11:'🐸', avatar12:'🦉',
};

const BADGE_LABELS = {
  first_save: { emoji: '💰', label: 'First Save' },
  streak_7: { emoji: '🔥', label: '7-Day Streak' },
  streak_30: { emoji: '⚡', label: '30-Day Streak' },
  budget_master: { emoji: '🎯', label: 'Budget Master' },
  clash_winner: { emoji: '⚔️', label: 'Clash Winner' },
  tournament_champ: { emoji: '🏆', label: 'Tournament Champ' },
  saver_100: { emoji: '💎', label: 'Saved $100' },
  saver_1000: { emoji: '👑', label: 'Saved $1,000' },
};

const BANNER_CLASSES = {
  green: 'from-emerald-500 to-teal-600',
  blue: 'from-blue-500 to-indigo-600',
  purple: 'from-violet-500 to-purple-600',
  orange: 'from-orange-500 to-red-500',
  pink: 'from-pink-500 to-rose-600',
  yellow: 'from-yellow-400 to-orange-500',
};

export default function UserProfileModal({ profile, onClose, currentUserId, myProfile }) {
  const [relationship, setRelationship] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUserId && profile?.created_by) {
      friendsApi.getRelationship(currentUserId, profile.created_by).then(setRelationship);
    }
  }, [currentUserId, profile?.created_by]);

  const isFriend = relationship?.status === 'accepted';
  const isPending = relationship?.status === 'pending';

  const handleAddFriend = async () => {
    setLoading(true);
    try {
      await friendsApi.sendRequest(currentUserId, profile.created_by);
      await notificationsApi.send({
        recipient_id: profile.created_by,
        sender_id: currentUserId,
        sender_username: myProfile?.username || 'Someone',
        type: 'friend_request',
        title: 'New Friend Request',
        body: `@${myProfile?.username || 'Someone'} sent you a friend request!`,
        read: false,
      });
      setRelationship({ status: 'pending' });
      toast.success('Friend request sent!');
    } catch { toast.error('Could not send request'); }
    finally { setLoading(false); }
  };

  const bannerClass = BANNER_CLASSES[profile?.banner_color] || BANNER_CLASSES.green;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm p-0 overflow-hidden">
        {/* Banner */}
        <div className={`h-24 bg-gradient-to-r ${bannerClass} relative`}>
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
        </div>

        {/* Avatar */}
        <div className="px-5 pb-5">
          <div className="flex items-end gap-4 -mt-10 mb-3">
            <div className="w-20 h-20 rounded-2xl border-4 border-card bg-card flex items-center justify-center text-4xl shadow-lg overflow-hidden flex-shrink-0">
              {profile?.custom_avatar_url
                ? <img src={profile.custom_avatar_url} alt="avatar" className="w-full h-full object-cover" />
                : <span>{AVATAR_PRESETS[profile?.avatar_id] || '🦁'}</span>
              }
            </div>
            <div className="pb-1 flex-1 min-w-0">
              <h2 className="font-heading font-bold text-lg leading-tight truncate">{profile?.display_name}</h2>
              <p className="text-sm text-muted-foreground">@{profile?.username}</p>
            </div>
          </div>

          {profile?.bio && (
            <p className="text-sm text-muted-foreground italic mb-3">"{profile.bio}"</p>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { icon: Zap, label: 'Level', value: profile?.level || 1 },
              { icon: Star, label: 'XP', value: (profile?.xp || 0).toLocaleString() },
              { icon: Swords, label: 'Battles Won', value: profile?.battles_won || 0 },
            ].map(stat => (
              <div key={stat.label} className="bg-muted rounded-xl p-2.5 text-center">
                <stat.icon className="w-4 h-4 mx-auto mb-1 text-primary" />
                <p className="font-bold text-sm font-heading">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Badges */}
          {profile?.badges?.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Badges</p>
              <div className="flex flex-wrap gap-1.5">
                {profile.badges.map(b => {
                  const badge = BADGE_LABELS[b];
                  return badge ? (
                    <span key={b} title={badge.label} className="text-lg" role="img" aria-label={badge.label}>
                      {badge.emoji}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          )}

          {/* Action */}
          {currentUserId !== profile?.created_by && (
            <div className="flex gap-2">
              {isFriend ? (
                <Button variant="secondary" className="flex-1 gap-2" disabled>
                  <UserCheck className="w-4 h-4" /> Friends
                </Button>
              ) : isPending ? (
                <Button variant="outline" className="flex-1 gap-2" disabled>
                  <UserCheck className="w-4 h-4" /> Request Sent
                </Button>
              ) : (
                <Button onClick={handleAddFriend} className="flex-1 gap-2" disabled={loading}>
                  <UserPlus className="w-4 h-4" /> Add Friend
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
