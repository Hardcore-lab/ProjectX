import React from "react";
import "./MainBanner.scss";

function MainBanner() {
  return (
    <div className="main-banner-home flex items-center" style={{
      minHeight: 350,
      paddingTop: 32,
      paddingBottom: 32,
      width: "100%",
      justifyContent: 'center',
    }}>
      <div className="page-width grid grid-cols-1 md:grid-cols-4 gap-2" style={{width: "100%"}}>
        <div className="text-center md:text-left px-2" style={{
          background: "rgba(19,20,23,0.76)",
          borderRadius: 14,
          padding: "28px 28px 23px 28px",
          width: 340,
          margin: "0 auto"
        }}>
          <h2
            className="h1"
            style={{
              color: "#fff",
              fontWeight: 900,
              fontSize: "2.9rem",
              letterSpacing: 2,
              lineHeight: 1.13,
              textTransform: "uppercase",
              textShadow: "0 2px 14px #000c, 0 1px 0 #000b"
            }}
          >
            Project<span style={{
              color: "#8b1111",
              textShadow: "0 2px 14px #000c, 0 1px 0 #000b"
            }}>X</span>
          </h2>
          <div style={{
            color: "#f2f2f2",
            margin: "15px 0 9px 0",
            fontWeight: 700,
            fontSize: "1.4rem",
            textShadow: "0 1px 10px #000b"
          }}>
            Выход за грань обычного!
          </div>
          <a
            className="brutal-cpb__more"
            href="/page/aboutus"
            style={{
              background: "#8b1111",
              border: "1.5px solid #8b1111",
              color: "#fff",
              borderRadius: 3,
              padding: "10px 26px",
              fontWeight: 800,
              fontSize: "1.07rem",
              letterSpacing: 1.13,
              textTransform: "uppercase",
              boxShadow: "0 2px 12px #8b111166",
              marginTop: 12,
              textDecoration: "none",
              display: "inline-block",
              minWidth: 110,
              transition: "background 0.15s, color 0.15s, border-color 0.14s"
            }}
          >
            О нас
          </a>
        </div>
        <div />
      </div>
    </div>
  );
}


export default MainBanner;

export const layout = {
  areaId: "content",
  sortOrder: 1,
};
