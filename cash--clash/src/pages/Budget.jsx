import React, { useState, useEffect } from 'react';
import { auth, entities } from '@/api/supabaseClient';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import TransactionForm from '../components/budget/TransactionForm';
import TransactionList from '../components/budget/TransactionList';
import BudgetCalculator from '../components/budget/BudgetCalculator';
import { XP_ACTIONS, getLevelFromXP } from '../components/game/GameUtils';

export default function Budget() {
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

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

  const profile = profiles?.[0];

  const ensureProfile = async () => {
    if (profile) return profile;
    const created = await entities.UserProfile.create({
      display_name: user?.full_name || 'Player',
      created_by: user?.id,
      level: 1, xp: 0, total_saved: 0, monthly_budget: 0, monthly_income: 0,
      badges: [], streak_days: 0, role: 'student',
    });
    queryClient.invalidateQueries({ queryKey: ['profile'] });
    return created;
  };

  const handleAddTransaction = async (data) => {
    await entities.Transaction.create({ ...data, created_by: user?.id });

    const p = await ensureProfile();
    const newXP = (p.xp || 0) + XP_ACTIONS.LOG_TRANSACTION;
    const badges = [...(p.badges || [])];
    const txCount = transactions.length + 1;
    if (txCount === 1 && !badges.includes('first_track')) badges.push('first_track');
    if (txCount >= 10 && !badges.includes('penny_wise')) badges.push('penny_wise');

    await entities.UserProfile.update(p.id, { xp: newXP, badges });

    queryClient.invalidateQueries({ queryKey: ['transactions'] });
    queryClient.invalidateQueries({ queryKey: ['profile'] });
    toast.success(`+${XP_ACTIONS.LOG_TRANSACTION} XP earned!`);
    setShowForm(false);
  };

  const handleSaveBudget = async (budgetData) => {
    const p = await ensureProfile();
    await entities.UserProfile.update(p.id, budgetData);
    queryClient.invalidateQueries({ queryKey: ['profile'] });
    toast.success('Budget plan saved!');
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold">Budget Tracker</h1>
        <Button data-tutorial="btn-add-transaction" onClick={() => setShowForm(!showForm)} size="sm" className="gap-2">
          <Plus className="w-4 h-4" /> {showForm ? 'Cancel' : 'Add Transaction'}
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <TransactionForm onSubmit={handleAddTransaction} onCancel={() => setShowForm(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <TransactionList transactions={transactions} />
        </div>
        <div>
          <BudgetCalculator profile={profile} onSave={handleSaveBudget} />
        </div>
      </div>
    </div>
  );
}
