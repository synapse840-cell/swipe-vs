import { useState } from 'react';
import { DEFAULT_TOPIC_IMAGE, normalizeTopicImageUrl } from '../lib/topicImage';

interface TopicChoiceImageProps {
  src: string;
  alt: string;
}

export function TopicChoiceImage({ src, alt }: TopicChoiceImageProps) {
  const [imageUrl, setImageUrl] = useState(() => normalizeTopicImageUrl(src));

  return (
    <img
      src={imageUrl}
      alt={alt}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => {
        if (imageUrl !== DEFAULT_TOPIC_IMAGE) {
          setImageUrl(DEFAULT_TOPIC_IMAGE);
        }
      }}
    />
  );
}
