import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
    try{
        const body = await req.json();
        const {email,username,password} = body;
        if (!email || !username || !password) {
            return NextResponse.json({error: 'Missing fields'}, {status: 400});
        }
        const existingUser = await prisma.user.findUnique({
            where: {email},
        });
        if (existingUser) {
            return NextResponse.json({error: 'User already exists'}, {status: 400});
        }
        
        const salt = generateSalt();
        const passwordHash = await hashPassword(password, salt);
        
        const user = await prisma.user.create({
            data: { email, username, passwordHash },
            select: { id: true, email: true, username: true }
        });
        
        return NextResponse.json({ user }, { status: 201 });
    } catch (error) {
        return NextResponse.json({error: 'Internal server error'}, {status: 500});
    }
}
function generateSalt(): string {
    return crypto.randomBytes(16).toString("hex").normalize();
}

function hashPassword(password: string, salt: string): Promise<string> {
    return new Promise((resolve, reject) => {
        crypto.scrypt(password.normalize(), salt, 64, (error, hash) => {
            if (error) reject(error);
            // Store salt:hash so we can verify later
            resolve(`${salt}:${hash.toString("hex")}`);
        });
    });
}
