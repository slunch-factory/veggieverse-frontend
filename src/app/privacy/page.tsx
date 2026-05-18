import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "개인정보 처리방침 - 슬런치 팩토리",
  description: "슬런치 팩토리 개인정보 처리방침",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="개인정보 처리방침" lastUpdated="2026-05-18">
      <section>
        <p>
          (주)슬런치팩토리(이하 &ldquo;회사&rdquo;)는 「개인정보 보호법」 등 관련 법령을 준수하며,
          이용자의 개인정보를 안전하게 보호하기 위해 다음과 같은 처리방침을 두고 있습니다.
        </p>
      </section>

      <section>
        <h2>1. 수집하는 개인정보 항목</h2>
        <ul>
          <li><strong>필수 항목</strong>: 이메일 주소, 비밀번호, 이름, 휴대전화번호</li>
          <li><strong>주문 시</strong>: 배송지 주소, 받는 사람 이름·연락처</li>
          <li><strong>결제 시</strong>: 결제수단 정보(토스 페이먼츠 등 외부 결제 대행사가 처리, 회사는 직접 저장하지 않음)</li>
          <li><strong>자동 수집</strong>: IP 주소, 쿠키, 접속 로그, 기기 정보</li>
        </ul>
      </section>

      <section>
        <h2>2. 개인정보의 수집 및 이용 목적</h2>
        <ul>
          <li>회원 가입 및 관리, 본인 확인</li>
          <li>상품 주문·결제·배송·환불 처리</li>
          <li>고객 문의 응대, 공지사항 전달</li>
          <li>마케팅 및 광고 활용(별도 동의 시)</li>
          <li>서비스 부정 이용 방지 및 보안</li>
        </ul>
      </section>

      <section>
        <h2>3. 개인정보의 보유 및 이용기간</h2>
        <p>
          회사는 회원 탈퇴 시까지 개인정보를 보유합니다. 다만 관계 법령에 따라 다음 정보는
          명시된 기간 동안 보관합니다.
        </p>
        <ul>
          <li>계약 또는 청약철회 등에 관한 기록: 5년 (전자상거래법)</li>
          <li>대금결제 및 재화 등의 공급에 관한 기록: 5년 (전자상거래법)</li>
          <li>소비자의 불만 또는 분쟁처리에 관한 기록: 3년 (전자상거래법)</li>
          <li>접속 로그: 3개월 (통신비밀보호법)</li>
        </ul>
      </section>

      <section>
        <h2>4. 개인정보의 제3자 제공</h2>
        <p>
          회사는 이용자의 개인정보를 본 처리방침에 명시한 범위 내에서만 처리하며, 이용자의
          사전 동의 없이는 제3자에게 제공하지 않습니다. 다만 다음의 경우는 예외입니다.
        </p>
        <ul>
          <li>이용자가 사전에 동의한 경우</li>
          <li>법령에 의해 요구되는 경우</li>
        </ul>
        <p className="legal-todo">
          TBD: 결제·배송 대행사 등 제3자 제공 대상이 있다면 구체적으로 명시 필요.
        </p>
      </section>

      <section>
        <h2>5. 개인정보 처리업무의 위탁</h2>
        <ul>
          <li>토스페이먼츠: 결제 처리</li>
          <li>Supabase: 인증·세션 관리</li>
        </ul>
        <p className="legal-todo">TBD: 배송 대행, CDN, 이메일 발송, 푸시 등 추가 위탁사 정리.</p>
      </section>

      <section>
        <h2>6. 정보주체의 권리</h2>
        <p>
          이용자는 언제든지 자신의 개인정보를 조회·정정·삭제할 수 있으며, 처리 정지를 요구할
          수 있습니다. 권리 행사는 마이페이지 또는 아래 개인정보 보호책임자 연락처를 통해
          하실 수 있습니다.
        </p>
      </section>

      <section>
        <h2>7. 개인정보 보호책임자</h2>
        <ul>
          <li>책임자: TBD</li>
          <li>연락처: slunch@slunch.co.kr</li>
        </ul>
        <p className="legal-todo">TBD: 실제 책임자명·직책·연락처 기입 필요.</p>
      </section>

      <section>
        <h2>8. 처리방침의 변경</h2>
        <p>
          본 처리방침은 시행일부터 적용되며, 변경 시 시행 7일 전부터 공지합니다.
        </p>
      </section>

      <p className="legal-todo">
        TBD: 본 처리방침 초안은 표준 양식 기반의 골격이며, 실제 서비스 출시 전 개인정보보호법
        준수 여부 법무 검토가 필요합니다.
      </p>
    </LegalPage>
  );
}
