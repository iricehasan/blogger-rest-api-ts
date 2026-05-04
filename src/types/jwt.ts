import { JwtPayload } from "jsonwebtoken";
import { Role } from "@prisma/client";

export interface TokenPayload extends JwtPayload {
  userId: string;
  role: Role;
}
