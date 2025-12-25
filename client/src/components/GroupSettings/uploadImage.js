export async function uploadImage(file) {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch('https://api.voteapp.online/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) throw new Error('Upload failed');

    const data = await res.json();
    return data.url;
  } catch (err) {
    console.error(err);
    return null;
  }
}