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
import { authenticate, requirePermission } from "../middlewares/auth.middleware";
import { PERMISSIONS } from "../types/permissions";

const router = Router();
router.use(authenticate);
router.get("/", requirePermission(PERMISSIONS.DOCUMENT_VIEW), getDocuments);

router.post(
  "/",
  requirePermission(PERMISSIONS.DOCUMENT_CREATE),
  uploadDocument.single("file"),
  createDocument
);

router.get(
  "/:id",
  requirePermission(PERMISSIONS.DOCUMENT_VIEW),
  getDocumentById
);

router.put(
  "/:id",
  requirePermission(PERMISSIONS.DOCUMENT_UPDATE),
  updateDocument
);

router.delete(
  "/:id",
  requirePermission(PERMISSIONS.DOCUMENT_DELETE),
  deleteDocument
);

router.post(
  "/:id/review",
  requirePermission(PERMISSIONS.DOCUMENT_UPDATE),
  reviewDocument
);

router.get(
  "/:id/reviews",
  requirePermission(PERMISSIONS.DOCUMENT_VIEW),
  getDocumentReviews
);


export default router;
