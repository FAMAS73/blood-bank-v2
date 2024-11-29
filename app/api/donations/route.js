import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const data = await request.json();
    const donation = await prisma.donation.create({
      data: {
        transactionHash: data.transactionHash,
        donorAddress: data.donorAddress,
        bloodType: data.bloodType,
        quantity: parseInt(data.quantity),
        donorName: data.donorName,
        age: parseInt(data.age),
        contact: data.contact,
        status: 'PENDING',
        timestamp: new Date()
      }
    });
    return NextResponse.json(donation);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create donation record' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const donorAddress = searchParams.get('donorAddress');
    const status = searchParams.get('status');

    let where = {};
    if (donorAddress) where.donorAddress = donorAddress;
    if (status) where.status = status;

    const donations = await prisma.donation.findMany({
      where,
      orderBy: {
        timestamp: 'desc'
      },
      include: {
        donor: true
      }
    });

    return NextResponse.json(donations);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch donations' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const data = await request.json();
    const donation = await prisma.donation.update({
      where: { id: data.id },
      data: {
        status: data.status,
        updatedAt: new Date()
      }
    });
    return NextResponse.json(donation);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update donation' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    await prisma.donation.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete donation' },
      { status: 500 }
    );
  }
}
