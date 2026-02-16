import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// 명시적으로 설정을 주입하여 초기화 에러 방지
export const prisma = globalForPrisma.prisma || new PrismaClient(); // Create without arguments to use standard .env configuration in Prisma 6

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function GET() {
    try {
        const games = await prisma.drinkingGame.findMany();
        return NextResponse.json(games);
    } catch (error) {
        return NextResponse.json({ error: "DB Connection Failed" }, { status: 500 });
    }
}