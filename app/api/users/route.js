import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const data = await request.json();
    const user = await prisma.user.create({
      data: {
        address: data.address,
        name: data.name,
        email: data.email,
        role: data.role
      }
    });
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (address) {
      const user = await prisma.user.findUnique({
        where: { address }
      });
      return NextResponse.json(user || null);
    }

    const users = await prisma.user.findMany();
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const data = await request.json();
    const user = await prisma.user.update({
      where: { address: data.address },
      data: {
        name: data.name,
        email: data.email,
        role: data.role
      }
    });
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}
