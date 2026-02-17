import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // DB 연결 시도 전 로그
    console.log("DB 주소 확인 시도 중...");
    
    const games = await prisma.drinkingGame.findMany();
    
    return NextResponse.json(games);
  } catch (error: any) {
    // 에러 발생 시 상세 내용을 Vercel 로그에 강제로 찍음
    console.error("❌ Prisma 에러 발생 상세:", {
      message: error.message,
      code: error.code,
      meta: error.meta,
    });
    
    return NextResponse.json(
      { error: "DB 연결 실패", details: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
