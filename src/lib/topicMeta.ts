import type { Topic } from '../types';
import { buildTopicShareUrl } from './topicUrl';

const DEFAULT_OG_IMAGE =
  'https://images.unsplash.com/photo-1611162617474-5b21e939e227?w=1200&h=630&fit=crop';

function setMeta(
  key: string,
  content: string,
  attribute: 'name' | 'property' = 'name',
) {
  let element = document.querySelector(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

export function updateTopicMeta(topic: Topic) {
  if (typeof document === 'undefined') return;

  const description = `${topic.optionA.text} vs ${topic.optionB.text} — あなたはどっち？`;
  const shareUrl = buildTopicShareUrl(topic.id);
  const imageUrl = topic.optionA.imageUrl.startsWith('data:')
    ? DEFAULT_OG_IMAGE
    : topic.optionA.imageUrl;

  document.title = `${topic.title} | Swipe VS`;

  setMeta('description', description);
  setMeta('og:title', topic.title, 'property');
  setMeta('og:description', description, 'property');
  setMeta('og:url', shareUrl, 'property');
  setMeta('og:image', imageUrl, 'property');
  setMeta('og:type', 'website', 'property');
  setMeta('og:site_name', 'Swipe VS', 'property');
  setMeta('twitter:card', 'summary_large_image');
  setMeta('twitter:title', topic.title);
  setMeta('twitter:description', description);
  setMeta('twitter:image', imageUrl);
}

export function resetAppMeta() {
  if (typeof document === 'undefined') return;

  document.title = 'Swipe VS';
  const description = '無限スワイプ型の2択投票プラットフォーム。左右スワイプで投票、白熱の議論に参加しよう。';

  setMeta('description', description);
  setMeta('og:title', 'Swipe VS', 'property');
  setMeta('og:description', description, 'property');
  setMeta('og:image', DEFAULT_OG_IMAGE, 'property');
}
