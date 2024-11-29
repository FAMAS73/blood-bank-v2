import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const inventory = await prisma.inventory.findMany({
      orderBy: {
        bloodType: 'asc'
      }
    });

    // Group and sum quantities by blood type
    const groupedInventory = inventory.reduce((acc, item) => {
      if (!acc[item.bloodType]) {
        acc[item.bloodType] = {
          bloodType: item.bloodType,
          quantity: 0,
          available: 0,
          reserved: 0
        };
      }
      acc[item.bloodType].quantity += item.quantity;
      acc[item.bloodType].available += item.status === 'AVAILABLE' ? item.quantity : 0;
      acc[item.bloodType].reserved += item.status === 'RESERVED' ? item.quantity : 0;
      return acc;
    }, {});

    return NextResponse.json(Object.values(groupedInventory));
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch inventory' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const inventory = await prisma.inventory.create({
      data: {
        bloodType: data.bloodType,
        quantity: parseInt(data.quantity),
        donationId: data.donationId,
        status: 'AVAILABLE',
        expiryDate: new Date(Date.now() + (42 * 24 * 60 * 60 * 1000)) // 42 days expiry
      }
    });
    return NextResponse.json(inventory);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update inventory' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const data = await request.json();
    const inventory = await prisma.inventory.update({
      where: { id: data.id },
      data: {
        status: data.status,
        requestId: data.requestId,
        updatedAt: new Date()
      }
    });
    return NextResponse.json(inventory);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update inventory item' },
      { status: 500 }
    );
  }
}

// Endpoint to handle expired blood units
export async function DELETE(request) {
  try {
    const now = new Date();
    const expiredItems = await prisma.inventory.deleteMany({
      where: {
        expiryDate: {
          lt: now
        }
      }
    });

    return NextResponse.json({
      success: true,
      deletedCount: expiredItems.count
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to remove expired inventory' },
      { status: 500 }
    );
  }
}
