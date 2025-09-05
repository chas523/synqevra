"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Sidebar } from "@/components/sidebar";

export default function LayoutWrapper({ children }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="flex">
            <div className="hidden md:block w-64">
                <Sidebar />
            </div>

            <div className="md:hidden fixed top-0 left-0 w-full bg-white shadow flex items-center justify-between p-4 z-50">
                <button onClick={() => setIsOpen(!isOpen)} className='cursor-pointer'>
                    {isOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
                <h1 className="text-lg font-bold">My App</h1>
            </div>

            {isOpen && (
                <div
                    className="fixed inset-0  bg-opacity-50 z-40"
                    onClick={() => setIsOpen(false)}
                >
                    <div
                        className="absolute left-0 top-0 h-full w-64 bg-white shadow p-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Sidebar />
                    </div>
                </div>
            )}

            <main className="flex-1  mt-16 md:mt-0 p-4">{children}</main>
        </div>
    );
}
