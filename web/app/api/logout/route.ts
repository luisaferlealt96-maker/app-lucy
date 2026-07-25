import { NextResponse } from "next/server";

export function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const response = NextResponse.redirect(new URL("/login", origin));

  // Limpiar cookies de Supabase Auth que puedan persistir
  const cookiesToDelete = [
    `sb-hbbfdbdydrqqgkavijds-auth-token`,
    `sb-hbbfdbdydrqqgkavijds-auth-token-code-verifier`,
    `sb-access-token`,
    `sb-refresh-token`,
  ];
  for (const name of cookiesToDelete) {
    response.cookies.set(name, "", { maxAge: 0, path: "/" });
  }

  return response;
}
