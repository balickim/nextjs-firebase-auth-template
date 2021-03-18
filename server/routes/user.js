import express from "express";

import { isAuthenticated, isAuthorized } from "../middlewares";

import { create, all, get, patch, remove } from "../controllers/user";

const app = express.Router();

app.post("/users", isAuthenticated, isAuthorized(["admin", "manager"]), create);
app.get("/users", isAuthenticated, isAuthorized(["admin", "manager"]), all);
// get :id user
app.get(
  "/users/:id",
  isAuthenticated,
  isAuthorized(["admin", "manager"], true),
  get
);
// updates :id user
app.patch(
  "/users/:id",
  isAuthenticated,
  isAuthorized(["admin", "manager"], true),
  patch
);
// deletes :id user
app.delete(
  "/users/:id",
  isAuthenticated,
  isAuthorized(["admin", "manager"]),
  remove
);

module.exports = app;
