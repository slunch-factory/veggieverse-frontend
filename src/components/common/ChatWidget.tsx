"use client";

import { useState } from "react";

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Chat Trigger */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-transform overflow-hidden"
        style={{ background: "transparent", border: "none", padding: 0 }}
        aria-label="채팅 열기"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/characters/chatbot.png`}
          alt="챗봇"
          className="w-full h-full object-cover rounded-full"
        />
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 h-96 bg-white rounded-2xl shadow-2xl border border-stone-200 flex flex-col">
          <div className="p-4 border-b border-stone-200 flex items-center justify-between">
            <span className="text-stone-800">VeggieVerse 챗봇</span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-stone-400 hover:text-stone-600"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 p-4 flex items-center justify-center text-sm text-stone-400">
            채팅 기능 준비 중입니다.
          </div>
        </div>
      )}
    </>
  );
}
