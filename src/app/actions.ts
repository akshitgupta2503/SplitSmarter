"use server";

import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function createGroup(formData: FormData) {
  const name = formData.get("name") as string;
  const userId = (await cookies()).get("userId")?.value;

  if (!userId || !name) return;

  const group = await prisma.group.create({
    data: {
      name,
      members: {
        create: {
          userId,
          joinedAt: new Date(),
        }
      }
    }
  });

  redirect(`/group/${group.id}`);
}

export async function addMemberToGroup(groupId: string, memberName: string) {
  const name = memberName.trim();
  if (!name) return { error: "Name is required" };

  let user = await prisma.user.findUnique({ where: { name } });
  if (!user) {
    user = await prisma.user.create({ data: { name } });
  }

  const existingMember = await prisma.groupMember.findFirst({
    where: { groupId, userId: user.id }
  });

  if (existingMember) {
    if (existingMember.leftAt) {
      // Re-join
      await prisma.groupMember.update({
        where: { id: existingMember.id },
        data: { leftAt: null }
      });
    }
  } else {
    await prisma.groupMember.create({
      data: {
        groupId,
        userId: user.id,
        joinedAt: new Date(),
      }
    });
  }

  revalidatePath(`/group/${groupId}/settings`);
  return { success: true };
}

export async function removeMemberFromGroup(groupId: string, userId: string) {
  const membership = await prisma.groupMember.findFirst({
    where: { groupId, userId }
  });

  if (membership) {
    await prisma.groupMember.update({
      where: { id: membership.id },
      data: { leftAt: new Date() }
    });
  }

  revalidatePath(`/group/${groupId}/settings`);
  return { success: true };
}

export async function settleDebt(groupId: string, payerId: string, payeeId: string, amount: number) {
  if (amount <= 0) return { error: "Amount must be positive" };

  await prisma.payment.create({
    data: {
      payerId,
      payeeId,
      amount,
      date: new Date(),
      notes: "Manual Settlement",
    }
  });

  revalidatePath(`/group/${groupId}`);
  return { success: true };
}

export async function addManualExpense(groupId: string, description: string, amount: number, paidById: string, splitType: string, splitDetailsRaw: string) {
  // We need to fetch group members to do equal splits
  const members = await prisma.groupMember.findMany({
    where: { groupId, leftAt: null }
  });
  const activeMembers = members.map(m => m.userId);

  const expense = await prisma.expense.create({
    data: {
      groupId,
      description,
      amount,
      date: new Date(),
      paidById,
      splitType,
      notes: splitType !== "EQUAL" ? splitDetailsRaw : "Manual entry"
    }
  });

  const splitsToCreate = [];

  if (splitType === "EQUAL") {
    const splitAmount = amount / activeMembers.length;
    for (const memberId of activeMembers) {
      splitsToCreate.push({ expenseId: expense.id, userId: memberId, amount: splitAmount });
    }
  } else if (splitType === "PERCENTAGE") {
    const parts = splitDetailsRaw.split(";").map(s => s.trim());
    let totalPerc = 0;
    const userPercents: {id: string, perc: number}[] = [];
    
    // Parse "Rohan 30; Aisha 70"
    for (const part of parts) {
       const split = part.split(" ");
       if (split.length >= 2) {
         const p = parseFloat(split.pop()!);
         const name = split.join(" ").trim();
         const user = await prisma.user.findUnique({ where: { name } });
         if (user && !isNaN(p)) {
           userPercents.push({ id: user.id, perc: p });
           totalPerc += p;
         }
       }
    }
    
    for (const up of userPercents) {
      const normalizedPerc = (up.perc / totalPerc); // handles > 100% implicitly
      splitsToCreate.push({ expenseId: expense.id, userId: up.id, amount: amount * normalizedPerc });
    }
  } else if (splitType === "SHARE" || splitType === "UNEQUAL") {
    const parts = splitDetailsRaw.split(";").map(s => s.trim());
    let totalSharesOrAmount = 0;
    const userVals: {id: string, val: number}[] = [];
    for (const part of parts) {
       const split = part.split(" ");
       if (split.length >= 2) {
         const val = parseFloat(split.pop()!);
         const name = split.join(" ").trim();
         const user = await prisma.user.findUnique({ where: { name } });
         if (user && !isNaN(val)) {
           userVals.push({ id: user.id, val });
           totalSharesOrAmount += val;
         }
       }
    }
    
    if (splitType === "SHARE") {
       for (const uv of userVals) {
         const shareAmount = amount * (uv.val / totalSharesOrAmount);
         splitsToCreate.push({ expenseId: expense.id, userId: uv.id, amount: shareAmount });
       }
    } else {
       for (const uv of userVals) {
         splitsToCreate.push({ expenseId: expense.id, userId: uv.id, amount: uv.val });
       }
    }
  }

  // Create splits
  for (const split of splitsToCreate) {
    await prisma.expenseSplit.create({
      data: {
        expenseId: split.expenseId,
        userId: split.userId,
        amount: Math.round(split.amount * 100) / 100
      }
    });
  }

  revalidatePath(`/group/${groupId}`);
  return { success: true };
}

export async function renameGroup(groupId: string, newName: string) {
  const userId = (await cookies()).get('userId')?.value;
  if (!userId) return { error: 'Not authenticated' };
  
  // Verify membership
  const member = await prisma.groupMember.findFirst({ where: { groupId, userId } });
  if (!member) return { error: 'Not a member' };

  await prisma.group.update({
    where: { id: groupId },
    data: { name: newName.trim() }
  });

  revalidatePath('/groups');
  revalidatePath(`/group/${groupId}`);
}

export async function deleteGroup(groupId: string) {
  const userId = (await cookies()).get('userId')?.value;
  if (!userId) return { error: 'Not authenticated' };
  
  // Verify membership
  const member = await prisma.groupMember.findFirst({ where: { groupId, userId } });
  if (!member) return { error: 'Not a member' };

  // Delete all related data first if needed, though prisma cascade handles it if configured. 
  // Let's just delete the group directly. If there are no cascades, we must manually delete.
  await prisma.groupMember.deleteMany({ where: { groupId } });
  await prisma.expenseSplit.deleteMany({ where: { expense: { groupId } } });
  await prisma.expense.deleteMany({ where: { groupId } });
  await prisma.group.delete({ where: { id: groupId } });

  revalidatePath('/groups');
}
