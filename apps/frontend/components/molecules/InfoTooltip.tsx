import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import InfoButton from "../atoms/InfoButton";

export interface InfoTooltipProps {
  content: React.ReactNode;
  buttonProps?: React.ComponentProps<typeof InfoButton>;
}

const InfoTooltip = ({ content, buttonProps = {} }: InfoTooltipProps) => {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <span tabIndex={0} className="outline-none">
            <InfoButton aria-label="More info" {...buttonProps} />
          </span>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-[220px]">
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default InfoTooltip;
