import { useEffect, useRef, useState } from 'react';
import { fileToDataUrl, validateImageFile } from '../lib/imageUtils';
import { TOPIC_CATEGORIES, type Topic, type TopicCategory } from '../types';

interface CreateTopicModalProps {
  open: boolean;
  userId: string;
  onClose: () => void;
  onSubmit: (topic: Omit<Topic, 'id' | 'votesA' | 'votesB' | 'viewCount' | 'comments'>) => void;
  uploadImage?: (file: File, side: 'a' | 'b') => Promise<string>;
}

const DEFAULT_IMAGE_A =
  'https://images.unsplash.com/photo-1557683316-973673baf926?w=600&h=800&fit=crop';
const DEFAULT_IMAGE_B =
  'https://images.unsplash.com/photo-1557683311-eac922347aa1?w=600&h=800&fit=crop';

export function CreateTopicModal({
  open,
  userId,
  onClose,
  onSubmit,
  uploadImage,
}: CreateTopicModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TopicCategory>('その他');
  const [textA, setTextA] = useState('');
  const [textB, setTextB] = useState('');
  const [previewA, setPreviewA] = useState('');
  const [previewB, setPreviewB] = useState('');
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [imageError, setImageError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const fileARef = useRef<HTMLInputElement>(null);
  const fileBRef = useRef<HTMLInputElement>(null);
  const previewARef = useRef<string | null>(null);
  const previewBRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewARef.current) URL.revokeObjectURL(previewARef.current);
      if (previewBRef.current) URL.revokeObjectURL(previewBRef.current);
    };
  }, []);

  function setPreview(side: 'A' | 'B', file: File) {
    const objectUrl = URL.createObjectURL(file);
    if (side === 'A') {
      if (previewARef.current) URL.revokeObjectURL(previewARef.current);
      previewARef.current = objectUrl;
      setPreviewA(objectUrl);
      setFileA(file);
      return;
    }

    if (previewBRef.current) URL.revokeObjectURL(previewBRef.current);
    previewBRef.current = objectUrl;
    setPreviewB(objectUrl);
    setFileB(file);
  }

  async function resolveImageUrl(
    side: 'a' | 'b',
    file: File | null,
    preview: string,
    fallback: string,
  ): Promise<string> {
    if (!file) return preview || fallback;
    if (uploadImage) return uploadImage(file, side);
    return fileToDataUrl(file);
  }

  async function handleImageChange(side: 'A' | 'B', file: File | null) {
    if (!file) return;

    const error = validateImageFile(file);
    if (error) {
      setImageError(error);
      return;
    }

    try {
      setImageError('');
      if (uploadImage) {
        setPreview(side, file);
        return;
      }

      const dataUrl = await fileToDataUrl(file);
      if (side === 'A') {
        setPreviewA(dataUrl);
        setFileA(file);
      } else {
        setPreviewB(dataUrl);
        setFileB(file);
      }
    } catch {
      setImageError('画像の読み込みに失敗しました');
    }
  }

  function resetForm() {
    setTitle('');
    setCategory('その他');
    setTextA('');
    setTextB('');
    setFileA(null);
    setFileB(null);
    if (previewARef.current) URL.revokeObjectURL(previewARef.current);
    if (previewBRef.current) URL.revokeObjectURL(previewBRef.current);
    previewARef.current = null;
    previewBRef.current = null;
    setPreviewA('');
    setPreviewB('');
    setImageError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !textA.trim() || !textB.trim() || submitting) return;

    setSubmitting(true);
    try {
      const [imageUrlA, imageUrlB] = await Promise.all([
        resolveImageUrl('a', fileA, previewA, DEFAULT_IMAGE_A),
        resolveImageUrl('b', fileB, previewB, DEFAULT_IMAGE_B),
      ]);

      onSubmit({
        title: title.trim(),
        category,
        optionA: { text: textA.trim(), imageUrl: imageUrlA },
        optionB: { text: textB.trim(), imageUrl: imageUrlB },
        createdBy: userId,
      });

      resetForm();
      onClose();
    } catch (err) {
      setImageError(err instanceof Error ? err.message : '投稿に失敗しました');
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <>
      <div className="overlay-backdrop overlay-backdrop--visible" onClick={onClose} />
      <div className="create-modal">
        <button className="create-modal__close" onClick={onClose} aria-label="閉じる">×</button>
        <h2>お題を作成</h2>

        <form className="create-modal__form" onSubmit={handleSubmit}>
          <label className="create-modal__field">
            <span className="create-modal__field-label">タイトル</span>
            <input
              type="text"
              placeholder="究極の選択タイトル"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={60}
            />
          </label>

          <label className="create-modal__field">
            <span className="create-modal__field-label">カテゴリ</span>
            <select
              className="create-modal__select"
              value={category}
              onChange={(e) => setCategory(e.target.value as TopicCategory)}
            >
              {TOPIC_CATEGORIES.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>

          <div className="create-modal__options">
            <div className="create-modal__option create-modal__option--a">
              <span className="create-modal__option-label">A（左・赤）</span>
              <input
                type="text"
                placeholder="選択肢A"
                value={textA}
                onChange={(e) => setTextA(e.target.value)}
              />
              <input
                ref={fileARef}
                type="file"
                accept="image/*"
                className="create-modal__file-input"
                onChange={(e) => handleImageChange('A', e.target.files?.[0] ?? null)}
              />
              <button
                type="button"
                className="create-modal__file-btn create-modal__file-btn--a"
                onClick={() => fileARef.current?.click()}
              >
                {previewA ? '画像を変更' : '画像を選択'}
              </button>
              {previewA && (
                <img className="create-modal__preview" src={previewA} alt="選択肢Aのプレビュー" />
              )}
            </div>

            <div className="create-modal__option create-modal__option--b">
              <span className="create-modal__option-label">B（右・青）</span>
              <input
                type="text"
                placeholder="選択肢B"
                value={textB}
                onChange={(e) => setTextB(e.target.value)}
              />
              <input
                ref={fileBRef}
                type="file"
                accept="image/*"
                className="create-modal__file-input"
                onChange={(e) => handleImageChange('B', e.target.files?.[0] ?? null)}
              />
              <button
                type="button"
                className="create-modal__file-btn create-modal__file-btn--b"
                onClick={() => fileBRef.current?.click()}
              >
                {previewB ? '画像を変更' : '画像を選択'}
              </button>
              {previewB && (
                <img className="create-modal__preview" src={previewB} alt="選択肢Bのプレビュー" />
              )}
            </div>
          </div>

          {imageError && <p className="create-modal__error">{imageError}</p>}

          <button type="submit" className="create-modal__submit" disabled={submitting}>
            {submitting ? '投稿中...' : '投稿して戦わせる'}
          </button>
        </form>
      </div>
    </>
  );
}
