import { useRef, useEffect, useCallback, useState } from "react";

interface MiniWormGameProps {
  foodImages: string[];
  width: number;
  height: number;
  skinColors?: string[];
  headType?: string;
  bgColors?: [string, string];
  celebrationEmoji?: string;
  controlStyle?: string;
}

export default function MiniWormGame({ foodImages, width, height, skinColors, headType, bgColors, celebrationEmoji, controlStyle }: MiniWormGameProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef<{
    worm: { x: number; y: number }[];
    angle: number;
    targetAngle: number;
    foods: { x: number; y: number; img: string; pulse: number }[];
    imgCache: Map<string, HTMLImageElement>;
    mouse: { x: number; y: number };
    running: boolean;
    score: number;
    time: number;
  } | null>(null);

  const init = useCallback(() => {
    const segments: { x: number; y: number }[] = [];
    const startX = width / 2;
    const startY = height / 2;
    for (let i = 0; i < 15; i++) {
      segments.push({ x: startX - i * 5, y: startY });
    }

    const foods: { x: number; y: number; img: string; pulse: number }[] = [];
    for (let i = 0; i < 6; i++) {
      foods.push({
        x: 40 + Math.random() * (width - 80),
        y: 40 + Math.random() * (height - 80),
        img: foodImages[i % foodImages.length],
        pulse: Math.random() * Math.PI * 2,
      });
    }

    // Preload images
    const imgCache = new Map<string, HTMLImageElement>();
    foodImages.forEach((src) => {
      if (imgCache.has(src)) return;
      const img = new Image();
      img.src = src;
      img.onload = () => imgCache.set(src, img);
    });

    stateRef.current = {
      worm: segments,
      angle: 0,
      targetAngle: 0,
      foods,
      imgCache,
      mouse: { x: startX, y: startY },
      running: true,
      score: 0,
      time: 0,
    };
  }, [width, height, foodImages]);

  useEffect(() => {
    init();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    const COLORS = skinColors && skinColors.length > 0 ? skinColors : ["#4ade80", "#22c55e", "#16a34a", "#15803d"];

    // Load head image if any
    let headImg: HTMLImageElement | null = null;
    if (headType && headType !== "default") {
      headImg = new Image();
      headImg.src = `/heads/${headType}.png`;
    }
    const SEG_R = 7;
    const SPEED = 2.5;
    const TURN = 0.1;

    const loop = () => {
      const s = stateRef.current;
      if (!s || !s.running) return;
      s.time += 0.02;

      // Update angle toward mouse
      const head = s.worm[0];
      const dx = s.mouse.x - head.x;
      const dy = s.mouse.y - head.y;
      s.targetAngle = Math.atan2(dy, dx);
      let diff = s.targetAngle - s.angle;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      s.angle += diff * TURN;

      // Move head
      head.x += Math.cos(s.angle) * SPEED;
      head.y += Math.sin(s.angle) * SPEED;

      // Wrap around edges
      if (head.x < -10) head.x = width + 10;
      if (head.x > width + 10) head.x = -10;
      if (head.y < -10) head.y = height + 10;
      if (head.y > height + 10) head.y = -10;

      // Segments follow
      for (let i = 1; i < s.worm.length; i++) {
        const prev = s.worm[i - 1];
        const curr = s.worm[i];
        const sdx = prev.x - curr.x;
        const sdy = prev.y - curr.y;
        const dist = Math.sqrt(sdx * sdx + sdy * sdy);
        const gap = 5;
        if (dist > gap) {
          const ratio = gap / dist;
          curr.x = prev.x - sdx * ratio;
          curr.y = prev.y - sdy * ratio;
        }
      }

      // Check food collision
      for (let i = s.foods.length - 1; i >= 0; i--) {
        const f = s.foods[i];
        const fdx = head.x - f.x;
        const fdy = head.y - f.y;
        if (fdx * fdx + fdy * fdy < 20 * 20) {
          // Eat food
          s.score++;
          // Add segments
          const tail = s.worm[s.worm.length - 1];
          for (let j = 0; j < 3; j++) {
            s.worm.push({ x: tail.x, y: tail.y });
          }
          // Respawn food
          s.foods[i] = {
            x: 40 + Math.random() * (width - 80),
            y: 40 + Math.random() * (height - 80),
            img: foodImages[Math.floor(Math.random() * foodImages.length)],
            pulse: Math.random() * Math.PI * 2,
          };
        }
      }

      // Draw
      ctx.clearRect(0, 0, width, height);

      // Draw background
      if (bgColors) {
        const grd = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width);
        grd.addColorStop(0, bgColors[0]);
        grd.addColorStop(1, bgColors[1]);
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, width, height);
      }

      // Draw food
      for (const f of s.foods) {
        const img = s.imgCache.get(f.img);
        const pulse = 1 + Math.sin(s.time * 3 + f.pulse) * 0.08;
        const size = 28 * pulse;

        // Glow
        const glow = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, size);
        glow.addColorStop(0, "rgba(100,200,255,0.15)");
        glow.addColorStop(1, "rgba(100,200,255,0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(f.x, f.y, size, 0, Math.PI * 2);
        ctx.fill();

        if (img) {
          ctx.drawImage(img, f.x - size / 2, f.y - size / 2, size, size);
        } else {
          ctx.fillStyle = "#ff6b35";
          ctx.beginPath();
          ctx.arc(f.x, f.y, 8, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw worm segments (back to front)
      for (let i = s.worm.length - 1; i >= 0; i--) {
        const p = s.worm[i];
        const r = SEG_R * (i === 0 ? 1.2 : Math.max(0.3, 1 - i * 0.005));
        const color = COLORS[i % COLORS.length];

        // Shadow
        ctx.fillStyle = "rgba(0,0,0,0.15)";
        ctx.beginPath();
        ctx.arc(p.x, p.y + r * 0.3, r * 1.05, 0, Math.PI * 2);
        ctx.fill();
        // Body
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
        // Highlight
        ctx.fillStyle = "rgba(255,255,255,0.18)";
        ctx.beginPath();
        ctx.arc(p.x - r * 0.2, p.y - r * 0.25, r * 0.45, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw head
      const h = s.worm[0];
      const cosA = Math.cos(s.angle);
      const sinA = Math.sin(s.angle);

      // Draw head image if available
      if (headImg && headImg.complete && headImg.naturalWidth > 0) {
        ctx.save();
        ctx.translate(h.x, h.y);
        ctx.rotate(s.angle);
        const headSize = SEG_R * 3.5;
        ctx.drawImage(headImg, -headSize / 2, -headSize / 2, headSize, headSize);
        ctx.restore();
      }

      // Draw eyes
      const eyeOff = 4;
      const eyeR = 3.5;
      for (const side of [-1, 1]) {
        const ex = h.x + cosA * 3 - sinA * side * eyeOff;
        const ey = h.y + sinA * 3 + cosA * side * eyeOff;
        // White
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(ex, ey, eyeR, 0, Math.PI * 2);
        ctx.fill();
        // Pupil
        ctx.fillStyle = "#111";
        ctx.beginPath();
        ctx.arc(ex + cosA * 1.5, ey + sinA * 1.5, 1.8, 0, Math.PI * 2);
        ctx.fill();
        // Shine
        ctx.fillStyle = "rgba(255,255,255,0.8)";
        ctx.beginPath();
        ctx.arc(ex - 0.5, ey - 1, 1, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw celebration speech bubble
      if (celebrationEmoji) {
        const bx = h.x;
        const by = h.y - 30;
        const bw = 36, bh = 32, br = 10;

        // Speech bubble shape
        ctx.save();
        ctx.fillStyle = "#fff";
        ctx.strokeStyle = "#4a9cd6";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        // Rounded rect
        ctx.moveTo(bx - bw / 2 + br, by - bh / 2);
        ctx.lineTo(bx + bw / 2 - br, by - bh / 2);
        ctx.quadraticCurveTo(bx + bw / 2, by - bh / 2, bx + bw / 2, by - bh / 2 + br);
        ctx.lineTo(bx + bw / 2, by + bh / 2 - br);
        ctx.quadraticCurveTo(bx + bw / 2, by + bh / 2, bx + bw / 2 - br, by + bh / 2);
        // Tail triangle
        ctx.lineTo(bx + 4, by + bh / 2);
        ctx.lineTo(bx, by + bh / 2 + 8);
        ctx.lineTo(bx - 4, by + bh / 2);
        ctx.lineTo(bx - bw / 2 + br, by + bh / 2);
        ctx.quadraticCurveTo(bx - bw / 2, by + bh / 2, bx - bw / 2, by + bh / 2 - br);
        ctx.lineTo(bx - bw / 2, by - bh / 2 + br);
        ctx.quadraticCurveTo(bx - bw / 2, by - bh / 2, bx - bw / 2 + br, by - bh / 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // Emoji inside bubble
        ctx.font = "20px serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(celebrationEmoji, bx, by);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    // Mouse/touch handling
    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (stateRef.current) {
        stateRef.current.mouse.x = e.clientX - rect.left;
        stateRef.current.mouse.y = e.clientY - rect.top;
      }
    };
    const onTouch = (e: TouchEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const t = e.touches[0];
      if (stateRef.current && t) {
        stateRef.current.mouse.x = t.clientX - rect.left;
        stateRef.current.mouse.y = t.clientY - rect.top;
      }
    };

    // Keyboard handling
    const keysDown = new Set<string>();
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d", "z", "q"].includes(key)) {
        e.preventDefault();
        keysDown.add(key);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keysDown.delete(e.key.toLowerCase());
    };

    // Update mouse target based on keys each frame
    const keyInterval = setInterval(() => {
      const s = stateRef.current;
      if (!s) return;
      const head = s.worm[0];
      const step = 200;
      let kx = 0, ky = 0;
      if (keysDown.has("arrowleft") || keysDown.has("a") || keysDown.has("q")) kx -= 1;
      if (keysDown.has("arrowright") || keysDown.has("d")) kx += 1;
      if (keysDown.has("arrowup") || keysDown.has("w") || keysDown.has("z")) ky -= 1;
      if (keysDown.has("arrowdown") || keysDown.has("s")) ky += 1;
      if (kx !== 0 || ky !== 0) {
        s.mouse.x = head.x + kx * step;
        s.mouse.y = head.y + ky * step;
      }
    }, 16);

    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("touchmove", onTouch, { passive: false });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      if (stateRef.current) stateRef.current.running = false;
      cancelAnimationFrame(animId);
      clearInterval(keyInterval);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("touchmove", onTouch);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [init, width, height, foodImages]);

  // Reset when food images change
  useEffect(() => {
    init();
  }, [foodImages, init]);

  if (typeof window === "undefined") return null;

  const btnStyle: React.CSSProperties = {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.25)",
    border: "2px solid rgba(255,255,255,0.4)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 20, color: "#fff", cursor: "pointer",
    userSelect: "none", WebkitUserSelect: "none",
    touchAction: "none",
  };

  const dirRef = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const id = setInterval(() => {
      const s = stateRef.current;
      const d = dirRef.current;
      if (!s || (d.dx === 0 && d.dy === 0)) return;
      const head = s.worm[0];
      s.mouse.x = head.x + d.dx * 200;
      s.mouse.y = head.y + d.dy * 200;
    }, 16);
    return () => clearInterval(id);
  }, []);

  const pressDir = (dx: number, dy: number) => {
    dirRef.current = { dx, dy };
    setKnobPos({ x: dx, y: dy });
    const s = stateRef.current;
    if (s) {
      const head = s.worm[0];
      s.mouse.x = head.x + dx * 200;
      s.mouse.y = head.y + dy * 200;
    }
  };
  const releaseDir = () => { dirRef.current = { dx: 0, dy: 0 }; setKnobPos({ x: 0, y: 0 }); };

  return (
    <div style={{ position: "relative", width, height }}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ width, height, borderRadius: 4 }}
      />
      {/* D-pad buttons */}
      {controlStyle === "buttons" && <div style={{ position: "absolute", bottom: 10, right: 10, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
        <div style={btnStyle} onMouseDown={() => pressDir(0, -1)} onMouseUp={releaseDir} onMouseLeave={releaseDir}
          onTouchStart={(e) => { e.preventDefault(); pressDir(0, -1); }} onTouchEnd={(e) => { e.preventDefault(); releaseDir(); }}>▲</div>
        <div style={{ display: "flex", gap: 2 }}>
          <div style={btnStyle} onMouseDown={() => pressDir(-1, 0)} onMouseUp={releaseDir} onMouseLeave={releaseDir}
            onTouchStart={(e) => { e.preventDefault(); pressDir(-1, 0); }} onTouchEnd={(e) => { e.preventDefault(); releaseDir(); }}>◀</div>
          <div style={btnStyle} onMouseDown={() => pressDir(1, 0)} onMouseUp={releaseDir} onMouseLeave={releaseDir}
            onTouchStart={(e) => { e.preventDefault(); pressDir(1, 0); }} onTouchEnd={(e) => { e.preventDefault(); releaseDir(); }}>▶</div>
        </div>
        <div style={btnStyle} onMouseDown={() => pressDir(0, 1)} onMouseUp={releaseDir} onMouseLeave={releaseDir}
          onTouchStart={(e) => { e.preventDefault(); pressDir(0, 1); }} onTouchEnd={(e) => { e.preventDefault(); releaseDir(); }}>▼</div>
      </div>}

      {/* Joystick */}
      {controlStyle === "joystick" && <div
        style={{
          position: "absolute", bottom: 10, right: 10, width: 100, height: 100,
          borderRadius: 50, backgroundColor: "rgba(255,255,255,0.15)",
          border: "2px solid rgba(255,255,255,0.3)", touchAction: "none",
        }}
        onMouseDown={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const cx = rect.left + 50, cy = rect.top + 50;
          pressDir((e.clientX - cx) / 50, (e.clientY - cy) / 50);
          const onMove = (ev: MouseEvent) => {
            pressDir(Math.max(-1, Math.min(1, (ev.clientX - cx) / 50)), Math.max(-1, Math.min(1, (ev.clientY - cy) / 50)));
          };
          const onUp = () => { releaseDir(); window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
          window.addEventListener("mousemove", onMove);
          window.addEventListener("mouseup", onUp);
        }}
        onTouchStart={(e) => {
          e.preventDefault();
          const rect = e.currentTarget.getBoundingClientRect();
          const cx = rect.left + 50, cy = rect.top + 50;
          const t = e.touches[0];
          pressDir((t.clientX - cx) / 50, (t.clientY - cy) / 50);
          const onMove = (ev: TouchEvent) => {
            ev.preventDefault(); const ct = ev.touches[0];
            pressDir(Math.max(-1, Math.min(1, (ct.clientX - cx) / 50)), Math.max(-1, Math.min(1, (ct.clientY - cy) / 50)));
          };
          const onEnd = () => { releaseDir(); window.removeEventListener("touchmove", onMove); window.removeEventListener("touchend", onEnd); };
          window.addEventListener("touchmove", onMove, { passive: false });
          window.addEventListener("touchend", onEnd);
        }}
      >
        <div style={{
          position: "absolute",
          top: `calc(50% + ${knobPos.y * 30}px)`,
          left: `calc(50% + ${knobPos.x * 30}px)`,
          transform: "translate(-50%,-50%)",
          width: 30, height: 30, borderRadius: 15,
          backgroundColor: "rgba(255,255,255,0.5)", border: "2px solid rgba(255,255,255,0.7)",
          pointerEvents: "none", transition: knobPos.x === 0 && knobPos.y === 0 ? "all 0.15s" : "none",
        }} />
      </div>}

      {/* Swipe zone */}
      {controlStyle === "swipe" && <div
        style={{
          position: "absolute", bottom: 10, right: 10, width: 90, height: 90,
          borderRadius: 16, backgroundColor: "rgba(255,255,255,0.1)",
          border: "2px dashed rgba(255,255,255,0.3)", touchAction: "none",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: "700",
          userSelect: "none", WebkitUserSelect: "none",
        }}
        onTouchStart={(e) => {
          e.preventDefault();
          const t = e.touches[0];
          const start = { x: t.clientX, y: t.clientY };
          const onMove = (ev: TouchEvent) => {
            ev.preventDefault();
            const ct = ev.touches[0];
            const sdx = ct.clientX - start.x;
            const sdy = ct.clientY - start.y;
            if (Math.abs(sdx) > 5 || Math.abs(sdy) > 5) {
              const len = Math.sqrt(sdx * sdx + sdy * sdy);
              pressDir(sdx / len, sdy / len);
            }
          };
          const onEnd = () => { releaseDir(); window.removeEventListener("touchmove", onMove); window.removeEventListener("touchend", onEnd); };
          window.addEventListener("touchmove", onMove, { passive: false });
          window.addEventListener("touchend", onEnd);
        }}
      >Swipe</div>}
    </div>
  );
}
