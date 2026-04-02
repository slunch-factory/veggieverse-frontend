interface ComingSoonProps {
  title: string;
  description?: string;
}

export function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4 text-stone-800">{title}</h1>
        {description && (
          <p className="text-stone-500 mb-2 text-sm leading-relaxed">{description}</p>
        )}
        <p className="text-stone-500 text-sm">페이지 준비 중입니다.</p>
      </div>
    </div>
  );
}
