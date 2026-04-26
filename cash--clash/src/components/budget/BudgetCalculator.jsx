import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Calculator, Save } from 'lucide-react';

const BUDGET_CATEGORIES = [
  { key: 'housing', label: 'Housing/Rent', suggested: 30 },
  { key: 'food', label: 'Food & Groceries', suggested: 15 },
  { key: 'transport', label: 'Transportation', suggested: 10 },
  { key: 'utilities', label: 'Utilities', suggested: 5 },
  { key: 'education', label: 'Education', suggested: 10 },
  { key: 'entertainment', label: 'Entertainment', suggested: 5 },
  { key: 'savings', label: 'Savings', suggested: 20 },
  { key: 'other', label: 'Other', suggested: 5 },
];

export default function BudgetCalculator({ profile, onSave }) {
  const [income, setIncome] = useState(profile?.monthly_income || '');
  const [allocations, setAllocations] = useState(
    BUDGET_CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat.key]: cat.suggested }), {})
  );

  const totalPercent = Object.values(allocations).reduce((s, v) => s + (parseFloat(v) || 0), 0);
  const incomeNum = parseFloat(income) || 0;

  const handleSave = () => {
    const budget = Object.entries(allocations).reduce((s, [, v]) => s + (incomeNum * (parseFloat(v) || 0) / 100), 0);
    onSave({
      monthly_income: incomeNum,
      monthly_budget: budget,
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-heading flex items-center gap-2">
          <Calculator className="w-4 h-4" /> Budget Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-xs">Monthly Income ($)</Label>
          <Input type="number" placeholder="e.g. 2000" value={income} onChange={e => setIncome(e.target.value)} />
        </div>

        {incomeNum > 0 && (
          <>
            <div className="space-y-3">
              {BUDGET_CATEGORIES.map(cat => (
                <div key={cat.key}>
                  <div className="flex justify-between items-center mb-1">
                    <Label className="text-xs">{cat.label}</Label>
                    <div className="flex items-center gap-1">
                      <Input type="number" min="0" max="100" className="w-16 h-7 text-xs text-right"
                        value={allocations[cat.key]}
                        onChange={e => setAllocations({ ...allocations, [cat.key]: e.target.value })} />
                      <span className="text-xs text-muted-foreground">%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={parseFloat(allocations[cat.key]) || 0} className="h-1.5" />
                    <span className="text-xs font-medium w-16 text-right">
                      ${(incomeNum * (parseFloat(allocations[cat.key]) || 0) / 100).toFixed(0)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className={`text-sm font-medium text-center py-2 rounded-lg ${totalPercent === 100 ? 'bg-primary/10 text-primary' : totalPercent > 100 ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'}`}>
              Total: {totalPercent}% {totalPercent === 100 ? '✓' : totalPercent > 100 ? '(over budget!)' : `(${100 - totalPercent}% unallocated)`}
            </div>

            <Button onClick={handleSave} className="w-full gap-2" disabled={totalPercent !== 100}>
              <Save className="w-4 h-4" /> Save Budget Plan
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}