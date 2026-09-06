import { useState } from "react";
import { Download, Menu, Minus, Plus, Printer, ReceiptText, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router";
import Modal from "../../../components/ui/Modal";
import type { Payment } from "../../../services/paymentService";
interface ReceiptLocationState {
    payment?: Payment;
}

/** Route entry point for a payment receipt preview. */
export default function PaymentReceiptPreviewPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const payment = (location.state as ReceiptLocationState | null)?.payment ?? null;

    const downloadReceipt = (selectedPayment: Payment) => {
        const receipt = [
            "SCHOOL MANAGEMENT PORTAL",
            "PAYMENT RECEIPT",
            "",
            `Receipt reference: ${selectedPayment.reference}`,
            `Student: ${selectedPayment.student?.name ?? "-"}`,
            `Student ID: ${selectedPayment.student?.studentCode ?? "-"}`,
            `Payment date: ${new Date(selectedPayment.createdAt).toLocaleDateString()}`,
            `Payment method: ${selectedPayment.method}`,
            `Status: ${selectedPayment.status}`,
            "",
            `Description: ${selectedPayment.description ?? "Tuition fee"}`,
            `Amount paid: $${selectedPayment.amount.toFixed(2)}`,
        ].join("\n");

        const url = URL.createObjectURL(new Blob([receipt], { type: "text/plain;charset=utf-8" }));
        const link = Object.assign(document.createElement("a"), {
            href: url,
            download: `receipt-${selectedPayment.reference}.txt`,
        });
        link.click();
        URL.revokeObjectURL(url);
    };

    if (!payment) {
        return (
            <main style={{ display: "grid", minHeight: "100vh", placeItems: "center", padding: 24 }}>
                <div style={{ maxWidth: 420, textAlign: "center" }}>
                    <h1 style={{ margin: 0, color: "#0f172a", fontSize: 22 }}>Receipt unavailable</h1>
                    <p style={{ color: "#64748b", lineHeight: 1.5 }}>
                        Open a receipt from the payments list to view its details.
                    </p>
                    <Link to="/payments" style={{ color: "#2563eb", fontWeight: 700 }}>
                        Back to payments
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <PaymentReceiptPreview
            payment={payment}
            isOpen
            onClose={() => navigate("/payments", { state: { reopenPaymentDetails: true, payment } })}
            onDownload={downloadReceipt}
        />
    );
}

interface PaymentReceiptPreviewProps {
    payment: Payment | null;
    isOpen: boolean;
    onClose: () => void;
    onDownload: (payment: Payment) => void;
}
function PaymentReceiptPreview({ payment, isOpen, onClose, onDownload }: PaymentReceiptPreviewProps) {
    const [zoom, setZoom] = useState(85);
    const [showThumbnails, setShowThumbnails] = useState(true);
    const changeZoom = (amount: number) => setZoom((current) => Math.min(150, Math.max(50, current + amount)));

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={<span style={{ display: "flex", alignItems: "center", gap: 8 }}><ReceiptText size={18} /> Receipt preview</span>} width={1240}>
            {payment && <div style={{ overflow: "hidden", borderRadius: 6, background: "#242424" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "12px 16px", background: "#fff", borderBottom: "1px solid #e2e8f0" }}><div><strong style={{ color: "#0f172a", fontSize: 15 }}>receipt-{payment.reference}.pdf</strong><div style={{ marginTop: 3, color: "#64748b", fontSize: 12 }}>application/pdf ? 1 page</div></div><button type="button" onClick={() => onDownload(payment)} style={downloadButtonStyle}><Download size={16} /> Download</button></div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 54, padding: "0 18px", color: "#fff", background: "#383838" }}>
                    <button type="button" onClick={() => setShowThumbnails((visible) => !visible)} title="Show or hide thumbnails" style={toolbarIconButtonStyle}><Menu size={19} /></button>
                    <strong style={{ overflow: "hidden", maxWidth: 230, textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 13 }}>receipt-{payment.reference}.pdf</strong>
                    <span style={toolbarDivider} /><span style={pageChip}>1</span><span>/ 1</span><span style={toolbarDivider} />
                    <button type="button" onClick={() => changeZoom(-10)} title="Zoom out" disabled={zoom <= 50} style={toolbarIconButtonStyle}><Minus size={17} /></button>
                    <span style={zoomChip}>{zoom}%</span>
                    <button type="button" onClick={() => changeZoom(10)} title="Zoom in" disabled={zoom >= 150} style={toolbarIconButtonStyle}><Plus size={17} /></button>
                    <span style={{ flex: 1 }} />
                    <button type="button" onClick={() => onDownload(payment)} title="Download receipt" style={toolbarIconButtonStyle}><Download size={18} /></button>
                    <button type="button" onClick={() => window.print()} title="Print receipt" style={toolbarIconButtonStyle}><Printer size={18} /></button>
                    <button type="button" onClick={onClose} title="Close preview" style={toolbarIconButtonStyle}><X size={19} /></button>
                </div>        <div style={{ display: "grid", gridTemplateColumns: showThumbnails ? "150px minmax(0, 1fr)" : "minmax(0, 1fr)", minHeight: 610, background: "#242424" }}>{showThumbnails && <aside style={{ padding: 18, borderRight: "1px solid #3f3f3f" }}><div style={{ padding: 6, border: "3px solid #7ba8ff", background: "#fff", aspectRatio: "0.73" }}><div style={{ height: 8, background: "#1e3a8a", margin: 8 }} /><div style={{ height: 4, background: "#cbd5e1", margin: 8 }} /><div style={{ height: 4, background: "#cbd5e1", margin: 8 }} /></div><div style={{ marginTop: 10, textAlign: "center", color: "#fff", fontSize: 12 }}>1</div></aside>}<div style={{ overflow: "auto", padding: "24px 34px", background: "#e5e7eb" }}><article style={{ width: "min(760px, 100%)", minHeight: 780, margin: "0 auto", background: "#fff", color: "#111827", padding: "34px 38px", boxSizing: "border-box", fontFamily: "Arial, sans-serif", boxShadow: "0 4px 16px rgba(0,0,0,.35)", transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}><header style={{ display: "flex", justifyContent: "space-between", gap: 20, paddingBottom: 18, borderBottom: "2px solid #1e3a8a" }}><div><div style={{ color: "#1e3a8a", fontWeight: 800, fontSize: 19 }}>SCHOOL MANAGEMENT PORTAL</div><div style={{ marginTop: 5, color: "#475569", fontSize: 12 }}>Official payment receipt</div></div><div style={{ border: "1px dashed #64748b", padding: "9px 12px", fontSize: 11 }}><strong>Receipt: {payment.reference}</strong><br />Date: {new Date(payment.createdAt).toLocaleDateString()}</div></header><h2 style={{ margin: "22px 0", textAlign: "center", fontSize: 19 }}>RECEIPT VOUCHER</h2><section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 30px", fontSize: 13, lineHeight: 1.5 }}><ReceiptInfo label="Student ID" value={payment.student?.studentCode ?? "-"} /><ReceiptInfo label="Student name" value={payment.student?.name ?? "-"} /><ReceiptInfo label="Email" value={payment.student?.email ?? "-"} /><ReceiptInfo label="Payment method" value={payment.method} /><ReceiptInfo label="Academic year" value="2025-2026" /><ReceiptInfo label="Status" value="PAID" /></section><table style={{ width: "100%", borderCollapse: "collapse", marginTop: 24, fontSize: 12 }}><thead><tr><th style={headerStyle}>No.</th><th style={headerStyle}>Description of goods or services</th><th style={headerStyle}>Quantity</th><th style={headerStyle}>Unit price</th><th style={headerStyle}>Amount</th></tr></thead><tbody><tr><td style={cellStyle}>1</td><td style={cellStyle}>{payment.description ?? "Tuition fee"}</td><td style={cellStyle}>1</td><td style={cellStyle}>${payment.amount.toFixed(2)}</td><td style={cellStyle}>${payment.amount.toFixed(2)}</td></tr><tr><td colSpan={4} style={{ ...cellStyle, textAlign: "right", fontWeight: 700 }}>Total paid</td><td style={{ ...cellStyle, fontWeight: 700 }}>${payment.amount.toFixed(2)}</td></tr></tbody></table><footer style={{ display: "flex", justifyContent: "space-between", marginTop: 52, fontSize: 11 }}><span>Payment is non-refundable.</span><span>Authorized receipt</span></footer></article></div></div>
            </div>}
        </Modal>
    );
}
function ReceiptInfo({ label, value }: { label: string; value: string }) { return <div><span style={{ color: "#64748b" }}>{label}: </span><strong>{value}</strong></div>; }
const headerStyle = { border: "1px solid #334155", padding: "8px", textAlign: "left" as const, background: "#f8fafc" };
const cellStyle = { border: "1px solid #334155", padding: "8px" };
const downloadButtonStyle = { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, border: "1px solid #cbd5e1", borderRadius: 6, background: "#fff", color: "#0f172a", padding: "9px 12px", fontSize: 13, fontWeight: 700, cursor: "pointer" };
const toolbarDivider = { width: 1, height: 24, background: "#727272" };
const pageChip = { background: "#202020", padding: "5px 9px", fontSize: 13 };
const zoomChip = { background: "#202020", padding: "5px 10px", fontSize: 13 };
const toolbarIconButtonStyle = { display: "inline-flex", alignItems: "center", justifyContent: "center", border: 0, background: "transparent", color: "#fff", cursor: "pointer", padding: 5 };
