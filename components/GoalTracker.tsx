'use client';

import React, { useState } from 'react';
import { Flame, Target, Trophy, Edit2, Check, Sparkles } from 'lucide-react';
import { useAppStore } from '@/lib/store';

export const GoalTracker: React.FC = () => {
  const { dailyStats, setDailyGoal, isAdmin } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);
  const [goalInput, setGoalInput] = useState(dailyStats.dailyGoal);

  const percent = Math.min(100, Math.round((dailyStats.pagesReadToday / dailyStats.dailyGoal) * 100));

  const handleSaveGoal = () => {
    if (goalInput > 0) {
      setDailyGoal(goalInput);
    }
    setIsEditing(false);
  };

  return (
    <div className="bg-white dark:bg-asura-card border border-slate-200 dark:border-asura-border rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Flame className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Daily Reading Goal & Streak
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Keep your reading streak active every day
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400 font-extrabold text-xs flex items-center space-x-1">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>{dailyStats.streakDays} Days Streak</span>
          </div>
        </div>
      </div>

      {/* Progress Bar & Percentage */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-600 dark:text-slate-300 font-medium">
            Today's Progress: <strong className="text-brand-500 dark:text-brand-400">{dailyStats.pagesReadToday}</strong> / {dailyStats.dailyGoal} Pages
          </span>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-emerald-500">{percent}%</span>
            {isAdmin && (
              isEditing ? (
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    min={1}
                    value={goalInput}
                    onChange={(e) => setGoalInput(Number(e.target.value))}
                    className="w-14 px-2 py-0.5 text-xs bg-slate-100 dark:bg-asura-bg border border-brand-500 rounded outline-none"
                  />
                  <button
                    onClick={handleSaveGoal}
                    className="p-1 bg-brand-500 text-white rounded hover:bg-brand-600"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-slate-400 hover:text-white p-1"
                  title="Edit Target"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              )
            )}
          </div>
        </div>

        <div className="w-full h-3 bg-slate-100 dark:bg-asura-bg rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-asura-border">
          <div
            className="h-full bg-gradient-to-r from-brand-600 via-brand-500 to-amber-400 rounded-full transition-all duration-500 shadow-glow-purple"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
