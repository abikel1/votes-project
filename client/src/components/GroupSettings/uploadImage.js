// src/utils/uploadImage.js
export async function uploadImage(file, oldUrl = '') {
  if (!file) return null;

  const fd = new FormData();
  fd.append('image', file);
  if (oldUrl) {
    fd.append('old', oldUrl);
  }

  const res = await fetch('/api/upload', {
    method: 'POST',
    body: fd,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Upload failed');
  }

  // מניחים שהשרת מחזיר { url: '...' }גגג
  return data.url;
}
