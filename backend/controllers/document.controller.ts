import { Request, Response } from "express";
import { PrismaClient, DocumentStatus } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * GET /api/documents
 */
export const getDocuments = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      search,
      status,
      category,
      page = "1",
      limit = "10",
    } = req.query;

    const pageNumber = Math.max(Number(page), 1);
    const limitNumber = Math.max(Number(limit), 1);

    const skip = (pageNumber - 1) * limitNumber;

    const where: any = {};

    if (search) {
      where.OR = [
        {
          name: {
            contains: String(search),
          },
        },
        {
          category: {
            contains: String(search),
          },
        },
      ];
    }

    if (
      status &&
      ["PENDING", "APPROVED", "REJECTED"].includes(
        String(status)
      )
    ) {
      where.status = String(status);
    }

    if (category) {
      where.category = String(category);
    }

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        orderBy: {
          uploadedAt: "desc",
        },
        skip,
        take: limitNumber,
      }),

      prisma.document.count({
        where,
      }),
    ]);

    return res.json({
      success: true,
      data: documents,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    console.error("Get documents error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get documents.",
    });
  }
};


/**
 * GET /api/documents/:id
 */
export const getDocumentById = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid document ID.",
      });
    }

    const document = await prisma.document.findUnique({
      where: {
        id,
      },

      include: {
        reviews: {
          orderBy: {
            reviewedAt: "desc",
          },
        },
      },
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found.",
      });
    }

    return res.json({
      success: true,
      data: document,
    });
  } catch (error) {
    console.error("Get document error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get document.",
    });
  }
};


/**
 * POST /api/documents
 */
export const createDocument = async (
  req: Request,
  res: Response
) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a document.",
      });
    }

    const {
      name,
      category,
      description,
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Document name is required.",
      });
    }

    /**
     * TODO:
     * Replace this with the authenticated
     * user's ID from your auth middleware.
     */
    const uploadedBy = 1;

    const document = await prisma.document.create({
      data: {
        name,
        fileName: req.file.filename,
        fileUrl: `/uploads/documents/${req.file.filename}`,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        category: category || null,
        description: description || null,
        uploadedBy,
        status: DocumentStatus.PENDING,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Document uploaded successfully.",
      data: document,
    });
  } catch (error) {
    console.error("Create document error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to upload document.",
    });
  }
};


/**
 * PUT /api/documents/:id
 */
export const updateDocument = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid document ID.",
      });
    }

    const {
      name,
      category,
      description,
    } = req.body;

    const existingDocument =
      await prisma.document.findUnique({
        where: { id },
      });

    if (!existingDocument) {
      return res.status(404).json({
        success: false,
        message: "Document not found.",
      });
    }

    const document = await prisma.document.update({
      where: { id },

      data: {
        ...(name !== undefined && { name }),
        ...(category !== undefined && { category }),
        ...(description !== undefined && {
          description,
        }),
      },
    });

    return res.json({
      success: true,
      message: "Document updated successfully.",
      data: document,
    });
  } catch (error) {
    console.error("Update document error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update document.",
    });
  }
};


/**
 * DELETE /api/documents/:id
 */
export const deleteDocument = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid document ID.",
      });
    }

    const document =
      await prisma.document.findUnique({
        where: { id },
      });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found.",
      });
    }

    await prisma.document.delete({
      where: { id },
    });

    return res.json({
      success: true,
      message: "Document deleted successfully.",
    });
  } catch (error) {
    console.error("Delete document error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete document.",
    });
  }
};


/**
 * POST /api/documents/:id/review
 */
export const reviewDocument = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);

    const {
      status,
      comment,
    } = req.body;

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid document ID.",
      });
    }

    if (
      !["APPROVED", "REJECTED"].includes(
        String(status)
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Status must be APPROVED or REJECTED.",
      });
    }

    if (!comment || !String(comment).trim()) {
      return res.status(400).json({
        success: false,
        message: "Review comment is required.",
      });
    }

    const document =
      await prisma.document.findUnique({
        where: { id },
      });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found.",
      });
    }

    /**
     * TODO:
     * Replace with authenticated reviewer ID.
     */
    const reviewerId = 1;

    const result = await prisma.$transaction(
      async (tx) => {
        const updatedDocument =
          await tx.document.update({
            where: { id },

            data: {
              status: status as DocumentStatus,
            },
          });

        const review =
          await tx.documentReview.create({
            data: {
              documentId: id,
              reviewerId,
              status: status as DocumentStatus,
              comment: String(comment).trim(),
            },
          });

        return {
          updatedDocument,
          review,
        };
      }
    );

    return res.json({
      success: true,
      message:
        status === "APPROVED"
          ? "Document approved successfully."
          : "Document rejected successfully.",

      data: result,
    });
  } catch (error) {
    console.error("Review document error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to review document.",
    });
  }
};


/**
 * GET /api/documents/:id/reviews
 */
export const getDocumentReviews = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid document ID.",
      });
    }

    const reviews =
      await prisma.documentReview.findMany({
        where: {
          documentId: id,
        },

        orderBy: {
          reviewedAt: "desc",
        },
      });

    return res.json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    console.error("Get reviews error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get document reviews.",
    });
  }
};
