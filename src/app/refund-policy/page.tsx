import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "환불·취소 정책 - 슬런치 팩토리",
  description: "슬런치 팩토리 환불 및 취소 정책",
};

export default function RefundPolicyPage() {
  return (
    <LegalPage title="환불·취소 정책" lastUpdated="2026-05-18">
      <section>
        <p>
          본 정책은 슬런치 팩토리에서 구매하신 상품의 결제 취소·환불에 관한 기준을 안내합니다.
          관련 법령(전자상거래법, 소비자보호법 등)에 우선하지 않는 범위 내에서 적용됩니다.
        </p>
      </section>

      <section>
        <h2>1. 결제 취소 (배송 전)</h2>
        <p>
          주문 후 배송이 시작되기 전이라면 마이페이지 &gt; 주문 내역에서 직접 결제 취소를
          신청하실 수 있습니다. 취소 즉시 결제 수단으로 자동 환불됩니다.
        </p>
      </section>

      <section>
        <h2>2. 환불 (배송 후)</h2>
        <ul>
          <li>상품 수령 후 7일 이내 환불 신청이 가능합니다.</li>
          <li>단순 변심에 의한 환불의 경우 왕복 배송비는 고객 부담입니다.</li>
          <li>상품 하자 또는 오배송의 경우 회사가 배송비를 부담합니다.</li>
          <li>현 단계에서는 <strong>전액 환불(부분 환불 불가)</strong> 만 지원합니다.</li>
        </ul>
      </section>

      <section>
        <h2>3. 환불 불가 사유</h2>
        <ul>
          <li>이용자의 책임 있는 사유로 상품이 멸실 또는 훼손된 경우</li>
          <li>이용자의 사용 또는 일부 소비로 상품의 가치가 현저히 감소한 경우</li>
          <li>식품 등 특성상 재판매가 어려운 상품으로서 포장을 개봉한 경우</li>
          <li>관련 법령에서 환불을 제한하는 경우</li>
        </ul>
        <p className="legal-todo">
          TBD: 비건 식품 상품군의 특성을 반영하여 환불 불가 사유 세부 조항 보강 필요.
        </p>
      </section>

      <section>
        <h2>4. 환불 처리 기간</h2>
        <ul>
          <li>환불 요청 접수 후 영업일 기준 3~5일 이내 처리됩니다.</li>
          <li>실제 환불 완료 시점은 결제 수단(카드사·은행) 정책에 따라 1~7영업일 추가 소요될 수 있습니다.</li>
        </ul>
      </section>

      <section>
        <h2>5. 환불 신청 방법</h2>
        <ol>
          <li>마이페이지 &gt; 주문 내역에서 해당 주문 상세 페이지로 이동합니다.</li>
          <li>&ldquo;환불 요청&rdquo; 버튼을 클릭하고 환불 사유를 입력합니다.</li>
          <li>접수 완료 시 등록된 이메일로 안내 메일이 발송됩니다.</li>
        </ol>
      </section>

      <section>
        <h2>6. 문의</h2>
        <p>
          환불 관련 문의는 <a href="mailto:slunch@slunch.co.kr">slunch@slunch.co.kr</a> 또는
          고객센터(032-224-6525)로 연락 주시기 바랍니다.
        </p>
      </section>

      <p className="legal-todo">
        TBD: 본 정책 초안은 일반적인 이커머스 환불 정책 골격이며, 슬런치 팩토리의 실제 운영
        정책에 맞춰 보강·법무 검토가 필요합니다.
      </p>
    </LegalPage>
  );
}
