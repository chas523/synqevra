"use client";

import { useState } from "react";

import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { Customer } from "../../../lib/utils";
import { Input } from "../../../components/ui/input";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";

interface CustomerTableProps {
  customers: Customer[];
  filteredCustomers: Customer[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  page: number;
  totalPages: number;
  totalElements: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  onSort: (key: keyof Customer) => void;
  sortConfig: { key: string; direction: string };
}

export const CustomerTable = ({
  customers,
  filteredCustomers,
  searchQuery,
  setSearchQuery,
  page,
  totalPages,
  totalElements,
  onPrevPage,
  onNextPage,
  onSort,
  sortConfig,
}: CustomerTableProps) => {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  const handleSearchChange = (query: string) => {
    setLocalSearchQuery(query);
    setSearchQuery(query);
  };

  const handleSort = (key: keyof Customer) => {
    onSort(key);
  };

  const getSortIndicator = (key: string) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === "ascending" ? " ↑" : " ↓";
    }
    return "";
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-bold text-xl">Customers Management</h2>
        <div className="relative">
          <div className="relative w-72 transition-all duration-300 focus-within:w-80 hover:w-76">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground
              transition-colors duration-300 group-hover:text-primary"
            />
            <Input
              placeholder="Search customers..."
              value={localSearchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-xl bg-white border-2 border-gray-200
              transition-all duration-800 hover:border-gray-300 shadow-sm group"
            />
            {localSearchQuery && (
              <button
                onClick={() => handleSearchChange("")}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-full
                bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
              >
                <X className="h-3.5 w-3.5 text-muted-foreground cursor-pointer" />
              </button>
            )}
          </div>
        </div>
      </div>

      {customers.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500 text-lg">No customers found.</p>
            <p className="text-gray-400 mt-2">Add customers to get started</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {filteredCustomers.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500 text-lg">
                  No customers match your search.
                </p>
                <p className="text-gray-400 mt-2">
                  Try a different search term
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="mb-4 text-sm text-gray-500">
                Showing {filteredCustomers.length} of {customers.length}{" "}
                customers
              </div>
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th
                            className="p-4 text-left font-semibold cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => handleSort("name")}
                          >
                            Name{getSortIndicator("name")}
                          </th>
                          <th className="p-4 text-left font-semibold">Email</th>
                          <th className="p-4 text-left font-semibold">
                            Country
                          </th>
                          <th className="p-4 text-left font-semibold">City</th>
                          <th
                            className="p-4 text-left font-semibold cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => handleSort("address")}
                          >
                            Address{getSortIndicator("address")}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCustomers.map((customer, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="p-4">
                              {customer.name || "Not specified"}
                            </td>
                            <td className="p-4">
                              {customer.email || "Not specified"}
                            </td>
                            <td className="p-4">
                              {customer.country || "Not specified"}
                            </td>
                            <td className="p-4">
                              {customer.city || "Not specified"}
                            </td>
                            <td className="p-4">
                              {customer.address || "Not specified"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-500">
                  Page {page + 1} of {totalPages} • Total customers:{" "}
                  {totalElements}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onPrevPage}
                    disabled={page === 0}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onNextPage}
                    disabled={page >= totalPages - 1}
                  >
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};
