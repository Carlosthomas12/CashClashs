import React, { useEffect } from 'react';
import { notificationsApi } from '@/api/supabaseClient';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Users, Swords, Trophy, Star, CheckCheck, Zap } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { formatDistanceToNow } from 'date-fns';

const NOTIF_CONFIG = {
  friend_request:    { icon: Users,  color: 'text-blue-500',   bg: 'bg-blue-500/10' },
  friend_accepted:   { icon: Users,  color: 'text-green-500',  bg: 'bg-green-500/10' },
  clash_invite:      { icon: Swords, color: 'text-primary',    bg: 'bg-primary/10' },
  tournament_invite: { icon: Trophy, color: 'text-amber-500',  bg: 'bg-amber-500/10' },
  level_up:          { icon: Zap,    color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  badge_earned:      { icon: Star,   color: 'text-purple-500', bg: 'bg-purple-500/10' },
};

export default function Inbox() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: () => notificationsApi.getMyNotifications(user.id),
    enabled: !!user?.id,
    refetchInterval: 30000,
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAll = async () => {
    await notificationsApi.markAllRead(user.id);
    queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
    queryClient.invalidateQueries({ queryKey: ['notif-count'] });
  };

  const handleMarkOne = async (n) => {
    if (!n.read) {
      await notificationsApi.markRead(n.id);
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['notif-count'] });
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6 pb-24 md:pb-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-heading font-bold">Inbox</h1>
            {unreadCount > 0 && <Badge className="bg-primary text-primary-foreground">{unreadCount}</Badge>}
          </div>
          {unreadCount > 0 && (
            <Button size="sm" variant="ghost" onClick={handleMarkAll} className="gap-1.5 text-muted-foreground">
              <CheckCheck className="w-4 h-4" /> Mark all read
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">Your notifications, invites and activity</p>
      </motion.div>

      {notifications.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Bell className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p className="text-sm">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif, i) => {
            const config = NOTIF_CONFIG[notif.type] || NOTIF_CONFIG.friend_request;
            const Icon = config.icon;
            return (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card
                  className={`cursor-pointer transition-all hover:border-primary/20 ${!notif.read ? 'border-primary/30 bg-primary/5' : ''}`}
                  onClick={() => handleMarkOne(notif)}
                >
                  <CardContent className="flex items-start gap-3 p-4">
                    <div className={`w-9 h-9 rounded-full ${config.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <Icon className={`w-4 h-4 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-medium ${!notif.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {notif.title}
                        </p>
                        {!notif.read && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />}
                      </div>
                      {notif.body && <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{notif.body}</p>}
                      <p className="text-[10px] text-muted-foreground/60 mt-1.5">
                        {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
