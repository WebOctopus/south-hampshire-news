import { Building2 } from 'lucide-react';
import { iconMap } from '@/lib/iconMap';
import { cn } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
  icon?: string | null;
}

interface Props {
  categories: Category[];
  selected: string;
  onSelect: (id: string) => void;
}

export function SectorPills({ categories, selected, onSelect }: Props) {
  if (!categories.length) return null;
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      <button
        type="button"
        onClick={() => onSelect('all')}
        className={cn(
          'inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-colors',
          selected === 'all'
            ? 'bg-foreground text-background border-foreground'
            : 'bg-background text-foreground border-border hover:bg-muted',
        )}
      >
        All sectors
      </button>
      {categories.map((cat) => {
        const Icon = iconMap[cat.icon || ''] || Building2;
        const active = selected === cat.id;
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect(cat.id)}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-colors',
              active
                ? 'bg-foreground text-background border-foreground'
                : 'bg-background text-foreground border-border hover:bg-muted',
            )}
          >
            <Icon className="h-4 w-4" />
            {cat.name}
          </button>
        );
      })}
    </div>
  );
}