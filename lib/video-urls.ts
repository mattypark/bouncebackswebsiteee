// Video assets hosted on Vercel Blob (faster CDN, no deploy bundle bloat).
// To update a video: upload a new version in the Vercel Dashboard
// (Storage → Blob), copy the new URL, and paste it here.

const BLOB_BASE = "https://fqdgjhiqmafkroy6.public.blob.vercel-storage.com";

export const VIDEOS = {
  process1: `${BLOB_BASE}/process1.mp4`,
  process2: `${BLOB_BASE}/process2.mp4`,
  process3: `${BLOB_BASE}/process3.mp4`,
  recycledReveal: `${BLOB_BASE}/recycled-reveal.mp4`,
  bb1Clip1: `${BLOB_BASE}/bb1-clip-1.mp4`,
  bb1Clip2: `${BLOB_BASE}/bb1-clip-2.mp4`,
  bb1Clip3: `${BLOB_BASE}/bb1-clip-3.mp4`,
  bb1Clip4: `${BLOB_BASE}/bb1-clip-4.mp4`,
} as const;
