"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!username || !password) {
            setError("Username and password are required");
            return;
        }

        setIsLoading(true);
        setError("");

        const result = await signIn("credentials", {
            username,
            password,
            redirect: false,
        });

        if (result?.error) {
            setError("Invalid username or password");
            setIsLoading(false);
        } else {
            router.push("/admin/coupons");
        }
    };

    return (
        <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
                    Admin Login
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="shadow-sm p-8 bg-white items-center rounded-lg w-full">
                    {error && (
                        <div className="mb-4 text-center border border-red-500 bg-red-100 rounded-sm" role="alert">
                            <div className="text-red-500">
                                {error}
                            </div>
                        </div>
                    )}
                    <div className="w-full flex flex-col space-y-2">
                        <div>Username</div>
                        <input type="text" className="border-[0.1px] rounded shadow-sm w-full px-2" onChange={(e)=>{setUsername(e.target.value)}}/>
                    </div>
                    <div className="w-full flex flex-col space-y-2 mt-5">
                        <div>Password</div>
                        <input type="password" className="border-[0.1px] rounded shadow-sm w-full px-2" onChange={(e)=>{setPassword(e.target.value)}}/>
                    </div>
                    <div className="w-full text-center mt-8">
                        <button className={`border w-full rounded-md ${isLoading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"} cursor-pointer py-1 text-black`} onClick={handleSubmit}>{isLoading ? "Processing..." : "Login"}</button>
                    </div>
                </div>
            </div>
        </div>
    );
}