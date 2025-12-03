export async function uploadImage(file) {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) throw new Error('Upload failed');

    const data = await res.json();
    return data.url; // URL של התמונה ב-Cloudinary
  } catch (err) {
    console.error(err);
    return null;
  }
}
