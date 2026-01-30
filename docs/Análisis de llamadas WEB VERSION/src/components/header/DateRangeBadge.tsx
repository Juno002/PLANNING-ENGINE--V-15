'use client';

import { useDashboardStore } from '@/store/dashboard.store';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';

export default function DateRangeBadge() {
  const dataDate = useDashboardStore((state) => state.dataDate);

  if (!dataDate) {
    return null;
  }

  return (
    <Badge
      variant="outline"
      className="flex w-fit items-center gap-2 py-1 px-3 text-sm"
    >
      <Calendar className="h-4 w-4" />
      <span>{dataDate}</span>
    </Badge>
  );
}
