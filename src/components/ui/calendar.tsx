'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isToday } from 'date-fns';

export interface CalendarProps {
  mode?: 'single' | 'multiple' | 'range';
  selected?: Date | Date[];
  onSelect?: (date: Date | undefined) => void;
  disabled?: (date: Date) => boolean;
  className?: string;
}

export function Calendar({
  mode = 'single',
  selected,
  onSelect,
  disabled,
  className
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const dateFormat = 'd';
  const rows: React.ReactElement[] = [];
  let days: React.ReactElement[] = [];
  let day = startDate;
  let formattedDate = '';

  // Header row with day names
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      formattedDate = format(day, dateFormat);
      const cloneDay = day;

      const isSelected = mode === 'single' && selected instanceof Date && isSameDay(day, selected);
      const isCurrentMonth = isSameMonth(day, monthStart);
      const isTodayDate = isToday(day);
      const isDisabled = disabled?.(day);

      days.push(
        <div
          className={cn(
            'h-9 w-9 p-0 text-center text-sm leading-9 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50',
            !isCurrentMonth && 'text-muted-foreground',
            isTodayDate && 'bg-accent text-accent-foreground',
            isSelected && 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
            isDisabled && 'pointer-events-none opacity-50'
          )}
          key={day.toString()}
          onClick={() => {
            if (!isDisabled && onSelect) {
              onSelect(cloneDay);
            }
          }}
        >
          {formattedDate}
        </div>
      );
      day = addDays(day, 1);
    }
    rows.push(
      <div className="flex" key={day.toString()}>
        {days}
      </div>
    );
    days = [];
  }

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  return (
    <div className={cn('p-3', className)}>
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          className="h-7 w-7 p-0"
          onClick={prevMonth}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="font-semibold">
          {format(currentMonth, 'MMMM yyyy')}
        </div>
        <Button
          variant="outline"
          className="h-7 w-7 p-0"
          onClick={nextMonth}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="h-9 w-9 p-0 text-center text-sm font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>
      <div className="space-y-1">
        {rows}
      </div>
    </div>
  );
}