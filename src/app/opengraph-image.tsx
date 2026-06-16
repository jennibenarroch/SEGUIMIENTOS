import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "SalesAI — Asistente de Ventas B2B con IA";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          backgroundColor: "#020617",
          padding: "56px 64px",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Top gradient bar */}
        <div
          style={{
            display: "flex",
            height: "4px",
            background: "linear-gradient(to right, #2563eb, #7c3aed)",
            borderRadius: "2px",
            marginBottom: "52px",
          }}
        />

        {/* Logo row */}
        <div style={{ display: "flex", alignItems: "center", gap: "18px", marginBottom: "52px" }}>
          <div
            style={{
              width: "60px",
              height: "60px",
              backgroundColor: "#2563eb",
              borderRadius: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path
                d="M13 2L4.09 12.96a.5.5 0 0 0 .41.81h5.78l-.78 8.27 8.91-10.96a.5.5 0 0 0-.41-.81h-5.78L13 2z"
                fill="white"
              />
            </svg>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "34px", fontWeight: 800, color: "white", lineHeight: "1" }}>
              SalesAI
            </span>
            <span style={{ fontSize: "16px", color: "#475569", marginTop: "4px" }}>
              Sicoben Ediciones · Panamá
            </span>
          </div>
        </div>

        {/* Main heading */}
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div
            style={{
              fontSize: "64px",
              fontWeight: 800,
              color: "white",
              lineHeight: "1.1",
              marginBottom: "8px",
            }}
          >
            Asistente de Ventas
          </div>
          <div
            style={{
              fontSize: "64px",
              fontWeight: 800,
              color: "#3b82f6",
              lineHeight: "1.1",
              marginBottom: "32px",
            }}
          >
            B2B con IA
          </div>
          <div style={{ fontSize: "22px", color: "#94a3b8", lineHeight: "1.5", maxWidth: "780px" }}>
            Prospección inteligente · Seguimiento multicanal · Propuestas creativas
          </div>
        </div>

        {/* Tag pills */}
        <div style={{ display: "flex", gap: "10px", marginTop: "40px" }}>
          {["Monday CRM", "Claude AI", "WhatsApp Business", "Email con tracking"].map((tag) => (
            <div
              key={tag}
              style={{
                backgroundColor: "#0f172a",
                border: "1px solid #1e293b",
                borderRadius: "999px",
                padding: "6px 18px",
              }}
            >
              <span style={{ fontSize: "15px", color: "#64748b" }}>{tag}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
