/**
 * Utility for uploading and optimizing images from the user's computer.
 * Converts to high-quality compressed Base64 data URL to fit within Firestore document limits.
 */
export async function processImageUpload(
  file: File,
  maxWidth = 1600,
  quality = 0.84
): Promise<{ dataUrl: string; fileName: string; fileSizeKB: number }> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Vui lòng chọn tệp hình ảnh hợp lệ (JPG, PNG, WebP, GIF, SVG).'));
      return;
    }

    // Max raw file size check (up to 10MB input before compression)
    if (file.size > 10 * 1024 * 1024) {
      reject(new Error('Kích thước tệp quá lớn (vui lòng chọn ảnh dưới 10MB).'));
      return;
    }

    // For SVG, read as SVG Data URL
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        resolve({
          dataUrl,
          fileName: file.name,
          fileSizeKB: Math.round(dataUrl.length / 1024),
        });
      };
      reader.onerror = () => reject(new Error('Không thể đọc tệp SVG.'));
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          const rawUrl = e.target?.result as string;
          resolve({
            dataUrl: rawUrl,
            fileName: file.name,
            fileSizeKB: Math.round(rawUrl.length / 1024),
          });
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to high-quality JPEG or PNG
        const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(mimeType, quality);

        resolve({
          dataUrl,
          fileName: file.name,
          fileSizeKB: Math.round((dataUrl.length * (3 / 4)) / 1024),
        });
      };
      img.onerror = () => reject(new Error('Không thể phân tích tệp hình ảnh.'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Lỗi khi tải tệp từ máy tính.'));
    reader.readAsDataURL(file);
  });
}
