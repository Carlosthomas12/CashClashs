import React, { useState, useEffect } from 'react';
import { auth, entities, profilesApi, notificationsApi } from '@/api/supabaseClient';
import { supabase } from '@/api/supabaseClient';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Swords, Plus, Trophy, Clock, CheckCircle, Target, AtSign, Info, TrendingUp, Users, Star, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { format, startOfWeek, endOfWeek, differenceInDays } from 'date-fns';

// ── HOW IT WORKS PANEL ──────────────────────────────────────────────
function HowItWorks({ open, onClose }) {
  const steps = [
    { icon: '👤', title: 'Challenge a Friend', desc: 'Enter a friend\'s @username and set a shared savings goal for the week.' },
    { icon: '✅', title: 'They Accept', desc: 'Your opponent gets a notification and accepts the clash invite from their Inbox.' },
    { icon: '💰', title: 'Log Transactions', desc: 'Both players log income and expenses in Budget all week. Every dollar saved counts.' },
    { icon: '📊', title: 'Live Progress', desc: 'Watch the savings bar update in real-time as both players track their money.' },
    { icon: '🏆', title: 'Week Ends — Winner Takes XP', desc: 'At week\'s end, whoever saved more wins! The winner earns bonus XP and bragging rights.' },
    { icon: '🔥', title: 'Level Up', desc: 'XP from clashes helps you level up your rank — from Broke Beginner all the way to Money Legend.' },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-sidebar border border-sidebar-border rounded-2xl p-5 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-sidebar-foreground flex items-center gap-2">
              <Swords className="w-4 h-4 text-accent" /> How Clashes Work
            </h3>
            <button onClick={onClose} className="text-sidebar-foreground/40 hover:text-sidebar-foreground text-xs">
              ✕ Close
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {steps.map((s, i) => (
              <div key={i} className="flex gap-3 p-3 bg-sidebar-accent/50 rounded-xl">
                <span className="text-2xl flex-shrink-0">{s.icon}</span>
                <div>
                  <p className="text-xs font-bold text-sidebar-foreground">{s.title}</p>
                  <p className="text-[11px] text-sidebar-foreground/60 mt-0.5 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 flex gap-2">
            <Zap className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-xs text-primary font-medium">Tip: Log transactions daily to keep your savings score accurate — clashes are settled automatically at week end!</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── PROGRESS BAR ────────────────────────────────────────────────────
function ClashProgressBar({ mySavings, opponentSavings, goal, myUsername, opponentUsername }) {
  const total = (mySavings || 0) + (opponentSavings || 0);
  const myPct = total > 0 ? Math.round(((mySavings || 0) / total) * 100) : 50;
  const oppPct = 100 - myPct;
  const goalPct = goal ? Math.min(100, Math.round(((mySavings || 0) / goal) * 100)) : null;
  const winning = (mySavings || 0) > (opponentSavings || 0);
  const tied = (mySavings || 0) === (opponentSavings || 0);

  return (
    <div className="space-y-2">
      {/* VS bar */}
      <div className="relative h-4 rounded-full overflow-hidden bg-muted flex">
        <motion.div
          initial={{ width: '50%' }}
          animate={{ width: `${myPct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="h-full bg-primary rounded-l-full"
        />
        <motion.div
          initial={{ width: '50%' }}
          animate={{ width: `${oppPct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="h-full bg-muted-foreground/30 rounded-r-full"
        />
        {/* Center divider */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-background transform -translate-x-1/2" />
      </div>

      {/* Labels */}
      <div className="flex justify-between text-xs">
        <span className={`font-bold ${winning && !tied ? 'text-primary' : 'text-muted-foreground'}`}>
          {winning && !tied ? '👑 ' : ''}You ${(mySavings || 0).toFixed(0)}
        </span>
        <span className={`font-bold ${!winning && !tied ? 'text-foreground' : 'text-muted-foreground'}`}>
          @{opponentUsername} ${(opponentSavings || 0).toFixed(0)}{!winning && !tied ? ' 👑' : ''}
        </span>
      </div>

      {/* Goal progress */}
      {goal && (
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><Target className="w-3 h-3" /> Your goal progress</span>
            <span>{goalPct}% of ${goal}</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${goalPct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-accent rounded-full"
            />
          </div>
        </div>
      )}

      {/* Status message */}
      <p className="text-[10px] text-center text-muted-foreground">
        {tied
          ? "🤝 It's tied! Log a transaction to pull ahead."
          : winning
            ? `🔥 You're leading by $${((mySavings || 0) - (opponentSavings || 0)).toFixed(0)}!`
            : `📈 You're $${((opponentSavings || 0) - (mySavings || 0)).toFixed(0)} behind — time to save more!`}
      </p>
    </div>
  );
}

// ── MAIN PAGE ───────────────────────────────────────────────────────
export default function Challenges() {
  const [user, setUser] = useState(null);
  const [myProfile, setMyProfile] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [howOpen, setHowOpen] = useState(false);
  const [form, setForm] = useState({ title: '', opponent_username: '', savings_goal: '' });
  const [searching, setSearching] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    auth.me().then(u => {
      setUser(u);
      profilesApi.getByUserId(u.id).then(setMyProfile).catch(() => {});
    }).catch(() => {});
  }, []);

  const { data: challenges } = useQuery({
    queryKey: ['challenges'],
    queryFn: () => entities.Challenge.list('-created_date', 50),
    enabled: !!user,
    initialData: [],
  });

  const myChallenges = challenges.filter(c =>
    c.challenger_id === user?.id || c.opponent_id === user?.id
  );

  const active = myChallenges.filter(c => c.status === 'active');
  const pending = myChallenges.filter(c => c.status === 'pending');
  const completed = myChallenges.filter(c => c.status === 'completed');

  const handleCreate = async () => {
    if (!form.title || !form.opponent_username || !form.savings_goal) {
      toast.error('Please fill in all fields');
      return;
    }
    setSearching(true);
    try {
      const opponent = await profilesApi.getByUsername(form.opponent_username.toLowerCase().replace('@', ''));
      if (!opponent) { toast.error('Username not found. Check the spelling.'); return; }
      if (opponent.created_by === user.id) { toast.error("You can't challenge yourself!"); return; }

      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
      const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

      await entities.Challenge.create({
        title: form.title,
        savings_goal: parseFloat(form.savings_goal),
        challenger_id: user.id,
        challenger_username: myProfile?.username || '',
        challenger_email: user.email,
        challenger_name: myProfile?.display_name || user.email,
        opponent_id: opponent.created_by,
        opponent_username: opponent.username,
        opponent_email: opponent.email || '',
        opponent_name: opponent.display_name,
        week_start: format(weekStart, 'yyyy-MM-dd'),
        week_end: format(weekEnd, 'yyyy-MM-dd'),
        challenger_savings: 0,
        opponent_savings: 0,
        status: 'pending',
      });

      await notificationsApi.send({
        recipient_id: opponent.created_by,
        sender_id: user.id,
        sender_username: myProfile?.username || 'Someone',
        type: 'clash_invite',
        title: '⚔️ Clash Invite!',
        body: `@${myProfile?.username || 'Someone'} challenged you to "${form.title}"!`,
        read: false,
      });

      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      setDialogOpen(false);
      setForm({ title: '', opponent_username: '', savings_goal: '' });
      toast.success(`Clash sent to @${opponent.username}!`);
    } catch (err) {
      toast.error(err.message || 'Failed to create challenge');
    } finally {
      setSearching(false);
    }
  };

  const handleAccept = async (challenge) => {
    await entities.Challenge.update(challenge.id, { status: 'active' });
    await notificationsApi.send({
      recipient_id: challenge.challenger_id,
      sender_id: user.id,
      sender_username: myProfile?.username,
      type: 'clash_invite',
      title: '⚔️ Clash Accepted!',
      body: `@${myProfile?.username} accepted your clash "${challenge.title}"!`,
      read: false,
    }).catch(() => {});
    queryClient.invalidateQueries({ queryKey: ['challenges'] });
    toast.success('Challenge accepted! Game on! ⚔️');
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-chart-3/10 text-chart-3 border-chart-3/20',
      active: 'bg-primary/10 text-primary border-primary/20',
      completed: 'bg-accent/10 text-accent border-accent/20',
    };
    return <Badge variant="outline" className={styles[status]}>{status}</Badge>;
  };

  const getDaysLeft = (weekEnd) => {
    if (!weekEnd) return null;
    const days = differenceInDays(new Date(weekEnd), new Date());
    if (days < 0) return 'Ended';
    if (days === 0) return 'Last day!';
    return `${days}d left`;
  };

  const ClashCard = ({ challenge, i }) => {
    const isChallenger = challenge.challenger_id === user?.id;
    const myUsername = isChallenger ? challenge.challenger_username : challenge.opponent_username;
    const opponentUsername = isChallenger ? challenge.opponent_username : challenge.challenger_username;
    const mySavings = isChallenger ? challenge.challenger_savings : challenge.opponent_savings;
    const opponentSavings = isChallenger ? challenge.opponent_savings : challenge.challenger_savings;
    const isPendingForMe = challenge.status === 'pending' && !isChallenger;
    const daysLeft = getDaysLeft(challenge.week_end);

    return (
      <motion.div key={challenge.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
        <Card className="hover:border-primary/30 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-base leading-tight">{challenge.title}</CardTitle>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {daysLeft && challenge.status === 'active' && (
                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                    <Clock className="w-3 h-3" /> {daysLeft}
                  </span>
                )}
                {getStatusBadge(challenge.status)}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              vs <span className="font-medium text-foreground">@{opponentUsername}</span>
              {challenge.week_start && ` · ${format(new Date(challenge.week_start), 'MMM d')} – ${format(new Date(challenge.week_end), 'MMM d')}`}
            </p>
          </CardHeader>

          <CardContent className="space-y-3">
            {/* Progress tracker for active clashes */}
            {challenge.status === 'active' && (
              <ClashProgressBar
                mySavings={mySavings}
                opponentSavings={opponentSavings}
                goal={challenge.savings_goal}
                myUsername={myUsername}
                opponentUsername={opponentUsername}
              />
            )}

            {/* Pending view — just show savings side by side */}
            {challenge.status === 'pending' && (
              <div className="flex items-center gap-3 text-sm">
                <div className="flex-1 bg-muted rounded-lg p-2.5 text-center">
                  <p className="text-xs text-muted-foreground mb-0.5">You</p>
                  <p className="font-bold font-heading text-primary">${(mySavings || 0).toFixed(2)}</p>
                </div>
                <Swords className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 bg-muted rounded-lg p-2.5 text-center">
                  <p className="text-xs text-muted-foreground mb-0.5">@{opponentUsername}</p>
                  <p className="font-bold font-heading">${(opponentSavings || 0).toFixed(2)}</p>
                </div>
              </div>
            )}

            {/* Completed view */}
            {challenge.status === 'completed' && (
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-sm">
                  <div className={`flex-1 rounded-lg p-2.5 text-center ${(mySavings || 0) >= (opponentSavings || 0) ? 'bg-primary/10 border border-primary/20' : 'bg-muted'}`}>
                    <p className="text-xs text-muted-foreground mb-0.5">You {(mySavings || 0) >= (opponentSavings || 0) ? '👑' : ''}</p>
                    <p className={`font-bold font-heading ${(mySavings || 0) >= (opponentSavings || 0) ? 'text-primary' : ''}`}>${(mySavings || 0).toFixed(2)}</p>
                  </div>
                  <Trophy className="w-4 h-4 text-chart-3 flex-shrink-0" />
                  <div className={`flex-1 rounded-lg p-2.5 text-center ${(opponentSavings || 0) > (mySavings || 0) ? 'bg-muted border border-border' : 'bg-muted'}`}>
                    <p className="text-xs text-muted-foreground mb-0.5">@{opponentUsername} {(opponentSavings || 0) > (mySavings || 0) ? '👑' : ''}</p>
                    <p className="font-bold font-heading">${(opponentSavings || 0).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            )}

            {challenge.savings_goal && challenge.status !== 'active' && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Target className="w-3 h-3" /> Goal: ${challenge.savings_goal}
              </p>
            )}

            {isPendingForMe && (
              <Button onClick={() => handleAccept(challenge)} size="sm" className="w-full gap-2">
                <CheckCircle className="w-4 h-4" /> Accept Challenge
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
            <Swords className="w-6 h-6 text-accent" /> 1v1 Clash
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Challenge friends to weekly savings battles</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => setHowOpen(!howOpen)}>
            <Info className="w-4 h-4" /> How it works
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button data-tutorial="btn-new-clash" size="sm" className="gap-2"><Plus className="w-4 h-4" /> New Clash</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><Swords className="w-5 h-5 text-primary" /> New 1v1 Clash</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="space-y-2">
                  <Label>Challenge Title</Label>
                  <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Who saves more this week?" />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5"><AtSign className="w-3.5 h-3.5" /> Opponent Username</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
                    <Input
                      value={form.opponent_username}
                      onChange={e => setForm({ ...form, opponent_username: e.target.value.replace('@', '') })}
                      placeholder="their_username"
                      className="pl-7"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Enter the exact username of who you want to challenge</p>
                </div>
                <div className="space-y-2">
                  <Label>Savings Goal ($)</Label>
                  <Input type="number" value={form.savings_goal} onChange={e => setForm({ ...form, savings_goal: e.target.value })} placeholder="100" />
                  <p className="text-xs text-muted-foreground">How much do you each aim to save this week?</p>
                </div>
                <Button onClick={handleCreate} className="w-full gap-2" disabled={searching}>
                  {searching ? <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : <Swords className="w-4 h-4" />}
                  Send Clash Invite
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* How it works panel */}
      <HowItWorks open={howOpen} onClose={() => setHowOpen(false)} />

      {/* Stats strip */}
      {myChallenges.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Active', count: active.length, icon: Swords, color: 'text-primary' },
            { label: 'Pending', count: pending.length, icon: Clock, color: 'text-chart-3' },
            { label: 'Completed', count: completed.length, icon: Trophy, color: 'text-accent' },
          ].map(({ label, count, icon: Icon, color }) => (
            <Card key={label} className="text-center">
              <CardContent className="p-3">
                <Icon className={`w-5 h-5 mx-auto mb-1 ${color}`} />
                <p className="text-lg font-heading font-bold">{count}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pending section */}
      {pending.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" /> Pending Invites
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {pending.map((c, i) => <ClashCard key={c.id} challenge={c} i={i} />)}
          </div>
        </div>
      )}

      {/* Active section */}
      {active.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <Swords className="w-4 h-4 text-primary" /> Active Clashes
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {active.map((c, i) => <ClashCard key={c.id} challenge={c} i={i} />)}
          </div>
        </div>
      )}

      {/* Completed section */}
      {completed.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-accent" /> Completed
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {completed.map((c, i) => <ClashCard key={c.id} challenge={c} i={i} />)}
          </div>
        </div>
      )}

      {/* Empty state */}
      {myChallenges.length === 0 && (
        <div className="text-center py-16 text-muted-foreground space-y-4">
          <Swords className="w-12 h-12 mx-auto opacity-20" />
          <div>
            <p className="text-sm font-medium">No clashes yet</p>
            <p className="text-xs mt-1">Challenge a friend by their @username to start a savings battle!</p>
          </div>
          <Button size="sm" className="gap-2" onClick={() => setHowOpen(true)}>
            <Info className="w-4 h-4" /> See how it works
          </Button>
        </div>
      )}
    </div>
  );
}
