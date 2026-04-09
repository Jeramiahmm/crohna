import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { VALID_CATEGORIES } from "@/lib/constants";

// --- Shared field schemas ---

const dateString = z.string().refine((val) => !isNaN(new Date(val).getTime()), {
  message: "Invalid date format",
});

const latitude = z.number().min(-90).max(90).nullable().optional();
const longitude = z.number().min(-180).max(180).nullable().optional();

const categoryField = z
  .string()
  .transform((val) => val.toLowerCase())
  .pipe(z.enum(VALID_CATEGORIES as unknown as [string, ...string[]]))
  .optional()
  .default("life");

// --- Event schemas ---

export const createEventSchema = z
  .object({
    title: z.string().min(1, "Title is required").max(500, "Title must be under 500 characters"),
    date: dateString,
    endDate: dateString.nullable().optional(),
    location: z.string().max(500, "Location must be under 500 characters").nullable().optional(),
    latitude,
    longitude,
    description: z.string().max(5000, "Description must be under 5000 characters").nullable().optional(),
    category: categoryField,
    imageUrl: z.string().url().nullable().optional(),
  })
  .refine(
    (data) => {
      if (data.endDate && data.date) {
        return new Date(data.endDate) >= new Date(data.date);
      }
      return true;
    },
    { message: "End date must be after start date", path: ["endDate"] }
  );

export const updateEventSchema = z
  .object({
    title: z.string().min(1, "Title cannot be empty").max(500, "Title must be under 500 characters").optional(),
    date: dateString.optional(),
    endDate: dateString.nullable().optional(),
    location: z.string().max(500, "Location must be under 500 characters").nullable().optional(),
    latitude,
    longitude,
    description: z.string().max(5000, "Description must be under 5000 characters").nullable().optional(),
    category: z
      .string()
      .transform((val) => val.toLowerCase())
      .pipe(z.enum(VALID_CATEGORIES as unknown as [string, ...string[]]))
      .optional(),
    imageUrl: z.string().url().nullable().optional(),
  })
  .refine(
    (data) => {
      if (data.endDate && data.date) {
        return new Date(data.endDate) >= new Date(data.date);
      }
      return true;
    },
    { message: "End date must be after start date", path: ["endDate"] }
  );

// --- Story schemas ---

export const createStorySchema = z.object({
  year: z
    .number()
    .int()
    .min(1900, "Year must be after 1900")
    .max(2100, "Year must be before 2100")
    .nullable()
    .optional(),
  period: z.string().max(200, "Period must be under 200 characters").nullable().optional(),
});

// --- User schemas ---

export const updateUserSchema = z.object({
  name: z.string().max(200, "Name must be under 200 characters").optional(),
  preferences: z
    .record(z.string(), z.unknown())
    .refine((val) => JSON.stringify(val).length <= 10_000, {
      message: "Preferences too large (max 10KB)",
    })
    .optional(),
});

export const deleteAccountSchema = z.object({
  confirm: z.string().refine((val) => val === "DELETE_MY_ACCOUNT", {
    message: 'Confirmation required. Send { "confirm": "DELETE_MY_ACCOUNT" } to proceed.',
  }),
});

// --- Helper: parse request body with Zod ---

export async function parseBody<T>(
  req: NextRequest,
  schema: z.ZodType<T>
): Promise<{ data: T; error: null } | { data: null; error: NextResponse }> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return {
      data: null,
      error: NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }),
    };
  }

  const result = schema.safeParse(raw);
  if (!result.success) {
    const firstIssue = result.error.issues[0];
    return {
      data: null,
      error: NextResponse.json(
        { error: firstIssue?.message || "Validation failed" },
        { status: 400 }
      ),
    };
  }

  return { data: result.data, error: null };
}
