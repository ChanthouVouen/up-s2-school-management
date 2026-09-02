import { Router } from "express";

import {
  getDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
  reviewDocument,
  getDocumentReviews,
} from "../controllers/document.controller";

import { uploadDocument } from "../middlewares/upload.middleware";

const router = Router();
router.get("/", getDocuments);

router.post(
  "/",
  uploadDocument.single("file"),
  createDocument
);

router.get(
  "/:id",
  getDocumentById
);

router.put(
  "/:id",
  updateDocument
);

router.delete(
  "/:id",
  deleteDocument
);

router.post(
  "/:id/review",
  reviewDocument
);

router.get(
  "/:id/reviews",
  getDocumentReviews
);


export default router;
