import { NextResponse } from "next/server";

/**
 * Standard API response helpers for consistent response format.
 */

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, ...data as object }, { status });
}

export function apiError(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export function apiPaginated<T>(
  items: T[],
  key: string,
  nextCursor?: string,
  total?: number
) {
  return NextResponse.json({
    success: true,
    [key]: items,
    total: total ?? items.length,
    ...(nextCursor ? { nextCursor } : {}),
  });
}
