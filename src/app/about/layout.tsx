import { AboutTabs } from "./_components/AboutTabs";

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[var(--cream)] min-h-screen">
      <AboutTabs />
      <div className="max-w-[1440px] mx-auto">
        {children}
      </div>
    </div>
  );
}
