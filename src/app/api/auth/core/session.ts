import { cookies } from "next/headers";
import crypto from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
const UserSessionSchema = z.object({
    id: z.string(),
    username: z.string(),
});

const SESSION_EXPIRATION_TIME = 60 * 60 * 24 * 1; // 1 day
export async function CreateUserSession(userId: string) {
    const sessionId = crypto.randomBytes(512).toString("hex").normalize();
    // Date.now() is ms; SESSION_EXPIRATION_TIME is seconds.
    const expiresAt = new Date(Date.now() + SESSION_EXPIRATION_TIME * 1000);
    await prisma.session.create({
        data:{
            id:sessionId,
            userId:userId,
            expiresAt,
        }
    })
    const cookieStore = await cookies();
    cookieStore.set("user_session", sessionId,{secure: process.env.NODE_ENV === 'production', httpOnly:true, sameSite: 'lax', maxAge: SESSION_EXPIRATION_TIME});
}
export async function GetUserSession() {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('user_session')?.value;
    if (!sessionId)return null;

    //find session in database
    const session = await prisma.session.findUnique({
        where:{id:sessionId},
        include:{user:true}
    });
    //if session is not found in db, return null
    if (!session) return null;
    //if session is found in db, check if it has expired
    if (session.expiresAt < new Date()) {
        // Server Components can read cookies, but cannot modify them.
        // Treat expired sessions as logged-out; cleanup happens on logout/new login flows.
        return null;
    }

    return session.user;
}
export async function DeleteUserSession(){
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('user_session')?.value;
    if (!sessionId)return;
    await prisma.session.delete({where:{id:sessionId}});
    cookieStore.delete("user_session");
}
// Logout everywhere in case security breach, changed password, etc.
export async function DestroyAllSessions(userId: string) {
    await prisma.session.deleteMany({ where: { userId } });
}
