import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const data = await request.json();
    const bloodRequest = await prisma.bloodRequest.create({
      data: {
        transactionHash: data.transactionHash,
        requesterAddress: data.requesterAddress,
        bloodType: data.bloodType,
        quantity: parseInt(data.quantity),
        recipientName: data.recipientName,
        age: parseInt(data.age),
        contact: data.contact,
        hospital: data.hospital,
        reason: data.reason,
        status: 'PENDING',
        timestamp: new Date()
      }
    });
    return NextResponse.json(bloodRequest);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create blood request' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const requesterAddress = searchParams.get('requesterAddress');
    const status = searchParams.get('status');

    let where = {};
    if (requesterAddress) where.requesterAddress = requesterAddress;
    if (status) where.status = status;

    const requests = await prisma.bloodRequest.findMany({
      where,
      orderBy: {
        timestamp: 'desc'
      },
      include: {
        requester: true
      }
    });

    return NextResponse.json(requests);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch blood requests' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const data = await request.json();
    const bloodRequest = await prisma.bloodRequest.update({
      where: { id: data.id },
      data: {
        status: data.status,
        updatedAt: new Date(),
        fulfilledBy: data.fulfilledBy,
        fulfilledAt: data.status === 'FULFILLED' ? new Date() : null
      }
    });
    return NextResponse.json(bloodRequest);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update blood request' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    await prisma.bloodRequest.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete blood request' },
      { status: 500 }
    );
  }
}
