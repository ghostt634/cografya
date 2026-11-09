import { useEffect, useState } from "react";
import QRCode from "qrcode";

interface Props {
  value: string;
  size?: number;
  className?: string;
}

export function QRCodeDisplay({ value, size = 200, className = "" }: Props) {
  const [svgHtml, setSvgHtml] = useState<string>("");

  useEffect(() => {
    let active = true;
    QRCode.toString(value, {
      type: "svg",
      width: size,
      margin: 1,
      color: {
        dark: "#08111F",
        light: "#FFFFFF",
      },
    })
      .then((svg) => {
        if (active) setSvgHtml(svg);
      })
      .catch((err) => {
        console.warn("[QRCodeDisplay] failed to generate SVG", err);
      });

    return () => {
      active = false;
    };
  }, [value, size]);

  if (!svgHtml) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`flex items-center justify-center bg-white rounded-xl ${className}`}
      >
        <span className="text-xs text-stone-500 font-mono">QR Yükleniyor...</span>
      </div>
    );
  }

  return (
    <div className={`inline-block ${className}`} dangerouslySetInnerHTML={{ __html: svgHtml }} />
  );
}
