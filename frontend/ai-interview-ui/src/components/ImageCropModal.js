import React, { useState, useCallback, useEffect } from "react";
import Cropper from "react-easy-crop";

const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

const getRadianAngle = (degreeValue) => (degreeValue * Math.PI) / 180;

const rotateSize = (width, height, rotation) => ({
  width:
    Math.abs(Math.cos(rotation) * width) +
    Math.abs(Math.sin(rotation) * height),
  height:
    Math.abs(Math.sin(rotation) * width) +
    Math.abs(Math.cos(rotation) * height),
});

const getCroppedImage = async (imageSrc, pixelCrop, rotation = 0) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas is not supported in this browser.");
  }

  const rotationRads = getRadianAngle(rotation);
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
    image.width,
    image.height,
    rotationRads
  );

  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotationRads);
  ctx.translate(-image.width / 2, -image.height / 2);
  ctx.drawImage(image, 0, 0);

  const croppedCanvas = document.createElement("canvas");
  const croppedContext = croppedCanvas.getContext("2d");

  if (!croppedContext) {
    throw new Error("Canvas is not supported in this browser.");
  }

  croppedCanvas.width = pixelCrop.width;
  croppedCanvas.height = pixelCrop.height;

  croppedContext.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  const outputType = imageSrc.startsWith("data:image/png") ? "image/png" : "image/jpeg";
  return croppedCanvas.toDataURL(outputType, 0.92);
};

const cropHandleDirections = [
  { key: "top", axisX: 0, axisY: -1, cursor: "ns-resize" },
  { key: "right", axisX: 1, axisY: 0, cursor: "ew-resize" },
  { key: "bottom", axisX: 0, axisY: 1, cursor: "ns-resize" },
  { key: "left", axisX: -1, axisY: 0, cursor: "ew-resize" },
  { key: "top-left", axisX: -1, axisY: -1, cursor: "nwse-resize" },
  { key: "top-right", axisX: 1, axisY: -1, cursor: "nesw-resize" },
  { key: "bottom-right", axisX: 1, axisY: 1, cursor: "nwse-resize" },
  { key: "bottom-left", axisX: -1, axisY: 1, cursor: "nesw-resize" }
];

const MIN_CROP_FRAME = 80;

const clampCropFrame = (frame) => ({
  width: Math.max(MIN_CROP_FRAME, Math.min(300, Math.round(frame.width))),
  height: Math.max(MIN_CROP_FRAME, Math.min(280, Math.round(frame.height)))
});

const ImageCropModal = ({ image, onClose, onSave }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [cropFrame, setCropFrame] = useState({ width: 180, height: 180 });
  const [mediaBounds, setMediaBounds] = useState({ width: 300, height: 280 });
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const onCropComplete = useCallback((_, pixels) => {
    setCroppedAreaPixels(pixels);
  }, []);

  useEffect(() => {
    setCropFrame((currentFrame) => {
      const nextFrame = {
        width: Math.min(currentFrame.width, mediaBounds.width),
        height: Math.min(currentFrame.height, mediaBounds.height)
      };

      return clampCropFrame(nextFrame);
    });
  }, [mediaBounds]);

  const handleCropResizeStart = (event, axisX, axisY) => {
    event.preventDefault();
    event.stopPropagation();

    const startX = event.clientX;
    const startY = event.clientY;
    const startFrame = cropFrame;

    const handlePointerMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      const nextWidth =
        axisX === 0 ? startFrame.width : startFrame.width + (deltaX * axisX * 2);
      const nextHeight =
        axisY === 0 ? startFrame.height : startFrame.height + (deltaY * axisY * 2);

      setCropFrame(
        clampCropFrame({
          width: Math.min(nextWidth, mediaBounds.width),
          height: Math.min(nextHeight, mediaBounds.height)
        })
      );
    };

    const handlePointerUp = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  const handleSave = async () => {
    if (!croppedAreaPixels) return;

    try {
      setSaving(true);
      setError("");
      const croppedImage = await getCroppedImage(image, croppedAreaPixels, rotation);
      await onSave(croppedImage);
    } catch (saveError) {
      setError(saveError?.message || "Unable to process this image right now.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content profile-editor-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close image editor"
        >
          ×
        </button>
        <div className="profile-editor-modal__header">
          <p className="profile-editor-modal__eyebrow">Profile image editor</p>
          <h3>Edit Profile Image</h3>
          <p className="profile-editor-modal__subtext">
            Crop the frame and rotate the image until it looks right.
          </p>
        </div>
        <div className="profile-editor-modal__crop-shell">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={cropFrame.width / cropFrame.height}
            cropSize={cropFrame}
            restrictPosition
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={onCropComplete}
            onMediaLoaded={(mediaSize) => {
              setMediaBounds({
                width: Math.max(MIN_CROP_FRAME, Math.min(300, Math.floor(mediaSize.width))),
                height: Math.max(MIN_CROP_FRAME, Math.min(280, Math.floor(mediaSize.height)))
              });
            }}
          />
          <div
            className="profile-editor-modal__crop-outline"
            style={{
              width: cropFrame.width,
              height: cropFrame.height
            }}
          >
            {cropHandleDirections.map((handle) => (
              <button
                key={handle.key}
                type="button"
                className={`profile-editor-modal__stretch-handle profile-editor-modal__stretch-handle--${handle.key}`}
                style={{ cursor: handle.cursor }}
                onPointerDown={(event) =>
                  handleCropResizeStart(event, handle.axisX, handle.axisY)
                }
                aria-label={`Resize crop area from ${handle.key}`}
                title="Drag to stretch crop box"
              />
            ))}
          </div>
        </div>

        <div className="profile-editor-modal__controls">
          <label className="profile-editor-modal__control">
            <span className="profile-editor-modal__control-label">
              Zoom
              <strong>{zoom.toFixed(1)}x</strong>
            </span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="profile-editor-modal__range"
            />
          </label>
          <label className="profile-editor-modal__control">
            <span className="profile-editor-modal__control-label">
              Rotate
              <strong>{rotation}°</strong>
            </span>
            <input
              type="range"
              min={0}
              max={360}
              value={rotation}
              onChange={(e) => setRotation(Number(e.target.value))}
              className="profile-editor-modal__range"
            />
          </label>
        </div>

        {error ? <div className="profile-editor-modal__error">{error}</div> : null}

        <div className="profile-editor-modal__actions">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="profile-editor-modal__btn profile-editor-modal__btn--ghost"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !croppedAreaPixels}
            className="profile-editor-modal__btn profile-editor-modal__btn--primary"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropModal;
