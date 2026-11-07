/**
 * Helpers that make silent background videos start reliably on phones, especially iPhone/Safari.
 *
 * - React sets `muted` as a property, not as an HTML attribute; iOS only allows autoplay when the
 *   video is muted *and* inline from the start, so both are forced here before calling play().
 * - Some hosts don't answer the byte-range requests Safari uses for MP4. If the file fails to load,
 *   it is downloaded once as a whole and played from memory (blob URL), which Safari always accepts.
 * - If the phone refuses autoplay (e.g. iPhone Low Power Mode), the caller shows the still image.
 */

export function prepareInlineVideo(v: HTMLVideoElement) {
  v.muted = true;
  v.defaultMuted = true;
  v.playsInline = true;
  v.setAttribute("muted", "");
  v.setAttribute("playsinline", "");
  v.setAttribute("webkit-playsinline", "");
}

const blobCache = new Map<string, Promise<string>>();

function loadAsBlob(src: string): Promise<string> {
  if (!blobCache.has(src)) {
    blobCache.set(
      src,
      fetch(src)
        .then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.blob();
        })
        .then((b) => URL.createObjectURL(new Blob([b], { type: "video/mp4" }))),
    );
  }
  return blobCache.get(src)!;
}

/** Switches the video to an in-memory copy of its file. Resolves false if that is impossible too. */
export async function reloadFromBlob(v: HTMLVideoElement, src: string): Promise<boolean> {
  try {
    const url = await loadAsBlob(src);
    if (v.src !== url) {
      v.src = url;
      v.load();
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Plays a muted inline video. Returns true when it is playing, false when the phone refuses
 * (the caller should then show the poster image instead).
 */
export async function playInline(v: HTMLVideoElement, src: string): Promise<boolean> {
  prepareInlineVideo(v);
  try {
    await v.play();
    return true;
  } catch (err) {
    const name = (err as DOMException)?.name;
    // Autoplay blocked by the device (Low Power Mode, data saver…): nothing else to try.
    if (name === "NotAllowedError") return false;
    // The file could not be loaded or decoded as served: retry once from memory.
    if (!(await reloadFromBlob(v, src))) return false;
    try {
      await v.play();
      return true;
    } catch {
      return false;
    }
  }
}
