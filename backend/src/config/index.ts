import "dotenv/config";

const config = {
  port: process.env.PORT ? Number(process.env.PORT) : 3000,
  databaseUrl: process.env.DATABASE_URL ?? "postgres://localhost:5432/contra",
};

export default config;
