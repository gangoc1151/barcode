import { useRef, useEffect } from "react";
import JsBarcode from "jsbarcode";

export default function BarcodeCell({ digits, small = false }) {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!svgRef.current || !digits) return;
    try {
      JsBarcode(svgRef.current, digits, {
        format: "CODE128",
        lineColor: "#1a237e",
        width: small ? 1 : 2,
        height: small ? 36 : 80,
        displayValue: !small,
        text: digits,
        fontSize: 12,
        margin: small ? 4 : 12,
      });
    } catch {}
  }, [digits, small]);

  return <svg ref={svgRef} style={{ width: "100%", display: "block" }} />;
}
