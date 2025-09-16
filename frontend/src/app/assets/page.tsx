"use client";

import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { type AssetProfile, fetchAssets } from "./actions";

export default function AssetsPage() {
  const [loading, setLoading] = useState<boolean>(false);
  const [assets, setAssets] = useState<AssetProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredAssets, setFilteredAssets] = useState<AssetProfile[]>([]);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  const [assetsPage, setAssetsPage] = useState(0);
  const [assetsTotalPages, setAssetsTotalPages] = useState(1);
  const [assetsTotalElements, setAssetsTotalElements] = useState(0);

  const handleSearchChange = (query: string) => {
    setLocalSearchQuery(query);
    setSearchQuery(query);
  };

  const loadAssets = async (page: number = 0) => {
    try {
      setLoading(true);
      const result = await fetchAssets(page);
      if (result.success) {
        const assetsData = result.data.data || [];
        setAssets(assetsData);
        setAssetsTotalPages(result.data.totalPages || 1);
        setAssetsTotalElements(result.data.totalElements || 0);
        setAssetsPage(page);
      }
    } catch (err) {
      console.error("Failed to load assets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssets(0);
  }, []);

  const handleAssetsPrevPage = () => {
    if (assetsPage > 0) {
      loadAssets(assetsPage - 1);
    }
  };

  const handleAssetsNextPage = () => {
    if (assetsPage < assetsTotalPages - 1) {
      loadAssets(assetsPage + 1);
    }
  };

  useEffect(() => {
    if (!searchQuery) {
      setFilteredAssets(assets);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = assets.filter(
      (item) =>
        (item.name && item.name.toLowerCase().includes(query)) ||
        (item.description && item.description.toLowerCase().includes(query)),
    );
    setFilteredAssets(filtered);
  }, [searchQuery, assets]);

  const displayAssets = searchQuery ? filteredAssets : assets;

  if (loading) {
    return (
      <div className="min-h-screen p-6 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700">
            Loading Assets data....
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Assets Page</h1>
        <p className="text-gray-600">Manage your assets</p>
      </div>
      <div>
        <h2 className="font-bold mt-10 mb-6 text-xl">Assets Management</h2>
      </div>
      <div className="relative mb-6">
        <div className="relative w-72 transition-all duration-300 focus-within:w-80 hover:w-76">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground
                            transition-colors duration-300 group-hover:text-primary"
          />
          <Input
            placeholder="Search assets..."
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
      {displayAssets.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500 text-lg">No assets found.</p>
            <p className="text-gray-400 mt-2">Add assets to get started</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="p-4 text-left font-semibold">Name</th>
                      <th className="p-4 text-left font-semibold">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayAssets.map((asset, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-4">{asset.name || "Not specified"}</td>
                        <td className="p-4">
                          {asset.description || "Not specified"}
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
              Page {assetsPage + 1} of {assetsTotalPages} Total assets:{" "}
              {assetsTotalElements}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAssetsPrevPage}
                disabled={assetsPage === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAssetsNextPage}
                disabled={assetsPage >= assetsTotalPages - 1}
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
