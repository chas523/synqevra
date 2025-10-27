export interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  className?: string;
}

const Modal = ({ isOpen, onClose, children, className = "" }: ModalProps) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape" && onClose) {
      onClose();
    }
  };

  const baseStyles = [
    "fixed",
    "inset-0",
    "z-50",
    "flex",
    "items-center",
    "justify-center",
    "bg-black/50",
    "backdrop-blur-sm",
  ];

  const contentStyles = [
    "bg-white",
    "rounded-lg",
    "shadow-xl",
    "p-8",
    "max-w-md",
    "w-full",
    "mx-4",
  ];

  const allContentStyles = [...contentStyles, className];

  return (
    <div
      className={baseStyles.join(" ")}
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      tabIndex={-1}
      aria-modal="true"
    >
      <div className={allContentStyles.join(" ")}>{children}</div>
    </div>
  );
};

export default Modal;
