import { NextRequest, NextResponse } from "next/server";
import { db } from "@/index";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/auth";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const url = new URL(req.url);
        const page = parseInt(url.searchParams.get("page") || "1");
        const limit = parseInt(url.searchParams.get("limit") || "20");
        const skip = (page - 1) * limit;

        const claims = await db.claim.findMany({
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            include: {
                coupon: true
            }
        });

        const total = await db.claim.count();

        return NextResponse.json({
            claims,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error("Error fetching claims:", error);
        return NextResponse.json({ error: "Failed to fetch claims" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await req.json();

        if (!id) {
            return NextResponse.json({ error: "Claim ID is required" }, { status: 400 });
        }

        const resp = await db.claim.delete({
            where: { id: parseInt(id) }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting claim:", error);
        return NextResponse.json({ error: "Failed to delete claim" }, { status: 500 });
    }
}