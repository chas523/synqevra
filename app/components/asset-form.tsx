"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormEvent, useState } from "react";

export default function AssetForm() {
  const [submitting, setSubmitting] = useState(false);

  const submitForm = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const fd = new FormData(e.currentTarget);
      const res = await fetch(`/api/thingsboard/asset`, {
        method: "POST",
        body: fd,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result?.error || "Request failed");
      console.log(result);
    } catch (err) {
      console.error("Submit failed:", err);
      alert(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form id="assetForm" onSubmit={submitForm}>
      <CardContent>
        <div className="flex flex-col gap-6">
          <div className="grid gap-2">
            <Label htmlFor="url">ThingsBoard url</Label>
            <Input
              id="url"
              name="url"
              type="text"
              defaultValue={process.env.NEXT_PUBLIC_TB_URL}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={process.env.NEXT_PUBLIC_TB_MAIL}
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
                defaultValue={process.env.NEXT_PUBLIC_TB_PWD}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="assetName">Asset Name</Label>
            <Input id="assetName" name="assetName" type="text" required />
          </div>
        </div>
      </CardContent>
      <br />
      <CardFooter>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Submitting..." : "Confirm"}
        </Button>
      </CardFooter>
    </form>
  );
}
