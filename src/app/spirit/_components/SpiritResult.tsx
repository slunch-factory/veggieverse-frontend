"use client";

import { useState, useCallback } from "react";
import { Sparkles, Share2, Download, UserCircle, Check, X, Link2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { VegetableItem } from "@/types";

interface VeganType {
  mbti: string;
  name: string;
  emoji: string;
  description: string;
  color: string;
}

interface SpiritResultProps {
  result: VeganType;
  selectedItems: VegetableItem[];
  isGeneratingImage: boolean;
  monsterImageUrl: string | null;
  onRegenerate: () => void;
  onSaveProfile: (profileImage: string, veganType: string) => void;
}

const getSpiritCurationMessage = (spiritName: string): string => {
  const messages: Record<string, string> = {
    Bloomist: "새로운 조합 좋아할 것 같아요",
    Mindgrower: "깔끔하고 건강한 거 모았어요",
    "Quiet Root": "정성 들어간 레시피예요",
    Lightgiver: "같이 먹으면 더 좋은 거예요",
    Forger: "빠르고 효율적인 거 모았어요",
    Groundtype: "영양 밸런스 좋은 거예요",
    Planter: "검증된 레시피만 모았어요",
    Strategreen: "효율 좋은 레시피예요",
    Floret: "예쁘고 감각적인 거예요",
    Joybean: "만들면서 재밌는 거예요",
    Careleaf: "푸짐하게 나눠 먹기 좋아요",
    Nurturer: "속 편하고 건강한 거예요",
    Thinkroot: "원리 이해하면 쉬운 거예요",
    Sparknut: "독특한 조합이에요",
    Craftbean: "직접 만들기 좋은 거예요",
    Wildgrain: "일단 해보기 좋은 거예요",
  };
  return messages[spiritName] || `${spiritName}에게 어울리는 레시피예요`;
};

export function SpiritResult({
  result,
  selectedItems,
  isGeneratingImage,
  monsterImageUrl,
  onRegenerate,
  onSaveProfile,
}: SpiritResultProps) {
  const router = useRouter();
  const [profileSaved, setProfileSaved] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareMessage, setShareMessage] = useState("");
  const [copyToast, setCopyToast] = useState(false);
  const [showRecipeCurationModal, setShowRecipeCurationModal] = useState(false);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(`${shareMessage || result.name}\n\n${window.location.href}`);
      setCopyToast(true);
      setTimeout(() => setCopyToast(false), 2000);
    } catch { /* ignore */ }
  }, [shareMessage, result.name]);

  return (
    <div className="min-h-screen bg-[#B2B2B2]">
      <div className="flex items-center justify-center min-h-screen p-8">
        <div className="bg-white p-8 max-w-2xl w-full shadow-sm rounded-2xl">

          {/* AI 스피릿 이미지 */}
          <div className="relative w-full aspect-square max-w-sm mx-auto mb-6 overflow-hidden bg-gradient-to-br from-emerald-100 via-lime-50 to-yellow-100">
            {isGeneratingImage ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-[#E0E0E0] animate-spin border-t-black" />
                  <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-black animate-pulse" />
                </div>
                <p className="mt-4 text-black">스피릿 소환 중...</p>
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                <div className="text-8xl mb-4">🌱</div>
                <div className="flex gap-2 mb-4">
                  {selectedItems.map((item, idx) => (
                    <div key={item.id} className={`w-12 h-12 overflow-hidden border-2 border-white shadow-md ${idx > 0 ? "-ml-2" : ""}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain bg-white" />
                    </div>
                  ))}
                </div>
              </div>
            )}
            {!isGeneratingImage && (
              <button onClick={onRegenerate} className="absolute bottom-4 right-4 px-4 py-2 bg-white/90 backdrop-blur-sm text-sm text-stone-700 hover:bg-white transition-colors shadow-lg flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> 다른 형상 보기
              </button>
            )}
          </div>

          {/* 스피릿 정보 */}
          <div className="text-center">
            <h2 className="text-stone-800 mb-2 text-[var(--font-size-h1)]">{result.name}</h2>
            <p className="text-stone-500 text-sm mb-4">{result.description}</p>
            <div className="flex justify-center gap-2 flex-wrap mb-4">
              {[
                result.mbti.includes("T") ? "논리적" : "감성적",
                result.mbti.includes("J") ? "효율추구" : "유연함",
                "자연주의",
              ].map((keyword, idx) => (
                <span key={idx} className="px-3 py-1 rounded-full text-xs bg-stone-100 text-stone-700">#{keyword}</span>
              ))}
            </div>
          </div>

          {/* Primary CTA */}
          <div className="flex gap-4 mb-4">
            <button onClick={() => setShowShareModal(true)} className="flex-1 py-4 text-base flex items-center justify-center gap-2 text-white bg-[#8C451D]">
              <Share2 className="w-5 h-5" /> 공유하기
            </button>
            <button onClick={() => setShowRecipeCurationModal(true)} className="flex-1 py-4 text-base flex items-center justify-center gap-2 text-white bg-[#8C451D]">
              레시피 보기
            </button>
          </div>

          {/* Secondary CTA */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button className="py-3 px-4 border-2 border-[#B2B2B2] bg-[#B2B2B2] text-white flex items-center justify-center gap-2">
              <Download className="w-5 h-5" /> 이미지 저장
            </button>
            <button
              onClick={() => {
                if (!profileSaved) {
                  onSaveProfile(monsterImageUrl || selectedItems[0]?.imageUrl || "", result.name);
                  setProfileSaved(true);
                }
              }}
              disabled={profileSaved}
              className={`py-3 px-4 border-2 flex items-center justify-center gap-2 ${
                profileSaved
                  ? "border-[#E0E0E0] bg-[#F5F5F5] text-black"
                  : "border-[#B2B2B2] bg-[#B2B2B2] text-white"
              }`}
            >
              {profileSaved ? <><Check className="w-5 h-5" /> 저장됨</> : <><UserCircle className="w-5 h-5" /> 프로필에 북마크</>}
            </button>
          </div>

          {/* 공유 모달 */}
          {showShareModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setShowShareModal(false)}>
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
              <div className="relative bg-white shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[var(--font-size-h2)]">공유하기</h3>
                  <button onClick={() => setShowShareModal(false)} className="p-2 hover:bg-stone-100"><X className="w-5 h-5 text-stone-400" /></button>
                </div>
                <textarea
                  value={shareMessage || `나의 테이스트 스피릿은 ${result.name}\n\n${result.description}\n\n#테이스트스피릿 #슬런치`}
                  onChange={(e) => setShareMessage(e.target.value)}
                  className="w-full p-3 border-2 border-stone-200 resize-none focus:outline-none focus:border-stone-400 text-sm"
                  rows={5}
                />
                <div className="flex items-center justify-center gap-6 mt-4">
                  <button
                    onClick={() => { window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage || result.name)}`, "_blank"); setShowShareModal(false); }}
                    className="w-14 h-14 flex items-center justify-center bg-black hover:bg-stone-800 text-white text-xl"
                  >
                    𝕏
                  </button>
                  <button onClick={handleCopyLink} className="w-14 h-14 flex items-center justify-center border-2 border-stone-200 hover:border-stone-400">
                    <Link2 className="w-6 h-6 text-stone-700" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 복사 토스트 */}
          {copyToast && (
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[101] bg-stone-800 text-white px-6 py-3 shadow-lg animate-fadeIn">복사됨!</div>
          )}

          {/* 레시피 큐레이션 모달 */}
          {showRecipeCurationModal && (
            <div className="sl-modal-overlay" onClick={() => setShowRecipeCurationModal(false)}>
              <div className="sl-modal" onClick={(e) => e.stopPropagation()}>
                <div className="sl-modal-header">
                  <button className="sl-modal-close" onClick={() => setShowRecipeCurationModal(false)}>✕</button>
                </div>
                <div className="sl-modal-content">
                  <div className="flex flex-col items-center mb-6">
                    <div className="w-24 h-24 rounded-full flex items-center justify-center text-5xl shadow-lg mb-4" style={{ backgroundColor: `${result.color}20` }}>
                      {result.emoji}
                    </div>
                    <h3 className="text-[var(--font-size-h2)]">{result.name}를 위한 레시피</h3>
                    <p className="text-stone-600 text-center leading-relaxed mt-2">{getSpiritCurationMessage(result.name)}</p>
                  </div>
                  <button
                    onClick={() => { setShowRecipeCurationModal(false); router.push(`/recipe?spirit=${encodeURIComponent(result.name)}`); }}
                    className="w-full py-4 flex items-center justify-center gap-2 text-white bg-[#8C451D]"
                  >
                    레시피 보기
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 다시하기 */}
          <button
            onClick={() => { localStorage.removeItem("spirit-finder-answers"); router.push("/"); }}
            className="w-full mt-4 py-3 text-stone-500 hover:text-stone-700 hover:underline transition-colors"
          >
            다시 해볼래요?
          </button>
        </div>
      </div>
    </div>
  );
}
