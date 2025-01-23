import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReviewStarsProps {
  rating: number;
  className?: string;
}

export const ReviewStars = ({ rating, className }: ReviewStarsProps) => {
  return (
    <div className={cn("flex", className)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "w-4 h-4",
            star <= rating ? "fill-primary text-primary" : "text-gray-300"
          )}
        />
      ))}
    </div>
  );
};