import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const PUBLISH_COVER_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
];
const PUBLISH_COVER_MAX_BYTES = 4 * 1024 * 1024;

function publishCoverExtension(type: string): string {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  return "jpg";
}

function publishCoverContentType(type: string): string {
  if (type === "image/png") return "image/png";
  if (type === "image/webp") return "image/webp";
  return "image/jpeg";
}

type R2Env = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  publicUrl: string;
};

function getR2Env(): R2Env | null {
  const accountId = process.env.R2_ACCOUNT_ID?.trim();
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
  const bucket = process.env.R2_BUCKET_NAME?.trim();
  const publicUrl = process.env.R2_PUBLIC_URL?.trim();
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicUrl) {
    return null;
  }
  return { accountId, accessKeyId, secretAccessKey, bucket, publicUrl };
}

async function saveCoverToR2(
  storyId: string,
  ext: string,
  buffer: Buffer,
  mime: string
): Promise<string> {
  const cfg = getR2Env();
  if (!cfg) {
    throw new Error("R2 environment variables are incomplete.");
  }

  const key = `covers/${storyId}.${ext}`;
  const client = new S3Client({
    region: "auto",
    endpoint: `https://${cfg.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: cfg.accessKeyId,
      secretAccessKey: cfg.secretAccessKey,
    },
  });

  await client.send(
    new PutObjectCommand({
      Bucket: cfg.bucket,
      Key: key,
      Body: buffer,
      ContentType: mime,
    })
  );

  const base = cfg.publicUrl.replace(/\/$/, "");
  return `${base}/${key}`;
}

/** Saves cover to R2 when R2_* env is set; otherwise `public/uploads/covers/{storyId}.ext`. */
export async function saveCoverFromUpload(
  storyId: string,
  coverFile: File | null
): Promise<string | undefined> {
  if (!coverFile || coverFile.size <= 0) return undefined;
  if (!PUBLISH_COVER_TYPES.includes(coverFile.type)) {
    throw new Error("Cover must be PNG, JPG, or WebP.");
  }
  if (coverFile.size > PUBLISH_COVER_MAX_BYTES) {
    throw new Error("Cover image must be under 4MB.");
  }
  const ext = publishCoverExtension(coverFile.type);
  const contentType = publishCoverContentType(coverFile.type);
  const buffer = Buffer.from(await coverFile.arrayBuffer());

  if (getR2Env()) {
    return saveCoverToR2(storyId, ext, buffer, contentType);
  }

  const dir = path.join(process.cwd(), "public", "uploads", "covers");
  await mkdir(dir, { recursive: true });
  const filename = `${storyId}.${ext}`;
  const filepath = path.join(dir, filename);
  await writeFile(filepath, buffer);
  return `/uploads/covers/${filename}`;
}
