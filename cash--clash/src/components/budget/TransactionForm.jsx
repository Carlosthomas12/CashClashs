import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X } from 'lucide-react';

const EXPENSE_CATEGORIES = ['food', 'transport', 'entertainment', 'education', 'housing', 'utilities', 'savings', 'other'];
const INCOME_CATEGORIES = ['salary', 'freelance', 'allowance', 'other'];

export default function TransactionForm({ onSubmit, onCancel }) {
  const [form, setForm] = useState({
    title: '',
    amount: '',
    type: 'expense',
    category: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const categories = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...form, amount: parseFloat(form.amount) });
    setForm({ title: '', amount: '', type: 'expense', category: '', date: new Date().toISOString().split('T')[0], notes: '' });
  };

  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-heading">New Transaction</CardTitle>
        {onCancel && (
          <Button variant="ghost" size="icon" onClick={onCancel}><X className="w-4 h-4" /></Button>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Toggle */}
          <div className="flex gap-2 bg-muted rounded-lg p-1">
            <button type="button" onClick={() => setForm({ ...form, type: 'expense', category: '' })}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${form.type === 'expense' ? 'bg-destructive text-destructive-foreground shadow-sm' : 'text-muted-foreground'}`}>
              Expense
            </button>
            <button type="button" onClick={() => setForm({ ...form, type: 'income', category: '' })}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${form.type === 'income' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground'}`}>
              Income
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 sm:col-span-1">
              <Label className="text-xs">Title</Label>
              <Input placeholder="e.g. Groceries" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <Label className="text-xs">Amount ($)</Label>
              <Input type="number" step="0.01" min="0" placeholder="0.00" value={form.amount}
                onChange={e => setForm({ ...form, amount: e.target.value })} required />
            </div>
            <div>
              <Label className="text-xs">Category</Label>
              <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => (
                    <SelectItem key={c} value={c} className="capitalize">{c.replace(/_/g, ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Date</Label>
              <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
            </div>
          </div>

          <div>
            <Label className="text-xs">Notes (optional)</Label>
            <Textarea placeholder="Any details..." rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          </div>

          <Button type="submit" className="w-full gap-2">
            <Plus className="w-4 h-4" /> Add Transaction
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}