"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { X, ImagePlus } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { StarRating } from "@/components/ui/StarRating";
import { useToast } from "@/components/ui/Toast";

const MIN_CONTENT = 10;
const MAX_CONTENT = 500;
const MAX_IMAGES = 5;

interface AttachedImage {
  id: number;
  url: string;
}

export interface ReviewWriteTarget {
  productName: string;
  productImage: string;
  /** 수정 모드면 기존 값 전달. */
  rating?: number;
  content?: string;
}

interface Props {
  target: ReviewWriteTarget | null;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 리뷰 작성/수정 모달 — 1차는 UI만(저장은 mock).
 * 백엔드 리뷰 API(#86) 연동 시 handleSubmit 내부만 실제 호출로 교체한다.
 */
export function ReviewWriteModal({ target, isOpen, onClose }: Props) {
  const toast = useToast();
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");
  const [images, setImages] = useState<AttachedImage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageIdRef = useRef(0);
  const isEdit = typeof target?.rating === "number";

  // 첨부 미리보기 objectURL 일괄 해제 — 닫기·초기화 시 호출(메모리 누수 방지).
  const revokeAll = (list: AttachedImage[]) => {
    list.forEach((img) => URL.revokeObjectURL(img.url));
  };

  // 모달이 열리는 순간 대상 값으로 폼을 초기화한다.
  // (effect 대신 렌더 중 prop 변화 감지 — React 권장 패턴)
  const [wasOpen, setWasOpen] = useState(false);
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) {
      setRating(target?.rating ?? 0);
      setContent(target?.content ?? "");
      setImages((prev) => {
        revokeAll(prev);
        return [];
      });
    }
  }

  const handleClose = () => {
    setImages((prev) => {
      revokeAll(prev);
      return [];
    });
    onClose();
  };

  const handleAddImages = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setImages((prev) => {
      const room = MAX_IMAGES - prev.length;
      if (room <= 0) {
        toast.info(`사진은 최대 ${MAX_IMAGES}장까지 첨부할 수 있어요.`);
        return prev;
      }
      const picked = Array.from(files)
        .slice(0, room)
        .map((file) => ({ id: ++imageIdRef.current, url: URL.createObjectURL(file) }));
      return [...prev, ...picked];
    });
    // 같은 파일 다시 선택 가능하도록 input 초기화
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveImage = (id: number) => {
    setImages((prev) => {
      const found = prev.find((img) => img.id === id);
      if (found) URL.revokeObjectURL(found.url);
      return prev.filter((img) => img.id !== id);
    });
  };

  const trimmed = content.trim();
  const canSubmit = rating >= 1 && trimmed.length >= MIN_CONTENT && trimmed.length <= MAX_CONTENT;

  const handleSubmit = () => {
    if (!canSubmit) return;
    // TODO(#86): 백엔드 리뷰 등록/수정 + 이미지 업로드 API 연동. 현재는 외형용 mock.
    toast.success(isEdit ? "리뷰가 수정되었습니다." : "리뷰가 등록되었습니다.", {
      detail: "백엔드 연동 전이라 실제 저장은 되지 않습니다.",
    });
    handleClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      labelledBy="review-write-title"
      position="center"
      zIndex={50}
      className="w-full max-w-[440px] flex flex-col"
      style={{
        background: "var(--bg-white)",
        border: "1px solid var(--ink)",
        borderRadius: "var(--r-btn)",
        maxHeight: "calc(100vh - 32px)",
      }}
    >
      {/* 헤더 */}
      <header
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: "1px solid var(--ink)" }}
      >
        <h2 id="review-write-title" className="t-h3" style={{ color: "var(--ink)" }}>
          {isEdit ? "리뷰 수정" : "리뷰 작성"}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="cursor-pointer"
          style={{ background: "transparent", border: "none", padding: 4 }}
        >
          <X size={18} color="var(--ink)" />
        </button>
      </header>

      {/* 본문 */}
      <div className="flex flex-col gap-4 overflow-y-auto px-5 py-5">
        {/* 대상 상품 */}
        {target && (
          <div className="flex items-center gap-3">
            <div
              className="shrink-0 overflow-hidden"
              style={{
                width: 48,
                height: 48,
                background: "var(--bg-off)",
                border: "1px solid var(--neutral-stone)",
                borderRadius: "var(--r-btn)",
              }}
            >
              <Image
                src={target.productImage}
                alt={target.productName}
                width={48}
                height={48}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
            <p className="t-small" style={{ color: "var(--ink)" }}>
              {target.productName}
            </p>
          </div>
        )}

        {/* 별점 입력 */}
        <div className="flex flex-col gap-1.5">
          <span className="t-small" style={{ color: "var(--ink)" }}>
            별점
            <span className="ml-1" style={{ color: "var(--alert-red)" }}>*</span>
          </span>
          <StarRating value={rating} size={28} onChange={setRating} ariaLabel="별점 선택" />
        </div>

        {/* 내용 입력 */}
        <div className="flex flex-col gap-1.5">
          <label className="t-small" style={{ color: "var(--ink)" }}>
            리뷰 내용
            <span className="ml-1" style={{ color: "var(--alert-red)" }}>*</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={MAX_CONTENT}
            rows={5}
            placeholder={`상품에 대한 솔직한 후기를 ${MIN_CONTENT}자 이상 남겨주세요.`}
            style={{
              width: "100%",
              padding: "10px 12px",
              fontSize: 13,
              color: "var(--ink)",
              background: "var(--bg-white)",
              border: "1px solid var(--neutral-stone)",
              borderRadius: "var(--r-btn)",
              outline: "none",
              resize: "vertical",
              minHeight: 110,
            }}
          />
          <div className="flex justify-end">
            <span className="t-caption" style={{ color: "var(--ink-light)" }}>
              {trimmed.length}/{MAX_CONTENT}
            </span>
          </div>
        </div>

        {/* 사진 첨부 */}
        <div className="flex flex-col gap-1.5">
          <span className="t-small" style={{ color: "var(--ink)" }}>
            사진 첨부
            <span className="ml-1 t-caption" style={{ color: "var(--ink-light)" }}>
              (선택 · 최대 {MAX_IMAGES}장)
            </span>
          </span>
          <div className="flex flex-wrap gap-2">
            {images.map((image) => (
              <div
                key={image.id}
                className="relative overflow-hidden"
                style={{
                  width: 72,
                  height: 72,
                  border: "1px solid var(--neutral-stone)",
                  borderRadius: "var(--r-btn)",
                  background: "var(--bg-off)",
                }}
              >
                <Image
                  src={image.url}
                  alt="첨부 이미지 미리보기"
                  width={72}
                  height={72}
                  unoptimized
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(image.id)}
                  aria-label="사진 삭제"
                  className="absolute top-1 right-1 flex items-center justify-center"
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    background: "rgba(37, 10, 0, 0.6)",
                    border: "none",
                  }}
                >
                  <X size={11} color="#fff" />
                </button>
              </div>
            ))}

            {images.length < MAX_IMAGES && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                aria-label="사진 추가"
                className="flex flex-col items-center justify-center gap-0.5"
                style={{
                  width: 72,
                  height: 72,
                  border: "1px dashed var(--neutral-stone)",
                  borderRadius: "var(--r-btn)",
                  background: "var(--bg-white)",
                  color: "var(--ink-light)",
                }}
              >
                <ImagePlus size={18} />
                <span style={{ fontSize: 11 }}>
                  {images.length}/{MAX_IMAGES}
                </span>
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => handleAddImages(e.target.files)}
          />
        </div>
      </div>

      {/* 푸터 */}
      <footer
        className="flex gap-2 px-5 py-4"
        style={{ borderTop: "1px solid var(--neutral-stone)" }}
      >
        <button
          type="button"
          onClick={onClose}
          className="btn btn-ghost btn-md flex-1"
          style={{ border: "1px solid var(--ink)" }}
        >
          취소
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="btn btn-dark btn-md flex-1"
        >
          {isEdit ? "수정 완료" : "등록"}
        </button>
      </footer>
    </Modal>
  );
}
