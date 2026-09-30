import type { DefaultSession } from "next-auth";
import type { Role } from "@/lib/db/schema";

declare module "next-auth" {
  interface User {
    id: string;
    role: Role;
    schoolId: string | null;
    fullName: string;
    roles?: Role[];
  }

  interface Session {
    user: {
      id: string;
      role: Role;
      schoolId: string | null;
      fullName: string;
      email: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: Role;
    schoolId?: string | null;
    fullName?: string;
  }
}