import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

import { randomUUID } from "crypto";

import { r2 } from "../../lib/cloudflare-r2";

import { env } from "../../config/env.js";

const generateKey = (folder, extension) => {
  return `${folder}/${randomUUID()}.${extension}`;
};

export const uploadImage = async (file, folder = "products") => {
  const extension = file.mimetype.split("/")[1];

  const key = generateKey(folder, extension);

  const command = new PutObjectCommand({
    Bucket: env.R2_BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  await r2.send(command);

  return {
    url: `${env.R2_PUBLIC_URL}/${key}`,
    key,
  };
};

export const deleteImage = async (key) => {
  const command = new DeleteObjectCommand({
    Bucket: env.R2_BUCKET_NAME,
    Key: key,
  });
  await r2.send(command);
};

export const uploadImages = async (files, folder = "products") => {
  const uploadedImages = [];

  try {
    for (const file of files) {
      const image = await uploadImage(file, folder);

      uploadedImages.push(image);
    }

    return uploadedImages;
  } catch (error) {
    await Promise.all(uploadedImages.map((image) => deleteImage(image.key)));

    throw error;
  }
};
