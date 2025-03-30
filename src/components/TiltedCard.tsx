import type { SpringOptions } from "framer-motion";
import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useTheme } from "./theme-provider";

interface TiltedCardProps {
  imageSrc: React.ComponentProps<"img">["src"];
  altText?: string;
  captionText?: string;
  containerHeight?: React.CSSProperties["height"];
  containerWidth?: React.CSSProperties["width"];
  imageHeight?: React.CSSProperties["height"];
  imageWidth?: React.CSSProperties["width"];
  scaleOnHover?: number;
  rotateAmplitude?: number;
  showMobileWarning?: boolean;
  showTooltip?: boolean;
  overlayContent?: React.ReactNode;
  displayOverlayContent?: boolean;
  enableRainbowEffect?: boolean; // New prop to toggle rainbow effect
}

const springValues: SpringOptions = {
  damping: 30,
  stiffness: 100,
  mass: 2,
};

export default function TiltedCard({
  imageSrc,
  altText = "Tilted card image",
  captionText = "",
  containerHeight = "300px",
  containerWidth = "100%",
  imageHeight = "300px",
  imageWidth = "300px",
  scaleOnHover = 1.1,
  rotateAmplitude = 14,
  showMobileWarning = true,
  showTooltip = true,
  overlayContent = null,
  displayOverlayContent = false,
  enableRainbowEffect = true, // Enabled by default
}: TiltedCardProps) {
  const { theme } = useTheme();
  const ref = useRef<HTMLElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useMotionValue(0), springValues);
  const rotateY = useSpring(useMotionValue(0), springValues);
  const scale = useSpring(1, springValues);
  const opacity = useSpring(0);
  const rotateFigcaption = useSpring(0, {
    stiffness: 350,
    damping: 30,
    mass: 1,
  });

  // Rainbow effect values
  const rainbowOpacity = useSpring(0, springValues);
  const rainbowX = useSpring(0, springValues);
  const rainbowY = useSpring(0, springValues);

  const [lastY, setLastY] = useState(0);

  function handleMouse(e: React.MouseEvent<HTMLElement>) {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;

    const rotationX = (offsetY / (rect.height / 2)) * -rotateAmplitude;
    const rotationY = (offsetX / (rect.width / 2)) * rotateAmplitude;

    rotateX.set(rotationX);
    rotateY.set(rotationY);

    x.set(e.clientX - rect.left);
    y.set(e.clientY - rect.top);

    // Update rainbow effect position
    if (enableRainbowEffect) {
      const normalizedX = offsetX / (rect.width / 2);
      const normalizedY = offsetY / (rect.height / 2);
      rainbowX.set(normalizedX * 20); // Small movement for smooth effect
      rainbowY.set(normalizedY * 20);
    }

    const velocityY = offsetY - lastY;
    rotateFigcaption.set(-velocityY * 0.6);
    setLastY(offsetY);
  }

  function handleMouseEnter() {
    scale.set(scaleOnHover);
    opacity.set(1);
    if (enableRainbowEffect) {
      rainbowOpacity.set(0.6); // Show rainbow effect
    }
  }

  function handleMouseLeave() {
    opacity.set(0);
    scale.set(1);
    rotateX.set(0);
    rotateY.set(0);
    rotateFigcaption.set(0);
    if (enableRainbowEffect) {
      rainbowOpacity.set(0); // Hide rainbow effect
      rainbowX.set(0);
      rainbowY.set(0);
    }
  }

  return (
    <figure
      ref={ref}
      className="relative w-full h-full [perspective:800px] flex flex-col items-center justify-center"
      style={{
        height: containerHeight,
        width: containerWidth,
      }}
      onMouseMove={handleMouse}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {showMobileWarning && (
        <div className="absolute top-4 text-center text-sm block sm:hidden dark:text-gray-200">
          This effect is not optimized for mobile. Check on desktop.
        </div>
      )}

      <motion.div
        className="relative [transform-style:preserve-3d]"
        style={{
          width: imageWidth,
          height: imageHeight,
          rotateX,
          rotateY,
          scale,
        }}
      >
        <motion.img
          src={imageSrc}
          alt={altText}
          className="absolute top-0 left-0 object-cover rounded-[15px] will-change-transform [transform:translateZ(0)]"
          style={{
            width: imageWidth,
            height: imageHeight,
          }}
        />

        {enableRainbowEffect && (
          <motion.div
            className="absolute top-0 left-0 w-full h-full rounded-[15px] z-[1] will-change-transform [transform:translateZ(10px)] overflow-visible pointer-events-none"
            style={{
              opacity: rainbowOpacity,
              x: rainbowX,
              y: rainbowY,
            }}
          >
            <div
              className="absolute inset-[-4px] rounded-[17px]"
              style={{
                background: "linear-gradient(45deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #8f00ff)",
                backgroundSize: "400% 400%",
                boxShadow: "0 0 8px 2px rgba(255, 255, 255, 0.6)",
                animation: "rainbow-shine 5s ease infinite",
                border: "none",
              }}
            />
            <div
              className="absolute inset-[-2px] rounded-[16px]"
              style={{
                background: "transparent",
                boxShadow: "inset 0 0 0 4px rgba(255, 255, 255, 0)",
                border: "2px solid transparent",
                mask: "radial-gradient(circle at center, transparent 96%, black 97%)",
                WebkitMask: "radial-gradient(circle at center, transparent 96%, black 97%)",
              }}
            />
          </motion.div>
        )}

        {displayOverlayContent && overlayContent && (
          <motion.div className="absolute top-0 left-0 z-[2] will-change-transform [transform:translateZ(30px)]">
            {overlayContent}
          </motion.div>
        )}
      </motion.div>

      {showTooltip && (
        <motion.figcaption
          className="pointer-events-none absolute left-0 top-0 rounded-[4px] bg-white dark:bg-gray-800 px-[10px] py-[4px] text-[10px] text-[#2d2d2d] dark:text-white opacity-0 z-[3] hidden sm:block"
          style={{
            x,
            y,
            opacity,
            rotate: rotateFigcaption,
          }}
        >
          {captionText}
        </motion.figcaption>
      )}

      <style>
        {`
          @keyframes rainbow-shine {
            0% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
            100% {
              background-position: 0% 50%;
            }
          }
        `}
      </style>
    </figure>
  );
}