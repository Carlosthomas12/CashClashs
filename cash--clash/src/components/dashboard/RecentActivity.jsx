import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const CATEGORY_ICONS = {
  food: '🍔', transport: '🚗', entertainment: '🎮', education: '📚',
  housing: '🏠', utilities: '💡', savings: '🏦', salary: '💼',
  freelance: '💻', allowance: '🎁', other: '📌',
};

export default function RecentActivity({ transactions }) {
  const recent = (transactions || []).slice(0, 8);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-heading">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {recent.length === 0 && (
          <p className="text-sm text-muted-foreground py-4 text-center">No transactions yet. Start tracking!</p>
        )}
        {recent.map(tx => (
          <div key={tx.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
            <span className="text-lg">{CATEGORY_ICONS[tx.category] || '📌'}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{tx.title}</p>
              <p className="text-xs text-muted-foreground">{format(new Date(tx.date), 'MMM d')}</p>
            </div>
            <div className={`flex items-center gap-1 text-sm font-semibold ${tx.type === 'income' ? 'text-primary' : 'text-destructive'}`}>
              {tx.type === 'income' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              ${tx.amount.toLocaleString()}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}