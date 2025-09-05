"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";

export default function RowsTable() {
  const [rows, setRows] = useState<number[]>([1]);

  const addRow = () => {
    setRows((prev) => [...prev, prev.length + 1]);
  };

  return (
    <div className="form-group">
      <table className="table" id="userDataTable">
        <thead>
          <tr>
            <th style={{ width: "50%" }}>Data</th>
            <th style={{ width: "50%" }}>Value</th>
            <th style={{ width: 80 }}></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((id) => (
            <tr key={id}>
              <td>
                <Input type="text" className="w-full" name="data[]" required />
              </td>
              <td>
                <Input type="text" className="w-full" name="value[]" required />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="d-flex flex-row-reverse">
        <button type="button" className="btn btn-primary" onClick={addRow}>
          +
        </button>
      </div>
    </div>
  );
}
