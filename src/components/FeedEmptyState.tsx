import { ALL_CATEGORIES_FILTER } from '../lib/feedOrder';

type FeedEmptyVariant = 'no-topics' | 'not-found' | 'empty-site';

interface FeedEmptyStateProps {
  categoryFilter: string;
  variant?: FeedEmptyVariant;
  onResetCategory: () => void;
  onBackToFeed?: () => void;
  onCreateTopic?: () => void;
}

export function FeedEmptyState({
  categoryFilter,
  variant = 'no-topics',
  onResetCategory,
  onBackToFeed,
  onCreateTopic,
}: FeedEmptyStateProps) {
  const filtered = categoryFilter !== ALL_CATEGORIES_FILTER;
  const notFound = variant === 'not-found';
  const emptySite = variant === 'empty-site';

  return (
    <div className="feed-empty">
      <p className="feed-empty__title">
        {emptySite
          ? 'まだお題はありません。作成しましょう。'
          : notFound
            ? 'お題が見つかりません'
            : '表示できるお題がありません'}
      </p>
      {!emptySite && (
        <p className="feed-empty__text">
          {notFound
            ? '削除されたか、リンクが無効になっている可能性があります。'
            : '別のカテゴリを選ぶか、新しいお題を作成してください。'}
        </p>
      )}
      {emptySite && onCreateTopic && (
        <button type="button" className="feed-empty__btn" onClick={onCreateTopic}>
          ＋ お題を作成する
        </button>
      )}
      {notFound && onBackToFeed && (
        <button type="button" className="feed-empty__btn" onClick={onBackToFeed}>
          フィードに戻る
        </button>
      )}
      {!notFound && filtered && (
        <button type="button" className="feed-empty__btn" onClick={onResetCategory}>
          すべてのカテゴリを表示
        </button>
      )}
    </div>
  );
}
