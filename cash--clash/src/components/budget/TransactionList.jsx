import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { format } from 'date-fns';
import { entities } from '@/api/supabaseClient';
import { useQueryClient } from '@tanstack/react-query';

const CATEGORY_ICONS = {
  food: '🍔', transport: '🚗', entertainment: '🎮', education: '📚',
  housing: '🏠', utilities: '💡', savings: '🏦', salary: '💼',
  freelance: '💻', allowance: '🎁', other: '📌',
};

export default function TransactionList({ transactions }) {
  const queryClient = useQueryClient();

  const handleDelete = async (id) => {
    await entities.Transaction.delete(id);
    queryClient.invalidateQueries({ queryKey: ['transactions'] });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-heading">All Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        {(!transactions || transactions.length === 0) ? (
          <p className="text-sm text-muted-foreground text-center py-8">No transactions yet</p>
        ) : (
          <div className="space-y-1 max-h-[500px] overflow-y-auto">
            {transactions.map(tx => (
              <div key={tx.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors group">
                <span className="text-lg">{CATEGORY_ICONS[tx.category] || '📌'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{tx.title}</p>
                  <p className="text-xs text-muted-foreground">{format(new Date(tx.date), 'MMM d, yyyy')} · <span className="capitalize">{tx.category?.replace(/_/g, ' ')}</span></p>
                </div>
                <div className={`flex items-center gap-1 text-sm font-semibold ${tx.type === 'income' ? 'text-primary' : 'text-destructive'}`}>
                  {tx.type === 'income' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  ${tx.amount.toLocaleString()}
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDelete(tx.id)}>
                  <Trash2 className="w-3 h-3 text-muted-foreground" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
