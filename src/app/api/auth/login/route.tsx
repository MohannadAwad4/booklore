import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { CreateUserSession } from '../core/session';

function verifyPassword(password: string, storedHash: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        const [salt, hash] = storedHash.split(":");
        if (!salt || !hash) {
            resolve(false);
            return;
        }
        crypto.scrypt(password.normalize(), salt, 64, (error, derivedKey) => {
            if (error) reject(error);
            resolve(hash === derivedKey.toString("hex"));
        });
    });
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password } = body;
        
        if (!email || !password) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }
        
        const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true, email: true, username: true, passwordHash: true }
        });
        
        if (!user) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }
        
        const isValid = await verifyPassword(password, user.passwordHash);
        if (!isValid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }
        
     
         await CreateUserSession(user.id);
        
        return NextResponse.json({ 
            user: { id: user.id, email: user.email, username: user.username } 
        });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}