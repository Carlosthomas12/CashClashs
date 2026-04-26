import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Wallet, Swords, Trophy, FileText, Settings, ChevronLeft, ChevronRight, LogOut, Zap, Users, Bell, Star, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { notificationsApi } from '@/api/supabaseClient';
import { useTutorial } from '@/lib/TutorialContext';

const PRIMARY_NAV = [
  { path: '/Dashboard', icon: LayoutDashboard, label: 'Dashboard', description: 'Your hub', tutorialId: 'nav-dashboard' },
];

const CORE_NAV = [
  { path: '/Challenges', icon: Swords, label: '1v1 Clash', description: 'Battle friends', accent: true, tutorialId: 'nav-clash' },
  { path: '/Budget', icon: Wallet, label: 'Budget', description: 'Track money', tutorialId: 'nav-budget' },
];

const SECONDARY_NAV = [
  { path: '/Friends', icon: Users, label: 'Friends', tutorialId: 'nav-friends' },
  { path: '/Leaderboard', icon: Trophy, label: 'Leaderboard', tutorialId: 'nav-leaderboard' },
  { path: '/Badges', icon: Star, label: 'Badges', tutorialId: 'nav-badges' },
  { path: '/Proposals', icon: FileText, label: 'Proposals', tutorialId: null },
];

export default function Sidebar({ collapsed, setCollapsed }) {
  const location = useLocation();
  const { logout, user } = useAuth();
  const { start: startTutorial } = useTutorial();

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notif-count', user?.id],
    queryFn: () => notificationsApi.getUnreadCount(user.id),
    enabled: !!user?.id,
    refetchInterval: 30000,
  });

  const NavItem = ({ item, size = 'normal' }) => {
    const isActive = location.pathname === item.path;
    const isLarge = size === 'large';
    const isAccent = item.accent;
    return (
      <Link to={item.path}>
        <div
          data-tutorial={item.tutorialId || undefined}
          className={`flex items-center gap-3 px-3 rounded-lg transition-all duration-200 relative
            ${isLarge ? 'py-3' : 'py-2.5'}
            ${isActive
              ? isAccent
                ? 'bg-accent text-accent-foreground shadow-lg shadow-accent/25'
                : 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-primary/20'
              : isAccent
                ? 'text-accent hover:bg-accent/10 hover:text-accent'
                : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent'
            }`}
        >
          <item.icon className={`flex-shrink-0 ${isLarge ? 'w-6 h-6' : 'w-5 h-5'}`} />
          {!collapsed && (
            <div>
              <span className={`font-medium ${isLarge ? 'text-base' : 'text-sm'}`}>{item.label}</span>
              {item.description && (
                <p className="text-[10px] opacity-60 leading-none mt-0.5">{item.description}</p>
              )}
            </div>
          )}
        </div>
      </Link>
    );
  };

  return (
    <aside className={`fixed left-0 top-0 h-full bg-sidebar z-50 flex flex-col transition-all duration-300 ${collapsed ? 'w-[72px]' : 'w-[240px]'}`}>
      {/* Logo */}
      <div className="p-4 flex items-center gap-3 border-b border-sidebar-border">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
          <Zap className="w-5 h-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-hidden">
            <h1 className="font-heading font-bold text-lg text-sidebar-foreground tracking-tight">Cash Clash</h1>
            <p className="text-[10px] text-sidebar-foreground/50 uppercase tracking-widest">Level Up Your Money</p>
          </motion.div>
        )}
      </div>

      {/* Tutorial button */}
      {!collapsed && (
        <div className="px-3 pt-3">
          <button
            data-tutorial="btn-tutorial"
            onClick={startTutorial}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all text-xs font-bold"
          >
            <BookOpen className="w-4 h-4" />
            How to use Cash Clash
          </button>
        </div>
      )}
      {collapsed && (
        <div className="px-2 pt-2">
          <button
            onClick={startTutorial}
            title="Tutorial"
            className="w-full flex items-center justify-center p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all"
          >
            <BookOpen className="w-4 h-4" />
          </button>
        </div>
      )}

      <nav className="flex-1 py-3 px-2 overflow-y-auto space-y-1">
        {PRIMARY_NAV.map(item => <NavItem key={item.path} item={item} size="large" />)}

        {!collapsed && (
          <p className="px-3 pt-4 pb-1 text-[10px] font-bold uppercase tracking-widest text-sidebar-foreground/30">Core</p>
        )}
        {collapsed && <div className="my-2 border-t border-sidebar-border/50" />}
        {CORE_NAV.map(item => <NavItem key={item.path} item={item} />)}

        {!collapsed && (
          <p className="px-3 pt-4 pb-1 text-[10px] font-bold uppercase tracking-widest text-sidebar-foreground/30">Community</p>
        )}
        {collapsed && <div className="my-2 border-t border-sidebar-border/50" />}

        {/* Inbox with badge */}
        <Link to="/Inbox">
          <div
            data-tutorial="nav-inbox"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative
              ${location.pathname === '/Inbox'
                ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-primary/20'
                : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent'}`}
          >
            <Bell className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="text-sm font-medium">Inbox</span>}
            {unreadCount > 0 && (
              <span className={`absolute ${collapsed ? 'top-1 right-1' : 'right-2'} min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center`}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
        </Link>

        {SECONDARY_NAV.map(item => <NavItem key={item.path} item={item} />)}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-sidebar-border space-y-1">
        <Link to="/Settings">
          <div
            data-tutorial="nav-settings"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
              ${location.pathname === '/Settings'
                ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                : 'text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent'}`}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="text-sm">Settings</span>}
          </div>
        </Link>
        <button onClick={() => logout()}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all">
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm">Logout</span>}
        </button>
        <button onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 rounded-lg text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all">
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
}
