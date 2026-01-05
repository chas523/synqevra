import { Plus } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";

interface HeaderWithTextAndButtonProps {
  mainText: string;
  miniText: string;
  buttonText: string;
  onButtonClick?: () => void;
  buttonIcon?: any;
}

const HeaderWithTextAndButton: React.FC<HeaderWithTextAndButtonProps> = ({
  mainText,
  miniText,
  buttonText,
  onButtonClick,
  buttonIcon,
}) => {
  return (
    <div className="mb-8 p-2 flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-white">{mainText}</h1>
        <p className="mt-1 text-sm text-slate-400">{miniText}</p>
      </div>
      <Button
        size="lg"
        className="cursor-pointer gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-md hover:shadow-lg"
        onClick={onButtonClick}
      >
        {buttonIcon ?? <Plus className="h-5 w-5" />}
        {buttonText}
      </Button>
    </div>
  );
};

export default HeaderWithTextAndButton;
