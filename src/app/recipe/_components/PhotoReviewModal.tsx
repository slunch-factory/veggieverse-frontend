"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { X } from "lucide-react";
import type { ToastProps } from "./Toast";

export interface PhotoReview {
  id: string;
  authorName: string;
  content: string;
  rating: number;
  image: string;
  createdAt: string;
}

interface PhotoReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipeId: number | string;
  recipeTitle: string;
  onReviewSubmitted: (review: PhotoReview) => void;
  onToast: (toast: Omit<ToastProps, "id" | "onClose">) => void;
}

export function PhotoReviewModal({
  isOpen,
  onClose,
  recipeId,
  recipeTitle,
  onReviewSubmitted,
  onToast,
}: PhotoReviewModalProps) {
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setImagePreview(URL.createObjectURL(file));
  };

  const reset = () => {
    setContent("");
    setRating(5);
    setImagePreview(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!imagePreview) {
      onToast({ type: "info", title: "사진이 필요합니다", message: "요리 완료 사진을 업로드해야 인증이 완료됩니다." });
      return;
    }
    if (!content.trim()) {
      onToast({ type: "info", title: "한 줄 평을 작성해주세요", message: "요리에 대한 간단한 후기를 남겨주세요." });
      return;
    }

    setIsSubmitting(true);

    const review: PhotoReview = {
      id: `review-${Date.now()}`,
      authorName: "사용자",
      content: content.trim(),
      rating,
      image: imagePreview,
      createdAt: new Date().toISOString(),
    };

    try {
      const existing = JSON.parse(localStorage.getItem(`veggieverse-recipe-${recipeId}-reviews`) || "[]");
      existing.push(review);
      localStorage.setItem(`veggieverse-recipe-${recipeId}-reviews`, JSON.stringify(existing));
    } catch { /* ignore */ }

    onReviewSubmitted(review);
    onToast({ type: "success", title: "리뷰 완료", message: "포토 리뷰가 성공적으로 등록되었습니다." });
    reset();
    onClose();
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40" onClick={handleClose}>
      <div className="bg-white border border-black rounded-2xl max-w-[480px] w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex justify-between items-start px-6 pt-6">
          <div>
            <h2 className="text-[18px] text-black mb-1">요리 인증</h2>
            <p className="text-[13px] text-[#888]">{recipeTitle}</p>
          </div>
          <button onClick={handleClose} className="w-8 h-8 flex items-center justify-center" aria-label="닫기">
            <X size={20} strokeWidth={1} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* 사진 업로드 */}
          <div className="mb-6">
            <label className="block text-[13px] text-black mb-2">사진 첨부</label>
            <div
              className="border border-black rounded-lg p-6 text-center cursor-pointer min-h-[120px] flex items-center justify-center"
              onClick={() => document.getElementById("photo-input")?.click()}
            >
              {imagePreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imagePreview} alt="Preview" className="max-w-full max-h-[200px] object-contain rounded" />
              ) : (
                <span className="text-[14px] text-[#888]">사진 첨부</span>
              )}
              <input id="photo-input" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </div>
          </div>

          {/* 별점 */}
          <div className="mb-6">
            <label className="block text-[13px] text-black mb-2">별점</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" onClick={() => setRating(star)} className="p-0.5">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill={star <= rating ? "#000" : "none"} stroke="#000" strokeWidth="1">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </button>
              ))}
              <span className="ml-2 text-[13px] text-[#666]">{rating} / 5</span>
            </div>
          </div>

          {/* 한 줄 평 */}
          <div className="mb-6">
            <label className="block text-[13px] text-black mb-2">한 줄 평</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              className="w-full p-3 border border-black rounded-lg text-[14px] resize-none outline-none"
              placeholder="요리에 대한 간단한 후기를 남겨주세요"
            />
          </div>

          {/* 버튼 */}
          <div className="flex gap-3">
            <button type="button" onClick={handleClose} className="flex-1 py-3.5 border border-black rounded-lg text-[14px] text-black">
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3.5 bg-black rounded-lg text-[14px] text-white disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "인증 중..." : "인증하기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
