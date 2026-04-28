"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MiniCalendarProps {
  startDate: Date;
  minDate: Date;
  onSelect: (d: Date) => void;
}

const stripTime = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

export function MiniCalendar({ startDate, minDate, onSelect }: MiniCalendarProps) {
  const [month, setMonth] = useState(
    () => new Date(startDate.getFullYear(), startDate.getMonth(), 1),
  );

  const firstDay = month.getDay();
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const minMonth = new Date(minDate.getFullYear(), minDate.getMonth(), 1).getTime();
  const canPrev = month.getTime() > minMonth;

  const windowStart = stripTime(startDate);
  const windowEnd = windowStart + 6 * 86400000;
  const minTime = stripTime(minDate);

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="select-none">
      {/* 월 네비게이션 */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => canPrev && setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
          disabled={!canPrev}
          className={`w-6 h-6 flex items-center justify-center bg-transparent ${
            canPrev ? "text-gray-700 hover:text-black cursor-pointer" : "text-gray-300 cursor-not-allowed"
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-[13px] text-gray-800">
          {month.getFullYear()}년 {month.getMonth() + 1}월
        </span>
        <button
          type="button"
          onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
          className="w-6 h-6 flex items-center justify-center bg-transparent text-gray-700 hover:text-black cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 mb-1">
        {["일", "월", "화", "수", "목", "금", "토"].map((w, i) => (
          <div
            key={w}
            className={`text-center text-[11px] py-1 ${
              i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-gray-400"
            }`}
          >
            {w}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((d, i) => {
          if (d === null) return <div key={i} />;
          const date = new Date(month.getFullYear(), month.getMonth(), d);
          const t = stripTime(date);
          const isPast = t < minTime;
          const isAnchor = t === windowStart;
          const isInWindow = t > windowStart && t < windowEnd;
          const isEnd = t === windowEnd;
          const dow = date.getDay();

          let cellCls = "flex items-center justify-center text-[12px] aspect-square rounded-full transition-colors";

          if (isAnchor || isEnd) {
            cellCls += " bg-black text-white";
          } else if (isInWindow) {
            cellCls += " bg-[#f0ede8] text-gray-800";
          } else if (isPast) {
            cellCls += " text-gray-300 cursor-not-allowed";
          } else {
            const tone = dow === 0 ? "text-red-400" : dow === 6 ? "text-blue-400" : "text-gray-700";
            cellCls += ` ${tone} hover:bg-gray-100 cursor-pointer`;
          }

          return (
            <button
              key={i}
              type="button"
              disabled={isPast}
              onClick={() => !isPast && onSelect(date)}
              className={cellCls}
            >
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
}
