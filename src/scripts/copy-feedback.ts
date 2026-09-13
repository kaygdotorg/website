/**
 * Copy text and report the result through the site's shared toast treatment.
 *
 * MarkdownLayout currently exposes its toast as `window.showToast`. This
 * module uses that function when an article page has installed it, while
 * keeping the same DOM fallback for pages such as Photography that use only
 * BaseLayout. The fallback deliberately mirrors the existing toast contract:
 * `#toast-notification`, `.toast-notification`, `.show`, and a 1500ms hold.
 */
const TOAST_DURATION_MS = 1500;

type ToastElement = HTMLDivElement & {
  _hideTimeout?: number;
};

type ToastWindow = Window & {
  showToast?: (message: string) => void;
};

/**
 * Copy without focusing a hidden form control. That keeps the non-secure
 * fallback from causing mobile Safari to paint or scroll an input bar.
 */
function legacyCopyTextToClipboard(text: string): boolean {
  const selection = window.getSelection();
  if (!selection) return false;

  const savedRanges: Range[] = [];
  for (let index = 0; index < selection.rangeCount; index += 1) {
    savedRanges.push(selection.getRangeAt(index).cloneRange());
  }

  const marker = document.createElement("span");
  marker.textContent = text;
  marker.setAttribute("aria-hidden", "true");
  marker.style.cssText = [
    "position:fixed",
    "top:0",
    "left:0",
    "opacity:0",
    "pointer-events:none",
    "user-select:text",
    "-webkit-user-select:text",
    "white-space:pre",
  ].join(";");
  document.body.appendChild(marker);

  const range = document.createRange();
  range.selectNodeContents(marker);
  selection.removeAllRanges();
  selection.addRange(range);

  const handleCopy = (event: ClipboardEvent) => {
    if (!event.clipboardData) return;
    event.preventDefault();
    event.clipboardData.setData("text/plain", text);
  };

  document.addEventListener("copy", handleCopy);

  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  }

  document.removeEventListener("copy", handleCopy);
  selection.removeAllRanges();
  savedRanges.forEach((savedRange) => selection.addRange(savedRange));
  marker.remove();
  return copied;
}

/** Show the existing global toast or create its identical standalone fallback. */
function showCopyToast(message: string): void {
  const sharedToast = (window as ToastWindow).showToast;
  if (typeof sharedToast === "function") {
    sharedToast(message);
    return;
  }

  let toast = document.getElementById("toast-notification") as ToastElement | null;
  if (!toast) {
    toast = document.createElement("div") as ToastElement;
    toast.id = "toast-notification";
    toast.className = "toast-notification";
    document.body.appendChild(toast);
  }

  toast.classList.remove("show");
  toast.textContent = message;
  void toast.offsetHeight;
  toast.classList.add("show");

  if (toast._hideTimeout) window.clearTimeout(toast._hideTimeout);
  toast._hideTimeout = window.setTimeout(() => {
    toast?.classList.remove("show");
  }, TOAST_DURATION_MS);
}

/** Copy text and show success only when the browser confirms the copy. */
export async function copyTextWithFeedback(text: string): Promise<boolean> {
  let copied = false;

  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      copied = true;
    } catch {
      // Try the selection-based path when the async API is unavailable.
    }
  }

  if (!copied) copied = legacyCopyTextToClipboard(text);

  showCopyToast(copied ? "Copied to clipboard!" : "Could not copy to clipboard.");
  return copied;
}
