import { useRef, useState } from "react";
import { ImagePlus, X, Star, Loader2 } from "lucide-react";
import { client, isRemote } from "@/lib/supabase";
import { useI18n } from "@/i18n";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import type { SpaceImage } from "@/types/space";

const MAX_PHOTOS = 6;
const MAX_EDGE = 1600;
const TARGET_QUALITY = 0.82;
const HARD_LIMIT_BYTES = 5 * 1024 * 1024;

/**
 * Shrinks an image in the browser before it ever leaves the device.
 *
 * A phone photo is routinely 4–8 MB. On mobile data in Bangladesh that is a
 * minute of uploading and a real cost to the person listing a room, so the
 * long edge is capped and the file re-encoded to JPEG first.
 */
async function compress(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);

  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not process that image.");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", TARGET_QUALITY),
  );

  if (!blob) throw new Error("Could not process that image.");
  return blob;
}

export function PhotoUploader({
  spaceId,
  images,
  onChange,
}: {
  /** Photos are filed under the uploader's id, which is how storage checks ownership. */
  spaceId: string;
  images: SpaceImage[];
  onChange: (images: SpaceImage[]) => void;
}) {
  const { t } = useI18n();
  const { account } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canUpload = isRemote && Boolean(account);
  const remaining = MAX_PHOTOS - images.length;

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0 || !account) return;

    setBusy(true);
    setError(null);

    const chosen = Array.from(files).slice(0, remaining);
    const added: SpaceImage[] = [];

    for (const file of chosen) {
      try {
        const blob = await compress(file);

        if (blob.size > HARD_LIMIT_BYTES) {
          setError(t("list.photoTooLarge"));
          continue;
        }

        const path = `${account.id}/${spaceId}/${crypto.randomUUID()}.jpg`;
        const { error: uploadError } = await client()
          .storage.from("space-photos")
          .upload(path, blob, { contentType: "image/jpeg", upsert: false });

        if (uploadError) {
          setError(t("list.photoFailed"));
          continue;
        }

        const { data } = client().storage.from("space-photos").getPublicUrl(path);

        added.push({
          url: data.publicUrl,
          label: `Photo ${images.length + added.length + 1}`,
          alt: "Photograph provided by the owner of this space",
          // Owner photographs are real; only seed artwork carries the demo flag.
          demo: false as unknown as true,
        });
      } catch {
        setError(t("list.photoFailed"));
      }
    }

    if (added.length) onChange([...images, ...added]);
    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const remove = (index: number) => onChange(images.filter((_, i) => i !== index));

  const makeCover = (index: number) => {
    const next = [...images];
    const [chosen] = next.splice(index, 1);
    onChange([chosen, ...next]);
  };

  return (
    <div>
      {images.length > 0 && (
        <ul className="mb-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {images.map((image, index) => (
            <li key={image.url} className="group relative overflow-hidden rounded-xl bg-ivory-deep">
              <img src={image.url} alt={image.alt} className="aspect-4/3 w-full object-cover" />

              {index === 0 && (
                <span className="absolute left-1.5 top-1.5 rounded-full bg-ink/85 px-2 py-0.5 text-[0.65rem] font-bold text-ivory">
                  {t("list.coverPhoto")}
                </span>
              )}

              <div className="absolute inset-x-1.5 bottom-1.5 flex justify-end gap-1">
                {index !== 0 && (
                  <button
                    type="button"
                    onClick={() => makeCover(index)}
                    aria-label={t("list.setCover")}
                    title={t("list.setCover")}
                    className="rounded-full bg-surface/90 p-1.5 text-ink-soft backdrop-blur hover:text-aqua-700"
                  >
                    <Star size={13} aria-hidden />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => remove(index)}
                  aria-label={t("action.remove")}
                  className="rounded-full bg-surface/90 p-1.5 text-ink-soft backdrop-blur hover:text-danger-600"
                >
                  <X size={13} aria-hidden />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        hidden
        onChange={(e) => void handleFiles(e.target.files)}
      />

      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="secondary"
          disabled={!canUpload || busy || remaining <= 0}
          onClick={() => inputRef.current?.click()}
        >
          {busy ? (
            <Loader2 size={16} className="animate-spin" aria-hidden />
          ) : (
            <ImagePlus size={16} aria-hidden />
          )}
          {busy ? t("list.uploading") : t("list.addPhotos")}
        </Button>

        <p className={cn("text-xs", images.length === 0 ? "text-muted" : "text-ink-soft")}>
          {images.length === 0 ? t("list.noPhotos") : t("list.photoHint")}
        </p>
      </div>

      {!canUpload && (
        <p className="mt-2 text-xs leading-relaxed text-warn-700">
          {isRemote ? t("inquiry.signInFirst") : t("auth.noDatabase")}
        </p>
      )}

      {error && <p className="mt-2 text-sm text-danger-600">{error}</p>}
    </div>
  );
}
