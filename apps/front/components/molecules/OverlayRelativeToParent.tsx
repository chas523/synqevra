import type { ReactNode } from "react";
import { useEffect } from "react";
import ErrorOverlayInformation from "./ErrorOverlayInformation";
import LoadingOverlayInformation from "./LoadingOverlayInformation";

interface OverlayRelativeToParentProps {
  children: ReactNode;
  visible?: boolean;
  text?: string;
  isError?: boolean;
  onClose?: () => void;
}

const OverlayRelativeToParent = ({
  children,
  visible = false,
  text = "Loading...",
  isError = false,
  onClose,
}: OverlayRelativeToParentProps) => {
  useEffect(() => {
    if (!visible || !isError || !onClose) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [visible, isError, onClose]);

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (isError && onClose && event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleBackdropKeyDown = (event: React.KeyboardEvent) => {
    if (isError && onClose && event.key === "Enter") {
      onClose();
    }
  };

  return (
    <div className="relative">
      {visible && (
        <div className="absolute inset-0 z-50 backdrop-blur-sm rounded-lg shadow-lg pointer-events-auto">
          {isError ? (
            <button
              className="w-full h-full p-6 bg-transparent border-none cursor-pointer"
              onClick={handleBackdropClick}
              onKeyDown={handleBackdropKeyDown}
              aria-label="Close error overlay"
              type="button"
            >
              <div className="sticky top-1/2 transform -translate-y-1/2 pointer-events-none">
                <div className="pointer-events-auto">
                  <ErrorOverlayInformation text={text} />
                </div>
              </div>
            </button>
          ) : (
            <div className="w-full h-full p-6">
              <div className="sticky top-1/2 transform -translate-y-1/2">
                <LoadingOverlayInformation text={text} />
              </div>
            </div>
          )}
        </div>
      )}
      {children}
    </div>
  );
};

export default OverlayRelativeToParent;
