import express from "express";
import morgan from "morgan";
const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 3000;
app.use(express.json());
app.use(morgan("dev"));
app.get("/", (_req, res) => {
    res.json({ message: "Contra API is up and running" });
});
app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
//# sourceMappingURL=server.js.map