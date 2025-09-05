"use client"

import { useState } from 'react';

export default function AlarmsPage() {
    const [loading, setLoading] = useState(false);

    if (loading) {
        return (
            <div className='min-h-screen p-6 bg-gray-50 flex items-center justify-center'>
                <div className='text-center'>
                    <h2 className='text-xl font-semibold text-gray-700'>Loading Alarms data</h2>
                </div>
            </div>
        )
    }
    return (
        <div className='min-h-screen p-6 bg-gray-50'>
            <h1>Alarms page</h1>
        </div>
    )
}