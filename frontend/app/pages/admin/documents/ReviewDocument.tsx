import React, { useState } from "react";
import { useNavigate, useParams } from "react-router";
import AdminLayout from "../../../layouts/AdminLayout";

const ReviewDocument: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [comment, setComment] = useState("");
  const [showReject, setShowReject] = useState(false);

  const handleApprove = () => {
    if (!comment.trim()) {
      alert("Please enter a review comment.");
      return;
    }

    alert("Document approved successfully!");
    navigate("/documents");
  };

  const handleReject = () => {
    if (!comment.trim()) {
      alert("Please enter a reason for rejection.");
      return;
    }

    alert("Document rejected.");
    navigate("/documents");
  };

    return (
      <AdminLayout>
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Back Button */}
      <button
        className="mb-[18px] border-none bg-transparent text-blue-600 hover:underline cursor-pointer"
        onClick={() => navigate(`/documents/${id}`)}
      >
        ← Back to Document
      </button>

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="mb-[5px] text-2xl font-bold text-gray-900">
            Review Document
          </h1>
          <p className="m-0 text-gray-500">Student Transcript 2026.pdf</p>
        </div>

        <span className="rounded-full bg-amber-100 px-3.5 py-1.5 text-xs font-semibold text-amber-700">
          Pending Review
        </span>
      </div>

      {/* Main Review Layout */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.5fr_1fr]">
        {/* Document Preview Box */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between bg-gray-800 px-4 py-[14px] text-white">
            <span className="text-sm font-medium">
              Student Transcript 2026.pdf
            </span>
            <button
              className="rounded-md border-none bg-gray-700 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-gray-600 cursor-pointer"
              onClick={() => navigate(`/documents/${id}/preview`)}
            >
              Full Preview
            </button>
          </div>

          <div className="flex min-h-[700px] justify-center bg-gray-200 p-[30px]">
            <div className="min-h-[600px] w-[80%] bg-white p-[45px] shadow-md">
              <div className="text-center text-[50px]">📄</div>

              <h2 className="mb-[25px] text-center text-xl font-bold text-gray-900">
                Student Transcript
              </h2>

              <p className="text-gray-700 leading-relaxed">
                Academic Year: 2026
              </p>

              <hr className="my-4 border-gray-200" />

              <p className="text-gray-700 leading-relaxed">
                Student Name: Sample Student
              </p>
              <p className="text-gray-700 leading-relaxed">
                Student ID: STU-2026-001
              </p>
              <p className="text-gray-700 leading-relaxed">
                Department: Computer Science
              </p>

              <br />

              <p className="text-gray-700 leading-relaxed">
                This area represents the document that the reviewer needs to
                inspect.
              </p>
            </div>
          </div>
        </div>

        {/* Review Side Panel */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mt-0 text-lg font-semibold text-gray-900">
            Document Information
          </h2>

          <div className="divide-y divide-slate-100">
            <div className="flex justify-between py-[13px]">
              <span className="text-gray-500">Uploaded By</span>
              <strong className="text-gray-900">Admin</strong>
            </div>

            <div className="flex justify-between py-[13px]">
              <span className="text-gray-500">Upload Date</span>
              <strong className="text-gray-900">31 Aug 2026</strong>
            </div>

            <div className="flex justify-between py-[13px]">
              <span className="text-gray-500">Document Type</span>
              <strong className="text-gray-900">PDF</strong>
            </div>

            <div className="flex justify-between py-[13px]">
              <span className="text-gray-500">Category</span>
              <strong className="text-gray-900">Academic</strong>
            </div>
          </div>

          <hr className="my-5 border-gray-200" />

          <h2 className="text-lg font-semibold text-gray-900">Review</h2>

          <label className="mb-2 mt-[20px] block text-sm font-semibold text-gray-700">
            Review Comment
          </label>

          <textarea
            rows={7}
            placeholder="Enter your review comment..."
            className="w-full resize-y rounded-lg border border-gray-300 p-3 font-sans text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          <div className="mt-[15px] grid grid-cols-2 gap-[10px]">
            <button
              className="rounded-lg border-none bg-red-600 px-[15px] py-[11px] font-semibold text-white transition-colors hover:bg-red-700 cursor-pointer"
              onClick={() => setShowReject(true)}
            >
              Reject
            </button>

            <button
              className="rounded-lg border-none bg-green-600 px-[15px] py-[11px] font-semibold text-white transition-colors hover:bg-green-700 cursor-pointer"
              onClick={handleApprove}
            >
              Approve
            </button>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-5">
          <div className="w-full max-w-[500px] rounded-xl bg-white p-[25px] shadow-xl">
            <h2 className="mt-0 text-xl font-bold text-gray-900">
              Reject Document
            </h2>

            <p className="mb-4 text-sm text-gray-500">
              Please confirm that you want to reject this document.
            </p>

            <textarea
              rows={5}
              placeholder="Enter reason for rejection..."
              className="w-full resize-y rounded-lg border border-gray-300 p-3 font-sans text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />

            <div className="mt-[15px] flex justify-end gap-2.5">
              <button
                className="rounded-lg border-none bg-gray-100 px-[15px] py-[11px] font-semibold text-gray-700 transition-colors hover:bg-gray-200 cursor-pointer"
                onClick={() => setShowReject(false)}
              >
                Cancel
              </button>

              <button
                className="rounded-lg border-none bg-red-600 px-[15px] py-[11px] font-semibold text-white transition-colors hover:bg-red-700 cursor-pointer"
                onClick={handleReject}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
            </div>
    </AdminLayout>
  );
};

export default ReviewDocument;
