import path from "path";
import fs from "fs";
import { query } from "../db.js";

const IMAGE_TABLE_BY_ENTITY = {
  quiz: "quiz",
  question: "question",
};

const buildImageRef = (entityType, entityId) => `${entityType}/${entityId}`;

export const publishImage = (entityType) => {
  return async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const tableName = IMAGE_TABLE_BY_ENTITY[entityType];
    const entityId = Number(req.params.id);

    if (!tableName) {
      return res.status(400).json({ message: "Unsupported image entity type" });
    }

    if (!Number.isInteger(entityId) || entityId <= 0) {
      return res.status(400).json({ message: "Invalid entity id" });
    }

    try {
      const imageRef = buildImageRef(entityType, entityId);
      const updateResult = await query(
        `UPDATE ${tableName}
         SET image = $1
         WHERE id = $2
         RETURNING id`,
        [imageRef, entityId]
      );

      if (!updateResult.rows.length) {
        return res.status(404).json({ message: "Entity not found" });
      }

      return res.json({
        message: "Image uploaded successfully",
        image: imageRef,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to save image metadata" });
    }
  };
};

const resolveUploadDir = (folderName) => {
  const baseUploadDir = process.env.UPLOAD_DIR || path.resolve("uploads");
  return path.resolve(baseUploadDir, folderName);
};

export function getImage(folderName) {
  return async function imageHandler(req, res) {
    const entityId = req.params.id;
    const dir = resolveUploadDir(folderName);

    if (!fs.existsSync(dir)) {
      return res.sendStatus(404);
    }

    const files = fs.readdirSync(dir).filter((file) => file.startsWith(`${entityId}.`));
    if (!files.length) return res.sendStatus(404);

    return res.sendFile(path.join(dir, files[0]));
  };
}
