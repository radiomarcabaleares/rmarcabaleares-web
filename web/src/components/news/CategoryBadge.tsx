import type { Category } from '@/lib/supabase/types';

interface CategoryBadgeProps {
  category: Category | null | undefined;
  size?: 'sm' | 'md';
}

export default function CategoryBadge({ category, size = 'sm' }: CategoryBadgeProps) {
  if (!category) return null;

  return (
    <span
      className={`inline-block font-bold uppercase tracking-wider text-white ${
        size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-3 py-1'
      }`}
      style={{ backgroundColor: category.color || '#E2001A' }}
    >
      {category.name}
    </span>
  );
}
