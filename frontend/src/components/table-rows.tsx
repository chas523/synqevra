"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface RowsTableProps {
  required?: boolean;
}

export default function RowsTable({ required = true }: RowsTableProps) {
  const [rows, setRows] = useState<number[]>([1]);

  const addRow = () => {
    setRows((prev) => [...prev, prev.length + 1]);
  };

  return (
    <div>
      <table className="table" id="userDataTable">
        <thead>
          <tr>
            <th>Data Topic</th>
            <th>Value</th>
            <th style={{ width: 80 }}></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((id) => (
            <tr key={id}>
              <td>
                <Input
                  type="text"
                  className="w-full"
                  name="data[]"
                  required={required}
                />
              </td>
              <td>
                <Input
                  type="text"
                  className="w-full"
                  name="value[]"
                  required={required}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Button type="button" className="btn btn-primary" onClick={addRow}>
        +
      </Button>
      <div className="d-flex flex-row-reverse"></div>
    </div>
  );
}
