"use client";

// TODO: 기존 프로젝트의 DietGridSelect 컴포넌트 마이그레이션 필요
interface DietGridSelectProps {
  categories: { category: string; options: { label: string; description: string; value: string }[] }[];
  selectedValues: string[];
  onSelect: (value: string) => void;
  conflictWarning?: string | null;
}

export function DietGridSelect({ categories, selectedValues, onSelect, conflictWarning }: DietGridSelectProps) {
  return (
    <div className="space-y-6">
      {conflictWarning && (
        <p className="text-sm text-red-500 mb-2">{conflictWarning}</p>
      )}
      {categories.map((cat) => (
        <div key={cat.category}>
          <p className="text-xs text-stone-500 mb-2 uppercase tracking-wide">{cat.category}</p>
          <div className="flex flex-wrap gap-2">
            {cat.options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onSelect(opt.value)}
                className="px-3 py-2 text-sm transition-colors"
                style={{
                  border: selectedValues.includes(opt.value) ? "2px solid #000" : "1px solid #ccc",
                  background: selectedValues.includes(opt.value) ? "#f0f0f0" : "transparent",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
