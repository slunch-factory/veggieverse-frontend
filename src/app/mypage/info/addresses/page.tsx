"use client";

import { useEffect, useState } from "react";
import { MapPin, Search } from "lucide-react";
import { getUserProfile, updateUserProfile } from "@/lib/api/user";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/components/ui/Toast";
import { KakaoPostcodeModal } from "@/components/modals/KakaoPostcodeModal";

/**
 * 배송지 관리 — 현재 백엔드는 프로필에 단일 배송지(zipCode/street/detail)만 보관한다.
 * 다중 배송지는 백엔드 지원 후 2차에서 확장. (#63)
 */
export default function AddressesPage() {
  const { refetchProfile } = useUser();
  const toast = useToast();

  const [postalCode, setPostalCode] = useState("");
  const [street, setStreet] = useState("");
  const [detail, setDetail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [postcodeOpen, setPostcodeOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    getUserProfile()
      .then((profile) => {
        if (!alive || !profile) return;
        setPostalCode(profile.address?.zipCode ?? "");
        setStreet(profile.address?.street ?? "");
        setDetail(profile.address?.detail ?? "");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const hasBase = Boolean(postalCode && street);

  async function handleSave() {
    if (!hasBase) {
      toast.error("우편번호 찾기로 기본 주소를 먼저 입력해 주세요.");
      return;
    }
    setSaving(true);
    try {
      const ok = await updateUserProfile({
        address: { zipCode: postalCode, street, detail },
      });
      if (!ok) throw new Error("save failed");
      await refetchProfile();
      toast.success("배송지가 저장되었습니다.");
    } catch {
      toast.error("배송지 저장에 실패했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-[640px]">
      <div className="mb-6 flex items-center gap-2">
        <MapPin size={20} color="var(--ink)" />
        <h1 className="t-h3" style={{ color: "var(--ink)" }}>배송지 관리</h1>
      </div>

      {loading ? (
        <div
          className="h-44 animate-pulse"
          style={{ background: "var(--bg-off)", borderRadius: "var(--r-btn)" }}
        />
      ) : (
        <div
          className="flex flex-col gap-4 p-5"
          style={{
            background: "var(--bg-white)",
            border: "1px solid var(--ink)",
            borderRadius: "var(--r-btn)",
          }}
        >
          {/* 우편번호 + 찾기 */}
          <div>
            <label className="t-caption mb-1 block" style={{ color: "var(--ink-light)" }}>
              우편번호
            </label>
            <div className="flex gap-2">
              <input
                className="ds-input flex-1"
                value={postalCode}
                placeholder="우편번호"
                readOnly
              />
              <button
                type="button"
                className="btn btn-ghost shrink-0 inline-flex items-center"
                style={{ border: "1px solid var(--ink)" }}
                onClick={() => setPostcodeOpen(true)}
              >
                <Search size={15} className="mr-1" />
                우편번호 찾기
              </button>
            </div>
          </div>

          {/* 기본 주소 */}
          <div>
            <label className="t-caption mb-1 block" style={{ color: "var(--ink-light)" }}>
              기본 주소
            </label>
            <input
              className="ds-input w-full"
              value={street}
              placeholder="우편번호 찾기로 자동 입력됩니다"
              readOnly
            />
          </div>

          {/* 상세 주소 */}
          <div>
            <label className="t-caption mb-1 block" style={{ color: "var(--ink-light)" }}>
              상세 주소
            </label>
            <input
              className="ds-input w-full"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="동/호수 등 상세 주소"
            />
          </div>

          <button
            type="button"
            className="btn btn-dark w-full"
            onClick={handleSave}
            disabled={saving}
            style={{ justifyContent: "center" }}
          >
            {saving ? "저장 중..." : "배송지 저장"}
          </button>
        </div>
      )}

      <KakaoPostcodeModal
        isOpen={postcodeOpen}
        onClose={() => setPostcodeOpen(false)}
        onSelect={({ postalCode: zip, address }) => {
          setPostalCode(zip);
          setStreet(address);
          setDetail("");
          setPostcodeOpen(false);
        }}
      />
    </div>
  );
}
