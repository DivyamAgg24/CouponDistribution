"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Claim = {
    id: number;
    couponId: number;
    ipAddress: string;
    userAgent: string;
    createdAt: string;
    coupon: {
        code: string;
    };
};

type Pagination = {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
};

export default function AdminClaims() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [claims, setClaims] = useState<Claim[]>([]);
    const [pagination, setPagination] = useState<Pagination>({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/admin");
        } else if (status === "authenticated") {
            fetchClaims(1);
        }
    }, [status, router]);

    const fetchClaims = async (page: number) => {
        try {
            setLoading(true);
            const response = await fetch(`/api/admin/claims?page=${page}&limit=20`);

            if (!response.ok) {
                throw new Error("Failed to fetch claims");
            }

            const data = await response.json();
            setClaims(data.claims);
            setPagination(data.pagination);
        } catch (err) {
            setError("Error fetching claims");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClaim = async (id: number) => {
        if (!confirm("Are you sure you want to delete this claim?")) {
            return;
        }

        try {
            const response = await fetch("/api/admin/claims", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ id }),
            });

            if (!response.ok) {
                throw new Error("Failed to delete claim");
            }

            fetchClaims(pagination.page);
        } catch (err) {
            setError("Error deleting claim");
            console.error(err);
        }
    };

    const handlePageChange = (page: number) => {
        fetchClaims(page);
    };

    if (status === "loading") {
        return <div className="p-8 text-center">Loading...</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Claim History</h1>
                <Link href="/admin/coupons" className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
                    Manage Coupons
                </Link>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <span className="block sm:inline">{error}</span>
                    <button
                        className="absolute top-0 bottom-0 right-0 px-4 py-3"
                        onClick={() => setError(null)}
                    >
                        <span className="text-xl">&times;</span>
                    </button>
                </div>
            )}

            {loading ? (
                <div className="text-center py-8">Loading claims...</div>
            ) : claims.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No claims found.</p>
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        ID
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Coupon
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        IP Address
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Claimed At
                                    </th>
                                    <th scope="col" className="relative px-6 py-3">
                                        <span className=""></span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {claims.map((claim) => (
                                    <tr key={claim.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {claim.id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {claim.coupon.code}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {claim.ipAddress}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(claim.createdAt).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleDeleteClaim(claim.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="flex justify-center mt-6">
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                <button
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={pagination.page === 1}
                                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${pagination.page === 1
                                            ? "text-gray-300 cursor-not-allowed"
                                            : "text-gray-500 hover:bg-gray-50"
                                        }`}
                                >
                                    Previous
                                </button>

                                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        className={`relative inline-flex items-center px-4 py-2 border ${page === pagination.page
                                                ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                                : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                                            } text-sm font-medium`}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={pagination.page === pagination.totalPages}
                                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${pagination.page === pagination.totalPages
                                            ? "text-gray-300 cursor-not-allowed"
                                            : "text-gray-500 hover:bg-gray-50"
                                        }`}
                                >
                                    Next
                                </button>
                            </nav>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}