import React, { useState, useRef } from "react";

const ImageUpload = ({ onUpload, image }) => {
  const [imgUrl, setImgUrl] = useState(image || null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("http://localhost:3000/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      setImgUrl(data.url);
      onUpload(data.url);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-[120px] h-[120px]">
        <div className="w-full h-full rounded-full border-4 overflow-hidden flex items-center justify-center"
             style={{ borderColor: "#1d486a", backgroundColor: "#f0f0f0" }}>
          {imgUrl ? <img src={imgUrl} alt="Profile" className="w-full h-full object-cover" /> : <p>+</p>}
        </div>
        <input
          type="file"
          ref={fileInputRef}
          className="absolute inset-0 opacity-0 cursor-pointer"
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>

      {isUploading && <p>Uploading...</p>}
    </div>
  );
};

export default ImageUpload;
