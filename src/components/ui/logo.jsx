import React from "react";
import IsotipoR from "../../assets/logo.png";

const Logo = ({ collapsed = false, className = "", style = {} }) => {
  return (
    <div className={`flex items-center ${className}`} style={{ pointerEvents: 'none', ...style }}>
      {/* Isotipo: Contenedor de 80px (ancho total de la sidebar colapsada) */}
      <div
        style={{
          width: 80,
          height: 60,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          src={IsotipoR}
          alt="Isotipo REVIXY"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            transform: "scale(1.6)",
            transition: "none",
          }}
        />
      </div>

      {/* Texto: aparece/desaparece con opacity */}
      <span
        className="select-none whitespace-nowrap"
        style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: "25px",
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: "-0.04em",
          color: "#E8E8F0",
          opacity: collapsed ? 0 : 1,
          display: "flex",
          alignItems: "center",
          lineHeight: "1",
          marginTop: "6px",
          paddingRight: "40px",
          marginLeft: "-7px",
        }}
      >
        REVI<span style={{ color: "rgb(108, 99, 255)" }}>XY</span>
      </span>
    </div>
  );
};

export default Logo;