"use client";

import { useState, FormEvent } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectContent,
} from "./ui/select";

export default function DeviceForm() {
  const [submitting, setSubmitting] = useState(false);

  const submitForm = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const fd = new FormData(e.currentTarget);
      const res = await fetch("/api/thingsboard/device", {
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
    <form id="deviceForm" onSubmit={submitForm}>
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
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              type="email"
              defaultValue={process.env.NEXT_PUBLIC_TB_MAIL}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="deviceName">Device Name</Label>
            <Input id="deviceName" name="deviceName" type="text" required />
          </div>
          <div className="grid gap-2">
            <Select name="deviceType" defaultValue="default">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Device Type</SelectLabel>
                  <SelectItem value="default">DEFAULT</SelectItem>
                  <SelectItem value="snmp">SNMP</SelectItem>
                  <SelectItem value="lwm2m">LWM2M</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
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
