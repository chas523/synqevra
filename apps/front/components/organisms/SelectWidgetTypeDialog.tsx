import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Activity,
    Clock,
    Sliders,
    AlertTriangle,
    Layout
} from "lucide-react";

interface SelectWidgetTypeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelectType: (type: string) => void;
}

const widgetTypes = [
    {
        id: "timeseries",
        label: "Time Series",
        icon: Activity,
        description: "Display time-series data over time"
    },
    {
        id: "latest",
        label: "Latest Values",
        icon: Clock,
        description: "Show only the most recent telemetry values"
    },
    {
        id: "control",
        label: "Control",
        icon: Sliders,
        description: "Widgets that allow sending commands to devices"
    },
    {
        id: "alarm",
        label: "Alarm",
        icon: AlertTriangle,
        description: "Display alarms and alert notifications"
    },
    {
        id: "static",
        label: "Static",
        icon: Layout,
        description: "Static HTML content or custom visualizations"
    }
];

export const SelectWidgetTypeDialog = ({
    open,
    onOpenChange,
    onSelectType,
}: SelectWidgetTypeDialogProps) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="dark:text-white">Select Widget Type</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                    {widgetTypes.map((type) => (
                        <Button
                            key={type.id}
                            variant="outline"
                            className="h-auto flex flex-col items-center justify-center p-6 gap-2 hover:bg-muted/50 transition-colors text-foreground dark:text-white"
                            onClick={() => onSelectType(type.id)}
                        >
                            <type.icon className="h-8 w-8 text-primary" />
                            <div className="text-center">
                                <div className="font-semibold">{type.label}</div>
                            </div>
                        </Button>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
};
