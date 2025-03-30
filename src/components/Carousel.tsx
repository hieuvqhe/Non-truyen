import { useEffect, useState, useRef } from "react";
import { motion, useMotionValue } from "framer-motion";
import useComicStore from "../store/comicStore";
import CarouselItem from "./CarouselItem";

const DRAG_BUFFER = 0;
const VELOCITY_THRESHOLD = 500;
const GAP = 16;
const SPRING_OPTIONS = { type: "spring", stiffness: 300, damping: 30 };

export default function Carousel({
  baseWidth = 300,
  autoplay = false,
  autoplayDelay = 3000,
  pauseOnHover = false,
  loop = false,
  round = false,
}) {
  const { homeComics, isLoadingHomeComics, fetchHomeComics } = useComicStore();
  
  // Fetch comics when component mounts
  useEffect(() => {
    fetchHomeComics();
  }, [fetchHomeComics]);
  
  const containerPadding = 16;
  const itemWidth = baseWidth - containerPadding * 2;
  const trackItemOffset = itemWidth + GAP;

  // Use homeComics if available, otherwise use an empty array
  const items = homeComics.length > 0 ? homeComics.slice(0, 10) : [];
  const carouselItems = loop ? [...items, items[0]] : items;
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const x = useMotionValue(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (pauseOnHover && containerRef.current) {
      const container = containerRef.current;
      const handleMouseEnter = () => setIsHovered(true);
      const handleMouseLeave = () => setIsHovered(false);
      container.addEventListener("mouseenter", handleMouseEnter);
      container.addEventListener("mouseleave", handleMouseLeave);
      return () => {
        container.removeEventListener("mouseenter", handleMouseEnter);
        container.removeEventListener("mouseleave", handleMouseLeave);
      };
    }
  }, [pauseOnHover]);

  useEffect(() => {
    if (autoplay && (!pauseOnHover || !isHovered)) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev === items.length - 1 && loop) {
            return prev + 1; // Animate to clone.
          }
          if (prev === carouselItems.length - 1) {
            return loop ? 0 : prev;
          }
          return prev + 1;
        });
      }, autoplayDelay);
      return () => clearInterval(timer);
    }
  }, [
    autoplay,
    autoplayDelay,
    isHovered,
    loop,
    items.length,
    carouselItems.length,
    pauseOnHover,
  ]);

  const effectiveTransition = isResetting ? { duration: 0 } : SPRING_OPTIONS;

  const handleAnimationComplete = () => {
    if (loop && currentIndex === carouselItems.length - 1) {
      setIsResetting(true);
      x.set(0);
      setCurrentIndex(0);
      setTimeout(() => setIsResetting(false), 50);
    }
  };

  // Define the PanInfo interface for drag events
  interface PanInfo {
    offset: {
        x: number;
        y: number;
    };
    velocity: {
        x: number;
        y: number;
    };
  }

  const handleDragEnd = (_: any, info: PanInfo) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    if (offset < -DRAG_BUFFER || velocity < -VELOCITY_THRESHOLD) {
        if (loop && currentIndex === items.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            setCurrentIndex((prev) => Math.min(prev + 1, carouselItems.length - 1));
        }
    } else if (offset > DRAG_BUFFER || velocity > VELOCITY_THRESHOLD) {
        if (loop && currentIndex === 0) {
            setCurrentIndex(items.length - 1);
        } else {
            setCurrentIndex((prev) => Math.max(prev - 1, 0));
        }
    }
  };

  const dragProps = loop
    ? {}
    : {
      dragConstraints: {
        left: -trackItemOffset * (carouselItems.length - 1),
        right: 0,
      },
    };

  // If still loading, show a loading indicator
  if (isLoadingHomeComics) {
    return (
      <div 
        className="flex items-center justify-center rounded-[16px] bg-card"
        style={{
          width: `${baseWidth}px`,
          height: "400px",
          maxWidth: '100%',
        }}
      >
        <div className="text-card-foreground">Loading comics...</div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden p-4 ${round
        ? "rounded-full"
        : "rounded-[16px]"
        }`}
      style={{
        width: `${baseWidth}px`,
        maxWidth: '100%',
        ...(round && { height: `${baseWidth}px` }),
      }}
    >
      <motion.div
        className="flex"
        drag="x"
        {...dragProps}
        style={{
          width: itemWidth,
          gap: `${GAP}px`,
          perspective: 1000,
          perspectiveOrigin: `${currentIndex * trackItemOffset + itemWidth / 2}px 50%`,
          x,
        }}
        onDragEnd={handleDragEnd}
        animate={{ x: -(currentIndex * trackItemOffset) }}
        transition={effectiveTransition}
        onAnimationComplete={handleAnimationComplete}
      >
        {carouselItems.map((comic, index) => (
          <CarouselItem 
            key={index}
            comic={comic}
            index={index}
            x={x}
            currentIndex={currentIndex}
            trackItemOffset={trackItemOffset}
            itemWidth={itemWidth}
            round={round}
            effectiveTransition={effectiveTransition}
          />
        ))}
      </motion.div>
      <div
        className={`flex w-full justify-center ${round ? "absolute z-20 bottom-12 left-1/2 -translate-x-1/2" : "mt-6"
          }`}
      >
        <div className="flex w-[200px] justify-center gap-4 px-8">
          {items.map((_, index) => (
            <motion.div
              key={index}
              className={`h-3 w-3 rounded-full cursor-pointer transition-colors duration-150 ${
                currentIndex % items.length === index
                ? "bg-primary"
                : "bg-muted"
              }`}
              animate={{
                scale: currentIndex % items.length === index ? 1.2 : 1,
              }}
              onClick={() => setCurrentIndex(index)}
              transition={{ duration: 0.15 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
