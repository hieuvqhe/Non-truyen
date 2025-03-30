import { motion, MotionValue, useTransform } from "framer-motion";
import { ComicCarousel } from "../types/Comic.type";

interface CarouselItemProps {
  comic: ComicCarousel;
  index: number;
  x: MotionValue<number>;
  currentIndex: number;
  trackItemOffset: number;
  itemWidth: number;
  round: boolean;
  effectiveTransition: any;
}

export default function CarouselItem({
  comic,
  index,
  x,

  trackItemOffset,
  itemWidth,
  round,
  effectiveTransition
}: CarouselItemProps) {
  const range = [
    -(index + 1) * trackItemOffset,
    -index * trackItemOffset,
    -(index - 1) * trackItemOffset,
  ];
  const outputRange = [90, 0, -90];
  const rotateY = useTransform(x, range, outputRange, { clamp: false });

  return (
    <motion.div
      className={`relative shrink-0 flex flex-col ${round
        ? "items-center justify-center text-center bg-background/90"
        : "items-start justify-between bg-card rounded-[12px]"
        } overflow-hidden cursor-grab active:cursor-grabbing shadow-lg`}
      style={{
        width: itemWidth,
        height: round ? itemWidth : "auto",
        minHeight: "400px",
        rotateY: rotateY,
        ...(round && { borderRadius: "50%" }),
      }}
      transition={effectiveTransition}
    >
      <div 
        className="w-full h-[280px] bg-cover bg-center" 
        style={{ 
          backgroundImage: `url(${comic?.thumbnail || ''})` 
        }}
      />
      <div className="p-5">
        <div className="mb-2 font-black text-2xl text-card-foreground">
          {comic?.title || ''}
        </div>
        <p className="text-base text-card-foreground/80">
          {comic?.origin_name && comic.origin_name.length > 0 ? comic.origin_name[0] : ''}
        </p>
      </div>
    </motion.div>
  );
}
