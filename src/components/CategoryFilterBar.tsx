import { TOPIC_CATEGORIES } from '../types';
import { ALL_CATEGORIES_FILTER } from '../lib/feedOrder';

interface CategoryFilterBarProps {
  value: string;
  onChange: (category: string) => void;
}

const FILTER_OPTIONS = [ALL_CATEGORIES_FILTER, ...TOPIC_CATEGORIES];

export function CategoryFilterBar({ value, onChange }: CategoryFilterBarProps) {
  return (
    <div className="category-filter" role="tablist" aria-label="カテゴリ絞り込み">
      {FILTER_OPTIONS.map((category) => {
        const active = value === category;
        return (
          <button
            key={category}
            type="button"
            role="tab"
            aria-selected={active}
            className={`category-filter__chip ${active ? 'category-filter__chip--active' : ''}`}
            onClick={() => onChange(category)}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
