import Form from "next/form";
import RowsTable from "@/components/table-rows";

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
        <div className="form-group">
          <label htmlFor="hostID">Host address</label>
          <input
            type="text"
            className="form-control"
            id="hostID"
            name="host"
            defaultValue={process.env["DEFAULT_URL"] ?? ""}
          />
          <label htmlFor="portID">Port</label>
          <input
            type="text"
            className="form-control"
            id="portID"
            name="port"
            defaultValue="1884"
          />
        </div>

        <RowsTable />

        <br />
        <button type="submit">Submit</button>
      </Form>
    </div>
  );
}
