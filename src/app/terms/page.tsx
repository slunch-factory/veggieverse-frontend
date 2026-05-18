import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "이용약관 - 슬런치 팩토리",
  description: "슬런치 팩토리 이용약관",
};

export default function TermsPage() {
  return (
    <LegalPage title="이용약관" lastUpdated="2026-05-18">
      <section>
        <h2>제1조 (목적)</h2>
        <p>
          본 약관은 (주)슬런치팩토리(이하 &ldquo;회사&rdquo;라 합니다)가 운영하는 슬런치 팩토리
          웹사이트(이하 &ldquo;서비스&rdquo;라 합니다)에서 제공하는 서비스의 이용과 관련하여
          회사와 회원의 권리·의무 및 책임 사항을 규정함을 목적으로 합니다.
        </p>
      </section>

      <section>
        <h2>제2조 (용어의 정의)</h2>
        <p>
          본 약관에서 사용하는 용어의 정의는 다음과 같습니다.
        </p>
        <ol>
          <li>&ldquo;서비스&rdquo;란 회사가 운영하는 슬런치 팩토리 웹사이트 및 관련 서비스 일체를 의미합니다.</li>
          <li>&ldquo;회원&rdquo;이란 본 약관에 동의하고 회사가 제공하는 서비스를 이용하는 자를 말합니다.</li>
          <li>&ldquo;아이디(ID)&rdquo;란 회원의 식별과 서비스 이용을 위해 등록된 이메일 주소를 말합니다.</li>
        </ol>
        <p className="legal-todo">TBD: 추가 용어 정의가 필요한 경우 법무 검토 후 보강 — 결제·주문·환불 관련 용어 등.</p>
      </section>

      <section>
        <h2>제3조 (약관의 효력 및 변경)</h2>
        <ol>
          <li>본 약관은 서비스를 이용하고자 하는 모든 회원에 대하여 효력을 발생합니다.</li>
          <li>회사는 관련 법령을 위배하지 않는 범위에서 본 약관을 변경할 수 있으며, 변경된 약관은 시행 7일 전부터 공지합니다.</li>
        </ol>
      </section>

      <section>
        <h2>제4조 (회원가입)</h2>
        <p>
          회원가입은 이용자가 본 약관 및 개인정보 처리방침에 동의하고, 회사가 정한 가입 양식에
          따라 회원정보를 기입한 후 가입 신청을 함으로써 이루어집니다.
        </p>
      </section>

      <section>
        <h2>제5조 (서비스 이용)</h2>
        <ol>
          <li>회원은 본 약관 및 회사가 정한 운영 정책을 준수해야 합니다.</li>
          <li>회사는 서비스의 안정적 제공을 위해 필요한 경우 서비스의 전부 또는 일부를 일시적으로 중단할 수 있습니다.</li>
        </ol>
      </section>

      <section>
        <h2>제6조 (회원 탈퇴 및 자격 상실)</h2>
        <p>
          회원은 언제든지 마이페이지에서 탈퇴를 신청할 수 있으며, 회사는 회원이 본 약관에 위배되는
          행위를 한 경우 회원 자격을 제한·정지·상실시킬 수 있습니다.
        </p>
      </section>

      <section>
        <h2>제7조 (개인정보 보호)</h2>
        <p>
          회사는 회원의 개인정보를 보호하기 위해 노력하며, 개인정보의 처리에 관한 상세한 내용은
          별도의 <a href="/privacy">개인정보 처리방침</a>에 따릅니다.
        </p>
      </section>

      <section>
        <h2>제8조 (분쟁의 해결)</h2>
        <p>
          본 약관과 관련하여 회사와 회원 간에 분쟁이 발생한 경우, 양 당사자는 상호 협의하여
          해결하도록 노력하며, 협의가 이루어지지 않을 경우 관할 법원의 판결에 따릅니다.
        </p>
      </section>

      <p className="legal-todo">
        TBD: 본 약관 초안은 표준 양식 기반의 골격이며, 실제 서비스 출시 전 법무 검토가 필요합니다.
      </p>
    </LegalPage>
  );
}
