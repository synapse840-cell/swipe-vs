import { LegalLayout, LegalSection } from '../components/LegalLayout';
import { LegalContactBlock, LegalOperatorSummary } from '../components/LegalContactBlock';
import { LEGAL } from '../lib/legalConfig';

export function PrivacyPage() {
  return (
    <LegalLayout title="プライバシーポリシー" updatedAt={LEGAL.lastUpdated}>
      <p className="legal-lead">
        {LEGAL.serviceName}（以下「本サービス」）は、ユーザーの個人情報および関連情報の取扱いについて、
        個人情報の保護に関する法律その他の関連法令を遵守し、
        以下のとおりプライバシーポリシー（以下「本ポリシー」）を定めます。
      </p>

      <LegalOperatorSummary />

      <LegalSection title="1. 取得する情報">
        <p>本サービスでは、以下の情報を取得・生成する場合があります。</p>
        <ul>
          <li>匿名ユーザーID（Supabase 認証により自動発行される識別子）</li>
          <li>投票内容（どのお題に、A/B のどちらに投票したか）</li>
          <li>お題・コメントのテキスト、カテゴリ、投稿日時</li>
          <li>お題に添付した画像（Supabase Storage に保存）</li>
          <li>お気に入り、閲覧履歴、コメントへのいいね等の利用履歴</li>
          <li>端末のローカルストレージに保存される表示設定やフィード状態</li>
          <li>アクセスログ（IPアドレス、ブラウザ種別、参照元、アクセス日時等）</li>
        </ul>
        <p>
          本サービスは、原則として氏名・メールアドレス・電話番号等、
          個人を直接特定する情報の入力を求めません。
          ただし、お問い合わせフォームからユーザーが任意で送信した情報は取得する場合があります。
        </p>
      </LegalSection>

      <LegalSection title="2. 利用目的">
        <p>取得した情報は、以下の目的で利用します。</p>
        <ul>
          <li>本サービスの提供・維持・改善</li>
          <li>投票結果の集計、お題・コメントの表示</li>
          <li>不正利用の防止、セキュリティ確保</li>
          <li>障害対応、品質改善、利用状況の分析</li>
          <li>お問い合わせ、通報、削除依頼への対応</li>
          <li>広告の配信および広告効果の測定</li>
          <li>法令に基づく対応</li>
        </ul>
        <p>上記の利用目的の範囲を超えて利用することはありません。</p>
      </LegalSection>

      <LegalSection title="3. 第三者サービス">
        <p>本サービスは、以下の外部サービスを利用しています。</p>
        <ul>
          <li>
            <strong>Supabase</strong>（データベース、認証、画像ストレージ）
            — データは主にアジア太平洋（東京）リージョンで処理・保管されます
          </li>
          <li>
            <strong>Vercel</strong>（Webアプリケーションのホスティング、配信）
          </li>
          <li>
            <strong>Unsplash 等</strong>（デフォルト画像の配信）
          </li>
          <li>
            <strong>Google AdSense</strong>（広告配信）
            — 広告の表示・効果測定のため、Cookie 等が利用される場合があります
          </li>
        </ul>
        <p>
          これらのサービス提供者において、それぞれのプライバシーポリシーに基づき情報が処理される場合があります。
          運営者は、委託先に対し、契約等により適切な安全管理が行われるよう努めます。
        </p>
      </LegalSection>

      <LegalSection title="4. Cookie・ローカルストレージ">
        <p>
          本サービスは、ログイン状態の維持、利用履歴の保存、表示設定の保持等のために、
          Cookie およびブラウザのローカルストレージを使用します。
        </p>
        <p>
          ブラウザ設定により Cookie やローカルストレージを無効化できますが、
          ログイン維持や履歴表示など、一部機能が利用できなくなる場合があります。
        </p>
        <p>
          Google AdSense 等の広告配信事業者は、広告の配信・効果測定のために Cookie 等を利用する場合があります。
          パーソナライズド広告の無効化は
          {' '}
          <a
            className="legal-contact__link"
            href="https://www.google.com/settings/ads"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google 広告設定
          </a>
          から行えます。詳細は各事業者のプライバシーポリシーをご確認ください。
        </p>
      </LegalSection>

      <LegalSection title="5. 第三者提供">
        <p>
          運営者は、次の場合を除き、本人の同意なく個人情報を第三者に提供しません。
        </p>
        <ul>
          <li>法令に基づく場合</li>
          <li>人の生命、身体または財産の保護のために必要がある場合</li>
          <li>利用目的の達成に必要な範囲で業務委託先に提供する場合</li>
        </ul>
        <p>運営者は、個人情報を第三者に販売しません。</p>
      </LegalSection>

      <LegalSection title="6. 保管期間">
        <p>
          取得した情報は、利用目的の達成に必要な期間保管します。
          お題の非公開・削除、コメント削除、サービス終了等に応じて、
          合理的な期間内に削除または匿名化します。
        </p>
        <p>
          ただし、法令上の保存義務がある場合や、不正利用調査のために必要な場合は、
          この限りではありません。
        </p>
      </LegalSection>

      <LegalSection title="7. 安全管理">
        <p>
          運営者は、不正アクセス、漏えい、改ざん、滅失等を防止するため、
          アクセス制御（Row Level Security）、通信の暗号化（HTTPS）、
          権限管理、委託先の選定等、合理的な安全管理措置を講じます。
        </p>
      </LegalSection>

      <LegalSection title="8. 開示・訂正・削除等">
        <p>
          ご自身の情報の開示、訂正、利用停止、削除等を希望される場合は、
          本ページ末尾のお問い合わせフォームからご連絡ください。
        </p>
        <p>お問い合わせの際は、次の情報があると対応しやすくなります。</p>
        <ul>
          <li>お問い合わせ内容（開示・訂正・削除等の希望）</li>
          <li>対象のお題またはコメントのURL、投稿日時、内容の概要</li>
          <li>可能な範囲での本人確認に協力いただける情報</li>
        </ul>
        <p>
          匿名アカウントの性質上、本人確認が困難な場合があり、その場合は
          希望する措置をすべて行えないことがあります。
        </p>
      </LegalSection>

      <LegalSection title="9. 未成年者">
        <p>
          未成年者が本サービスを利用する場合は、保護者の同意を得たうえでご利用ください。
          保護者からのお問い合わせにも対応します。
        </p>
      </LegalSection>

      <LegalSection title="10. ポリシーの変更">
        <p>
          本ポリシーは、法令の改正やサービス内容の変更に応じて更新されることがあります。
          重要な変更がある場合は、本サービス上で告知します。
        </p>
        <p>制定日: {LEGAL.effectiveDate}</p>
      </LegalSection>

      <LegalSection title="11. お問い合わせ">
        <LegalContactBlock subject="Swipe VS プライバシーポリシーに関するお問い合わせ" />
      </LegalSection>
    </LegalLayout>
  );
}
