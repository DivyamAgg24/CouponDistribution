"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Coupon = {
    id: number;
    code: string;
    description: string;
    isActive: boolean;
    createdAt: string;
    _count: {
        claims: number;
    };
};

export default function AdminCoupons() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);


    const [showForm, setShowForm] = useState(false);
    const [formMode, setFormMode] = useState<"create" | "edit">("create");
    const [formData, setFormData] = useState({
        id: 0,
        code: "",
        description: "",
        isActive: true
    });

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/admin");
        } else if (status === "authenticated") {
            fetchCoupons();
        }
    }, [status, router]);

    const fetchCoupons = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/admin/coupons");

            if (!response.ok) {
                throw new Error("Failed to fetch coupons");
            }

            const data = await response.json();
            setCoupons(data.coupons);
        } catch (err) {
            setError("Error fetching coupons");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCoupon = () => {
        setFormData({
            id: 0,
            code: "",
            description: "",
            isActive: true
        });
        setFormMode("create");
        setShowForm(true);
    };

    const handleEditCoupon = (coupon: Coupon) => {
        setFormData({
            id: coupon.id,
            code: coupon.code,
            description: coupon.description,
            isActive: coupon.isActive
        });
        setFormMode("edit");
        setShowForm(true);
    };

    const handleDeleteCoupon = async (id: number) => {
        if (!confirm("Are you sure you want to delete this coupon?")) {
            return;
        }

        try {
            const response = await fetch("/api/admin/coupons", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ id }),
            });

            if (!response.ok) {
                throw new Error("Failed to delete coupon");
            }

            fetchCoupons();
        } catch (err) {
            setError("Error deleting coupon");
            console.error(err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const method = formMode === "create" ? "POST" : "PATCH";
            const response = await fetch("/api/admin/coupons", {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to save coupon");
            }

            setShowForm(false);
            fetchCoupons();
        } catch (err: any) {
            setError(err.message);
        }
    };

    if (status == "loading" || status === "unauthenticated") {
        return <div className="p-8 text-center">Loading...</div>;
    }
    else{

        return (
            <div className="mx-24 px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Coupon Management</h1>
                    <div className="space-x-2">
                        <Link href="/admin/claims" className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
                            View Claims
                        </Link>
                        <button
                            onClick={handleCreateCoupon}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Add New Coupon
                        </button>
                    </div>
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
    
                {showForm && (
                    <div className="mb-8 p-6 bg-gray-50 rounded-lg shadow">
                        <h2 className="text-lg font-medium mb-4">
                            {formMode === "create" ? "Add New Coupon" : "Edit Coupon"}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Coupon Code
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                        className="mt-1 py-1 px-2 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        required
                                    />
                                </div>
    
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Description
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="mt-1 py-1 px-2 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    />
                                </div>
    
                                <div className="col-span-2">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.isActive}
                                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <label className="ml-2 block text-sm text-gray-700">
                                            Active
                                        </label>
                                    </div>
                                </div>
                            </div>
    
                            <div className="mt-4 flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    {formMode === "create" ? "Create" : "Update"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
    
                {loading ? (
                    <div className="text-center py-8">Loading coupons...</div>
                ) : coupons.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <p className="text-gray-500">No coupons found. Add your first coupon to get started.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Code
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Description
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Claims
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Created
                                    </th>
                                    <th scope="col" className="relative px-6 py-3">
                                        <span className=""></span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {coupons.map((coupon) => (
                                    <tr key={coupon.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {coupon.code}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {coupon.description || "-"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${coupon.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                                                }`}>
                                                {coupon.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {coupon._count.claims}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(coupon.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleEditCoupon(coupon)}
                                                className="text-blue-600 hover:text-blue-900 mr-4"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCoupon(coupon.id)}
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
                )}
            </div>
        );
    }
}