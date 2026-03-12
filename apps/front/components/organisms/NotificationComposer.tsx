import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Bell } from "lucide-react";
import { ColorPicker } from "@/components/molecules/ColorPicker";

interface NotificationComposerProps {
  subject: string;
  onSubjectChange: (value: string) => void;
  message: string;
  onMessageChange: (value: string) => void;
  iconEnabled: boolean;
  onIconEnabledChange: (enabled: boolean) => void;
  iconName: string;
  iconColor: string;
  onIconClick: () => void;
  onColorChange: (color: string) => void;
  actionButtonEnabled: boolean;
  onActionButtonEnabledChange: (enabled: boolean) => void;
  actionButtonText: string;
  onActionButtonTextChange: (value: string) => void;
  actionButtonLink: string;
  onActionButtonLinkChange: (value: string) => void;
}

export function NotificationComposer({
  subject,
  onSubjectChange,
  message,
  onMessageChange,
  iconEnabled,
  onIconEnabledChange,
  iconName,
  iconColor,
  onIconClick,
  onColorChange,
  actionButtonEnabled,
  onActionButtonEnabledChange,
  actionButtonText,
  onActionButtonTextChange,
  actionButtonLink,
  onActionButtonLinkChange,
}: NotificationComposerProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Customize messages</h3>

      {/* Web Method Section */}
      <div className="border rounded-lg p-4 space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Bell className="h-4 w-4" />
          Web
        </div>

        {/* Subject */}
        <div className="space-y-2">
          <Label>Subject*</Label>
          <Input
            value={subject}
            onChange={(e) => onSubjectChange(e.target.value)}
            placeholder="Enter subject"
          />
        </div>

        {/* Message */}
        <div className="space-y-2">
          <Label>Message*</Label>
          <Textarea
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
            placeholder="Enter message"
            className="min-h-[100px]"
          />
        </div>

        {/* Icon Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id="icon-enabled"
              checked={iconEnabled}
              onCheckedChange={(checked) =>
                onIconEnabledChange(checked === true)
              }
            />
            <Label htmlFor="icon-enabled" className="cursor-pointer">
              Icon
            </Label>
          </div>

          {iconEnabled && (
            <div className="space-y-3 pl-6">
              <div className="flex items-center gap-3">
                <Label className="text-sm">Icon:</Label>
                <button
                  type="button"
                  onClick={onIconClick}
                  className="flex items-center justify-center w-12 h-12 rounded border hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  {iconName.startsWith("mdi:") ? (
                    <div
                      style={{
                        WebkitMaskImage: `url(/tb-assets/mdi/${iconName.substring(4)}.svg)`,
                        maskImage: `url(/tb-assets/mdi/${iconName.substring(4)}.svg)`,
                        WebkitMaskSize: "contain",
                        maskSize: "contain",
                        WebkitMaskRepeat: "no-repeat",
                        maskRepeat: "no-repeat",
                        WebkitMaskPosition: "center",
                        maskPosition: "center",
                        backgroundColor: iconColor,
                        width: "24px",
                        height: "24px",
                      }}
                    />
                  ) : (
                    <span
                      className="material-icons text-2xl"
                      style={{ color: iconColor }}
                    >
                      {iconName}
                    </span>
                  )}
                </button>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Color:</Label>
                <ColorPicker value={iconColor} onChange={onColorChange} />
              </div>
            </div>
          )}
        </div>

        {/* Action Button Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id="action-button-enabled"
              checked={actionButtonEnabled}
              onCheckedChange={(checked) =>
                onActionButtonEnabledChange(checked === true)
              }
            />
            <Label htmlFor="action-button-enabled" className="cursor-pointer">
              Action button
            </Label>
          </div>

          {actionButtonEnabled && (
            <div className="space-y-2 pl-6">
              <div>
                <Label>Button text*</Label>
                <Input
                  value={actionButtonText}
                  onChange={(e) => onActionButtonTextChange(e.target.value)}
                  placeholder="Enter button text"
                />
              </div>
              <div>
                <Label>Link*</Label>
                <Input
                  value={actionButtonLink}
                  onChange={(e) => onActionButtonLinkChange(e.target.value)}
                  placeholder="Enter link URL"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
