"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DatePickerCalendarProps {
  selected: Date;
  minDate: Date;
  onSelect: (d: Date) => void;
}

const stripTime = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

export function DatePickerCalendar({ selected, minDate, onSelect }: DatePickerCalendarProps) {
  const [month, setMonth] = useState(() => new Date(selected.getFullYear(), selected.getMonth(), 1));
  const firstDay = month.getDay();
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const minTime = stripTime(minDate);
  const selectedTime = stripTime(selected);
  const minMonth = new Date(minDate.getFullYear(), minDate.getMonth(), 1).getTime();
  const canPrev = month.getTime() > minMonth;

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() =>
            canPrev && setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))
          }
          disabled={!canPrev}
          className={`bg-transparent px-2 leading-none ${
            canPrev ? "cursor-pointer text-gray-800 hover:text-black" : "cursor-not-allowed text-gray-300"
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-[13px]">
          {month.getFullYear()}.{String(month.getMonth() + 1).padStart(2, "0")}
        </span>
        <button
          type="button"
          onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
          className="bg-transparent px-2 leading-none text-gray-800 hover:text-black cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {["일", "월", "화", "수", "목", "금", "토"].map((w, i) => (
          <div
            key={w}
            className={`py-1 text-center text-[10px] ${
              i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-gray-500"
            }`}
          >
            {w}
          </div>
        ))}
        {cells.map((d, i) => {
          if (d === null) return <div key={i} />;
          const date = new Date(month.getFullYear(), month.getMonth(), d);
          const t = stripTime(date);
          const disabled = t < minTime;
          const isSelected = t === selectedTime;
          const dow = date.getDay();
          const tone =
            dow === 0 ? "text-red-400" : dow === 6 ? "text-blue-400" : "text-gray-800";
          return (
            <button
              key={i}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(date)}
              className={`flex aspect-square items-center justify-center bg-transparent text-[13px] ${
                disabled
                  ? "cursor-not-allowed text-gray-300"
                  : isSelected
                    ? "bg-[#8C451D] text-white cursor-pointer"
                    : `${tone} cursor-pointer hover:bg-gray-100`
              }`}
            >
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
}
