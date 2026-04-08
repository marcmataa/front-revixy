import React from "react";
import IsotipoR from "../../assets/logo.png";

const Logo = ({
  variant = "full", // "full" | "icon"
  scale = 1,        // multiplicador proporcional de todas las dimensiones internas
  className = "",
  style = {},
}) => {
  const showText = variant === "full";

  // Dimensiones del contenedor del isotipo escaladas proporcionalmente
  const iconWidth  = 72 * scale;
  const iconHeight = 54 * scale;
  const fontSize   = 23 * scale;

  return (
    <div
      className={`flex items-center ${className}`}
      style={{ pointerEvents: "none", ...style }}
    >
      {/* ICONO */}
      <div
        style={{
          width: iconWidth,
          height: iconHeight,
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
            transform: "scale(1.5)",
          }}
        />
      </div>

      {/* TEXTO */}
      {showText && (
        <span
          className="select-none whitespace-nowrap"
          style={{
            fontFamily: "Syne, sans-serif",
            fontSize: `${fontSize}px`,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "-0.04em",
            color: "#E8E8F0",
            display: "flex",
            alignItems: "center",
            lineHeight: "1",
            marginTop: `${4 * scale}px`,
            marginLeft: `${-4 * scale}px`,
          }}
        >
          REVI
          <span style={{ color: "rgb(108, 99, 255)" }}>XY</span>
        </span>
      )}
    </div>
  );
};

export default Logo;