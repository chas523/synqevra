"use client"

import { useEffect, useState } from 'react';
import { AssetProfile, fetchAssets } from './actions';
import { Card, CardContent } from '../../components/ui/card';


export default function AssetsPage() {
    const [loading, setLoading] = useState<boolean>(false);
    const [assets, setAssets] = useState<AssetProfile[]>([]);

    useEffect(() => {
        const loadAssets = async () => {
            try {
                setLoading(true);
                const result = await fetchAssets();
                if(result.success) setAssets(result.data.data || []);
            } catch (err) {
                console.error("Failed to load assets:", err);
            }finally {
                setLoading(false);
            }
        }
        loadAssets();
    }, [])

    if (loading) {
        return (
            <div className='min-h-screen p-6 bg-gray-50 flex items-center justify-center'>
                <div className='text-center'>
                    <h2 className='text-xl font-semibold text-gray-700'>Loading Assets data....</h2>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen p-6 bg-gray-50">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Assets Page</h1>
                <p className="text-gray-600">Manage your assets</p>
            </div>
            <div>
                <h2 className="font-bold mb-6 text-xl">Assets Management</h2>
            </div>
            {assets.length === 0 ? (
                <Card>
                    <CardContent className="p-8 text-center">
                        <p className="text-gray-500 text-lg">No customers found.</p>
                        <p className="text-gray-400 mt-2">Add customers to get started</p>
                    </CardContent>
                </Card>
            ): (
                <Card>
                    <CardContent className="p-0">
                        <div className='overflow-x-auto'>
                            <table className='w-full'>
                                <thead>
                                <tr className="border-b bg-gray-50">
                                    <th className='p-4 text-left font-semibold'>Name</th>
                                    <th className='p-4 text-left font-semibold'>Description</th>
                                </tr>
                                </thead>
                                <tbody>
                                {assets.map((asset, index) => (
                                    <tr key={index} className='border-b hover:bg-gray-50'>
                                        <td className='p-4'>{asset.name || 'Not specified'}</td>
                                        <td className='p-4'>{asset.description || "Not specified"}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
