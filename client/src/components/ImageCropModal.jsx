// src/components/ImageCropModal.jsx
import React, { useState, useCallback, useEffect } from 'react';
import Cropper from 'react-easy-crop';

export default function ImageCropModal({
    file,
    onCancel,
    onCropped,
    aspect = 1,            // יחס רוחב:גובה
    cropShape = 'round',   // 👈 חדש: 'round' או 'rect'
}) {
    const [imageSrc, setImageSrc] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    useEffect(() => {
        if (!file) return;
        const reader = new FileReader();
        reader.addEventListener('load', () => {
            setImageSrc(reader.result);
        });
        reader.readAsDataURL(file);
    }, [file]);

    const onCropComplete = useCallback((_, croppedPixels) => {
        setCroppedAreaPixels(croppedPixels);
    }, []);

    const createImage = (url) =>
        new Promise((resolve, reject) => {
            const image = new Image();
            image.addEventListener('load', () => resolve(image));
            image.addEventListener('error', (error) => reject(error));
            image.src = url;
        });

    const getCroppedImg = async (imageSrc, cropPixels) => {
        const image = await createImage(imageSrc);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = cropPixels.width;
        canvas.height = cropPixels.height;

        ctx.drawImage(
            image,
            cropPixels.x,
            cropPixels.y,
            cropPixels.width,
            cropPixels.height,
            0,
            0,
            cropPixels.width,
            cropPixels.height
        );

        return new Promise((resolve, reject) => {
            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        reject(new Error('Canvas is empty'));
                        return;
                    }
                    const fileType = file.type || 'image/jpeg';
                    const croppedFile = new File([blob], file.name, { type: fileType });
                    resolve(croppedFile);
                },
                file.type || 'image/jpeg',
                0.9
            );
        });
    };

    const handleSave = async () => {
        if (!imageSrc || !croppedAreaPixels) return;
        try {
            const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels);
            onCropped(croppedFile);
        } catch (err) {
            console.error('Cropping failed', err);
            onCancel && onCancel();
        }
    };

    if (!file) return null;

    return (
        <div
            className="crop-modal-backdrop"
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
            }}
        >
            <div
                className="crop-modal"
                style={{
                    backgroundColor: '#fff',
                    borderRadius: 8,
                    padding: 16,
                    width: '90%',
                    maxWidth: 500,
                    maxHeight: '90vh',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                }}
            >
                <h3 style={{ margin: 0, textAlign: 'center' }}>חתוך תמונה</h3>

                <div
                    style={{
                        position: 'relative',
                        width: '100%',
                        flex: 1,
                        minHeight: 250,
                        background: '#000',
                    }}
                >
                    {imageSrc && (
                        <Cropper
                            image={imageSrc}
                            crop={crop}
                            zoom={zoom}
                            aspect={aspect}
                            onCropChange={setCrop}
                            onZoomChange={setZoom}
                            onCropComplete={onCropComplete}
                            showGrid={false}
                            cropShape={cropShape}   // 👈 עכשיו לפי פרופ
                        />
                    )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                        type="range"
                        min={1}
                        max={3}
                        step={0.1}
                        value={zoom}
                        onChange={(e) => setZoom(Number(e.target.value))}
                        style={{ flex: 1 }}
                    />
                </div>

                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: 8,
                        marginTop: 8,
                    }}
                >
                    <button
                        type="button"
                        className="gs-btn-outline"
                        onClick={onCancel}
                    >
                        ביטול
                    </button>
                    <button
                        type="button"
                        className="gs-btn"
                        onClick={handleSave}
                    >
                        שמור
                    </button>
                </div>
            </div>
        </div>
    );
}
