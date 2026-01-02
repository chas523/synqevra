import { Plus } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";
import { Icon } from "next/dist/lib/metadata/types/metadata-types";

interface HeaderWithTextProps {
  mainText: string;
  miniText: string;
}

const HeaderWithText: React.FC<HeaderWithTextProps> = ({
  mainText,
  miniText,
}) => {
  return (
    <div className="mb-8 p-2 flex items-center justify-between text-slate-300">
      <div>
        <h1 className="text-3xl font-bold ">{mainText}</h1>
        <p className="mt-1 text-sm ">{miniText}</p>
      </div>
    </div>
  );
};

export default HeaderWithText;
