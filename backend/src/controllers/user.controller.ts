import type { Request, Response } from "express";

import { getUserById, listUsers } from "../services/user.service";

export async function listUsersHandler(_req: Request, res: Response) {
  const users = await listUsers();
  res.json(users);
}

export async function getUserByIdHandler(req: Request, res: Response) {
  const user = await getUserById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.json(user);
}
