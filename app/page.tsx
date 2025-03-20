"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Home() {
    const [coupon, setCoupon] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const claimCoupon = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/coupon", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const data = await response.json();

            if (response.ok) {
                setCoupon(data.coupon);
                setMessage(data.message);
            } else {
                setError(data.message || "Failed to claim coupon");
            }
        } catch (err) {
            setError("An error occurred while claiming your coupon");
        }
        setIsLoading(false)
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <h1 className="text-3xl font-extrabold text-gray-900">Coupon Distribution</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Claim your exclusive coupon now!
                    </p>
                </div>

                <div className="space-y-6">
                    {coupon ? (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                            <h2 className="text-lg font-medium text-green-800">Your Coupon:</h2>
                            <div className="mt-2 p-3 bg-white border border-dashed border-green-300 rounded text-center">
                                <span className="text-xl font-bold tracking-wide text-green-700">{coupon}</span>
                            </div>
                            <p className="mt-2 text-sm text-green-600">{message}</p>
                        </div>
                    ) : error ? (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    ) : null}

                    <button
                        onClick={claimCoupon}
                        disabled={isLoading || !!coupon}
                        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isLoading || coupon ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                            }`}
                    >
                        {isLoading ? "Processing..." : coupon ? "Coupon Claimed" : "Claim Your Coupon"}
                    </button>
                </div>

                <div className="mt-6 text-center">
                    <Link href="/admin" className="text-sm text-blue-600 hover:text-blue-500">
                        Admin Login
                    </Link>
                </div>
            </div>
        </div>
    );
}