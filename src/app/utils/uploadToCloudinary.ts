import { cloudinary } from "../lib/cloudinary";

const CLOUDINARY_FOLDER = "real-estate";

export const uploadToCloudinary = (
  file: Express.Multer.File,
  folder = CLOUDINARY_FOLDER,
) => {
  return new Promise<{
    secure_url: string;
    public_id: string;
  }>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        folder,
        transformation: [{ width: 1600, crop: "limit", quality: "auto", fetch_format: "auto" }],
      },

      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result) {
          reject(new Error("Cloudinary upload failed"));
          return;
        }

        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
        });
      },
    );

    uploadStream.end(file.buffer);
  });
};

/**
 * Seeded images are external (Unsplash) URLs and use an "external:" publicId,
 * so they are skipped here.
 */
export const deleteFromCloudinary = async (publicIds: (string | null | undefined)[]) => {
  const ids = publicIds.filter(
    (id): id is string => typeof id === "string" && !id.startsWith("external:"),
  );

  if (!ids.length) return;

  await Promise.allSettled(ids.map((id) => cloudinary.uploader.destroy(id)));
};
