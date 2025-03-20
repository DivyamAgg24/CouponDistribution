import { NextRequest,NextResponse } from "next/server";
import {db} from "@/app/lib";
import { cookies } from "next/headers";

type Coupon = {
    id: number;
    code: string;
    description: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export async function GET(req:NextRequest) {
    try {
        const ip = req.headers.get('x-forwarded-for') || ""
        const userAgent = req.headers.get("user-agent") || "";
        const cookieStore = await cookies();
        const claimId = cookieStore.get("coupon_claim_id")?.value;
    
        const cooldownPeriod = parseInt(process.env.COOLDOWN_TIME || "3600")
        const claimGap = new Date(Date.now() - cooldownPeriod * 1000)
    
        const recentClaim = await db.claim.findFirst({
            where: {
                ipAddress: ip,
                createdAt: {
                    gte: claimGap
                }
            }
        })
    
        if (recentClaim){
            const waitTime = Math.ceil((recentClaim.createdAt.getTime() + cooldownPeriod * 1000 - Date.now())/60000)
            return NextResponse.json({
                success: false,
                message: `Please wait ${waitTime} minutes before claiming another coupon.`
            }, {status: 429})
        }
    
        if (claimId){
            const existingClaim = await db.claim.findUnique({
                where: {
                    id: parseInt(claimId)
                },
                include: {coupon: true}
            })
    
            if (existingClaim){
                return NextResponse.json({
                    success: true,
                    message: "You have already claimed a coupon",
                    coupon: existingClaim.coupon.code
                })
            }
        }
    
        const latestClaim = await db.claim.findFirst({
           orderBy: {createdAt: "desc"},
           include: {coupon: true}
        })
    
        const activeCoupons = await db.coupon.findMany({
            where: {
                isActive: true
            },
            orderBy: {
                id: "asc"
            }
        })
    
        if (activeCoupons.length === 0){
            return NextResponse.json({
                message: "No active coupons currently"
            }, {status: 404})
        }
    
        let nextCouponIndex = 0
        if(latestClaim){
            const lastIndex = activeCoupons.findIndex((c: Coupon) => c.id == latestClaim.couponId)
            nextCouponIndex = (lastIndex + 1) % activeCoupons.length
        }
    
        const nextCoupon = activeCoupons[nextCouponIndex]
    
        const claim = await db.claim.create({
            data: {
                couponId: nextCoupon.id,
                ipAddress: ip,
                userAgent: userAgent
            },
            include: {coupon: true}
        })
    
        const response = NextResponse.json({
            success: true,
            message: "Coupon claimed successfully!",
            coupon: nextCoupon.code
        })
    
        response.cookies.set("coupon_claim_id", claim.id.toString(), {
            httpOnly: true,
            maxAge: 60 * 60 * 24,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production"
        })
        return response
    } catch (e) {
        console.error("Error claiming coupon:", e);
        return NextResponse.json({
            success: false,
            message: "An error occurred while processing your request"
        }, {status: 500})
    }
}