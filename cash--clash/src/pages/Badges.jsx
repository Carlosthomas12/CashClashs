import React, { useState, useEffect } from 'react';
import { auth, entities } from '@/api/supabaseClient';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { ALL_BADGES, getUnlockedBadges, getLockedBadges, getLevelFromXP, getRankTitle, getRankColor } from '../components/game/GameUtils';
import LevelBadge from '../components/game/LevelBadge';
import XPBar from '../components/game/XPBar';
import { Trophy, Lock, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Badges() {
  const [user, setUser] = useState(null);
  useEffect(() => { auth.me().then(setUser).catch(() => {}); }, []);

  const { data: profiles } = useQuery({
    queryKey: ['profile'],
    queryFn: () => entities.UserProfile.filter({ created_by: user?.id }),
    enabled: !!user?.id,
    initialData: [],
  });

  const profile = profiles?.[0];
  const xp = profile?.xp || 0;
  const earnedIds = profile?.badges || [];
  const unlocked = getUnlockedBadges(earnedIds);
  const locked = getLockedBadges(earnedIds);
  const level = getLevelFromXP(xp);

  const RANKS = [
    { name: 'Rookie Saver', minLevel: 1, color: 'from-stone-400 to-stone-500' },
    { name: 'Penny Pincher', minLevel: 5, color: 'from-slate-400 to-slate-500' },
    { name: 'Smart Spender', minLevel: 10, color: 'from-teal-400 to-emerald-500' },
    { name: 'Savings Pro', minLevel: 15, color: 'from-emerald-500 to-green-500' },
    { name: 'Budget Boss', minLevel: 20, color: 'from-blue-500 to-cyan-500' },
    { name: 'Money Master', minLevel: 30, color: 'from-violet-500 to-purple-600' },
    { name: 'Cash Legend', minLevel: 40, color: 'from-amber-400 to-yellow-500' },
  ];

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 p-6 flex flex-col sm:flex-row items-center gap-6">
            <LevelBadge xp={xp} size="lg" />
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-heading font-bold">{profile?.display_name || 'Player'}</h1>
              <p className="text-muted-foreground text-sm">Level {level} · {getRankTitle(level)}</p>
              <div className="mt-3 max-w-sm"><XPBar xp={xp} /></div>
            </div>
            <div className="text-center">
              <p className="text-3xl font-heading font-bold text-accent">{unlocked.length}</p>
              <p className="text-xs text-muted-foreground">of {ALL_BADGES.length} badges</p>
            </div>
          </div>
        </Card>
      </motion.div>

      <div>
        <h2 className="font-heading font-semibold text-lg mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-chart-3" /> Rank Tiers
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {RANKS.map(rank => {
            const achieved = level >= rank.minLevel;
            return (
              <div key={rank.name} className={`text-center p-3 rounded-xl border transition-all ${achieved ? 'border-primary/30 bg-card shadow-sm' : 'border-border/50 bg-muted/30 opacity-50'}`}>
                <div className={`w-10 h-10 mx-auto rounded-full bg-gradient-to-br ${rank.color} flex items-center justify-center mb-2`}>
                  <span className="text-white text-xs font-bold">{rank.minLevel}</span>
                </div>
                <p className="text-[10px] font-semibold">{rank.name}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="font-heading font-semibold text-lg mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" /> Earned Badges ({unlocked.length})
        </h2>
        {unlocked.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Start tracking your finances to earn badges!</p>
          </Card>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {unlocked.map((badge, i) => (
              <motion.div key={badge.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
                <Card className="p-4 text-center hover:shadow-lg transition-shadow border-primary/20">
                  <span className="text-4xl block">{badge.icon}</span>
                  <p className="font-heading font-semibold text-sm mt-2">{badge.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{badge.description}</p>
                  {badge.xpReward > 0 && <p className="text-[10px] text-primary font-semibold mt-2">+{badge.xpReward} XP</p>}
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="font-heading font-semibold text-lg mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-muted-foreground" /> Locked ({locked.length})
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {locked.map(badge => (
            <Card key={badge.id} className="p-4 text-center opacity-50 grayscale">
              <span className="text-4xl block">{badge.icon}</span>
              <p className="font-heading font-semibold text-sm mt-2">{badge.name}</p>
              <p className="text-xs text-muted-foreground mt-1">{badge.description}</p>
              {badge.xpReward > 0 && <p className="text-[10px] text-muted-foreground font-semibold mt-2">+{badge.xpReward} XP</p>}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
