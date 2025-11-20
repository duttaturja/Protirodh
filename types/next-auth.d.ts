import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    _id: string;
    role: string;
    isBanned: boolean;
  }

  interface Session {
    user: {
      id: string;
      role: string;
      isBanned: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    isBanned: boolean;
  }
}