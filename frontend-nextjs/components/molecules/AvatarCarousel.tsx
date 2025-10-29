"use client";

import type { Attachment } from "@medplum/fhirtypes";
import { ChevronLeft, ChevronRight, User } from "lucide-react";
import { useId, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface PatientAvatarCarouselProps {
  photos: Attachment[];
  fullName: string;
  initials: string;
  isHovered: boolean;
}

export function PatientAvatarCarousel({
  photos,
  fullName,
  initials,
  isHovered,
}: PatientAvatarCarouselProps) {
  const id = useId();
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const currentPhoto = photos[currentPhotoIndex];

  const handlePrevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  };

  const handleNextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="relative">
      <div
        className={`transition-transform duration-300 ${isHovered ? "scale-110" : "scale-100"}`}
      >
        <Avatar className="h-24 w-24 border-4 border-white shadow-lg ring-2 ring-cyan-200">
          <AvatarImage
            src={currentPhoto?.url || currentPhoto?.data}
            alt={fullName}
          />
          <AvatarFallback className="bg-gradient-to-br from-cyan-100 to-blue-100 text-2xl font-bold text-cyan-700">
            {initials || <User className="h-10 w-10" />}
          </AvatarFallback>
        </Avatar>
      </div>

      {photos.length > 1 && (
        <>
          <Button
            variant="secondary"
            size="icon"
            className="absolute left-0 top-1/2 h-6 w-6 -translate-x-2 -translate-y-1/2 rounded-full shadow-md hover:scale-110 transition-transform bg-white border-2 border-slate-200"
            onClick={handlePrevPhoto}
          >
            <ChevronLeft className="h-3 w-3" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="absolute right-0 top-1/2 h-6 w-6 -translate-y-1/2 translate-x-2 rounded-full shadow-md hover:scale-110 transition-transform bg-white border-2 border-slate-200"
            onClick={handleNextPhoto}
          >
            <ChevronRight className="h-3 w-3" />
          </Button>
          <div className="absolute -bottom-1 left-1/2 flex -translate-x-1/2 gap-1">
            {photos.map((photo, index) => (
              <div
                key={`${id}-${photo.url}}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentPhotoIndex
                    ? "w-4 bg-cyan-500"
                    : "w-1.5 bg-slate-300"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
