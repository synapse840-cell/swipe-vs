import { useState } from 'react';
import type { MyPageNotification } from '../lib/myPageNotifications';
import { MY_PAGE_NOTIFICATION_LIMIT } from '../lib/myPageNotifications';
import { navigateTo } from '../lib/legalRoutes';
import type { Topic, VoteSide } from '../types';

export interface VotedTopicItem {
  topic: Topic;
  side: VoteSide;
}

interface MyPageDrawerProps {
  open: boolean;
  userId: string;
  createdTopics: Topic[];
  votedTopics: VotedTopicItem[];
  likedTopics: Topic[];
  votedCount: number;
  notifications: MyPageNotification[];
  onClose: () => void;
  onTopicSelect: (topicId: string) => void;
  onNotificationSelect: (topicId: string) => void;
  onCreateTopic: () => void;
  onUnpublishTopic?: (topicId: string) => void;
}

type SectionKey = 'voted' | 'liked' | 'created';

function shortenUserId(id: string) {
  return id.length > 12 ? `${id.slice(0, 12)}…` : id;
}

function SectionChevron({ expanded }: { expanded: boolean }) {
  return (
    <svg
      className={`my-drawer__section-chevron ${expanded ? 'my-drawer__section-chevron--open' : ''}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function CollapsibleSection({
  title,
  count,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  count: number;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="my-drawer__section">
      <button
        type="button"
        className="my-drawer__section-toggle"
        onClick={onToggle}
        aria-expanded={expanded}
      >
        <h3 className="my-drawer__section-title">
          {title}
          <span className="my-drawer__section-count">{count}</span>
        </h3>
        <SectionChevron expanded={expanded} />
      </button>
      {expanded && <div className="my-drawer__section-body">{children}</div>}
    </section>
  );
}

function TopicListItem({
  title,
  meta,
  badge,
  onClick,
}: {
  title: string;
  meta: React.ReactNode;
  badge?: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button type="button" className="my-drawer__item" onClick={onClick}>
      <div className="my-drawer__item-body">
        <p className="my-drawer__item-title">
          {badge}
          {title}
        </p>
        <div className="my-drawer__item-stats">{meta}</div>
      </div>
      <svg
        className="my-drawer__item-chevron"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </button>
  );
}

export function MyPageDrawer({
  open,
  userId,
  createdTopics,
  votedTopics,
  likedTopics,
  votedCount,
  notifications,
  onClose,
  onTopicSelect,
  onNotificationSelect,
  onCreateTopic,
  onUnpublishTopic,
}: MyPageDrawerProps) {
  const [expandedSections, setExpandedSections] = useState<Record<SectionKey, boolean>>({
    voted: false,
    liked: false,
    created: false,
  });

  const totalVotes = createdTopics.reduce((sum, t) => sum + t.votesA + t.votesB, 0);
  const totalViews = createdTopics.reduce((sum, t) => sum + t.viewCount, 0);
  const newNotificationCount = notifications.filter((notification) => notification.isNew).length;
  const visibleNotifications = notifications.slice(0, MY_PAGE_NOTIFICATION_LIMIT);

  function toggleSection(key: SectionKey) {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <>
      <div
        className={`overlay-backdrop ${open ? 'overlay-backdrop--visible' : ''}`}
        onClick={onClose}
      />
      <div className={`my-drawer ${open ? 'my-drawer--open' : ''}`}>
        <div className="my-drawer__header">
          <h2>マイページ</h2>
          <button onClick={onClose} aria-label="閉じる">×</button>
        </div>

        <p className="my-drawer__user-id">ID: {shortenUserId(userId)}</p>

        <div className="my-drawer__stats">
          <div className="my-drawer__stat">
            <span className="my-drawer__stat-value">{votedCount.toLocaleString()}</span>
            <span className="my-drawer__stat-label">投票した数</span>
          </div>
          <div className="my-drawer__stat">
            <span className="my-drawer__stat-value">{createdTopics.length.toLocaleString()}</span>
            <span className="my-drawer__stat-label">作成した数</span>
          </div>
        </div>

        <div className="my-drawer__stats my-drawer__stats--secondary">
          <div className="my-drawer__stat">
            <span className="my-drawer__stat-value my-drawer__stat-value--sm">{totalVotes.toLocaleString()}</span>
            <span className="my-drawer__stat-label">作成お題の総投票</span>
          </div>
          <div className="my-drawer__stat">
            <span className="my-drawer__stat-value my-drawer__stat-value--sm">{totalViews.toLocaleString()}</span>
            <span className="my-drawer__stat-label">作成お題の総閲覧</span>
          </div>
        </div>

        <CollapsibleSection
          title="投票したお題"
          count={votedTopics.length}
          expanded={expandedSections.voted}
          onToggle={() => toggleSection('voted')}
        >
          <div className="my-drawer__list">
            {votedTopics.map(({ topic, side }) => (
              <TopicListItem
                key={topic.id}
                title={topic.title}
                badge={
                  <span className={`my-drawer__vote-badge my-drawer__vote-badge--${side.toLowerCase()}`}>
                    {side}
                  </span>
                }
                meta={<span>{(topic.votesA + topic.votesB).toLocaleString()} 票</span>}
                onClick={() => onTopicSelect(topic.id)}
              />
            ))}
            {votedTopics.length === 0 && (
              <p className="my-drawer__empty">まだ投票していません</p>
            )}
          </div>
        </CollapsibleSection>

        <section className="my-drawer__section my-drawer__section--static">
          <h3 className="my-drawer__section-title my-drawer__section-title--static">
            通知
            {newNotificationCount > 0 && (
              <span className="my-drawer__section-badge">{newNotificationCount}</span>
            )}
          </h3>
          <div className="my-drawer__notifications">
            {visibleNotifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                className={`my-drawer__notif ${notification.isNew ? 'my-drawer__notif--new' : ''}`}
                onClick={() => notification.topicId && onNotificationSelect(notification.topicId)}
                disabled={!notification.topicId}
              >
                <span className="my-drawer__notif-badge">
                  {notification.id.startsWith('milestone-') ? '🔥' : '💬'}
                </span>
                {notification.message}
              </button>
            ))}
            {visibleNotifications.length === 0 && (
              <p className="my-drawer__empty my-drawer__empty--compact">新しい通知はありません</p>
            )}
          </div>
        </section>

        <CollapsibleSection
          title="お気に入りのお題"
          count={likedTopics.length}
          expanded={expandedSections.liked}
          onToggle={() => toggleSection('liked')}
        >
          <div className="my-drawer__list">
            {likedTopics.map((topic) => (
              <TopicListItem
                key={topic.id}
                title={topic.title}
                badge={<span className="my-drawer__like-badge" aria-hidden="true">♥</span>}
                meta={
                  <>
                    <span>{topic.category}</span>
                    <span>{(topic.votesA + topic.votesB).toLocaleString()} 票</span>
                  </>
                }
                onClick={() => onTopicSelect(topic.id)}
              />
            ))}
            {likedTopics.length === 0 && (
              <p className="my-drawer__empty">まだお気に入りがありません</p>
            )}
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title="作成したお題"
          count={createdTopics.length}
          expanded={expandedSections.created}
          onToggle={() => toggleSection('created')}
        >
          <div className="my-drawer__list">
            {createdTopics.map((topic) => (
              <div key={topic.id} className="my-drawer__created-row">
                <TopicListItem
                  title={topic.title}
                  meta={
                    <>
                      <span>{(topic.votesA + topic.votesB).toLocaleString()} 票</span>
                      <span>{topic.viewCount.toLocaleString()} 閲覧</span>
                    </>
                  }
                  onClick={() => onTopicSelect(topic.id)}
                />
                {onUnpublishTopic && (
                  <button
                    type="button"
                    className="my-drawer__unpublish-btn"
                    onClick={() => onUnpublishTopic(topic.id)}
                    aria-label={`${topic.title}を非公開にする`}
                  >
                    非公開
                  </button>
                )}
              </div>
            ))}
            {createdTopics.length === 0 && (
              <div className="my-drawer__empty-create">
                <button
                  type="button"
                  className="my-drawer__create-btn"
                  onClick={onCreateTopic}
                >
                  ＋ お題を作成する
                </button>
              </div>
            )}
          </div>
        </CollapsibleSection>

        <footer className="my-drawer__legal">
          <button type="button" className="my-drawer__legal-link" onClick={() => navigateTo('/terms')}>
            利用規約
          </button>
          <span aria-hidden="true">·</span>
          <button type="button" className="my-drawer__legal-link" onClick={() => navigateTo('/privacy')}>
            プライバシーポリシー
          </button>
        </footer>
      </div>
    </>
  );
}
