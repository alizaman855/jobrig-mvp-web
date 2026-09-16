"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export function SignaturePad({ onChange }: { onChange: (dataUrl: string | null) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const hasDrawnRef = useRef(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#0f172a";
  }, []);

  function getPos(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function onPointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    canvas.setPointerCapture(e.pointerId);
    drawingRef.current = true;
    const ctx = canvas.getContext("2d")!;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function onPointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    hasDrawnRef.current = true;
  }

  function onPointerUp() {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    if (hasDrawnRef.current) {
      setHasSignature(true);
      onChange(canvasRef.current!.toDataURL("image/png"));
    }
  }

  function clear() {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const ratio = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / ratio, canvas.height / ratio);
    hasDrawnRef.current = false;
    setHasSignature(false);
    onChange(null);
  }

  return (
    <div className="flex flex-col gap-2">
      <canvas
        ref={canvasRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        className="h-40 w-full touch-none rounded-lg border bg-white"
        aria-label="Signature pad — draw your signature here"
        role="img"
      />
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Sign above using your finger or mouse.</p>
        {hasSignature ? (
          <Button type="button" variant="ghost" size="sm" onClick={clear} className="h-8">
            Clear
          </Button>
        ) : null}
      </div>
    </div>
  );
}
