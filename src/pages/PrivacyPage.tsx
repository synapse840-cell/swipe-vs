import { LegalLayout, LegalSection } from '../components/LegalLayout';

export function PrivacyPage() {
  return (
    <LegalLayout title="プライバシーポリシー" updatedAt="2026年7月12日">
      <p className="legal-lead">
        Swipe VS（以下「本サービス」）は、ユーザーの個人情報および関連情報の取扱いについて、
        以下のとおりプライバシーポリシー（以下「本ポリシー」）を定めます。
      </p>

      <LegalSection title="1. 取得する情報">
        <p>本サービスでは、以下の情報を取得・生成する場合があります。</p>
        <ul>
          <li>匿名ユーザーID（Supabase 認証により自動発行）</li>
          <li>投票内容（どのお題に、A/B のどちらに投票したか）</li>
          <li>お題・コメントのテキスト、カテゴリ、投稿日時</li>
          <li>お題に添付した画像（Supabase Storage に保存）</li>
          <li>お気に入り、閲覧履歴、コメントへのいいね等の利用履歴</li>
          <li>端末のローカルストレージに保存される表示設定やフィード状態</li>
          <li>アクセスログ（IPアドレス、ブラウザ種別、アクセス日時等）</li>
        </ul>
        <p>
          本サービスは、原則として氏名・メールアドレス・電話番号等の個人を直接特定する情報の入力を求めません。
        </p>
      </LegalSection>

      <LegalSection title="2. 利用目的">
        <p>取得した情報は、以下の目的で利用します。</p>
        <ul>
          <li>本サービスの提供・維持・改善</li>
          <li>投票結果の集計、お題・コメントの表示</li>
          <li>不正利用の防止、セキュリティ確保</li>
          <li>障害対応、利用状況の分析</li>
          <li>お問い合わせへの対応</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. 第三者サービス">
        <p>本サービスは、以下の外部サービスを利用しています。</p>
        <ul>
          <li>
            <strong>Supabase</strong>（データベース、認証、画像ストレージ）
          </li>
          <li>
            <strong>Vercel</strong>（Webアプリのホスティング）
          </li>
          <li>
            <strong>Unsplash 等</strong>（デフォルト画像の配信）
          </li>
        </ul>
        <p>
          これらのサービス提供者において、それぞれのプライバシーポリシーに基づき情報が処理される場合があります。
        </p>
      </LegalSection>

      <LegalSection title="4. Cookie・ローカルストレージ">
        <p>
          本サービスは、ログイン状態の維持、利用履歴の保存等のために、
          Cookie およびブラウザのローカルストレージを使用します。
          ブラウザ設定により無効化できますが、一部機能が利用できなくなる場合があります。
        </p>
      </LegalSection>

      <LegalSection title="5. 第三者提供">
        <p>
          法令に基づく場合を除き、本人の同意なく個人情報を第三者に提供しません。
        </p>
      </LegalSection>

      <LegalSection title="6. 保管期間">
        <p>
          取得した情報は、利用目的の達成に必要な期間保管します。
          お題の非公開・削除、サービス終了等に応じて、合理的な期間内に削除または匿名化します。
        </p>
      </LegalSection>

      <LegalSection title="7. 安全管理">
        <p>
          運営者は、不正アクセス、漏えい等を防止するため、
          アクセス制御（RLS）、通信の暗号化（HTTPS）等の合理的な安全管理措置を講じます。
        </p>
      </LegalSection>

      <LegalSection title="8. ユーザーの権利">
        <p>
          ご自身の情報の開示、訂正、削除等を希望される場合は、お問い合わせください。
          匿名アカウントの性質上、本人確認が困難な場合があります。
        </p>
      </LegalSection>

      <LegalSection title="9. 未成年者">
        <p>
          未成年者が本サービスを利用する場合は、保護者の同意を得たうえでご利用ください。
        </p>
      </LegalSection>

      <LegalSection title="10. ポリシーの変更">
        <p>
          本ポリシーは、法令の改正やサービス内容の変更に応じて更新されることがあります。
          重要な変更がある場合は、本サービス上で告知します。
        </p>
      </LegalSection>

      <LegalSection title="11. お問い合わせ">
        <p>
          本ポリシーに関するお問い合わせは、本サービス運営者までご連絡ください。
          （連絡先はサービス内告知または公式ページで案内します）
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
