const MAX_IMAGE_BYTES = 800 * 1024;

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject(new Error('画像の読み込みに失敗しました'));
    };
    reader.onerror = () => reject(new Error('画像の読み込みに失敗しました'));
    reader.readAsDataURL(file);
  });
}

export function validateImageFile(file: File): string | null {
  if (!file.type.startsWith('image/')) {
    return '画像ファイルを選択してください';
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return '画像は800KB以下にしてください';
  }
  return null;
}
