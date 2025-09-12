import Form from "next/form";
import RowsTable from "@/components/table-rows";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Device, submitPost } from "@/app/mock/actions";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { Input } from "@/components/ui/input";

export default function PostForm({ devices = [] }: { devices?: Device[] }) {
  const [loop, setLoop] = useState(false);

  return (
    <div>
      <Form action={submitPost}>
        <Card>
          <CardHeader>
            <CardTitle>HTTP</CardTitle>
            <CardDescription>
              Send a message to ThingsBoard using HTTP protocol.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/2 flex flex-col gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="device">Device</Label>
                  <Select name="device" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Device" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Device</SelectLabel>
                        {devices.length === 0 ? (
                          <SelectItem disabled value="no-devices">
                            No devices found
                          </SelectItem>
                        ) : (
                          devices.map((device, index) => (
                            <SelectItem
                              key={index}
                              value={String(device.id.id)}
                            >
                              {device.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="md:w-1/2 flex flex-col gap-2">
                <Label>Values</Label>
                <RowsTable required={!loop} />
              </div>
            </div>
          </CardContent>

          <CardFooter>
            <div className="grid w-full gap-4 md:grid-cols-2 items-start">
              <Label className="hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:border-blue-600 has-[[aria-checked=true]]:bg-blue-50 dark:has-[[aria-checked=true]]:border-blue-900 dark:has-[[aria-checked=true]]:bg-blue-950">
                <Checkbox
                  id="toggle"
                  checked={loop}
                  onCheckedChange={(checked) => setLoop(!!checked)}
                  className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
                />
                <div className="grid gap-1.5 font-normal">
                  <p className="text-sm leading-none font-medium">
                    Send data in a loop
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Checking this will send temperature data every 1 second.
                  </p>
                </div>
              </Label>

              {loop && (
                <div className="flex flex-col gap-2">
                  <Label htmlFor="loopTime">Loop Time (seconds)</Label>
                  <Input
                    name="loopTime"
                    id="loopTime"
                    defaultValue={30}
                    type="number"
                    min={1}
                    max={60}
                  />
                </div>
              )}
              <div className="col-span-1 md:col-span-2">
                <Button type="submit" className="w-1/2">
                  Submit
                </Button>
              </div>
              <input type="hidden" name="loop" value={String(loop)} />
            </div>
          </CardFooter>
        </Card>
      </Form>
    </div>
  );
}
