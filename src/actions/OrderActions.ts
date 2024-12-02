"use server";

import Order from "@/db/models/Order";
import { getUserIdFromCookies } from "@/lib/utils";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function purchaseCourse(courseId: string) {
  try {
    const cookieStore = await cookies();
    const { userId, error } = getUserIdFromCookies(cookieStore);
    if (error !== null) throw new Error("Unauthenticated");
    Order.create({ course: courseId, user: userId });
    redirect("/dashboard/group-classes/my-classes");
  } catch (err) {
    const error = err as Error;
    return { error: error.message };
  }
}
