"use client";

import { useEffect, useRef, useState } from "react";
import Cropper, { type Area, type Point } from "react-easy-crop";
import { ImageOff, Upload, X } from "lucide-react";
import { Button } from "../Button";
import { TextField } from "../fields";
import { FeedbackBanner, useToast } from "../toast";
import { exportCroppedImage } from "./cropExport";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SOURCE_BYTES = 10 * 1024 * 1024;

type ModalPhase = "cropping" | "uploading" | "error";

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** width / height, e.g. 2 for 2:1, 16/9 for 16:9. */
  aspectRatio: number;
  folder: "photos" | "articles";
  hint?: string;
};

export function ImageUploadField({ label, value, onChange, aspectRatio, folder, hint }: Props) {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const pendingBlobRef = useRef<Blob | null>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [phase, setPhase] = useState<ModalPhase | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [cropPixels, setCropPixels] = useState<Area | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pickError, setPickError] = useState<string | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);

  useEffect(() => {
    if (phase) modalRef.current?.focus();
  }, [phase]);

  // Revoke the object URL whenever it's replaced or the field unmounts.
  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  function resetPicker() {
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function closeModal() {
    xhrRef.current?.abort();
    xhrRef.current = null;
    pendingBlobRef.current = null;
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    setObjectUrl(null);
    setPhase(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCropPixels(null);
    setProgress(0);
    setError(null);
    resetPicker();
  }

  function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    resetPicker();
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setPickError("Please choose a JPEG, PNG, or WebP image.");
      return;
    }
    if (file.size > MAX_SOURCE_BYTES) {
      setPickError("That image is over 10MB — please choose a smaller file.");
      return;
    }

    setPickError(null);
    setObjectUrl(URL.createObjectURL(file));
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCropPixels(null);
    setPhase("cropping");
  }

  async function confirmCrop() {
    if (!objectUrl || !cropPixels) return;
    setPhase("uploading");
    setError(null);
    try {
      const blob = await exportCroppedImage(objectUrl, cropPixels);
      pendingBlobRef.current = blob;
      uploadBlob(blob);
    } catch {
      setError("Could not process that image. Please try a different file.");
      setPhase("error");
    }
  }

  function uploadBlob(blob: Blob) {
    setPhase("uploading");
    setError(null);
    setProgress(0);

    const formData = new FormData();
    formData.append("file", blob, "upload.webp");
    formData.append("folder", folder);

    const xhr = new XMLHttpRequest();
    xhrRef.current = xhr;

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) setProgress(Math.round((event.loaded / event.total) * 100));
    });

    xhr.addEventListener("load", () => {
      let data: { ok?: boolean; url?: string; message?: string } | null = null;
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        // fall through to generic error below
      }
      if (xhr.status >= 200 && xhr.status < 300 && data?.ok && data.url) {
        onChange(data.url);
        toast.push("success", "Image uploaded.");
        closeModal();
      } else {
        setError(data?.message ?? "Upload failed. Please try again.");
        setPhase("error");
      }
    });

    xhr.addEventListener("error", () => {
      setError("Could not reach the server.");
      setPhase("error");
    });

    xhr.open("POST", "/api/admin/upload");
    xhr.send(formData);
  }

  function retry() {
    if (pendingBlobRef.current) uploadBlob(pendingBlobRef.current);
  }

  const canCloseModal = phase === "cropping" || phase === "error";

  return (
    <div>
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>

      <div className="flex items-start gap-3">
        <div
          className="w-40 shrink-0 overflow-hidden rounded-md border border-atlas-line bg-atlas-mist"
          style={{ aspectRatio }}
        >
          {value ? (
            // Admin-only internal preview; value may be a legacy path, a local
            // upload, or an external Blob URL — a plain <img> avoids needing
            // next/image remote-pattern config just for this thumbnail.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-slate-400">
              <ImageOff aria-hidden="true" className="h-6 w-6" />
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelected}
            className="hidden"
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="self-start"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload aria-hidden="true" className="h-3.5 w-3.5" />
            {value ? "Change image" : "Upload image"}
          </Button>

          {pickError && <FeedbackBanner tone="error">{pickError}</FeedbackBanner>}
          {hint && !pickError && <p className="text-xs text-slate-400">{hint}</p>}

          <button
            type="button"
            onClick={() => setShowManualInput((v) => !v)}
            className="self-start text-xs font-medium text-atlas-blue hover:text-atlas-navy hover:underline"
          >
            {showManualInput ? "Hide manual path entry" : "Enter an image path manually"}
          </button>
          {showManualInput && (
            <TextField label="Image path" value={value} onChange={onChange} placeholder="/images/example.png" />
          )}
        </div>
      </div>

      {phase && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => canCloseModal && closeModal()}
        >
          <div
            ref={modalRef}
            role="dialog"
            aria-label={`Crop ${label.toLowerCase()}`}
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Escape" && canCloseModal) closeModal();
            }}
            className="w-full max-w-lg overflow-hidden rounded-lg bg-white shadow-soft"
          >
            <div className="flex items-center justify-between border-b border-atlas-line px-4 py-3">
              <p className="font-serif text-lg text-atlas-navy">Crop {label.toLowerCase()}</p>
              {canCloseModal && (
                <button
                  type="button"
                  onClick={closeModal}
                  aria-label="Cancel"
                  className="rounded-full p-1 text-slate-400 hover:bg-atlas-mist hover:text-atlas-navy"
                >
                  <X aria-hidden="true" className="h-5 w-5" />
                </button>
              )}
            </div>

            {phase === "cropping" && objectUrl && (
              <div className="p-4">
                <div className="relative h-72 w-full overflow-hidden rounded-md bg-atlas-navy">
                  <Cropper
                    image={objectUrl}
                    crop={crop}
                    zoom={zoom}
                    aspect={aspectRatio}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={(_area, pixels) => setCropPixels(pixels)}
                  />
                </div>
                <label className="mt-4 block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Zoom
                  </span>
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.05}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full"
                  />
                </label>
                <div className="mt-4 flex justify-end gap-2">
                  <Button type="button" variant="secondary" size="sm" onClick={closeModal}>
                    Cancel
                  </Button>
                  <Button type="button" size="sm" disabled={!cropPixels} onClick={() => void confirmCrop()}>
                    Use this crop
                  </Button>
                </div>
              </div>
            )}

            {phase === "uploading" && (
              <div className="space-y-3 p-4">
                <p className="text-sm text-slate-600">Uploading…</p>
                <div className="h-2 overflow-hidden rounded-full bg-atlas-mist">
                  <div
                    className="h-full rounded-full bg-atlas-gold transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {phase === "error" && (
              <div className="space-y-3 p-4">
                <FeedbackBanner tone="error">{error ?? "Upload failed."}</FeedbackBanner>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="secondary" size="sm" onClick={closeModal}>
                    Cancel
                  </Button>
                  <Button type="button" size="sm" onClick={retry}>
                    Retry
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
