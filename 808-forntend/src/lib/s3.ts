import { env } from "~/env";

// Local API base URL
const API_BASE_URL = env.SEED_VC_API_ROUTE;

/**
 * Get a URL for accessing a file by its key
 */
export async function getPresignedUrl({
  key,
  expiresIn = 3600,
}: {
  key: string;
  expiresIn?: number;
  bucket?: string;
}): Promise<string> {
  try {
    // Call the API to get a URL for the file
    const response = await fetch(`${API_BASE_URL}/file/${key}`, {
      method: "GET",
      headers: {
        Authorization: env.BACKEND_API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get file URL: ${response.statusText}`);
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error("Error getting file URL:", error);
    throw error;
  }
}

/**
 * Get a URL for uploading a file and a key for referencing it later
 */
export async function getUploadUrl(fileType: string): Promise<{
  uploadUrl: string;
  s3Key: string;
}> {
  // Only allow MP3 and WAV file types
  const allowedTypes = ["audio/mp3", "audio/wav"];

  if (!allowedTypes.includes(fileType)) {
    throw new Error("Only MP3 and WAV files are supported");
  }

  // Get file extension for better organization
  const extension =
    fileType === "audio/mpeg" || fileType === "audio/mp3" ? "mp3" : "wav";

  // Create a structured key with the extension (maintain the same format for compatibility)
  const s3Key = `seed-vc-audio-uploads/${crypto.randomUUID()}.${extension}`;

  // Return the upload URL (direct to the API endpoint)
  const uploadUrl = `${API_BASE_URL}/upload`;

  return {
    uploadUrl,
    s3Key,
  };
}
