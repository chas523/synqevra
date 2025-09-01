import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

async function submitForm(data: FormData) {
  "use server";

  const res = await fetch(`${process.env.NEXT_URL}/api/mqtt`, {
    method: "POST",
    body: data,
  });

  const result = await res.json();
  console.log(result);
}

export default function AssetForm() {
  return (
    <form id="assetForm" action="/api/thingsboard/asset" method="POST">
      <div className="flex flex-col gap-6">
        <div className="grid gap-2">
          <Label htmlFor="url">ThingsBoard url</Label>
          <Input
            id="url"
            name="url"
            type="text"
            defaultValue={process.env.TB_URL}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={process.env.TB_MAIL}
            required
          />
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Password</Label>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              required
              defaultValue={process.env.TB_PWD}
            />
          </div>
        </div>{" "}
        <div className="grid gap-2">
          <Label htmlFor="assetName">Asset Name</Label>
          <Input id="assetName" type="text" required />
        </div>
      </div>
    </form>
  );
}
