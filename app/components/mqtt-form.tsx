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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

async function submitForm(data: FormData) {
  "use server";

  const res = await fetch(`${process.env.NEXT_URL}/api/mqtt`, {
    method: "POST",
    body: data,
  });

  const result = await res.json();
  console.log(result);
}

export default function MqttForm() {
  return (
    <div>
      <Form action={submitForm}>
        <Card>
          <CardHeader>
            <CardTitle>MQTT</CardTitle>
            <CardDescription>Send MQTT message to ThingsBoard</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="hostID">Host address</Label>
                <Input
                  type="text"
                  className="form-control"
                  id="hostID"
                  name="host"
                  defaultValue={process.env.DEFAULT_URL}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="portID">Port</Label>
                <Input
                  type="text"
                  className="form-control"
                  id="portID"
                  name="port"
                  defaultValue="1884"
                  required
                />
              </div>
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
