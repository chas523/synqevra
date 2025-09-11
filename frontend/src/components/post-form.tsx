import Form from "next/form";
import RowsTable from "@/components/table-rows";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {Button} from "@/components/ui/button";
import {Device, submitPost} from "@/app/mock/actions";
import {Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue,} from "./ui/select";

export default function PostForm({ devices = [] }: { devices?: Device[] }) {
  return (
    <div>
      <Form action={submitPost}>
        <Card>
          <CardHeader>
            <CardTitle>HTTP</CardTitle>
            <CardDescription>Send a message to ThingsBoard using HTTP protocol.</CardDescription>
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
                <RowsTable />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit">Submit</Button>
          </CardFooter>
        </Card>
      </Form>
    </div>
  );
}
