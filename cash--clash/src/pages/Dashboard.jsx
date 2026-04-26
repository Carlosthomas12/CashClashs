import React, { useState, useEffect } from 'react';
import { auth, entities } from '@/api/supabaseClient';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Swords, Trophy, FileText, Zap, ArrowRight, Star, Users } from 'lucide-react';

import LevelBadge from '../components/game/LevelBadge';
import XPBar from '../components/game/XPBar';
import QuickStats from '../components/dashboard/QuickStats';
import RecentActivity from '../components/dashboard/RecentActivity';
import SpendingChart from '../components/dashboard/SpendingChart';
import DailyTip from '../components/dashboard/DailyTip';
import SavingsGoalCard from '../components/dashboard/SavingsGoalCard';
import ChallengePreview from '../components/dashboard/ChallengePreview';
import { getLevelFromXP, getRankTitle, getRankColor, ALL_BADGES } from '../components/game/GameUtils';

export default function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => { auth.me().then(setUser).catch(() => {}); }, []);

  const { data: profiles } = useQuery({
    queryKey: ['profile'],
    queryFn: () => entities.UserProfile.filter({ created_by: user?.id }),
    enabled: !!user?.id,
    initialData: [],
  });

  const { data: transactions } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => entities.Transaction.filter({ created_by: user?.id }, '-date', 100),
    enabled: !!user?.id,
    initialData: [],
  });

  const { data: challenges } = useQuery({
    queryKey: ['challenges'],
    queryFn: () => entities.Challenge.list('-created_date', 20),
    enabled: !!user?.id,
    initialData: [],
  });

  const profile = profiles?.[0];
  const xp = profile?.xp || 0;
  const level = getLevelFromXP(xp);
  const rank = getRankTitle(level);
  const gradient = getRankColor(level);
  const earnedBadges = (profile?.badges || []).map(id => ALL_BADGES.find(b => b.id === id)).filter(Boolean);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 pb-24 md:pb-8">

      {/* ── TUTORIAL ── */}

      {/* ── HERO HUD HEADER ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl overflow-hidden bg-sidebar p-6"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-primary blur-3xl" />
          <div className="absolute bottom-0 left-1/3 w-48 h-48 rounded-full bg-accent blur-3xl" />
        </div>

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <LevelBadge xp={xp} size="lg" />

          <div className="flex-1 min-w-0">
            <p className="text-sidebar-foreground/60 text-xs uppercase tracking-widest font-semibold mb-0.5">Welcome back,</p>
            <h1 className="text-2xl md:text-3xl font-heading font-bold text-white truncate">
              {profile?.display_name || user?.full_name || 'Player'}
            </h1>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full bg-gradient-to-r ${gradient} text-white`}>
                {rank}
              </span>
              <span className="text-sidebar-foreground/60 text-xs flex items-center gap-1">
                <Zap className="w-3 h-3 text-primary" /> {xp.toLocaleString()} XP
              </span>
              <span className="text-sidebar-foreground/60 text-xs">
                🔥 {profile?.streak_days || 0} day streak
              </span>
            </div>
            <div className="mt-3 max-w-xs">
              <XPBar xp={xp} />
            </div>
          </div>

          <div className="flex flex-row sm:flex-col gap-2">
            <Link to="/Budget">
              <Button size="sm" className="gap-2 w-full">
                <Plus className="w-4 h-4" /> Track Money
              </Button>
            </Link>
            <Link to="/Challenges">
              <Button size="sm" variant="outline" className="gap-2 w-full border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent">
                <Swords className="w-4 h-4" /> Clash
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* ── QUICK STATS ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <QuickStats transactions={transactions} profile={profile} />
      </motion.div>

      {/* ── DAILY TIP ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
        <DailyTip />
      </motion.div>

      {/* ── MAIN GRID ── */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <SpendingChart transactions={transactions} />
          <RecentActivity transactions={transactions} />
        </div>

        <div className="space-y-4">
          <SavingsGoalCard profile={profile} transactions={transactions} />

          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-heading font-semibold flex items-center gap-2">
                <Swords className="w-4 h-4 text-accent" /> Active Clash
              </h3>
              <Link to="/Challenges" className="text-xs text-primary hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <ChallengePreview challenges={challenges} userEmail={user?.email} />
          </div>
        </div>
      </div>

      {/* ── BADGES SECTION ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading font-semibold text-lg flex items-center gap-2">
            <Trophy className="w-5 h-5 text-chart-3" /> Achievements
          </h2>
          <Link to="/Badges" className="text-xs text-primary hover:underline flex items-center gap-1">
            All badges <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {earnedBadges.length === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="p-6 text-center">
              <Trophy className="w-10 h-10 mx-auto text-muted-foreground/20 mb-2" />
              <p className="text-sm text-muted-foreground">Log your first transaction to earn your first badge!</p>
              <Link to="/Budget">
                <Button size="sm" variant="outline" className="mt-3 gap-2"><Plus className="w-3 h-3" /> Track a Transaction</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {earnedBadges.slice(0, 8).map((badge, i) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="flex-shrink-0 bg-card rounded-xl p-3 text-center border border-border hover:border-primary/30 hover:shadow-md transition-all min-w-[90px]"
              >
                <span className="text-3xl block">{badge.icon}</span>
                <p className="text-[10px] font-semibold mt-1.5 leading-tight">{badge.name}</p>
                {badge.xpReward > 0 && (
                  <p className="text-[9px] text-primary font-bold mt-0.5">+{badge.xpReward} XP</p>
                )}
              </motion.div>
            ))}
            <Link to="/Badges" className="flex-shrink-0 min-w-[90px] flex items-center justify-center">
              <div className="bg-muted rounded-xl p-3 text-center border border-dashed border-border hover:border-primary/30 transition-colors w-full">
                <ArrowRight className="w-5 h-5 mx-auto text-muted-foreground" />
                <p className="text-[10px] text-muted-foreground mt-1">View all</p>
              </div>
            </Link>
          </div>
        )}
      </motion.div>

      {/* ── BOTTOM CTA STRIP ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { to: '/Budget', icon: Plus, label: 'Log Transaction', color: 'bg-primary/10 text-primary border-primary/20' },
            { to: '/Challenges', icon: Swords, label: '1v1 Clash', color: 'bg-accent/10 text-accent border-accent/20' },
            { to: '/Friends', icon: Users, label: 'Add Friends', color: 'bg-chart-4/10 text-chart-4 border-chart-4/20' },
            { to: '/Proposals', icon: FileText, label: 'Submit Proposal', color: 'bg-chart-2/10 text-chart-2 border-chart-2/20' },
          ].map(({ to, icon: Icon, label, color }) => (
            <Link key={to} to={to}>
              <Card className={`border hover:shadow-md transition-all cursor-pointer`}>
                <CardContent className="p-3 text-center">
                  <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center mx-auto mb-2`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-semibold leading-tight">{label}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
