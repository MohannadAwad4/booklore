import { NextResponse } from "next/server";
import { DeleteUserSession } from "../core/session";

export async function GET(req: Request) {
    try {
        await DeleteUserSession();
        return NextResponse.json({ message: 'Logged out' });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}