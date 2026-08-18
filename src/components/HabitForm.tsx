import React, { useState } from 'react';
import { Habit } from '../types';
import { HABIT_TEMPLATES } from '../utils/dummyData';

interface HabitFormProps {
  habitToEdit: Habit | null;
  categoriesList: string[];
  onSave: (habitData: Omit<Habit, 'order' | 'createdAt'> & { id?: string }) => void;
  onClose: () => void;
}

export default function HabitForm({
  habitToEdit,
  categoriesList,
  onSave,
  onClose,
}: HabitFormProps) {
  const [name, setName] = useState(habitToEdit?.name || '');
  const [description, setDescription] = useState(habitToEdit?.description || '');
  const [emoji, setEmoji] = useState(habitToEdit?.emoji || '🎯');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'specific'>(
    habitToEdit?.frequency || 'daily'
  );
  const [color, setColor] = useState(habitToEdit?.color || 'indigo');
  const [category, setCategory] = useState(habitToEdit?.category || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSave({
      id: habitToEdit?.id,
      name,
      description,
      emoji,
      frequency,
      color,
      category,
      type: 'habit',
      isTask: false,
      subtasks: habitToEdit?.subtasks || [],
      isArchived: false,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-lg p-6 w-full max-w-md max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {habitToEdit ? 'Edit Habit' : 'New Habit'}
          </h2>
          <button
            onClick={onClose}
            className="text-2xl text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Habit name"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Emoji</label>
            <input
              type="text"
              value={emoji}
              onChange={(e) => setEmoji(e.target.value.slice(0, 2))}
              maxLength={2}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-2xl focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Frequency</label>
            <select
              value={frequency}
              onChange={(e) =>
                setFrequency(e.target.value as 'daily' | 'weekly' | 'specific')
              }
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="specific">Specific Days</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Color</label>
            <select
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="emerald">Emerald</option>
              <option value="indigo">Indigo</option>
              <option value="rose">Rose</option>
              <option value="amber">Amber</option>
              <option value="cyan">Cyan</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">Select a category</option>
              {categoriesList.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-800 rounded-lg hover:bg-slate-700 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700 font-semibold text-white"
            >
              Save Habit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
