"use server";

import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function getSafeRedirect(value: FormDataEntryValue | null) {
  const redirectTo = String(value ?? "/tweets");

  if (!redirectTo.startsWith("/") || redirectTo.startsWith("//")) {
    return "/tweets";
  }

  return redirectTo;
}

export async function toggleFollow(formData: FormData) {
  const currentUser = await getCurrentUser();
  const followingId = Number(formData.get("followingId"));
  const redirectTo = getSafeRedirect(formData.get("redirectTo"));

  if (!currentUser) {
    redirect("/login");
  }

  if (!followingId || followingId === currentUser.id) {
    redirect(redirectTo);
  }

  const existingFollow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: currentUser.id,
        followingId,
      },
    },
  });

  if (existingFollow) {
    await prisma.follow.delete({
      where: {
        id: existingFollow.id,
      },
    });
  } else {
    await prisma.follow.create({
      data: {
        followerId: currentUser.id,
        followingId,
      },
    });
  }

  revalidatePath("/tweets");
  revalidatePath("/profile");
  revalidatePath(`/users/${followingId}`);
  redirect(redirectTo);
}
