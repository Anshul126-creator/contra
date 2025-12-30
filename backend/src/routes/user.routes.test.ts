import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";

const { listUsersMock, getUserByIdMock } = vi.hoisted(() => {
  return {
    listUsersMock: vi.fn(),
    getUserByIdMock: vi.fn(),
  };
});

vi.mock("../services/user.service", () => ({
  listUsers: listUsersMock,
  getUserById: getUserByIdMock,
}));

import app from "../app";
import * as userService from "../services/user.service";

describe("User routes", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should return list of users", async () => {
    listUsersMock.mockResolvedValue([
      { id: "1", name: "Alice", email: "alice@example.com", bio: null, location: null },
    ]);

    const res = await request(app).get("/api/users");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      { id: "1", name: "Alice", email: "alice@example.com", bio: null, location: null },
    ]);
    expect(listUsersMock).toHaveBeenCalledTimes(1);
  });

  it("should return 404 when user not found", async () => {
    getUserByIdMock.mockResolvedValue(null);

    const res = await request(app).get("/api/users/123");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: "User not found" });
    expect(getUserByIdMock).toHaveBeenCalledWith("123");
  });

  it("should return user when found", async () => {
    const user = { id: "1", name: "Alice", email: "alice@example.com", bio: null, location: null, website: null, company: null };
    getUserByIdMock.mockResolvedValue(user);

    const res = await request(app).get("/api/users/1");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(user);
  });
});
