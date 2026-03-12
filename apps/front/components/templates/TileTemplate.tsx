import React from "react";
import { Card } from "../ui/card";
import { cn } from "@/lib/utils";

interface TileTemplateProps {
  colSpan?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  rowSpan?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  gridCols?: 1 | 2 | 3 | 4 | 5 | 6;
  children?: React.ReactNode;
  className?: string;
}

const colSpanMap = {
  1: "md:col-span-1",
  2: "md:col-span-2",
  3: "md:col-span-3",
  4: "md:col-span-4",
  5: "md:col-span-5",
  6: "md:col-span-6",
  7: "md:col-span-7",
  8: "md:col-span-8",
  9: "md:col-span-9",
  10: "md:col-span-10",
  11: "md:col-span-11",
  12: "md:col-span-12",
};

const rowSpanMap = {
  1: "md:row-span-1",
  2: "md:row-span-2",
  3: "md:row-span-3",
  4: "md:row-span-4",
  5: "md:row-span-5",
  6: "md:row-span-6",
  7: "md:row-span-7",
  8: "md:row-span-8",
  9: "md:row-span-9",
  10: "md:row-span-10",
  11: "md:row-span-11",
  12: "md:row-span-12",
};

const gridColsMap = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
};

const TileTemplate = ({
  colSpan = 1,
  rowSpan = 1,
  gridCols,
  children,
  className,
}: TileTemplateProps) => {
  return (
    <Card
      className={cn(
        colSpanMap[colSpan],
        rowSpanMap[rowSpan],
        "gap-1 p-2 min-h-[200px] md:min-h-0",
        gridCols && "grid",
        gridCols && gridColsMap[gridCols],
        className,
      )}
    >
      {children}
    </Card>
  );
};

export default TileTemplate;
