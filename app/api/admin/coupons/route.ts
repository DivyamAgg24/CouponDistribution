import { NextRequest, NextResponse } from "next/server";
import { db } from "@/index.ts";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { error } from "console";

export async function GET(req: NextRequest) {
    try{
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const coupons = await db.coupon.findMany({
            orderBy: {
                id: "asc"
            },
            include: {
                _count: {
                    select: {
                        claims: true
                    }
                }
            }
        })
        return NextResponse.json({coupons})
    } catch (e){
        console.error("Error fetching coupons", error)
        return NextResponse.json({
            error: "Failed to fetch coupons"
        }, {status: 500})
    } 
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const {code, description, isActive} = await req.json()
        if(!code){
            return NextResponse.json({
                error: "Coupon code is required"
            }, {status: 400})
        }

        const coupon = await db.coupon.create({
            data: {
                code,
                description: description || "",
                isActive: isActive ?? true
            }
        })

        return NextResponse.json({coupon})
    } catch (e){
        console.error("Error while creating coupon", error)
        return NextResponse.json({error: "Failed to create coupon"}, {status: 500})
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const {id, code, description, isActive} = await req.json()


        if(!id){
            return NextResponse.json({
                error: "Coupon id is required"
            }, {status: 400})
        }

        const coupon = await db.coupon.update({
            where: {id: parseInt(id)},
            data: {
                code,
                description,
                isActive
            }
        })

        return NextResponse.json({coupon})
    } catch (e){
        console.error("Error while updating coupon", error)
        return NextResponse.json({error: "Failed to update coupon"}, {status: 500})
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const {id} = await req.json()


        if(!id){
            return NextResponse.json({
                error: "Coupon id is required"
            }, {status: 400})
        }

        await db.coupon.delete({
            where: {id: parseInt(id)}
        })

        return NextResponse.json({message: "Coupon deleted successfully"})
    } catch (e){
        console.error("Error while deleting coupon", error)
        return NextResponse.json({error: "Failed to delete coupon"}, {status: 500})
    }
}