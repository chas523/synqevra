import Form from "next/form";
import { submitMqtt } from "@/app/mock/actions";
import RowsTable from "@/components/table-rows";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function MqttForm() {
  return (
    <div>
      <Form action={submitMqtt}>
        <Card>
          <CardHeader>
            <CardTitle>MQTT</CardTitle>
            <CardDescription>
              Send a message to ThingsBoard using MQTT and broker. Requires our
              implementation of ThingsBoard Gateway!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label>Values</Label>
                <RowsTable />
              </div>
            </div>
          </CardContent>
          <br />
          <CardFooter>
            <Button type="submit">Submit</Button>
          </CardFooter>
        </Card>
      </Form>
    </div>
  );
}
