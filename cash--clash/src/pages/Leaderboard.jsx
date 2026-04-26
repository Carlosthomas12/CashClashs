import React, { useState, useEffect } from 'react';
import { profilesApi } from '@/api/supabaseClient';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Swords, Star, Crown, Medal } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import UserProfileModal from '@/components/social/UserProfileModal';
import { profilesApi as pApi } from '@/api/supabaseClient';

const AVATAR_PRESETS = {
  avatar1:'🦁', avatar2:'🐯', avatar3:'🦊', avatar4:'🐺', avatar5:'🦅',
  avatar6:'🐉', avatar7:'🦄', avatar8:'🐻', avatar9:'🦈', avatar10:'🍆',
  avatar11:'🐸', avatar12:'🦉',
};

const RANK_STYLES = [
  { bg: 'bg-yellow-500/10 border-yellow-500/30', text: 'text-yellow-500', icon: Crown },
  { bg: 'bg-slate-400/10 border-slate-400/30', text: 'text-slate-400', icon: Medal },
  { bg: 'bg-amber-700/10 border-amber-700/30', text: 'text-amber-700', icon: Medal },
];

function LeaderboardRow({ profile, rank, onView, isMe }) {
  const rankStyle = rank <= 3 ? RANK_STYLES[rank - 1] : null;
  const RankIcon = rankStyle?.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.03 }}
    >
      <div
        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all hover:border-primary/30 hover:bg-muted/50
          ${rankStyle ? `${rankStyle.bg}` : 'bg-card border-border'}
          ${isMe ? 'ring-2 ring-primary/40' : ''}`}
        onClick={() => onView(profile)}
      >
        <div className={`w-8 text-center font-heading font-bold text-sm ${rankStyle ? rankStyle.text : 'text-muted-foreground'}`}>
          {RankIcon ? <RankIcon className={`w-5 h-5 mx-auto ${rankStyle.text}`} /> : `#${rank}`}
        </div>
        <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-xl overflow-hidden flex-shrink-0">
          {profile.custom_avatar_url
            ? <img src={profile.custom_avatar_url} className="w-full h-full object-cover" alt="avatar" />
            : AVATAR_PRESETS[profile.avatar_id] || '🦁'
          }
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm truncate">{profile.display_name}</p>
            {isMe && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">You</Badge>}
          </div>
          <p className="text-xs text-muted-foreground">@{profile.username}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge variant="outline" className="text-xs">Lv {profile.level}</Badge>
        </div>
      </div>
    </motion.div>
  );
}

export default function Leaderboard() {
  const { user } = useAuth();
  const [viewProfile, setViewProfile] = useState(null);
  const [myProfile, setMyProfile] = useState(null);

  useEffect(() => {
    if (user?.id) pApi.getByUserId(user.id).then(setMyProfile).catch(() => {});
  }, [user?.id]);

  const { data: byXP = [] } = useQuery({
    queryKey: ['leaderboard', 'xp'],
    queryFn: () => profilesApi.leaderboard('xp', 50),
  });
  const { data: byBattles = [] } = useQuery({
    queryKey: ['leaderboard', 'battles_won'],
    queryFn: () => profilesApi.leaderboard('battles_won', 50),
  });
  const { data: byTournament = [] } = useQuery({
    queryKey: ['leaderboard', 'tournament_wins'],
    queryFn: () => profilesApi.leaderboard('tournament_wins', 50),
  });

  const renderList = (list, valueProp, valueLabel, valueIcon) => {
    const Icon = valueIcon;
    return list.length === 0 ? (
      <div className="text-center py-12 text-muted-foreground">
        <Trophy className="w-10 h-10 mx-auto mb-3 opacity-20" />
        <p className="text-sm">No data yet. Start playing!</p>
      </div>
    ) : (
      <div className="space-y-2">
        {list.map((profile, idx) => (
          <div key={profile.id} className="flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <LeaderboardRow
                profile={profile}
                rank={idx + 1}
                onView={setViewProfile}
                isMe={profile.created_by === user?.id}
              />
            </div>
            <div className="flex items-center gap-1 flex-shrink-0 w-20 justify-end">
              <Icon className="w-3.5 h-3.5 text-primary" />
              <span className="text-sm font-bold font-heading">{(profile[valueProp] || 0).toLocaleString()}</span>
              <span className="text-[10px] text-muted-foreground">{valueLabel}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6 pb-24 md:pb-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <Trophy className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-heading font-bold">Leaderboard</h1>
        </div>
        <p className="text-sm text-muted-foreground">Top players across Cash Clash. Click a player to view their profile.</p>
      </motion.div>

      <Tabs defaultValue="xp">
        <TabsList className="w-full">
          <TabsTrigger value="xp" className="flex-1 gap-1.5"><Star className="w-3.5 h-3.5" /> Most XP</TabsTrigger>
          <TabsTrigger value="battles" className="flex-1 gap-1.5"><Swords className="w-3.5 h-3.5" /> Battles Won</TabsTrigger>
          <TabsTrigger value="tournaments" className="flex-1 gap-1.5"><Trophy className="w-3.5 h-3.5" /> Tournament Wins</TabsTrigger>
        </TabsList>
        <TabsContent value="xp" className="mt-4">
          {renderList(byXP, 'xp', 'XP', Star)}
        </TabsContent>
        <TabsContent value="battles" className="mt-4">
          {renderList(byBattles, 'battles_won', 'wins', Swords)}
        </TabsContent>
        <TabsContent value="tournaments" className="mt-4">
          {renderList(byTournament, 'tournament_wins', 'wins', Trophy)}
        </TabsContent>
      </Tabs>

      {viewProfile && (
        <UserProfileModal profile={viewProfile} onClose={() => setViewProfile(null)} currentUserId={user?.id} myProfile={myProfile} />
      )}
    </div>
  );
}
