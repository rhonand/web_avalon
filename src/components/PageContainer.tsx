import type { ReactNode } from "react";

type PageContainerProps = {
  title: string;
  children: ReactNode;
};

function PageContainer({ title, children }: PageContainerProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "linear-gradient(to bottom, #0f172a, #1e293b)",
        padding: "24px 16px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: "480px",
          margin: "0 auto",
          backgroundColor: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: "16px",
          padding: "20px",
          color: "white",
          boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
          backdropFilter: "blur(8px)",
        }}
      >
        <h1
          style={{
            marginTop: 0,
            marginBottom: "20px",
            fontSize: "28px",
            textAlign: "center",
          }}
        >
          {title}
        </h1>

        {children}
      </div>
    </div>
  );
}

export default PageContainer;