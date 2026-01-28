"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function createPoll(formData: {
  title: string;
  description: string | null;
  options: string[];
}) {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
      .getAll()
      .map((c) => `${c.name}=${c.value}`)
      .join("; ");

    const response = await fetch("http://localhost:8080/polls", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      body: JSON.stringify(formData),
    });

    if (response.status === 401) {
      return {
        success: false,
        error: "You need to be signed in to create a poll",
      };
    }

    if (!response.ok) {
      const data = await response.json();
      return {
        success: false,
        error: data.error || "Failed to create poll",
      };
    }

    const data = await response.json();

    // Revalidate the polls page
    revalidatePath("/polls");

    return {
      success: true,
      pollId: data.poll_id,
      message: "Poll created successfully",
    };
  } catch (error) {
    console.error("Error creating poll:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
