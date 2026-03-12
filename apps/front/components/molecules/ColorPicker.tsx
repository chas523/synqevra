"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";

interface ColorPickerProps {
  value: string; // hex color
  onChange: (color: string) => void;
}

const PRESET_COLORS = [
  "#4A4A4A",
  "#FF5722",
  "#FF9800",
  "#FFC107",
  "#8BC34A",
  "#4CAF50",
  "#009688",
  "#03A9F4",
  "#673AB7",
  "#9C27B0",
  "#E91E63",
  "#6D1B7B",
  "#9E9E9E",
  "#FF8A80",
  "#FFD180",
  "#FFF9C4",
  "#C5E1A5",
  "#A5D6A7",
  "#80CBC4",
  "#81D4FA",
  "#B39DDB",
  "#CE93D8",
  "#F48FB1",
  "#BA68C8",
];

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(100);
  const [lightness, setLightness] = useState(50);
  const [hexInput, setHexInput] = useState(value || "#FFFFFF");
  const colorAreaRef = useRef<HTMLCanvasElement>(null);

  // Convert hex to HSL on mount/value change
  useEffect(() => {
    if (value && value !== hexInput) {
      const hsl = hexToHSL(value);
      setHue(hsl.h);
      setSaturation(hsl.s);
      setLightness(hsl.l);
      setHexInput(value);
    }
  }, [value]);

  // Update hex when HSL changes
  useEffect(() => {
    const hex = hslToHex(hue, saturation, lightness);
    setHexInput(hex);
    onChange(hex);
    drawColorArea();
  }, [hue, saturation, lightness]);

  const drawColorArea = () => {
    const canvas = colorAreaRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Draw saturation-lightness gradient for current hue
    for (let row = 0; row < height; row++) {
      const l = (row / height) * 100;
      for (let col = 0; col < width; col++) {
        const s = (col / width) * 100;
        ctx.fillStyle = `hsl(${hue}, ${s}%, ${100 - l}%)`;
        ctx.fillRect(col, row, 1, 1);
      }
    }
  };

  const handleColorAreaClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = colorAreaRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newSaturation = (x / rect.width) * 100;
    const newLightness = 100 - (y / rect.height) * 100;

    setSaturation(Math.max(0, Math.min(100, newSaturation)));
    setLightness(Math.max(0, Math.min(100, newLightness)));
  };

  const handleHexChange = (hex: string) => {
    setHexInput(hex);
    if (/^#[0-9A-F]{6}$/i.test(hex)) {
      const hsl = hexToHSL(hex);
      setHue(hsl.h);
      setSaturation(hsl.s);
      setLightness(hsl.l);
      onChange(hex);
    }
  };

  return (
    <div className="space-y-3">
      {/* Color Area (Saturation-Lightness) */}
      <div className="relative">
        <canvas
          ref={colorAreaRef}
          width={300}
          height={200}
          onClick={handleColorAreaClick}
          className="w-full h-[200px] rounded-md cursor-crosshair border"
        />
        {/* Cursor showing selected color */}
        <div
          className="absolute w-4 h-4 border-2 border-white rounded-full pointer-events-none shadow-lg"
          style={{
            left: `${saturation}%`,
            top: `${100 - lightness}%`,
            transform: "translate(-50%, -50%)",
          }}
        />
      </div>

      {/* Hue Slider */}
      <div className="space-y-2">
        <input
          type="range"
          min="0"
          max="360"
          value={hue}
          onChange={(e) => setHue(Number(e.target.value))}
          className="w-full h-3 rounded-lg cursor-pointer"
          style={{
            background: `linear-gradient(to right, 
                            hsl(0, 100%, 50%), 
                            hsl(60, 100%, 50%), 
                            hsl(120, 100%, 50%), 
                            hsl(180, 100%, 50%), 
                            hsl(240, 100%, 50%), 
                            hsl(300, 100%, 50%), 
                            hsl(360, 100%, 50%))`,
          }}
        />
      </div>

      {/* Opacity Slider (keeping lightness range) */}
      <div className="space-y-2">
        <input
          type="range"
          min="0"
          max="100"
          value={lightness}
          onChange={(e) => setLightness(Number(e.target.value))}
          className="w-full h-3 rounded-lg cursor-pointer"
          style={{
            background: `linear-gradient(to right, 
                            hsl(${hue}, ${saturation}%, 0%), 
                            hsl(${hue}, ${saturation}%, 50%), 
                            hsl(${hue}, ${saturation}%, 100%))`,
          }}
        />
      </div>

      {/* Hex Input */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium w-16">HEX</span>
        <Input
          value={hexInput}
          onChange={(e) => handleHexChange(e.target.value.toUpperCase())}
          placeholder="#FFFFFF"
          maxLength={7}
          className="flex-1 font-mono"
        />
        <div
          className="w-12 h-10 rounded border"
          style={{ backgroundColor: hexInput }}
        />
      </div>

      {/* Preset Colors */}
      <div className="grid grid-cols-12 gap-1">
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            onClick={() => handleHexChange(color)}
            className="w-full aspect-square rounded border hover:scale-110 transition-transform"
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>
    </div>
  );
}

// Utility functions
function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

function hexToHSL(hex: string): { h: number; s: number; l: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { h: 0, s: 0, l: 100 };

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}
