"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// api/index.ts
var index_exports = {};
__export(index_exports, {
  default: () => index_default
});
module.exports = __toCommonJS(index_exports);

// src/app.ts
var import_express18 = __toESM(require("express"), 1);
var import_cors = __toESM(require("cors"), 1);

// src/config/env.ts
var import_config = require("dotenv/config");
var import_zod = require("zod");
var envSchema = import_zod.z.object({
  NODE_ENV: import_zod.z.enum(["development", "test", "production"]).default("development"),
  PORT: import_zod.z.coerce.number().int().positive().default(4e3),
  API_PREFIX: import_zod.z.string().startsWith("/").default("/api/v1"),
  DATABASE_URL: import_zod.z.string().url(),
  JWT_ACCESS_SECRET: import_zod.z.string().min(16),
  JWT_REFRESH_SECRET: import_zod.z.string().min(16),
  JWT_ACCESS_EXPIRES_IN: import_zod.z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: import_zod.z.string().default("7d"),
  BCRYPT_SALT_ROUNDS: import_zod.z.coerce.number().int().min(4).max(15).default(12),
  CORS_ORIGIN: import_zod.z.string().default("*"),
  LOG_LEVEL: import_zod.z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
  // File uploads (local storage by default).
  UPLOAD_DIR: import_zod.z.string().default("uploads"),
  MAX_FILE_SIZE_MB: import_zod.z.coerce.number().positive().max(512).default(25),
  // Google OAuth
  GOOGLE_CLIENT_ID: import_zod.z.string().min(1),
  GOOGLE_CLIENT_SECRET: import_zod.z.string().min(1),
  GOOGLE_CALLBACK_URL: import_zod.z.string().url(),
  // Where the frontend lives (Google login sends the user back here)
  FRONTEND_URL: import_zod.z.string().url().default("http://localhost:5173"),
  // SMTP (email sending) — all optional: when SMTP_HOST is empty,
  // the mailer runs in console mode (OTP printed to terminal).
  SMTP_HOST: import_zod.z.string().default(""),
  SMTP_PORT: import_zod.z.coerce.number().int().default(587),
  SMTP_USER: import_zod.z.string().default(""),
  SMTP_PASS: import_zod.z.string().default(""),
  MAIL_FROM: import_zod.z.string().default("Bayt Al Taleb <no-reply@example.com>")
});
function loadEnv() {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error("\u274C Invalid environment configuration:");
    console.error(parsed.error.flatten().fieldErrors);
    process.exit(1);
  }
  return parsed.data;
}
var env = loadEnv();
var isProduction = env.NODE_ENV === "production";
var isTest = env.NODE_ENV === "test";

// src/infrastructure/database/prisma.ts
var import_client = require("@prisma/client");
var globalForPrisma = globalThis;
var prisma = globalForPrisma.prisma ?? new import_client.PrismaClient({
  log: isProduction ? ["error"] : ["warn", "error"]
});
if (!isProduction) {
  globalForPrisma.prisma = prisma;
}

// src/shared/errors/app-error.ts
var AppError = class extends Error {
  statusCode;
  code;
  /** Marks errors we expect & surface to clients vs. unexpected bugs. */
  isOperational;
  details;
  constructor(message, statusCode, code, options = {}) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = options.isOperational ?? true;
    this.details = options.details;
    Error.captureStackTrace?.(this, this.constructor);
  }
};
var BadRequestError = class extends AppError {
  constructor(message = "Bad request", details) {
    super(message, 400, "BAD_REQUEST", { details });
  }
};
var ValidationError = class extends AppError {
  constructor(message = "Validation failed", details) {
    super(message, 422, "VALIDATION_ERROR", { details });
  }
};
var UnauthorizedError = class extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED");
  }
};
var ForbiddenError = class extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403, "FORBIDDEN");
  }
};
var NotFoundError = class extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404, "NOT_FOUND");
  }
};
var ConflictError = class extends AppError {
  constructor(message = "Conflict", details) {
    super(message, 409, "CONFLICT", { details });
  }
};

// src/shared/rbac/permissions.ts
var import_client2 = require("@prisma/client");
var PERMISSIONS = {
  // Users
  USERS_READ: "users:read",
  USERS_MANAGE: "users:manage",
  // Roles
  ROLES_READ: "roles:read",
  ROLES_ASSIGN: "roles:assign",
  // Moderators (admin-level capability)
  MODERATORS_MANAGE: "moderators:manage",
  // Content (majors / scholarships + their sections/faqs)
  MAJORS_READ: "majors:read",
  MAJORS_MANAGE: "majors:manage",
  SCHOLARSHIPS_READ: "scholarships:read",
  SCHOLARSHIPS_MANAGE: "scholarships:manage",
  CONTENT_MANAGE: "content:manage",
  // Files
  FILES_READ: "files:read",
  FILES_UPLOAD: "files:upload",
  FILES_MANAGE: "files:manage",
  FILES_REVIEW: "files:review",
  // Contact
  CONTACT_SUBMIT: "contact:submit",
  CONTACT_MANAGE: "contact:manage"
};
var ALL_PERMISSIONS = Object.values(PERMISSIONS);
var ROLE_PERMISSIONS = {
  [import_client2.RoleName.SUPER_ADMIN]: ALL_PERMISSIONS,
  [import_client2.RoleName.ADMIN]: [
    PERMISSIONS.USERS_READ,
    PERMISSIONS.MODERATORS_MANAGE,
    PERMISSIONS.USERS_MANAGE,
    PERMISSIONS.ROLES_READ,
    PERMISSIONS.MAJORS_READ,
    PERMISSIONS.MAJORS_MANAGE,
    PERMISSIONS.SCHOLARSHIPS_READ,
    PERMISSIONS.SCHOLARSHIPS_MANAGE,
    PERMISSIONS.CONTENT_MANAGE,
    PERMISSIONS.FILES_READ,
    PERMISSIONS.FILES_MANAGE,
    PERMISSIONS.FILES_REVIEW,
    PERMISSIONS.CONTACT_MANAGE
  ],
  [import_client2.RoleName.MODERATOR]: [
    PERMISSIONS.MAJORS_READ,
    PERMISSIONS.MAJORS_MANAGE,
    PERMISSIONS.SCHOLARSHIPS_READ,
    PERMISSIONS.SCHOLARSHIPS_MANAGE,
    PERMISSIONS.CONTENT_MANAGE,
    PERMISSIONS.FILES_READ,
    PERMISSIONS.FILES_REVIEW
  ],
  [import_client2.RoleName.MEMBER]: [
    PERMISSIONS.MAJORS_READ,
    PERMISSIONS.SCHOLARSHIPS_READ,
    PERMISSIONS.FILES_READ,
    PERMISSIONS.FILES_UPLOAD,
    PERMISSIONS.CONTACT_SUBMIT
  ],
  [import_client2.RoleName.VISITOR]: [
    PERMISSIONS.MAJORS_READ,
    PERMISSIONS.SCHOLARSHIPS_READ,
    PERMISSIONS.FILES_READ,
    PERMISSIONS.CONTACT_SUBMIT
  ]
};
function permissionsForRole(role) {
  if (role === import_client2.RoleName.SUPER_ADMIN) return new Set(ALL_PERMISSIONS);
  return new Set(ROLE_PERMISSIONS[role] ?? []);
}

// src/infrastructure/http/middlewares/auth.middleware.ts
function authenticate(tokenService) {
  return (req, _res, next) => {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw new UnauthorizedError("Missing or malformed Authorization header");
    }
    const token = header.slice("Bearer ".length).trim();
    try {
      const payload = tokenService.verifyAccessToken(token);
      req.user = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
        permissions: permissionsForRole(payload.role)
      };
      next();
    } catch {
      throw new UnauthorizedError("Invalid or expired access token");
    }
  };
}

// src/modules/auth/auth.repository.ts
var AuthRepository = class {
  constructor(db) {
    this.db = db;
  }
  db;
  // ─── Users ────────────────────────────────────────────────────
  async findUserByEmail(email) {
    return this.db.user.findUnique({
      where: { email },
      include: { role: { select: { name: true } } }
    });
  }
  async findUserById(id) {
    return this.db.user.findUnique({
      where: { id },
      include: { role: { select: { name: true } } }
    });
  }
  async findUserByGoogleId(googleId) {
    return this.db.user.findUnique({
      where: { googleId },
      include: { role: { select: { name: true } } }
    });
  }
  async updateUser(id, data) {
    return this.db.user.update({
      where: { id },
      data,
      include: { role: { select: { name: true } } }
    });
  }
  async createUser(data) {
    return this.db.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash ?? null,
        fullName: data.fullName,
        roleId: data.roleId,
        googleId: data.googleId ?? null
      },
      include: { role: { select: { name: true } } }
    });
  }
  async findRoleByName(name) {
    return this.db.role.findUnique({ where: { name } });
  }
  // ─── Refresh Tokens ───────────────────────────────────────────
  async createRefreshToken(data) {
    return this.db.refreshToken.create({ data });
  }
  async findRefreshToken(tokenHash) {
    return this.db.refreshToken.findUnique({ where: { tokenHash } });
  }
  async revokeRefreshToken(tokenHash) {
    await this.db.refreshToken.updateMany({
      where: { tokenHash },
      data: { revokedAt: /* @__PURE__ */ new Date() }
    });
  }
  async revokeAllUserRefreshTokens(userId) {
    await this.db.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: /* @__PURE__ */ new Date() }
    });
  }
  async deleteExpiredTokens() {
    await this.db.refreshToken.deleteMany({
      where: { expiresAt: { lt: /* @__PURE__ */ new Date() } }
    });
  }
};

// src/modules/auth/auth.service.ts
var import_crypto = __toESM(require("crypto"), 1);
var import_client3 = require("@prisma/client");
var OTP_TTL_MS = 10 * 60 * 1e3;
var AuthService = class {
  constructor(repo, hasher, tokenService, refreshTtlMs, googleAuth, mailer) {
    this.repo = repo;
    this.hasher = hasher;
    this.tokenService = tokenService;
    this.refreshTtlMs = refreshTtlMs;
    this.googleAuth = googleAuth;
    this.mailer = mailer;
  }
  repo;
  hasher;
  tokenService;
  refreshTtlMs;
  googleAuth;
  mailer;
  // ─── Register ────────────────────────────────────────────────
  async register(input) {
    const existing = await this.repo.findUserByEmail(input.email);
    if (existing) {
      throw new ConflictError("Email is already in use");
    }
    const memberRole = await this.repo.findRoleByName(import_client3.RoleName.MEMBER);
    if (!memberRole) throw new Error("MEMBER role not seeded");
    const passwordHash = await this.hasher.hash(input.password);
    const user = await this.repo.createUser({
      email: input.email,
      passwordHash,
      fullName: input.fullName,
      roleId: memberRole.id
    });
    const tokens = await this.#issueTokenPair(user.id, user.email, user.role.name);
    return {
      user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role.name },
      tokens
    };
  }
  // ─── Login ───────────────────────────────────────────────────
  async login(input) {
    const user = await this.repo.findUserByEmail(input.email);
    if (!user) throw new UnauthorizedError("Invalid email or password");
    if (!user.passwordHash) throw new UnauthorizedError("Invalid email or password");
    const valid = await this.hasher.compare(input.password, user.passwordHash);
    if (!valid) throw new UnauthorizedError("Invalid email or password");
    if (!user.isActive) throw new UnauthorizedError("Account is deactivated");
    if (user.twoFactorEnabled) {
      const code = this.#generateOtp();
      const hash = this.#hashToken(code);
      await this.repo.updateUser(user.id, {
        twoFactorSecret: hash,
        otpExpiresAt: new Date(Date.now() + OTP_TTL_MS)
      });
      await this.mailer.sendOtpCode(user.email, code, "login");
      const tempToken = this.tokenService.signAccess({
        sub: user.id,
        email: user.email,
        role: "TWO_FACTOR"
      });
      return { requiresTwoFactor: true, tempToken };
    }
    const tokens = await this.#issueTokenPair(user.id, user.email, user.role.name);
    return {
      user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role.name },
      tokens
    };
  }
  // ─── 2FA (email OTP) ─────────────────────────────────────────
  /** Verify the OTP code during login, then issue the real tokens. */
  async verifyOtp(input) {
    let payload;
    try {
      payload = this.tokenService.verifyAccessToken(input.tempToken);
    } catch {
      throw new UnauthorizedError("Invalid or expired session");
    }
    if (payload.role !== "TWO_FACTOR") throw new UnauthorizedError("Invalid session");
    const user = await this.repo.findUserById(payload.sub);
    if (!user || !user.isActive) throw new UnauthorizedError("User not found or deactivated");
    if (!user.twoFactorSecret || !user.otpExpiresAt) {
      throw new UnauthorizedError("Two-factor verification is not required");
    }
    if (user.otpExpiresAt < /* @__PURE__ */ new Date()) {
      throw new UnauthorizedError("The code has expired. Please log in again.");
    }
    const hash = this.#hashToken(input.code.trim());
    if (hash !== user.twoFactorSecret) {
      throw new UnauthorizedError("Invalid code");
    }
    await this.repo.updateUser(user.id, {
      twoFactorSecret: null,
      otpExpiresAt: null
    });
    const tokens = await this.#issueTokenPair(user.id, user.email, user.role.name);
    return {
      user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role.name },
      tokens
    };
  }
  /** Start enabling 2FA: email a confirmation code. */
  async setupTwoFactor(userId) {
    const user = await this.repo.findUserById(userId);
    if (!user) throw new UnauthorizedError("User not found");
    const code = this.#generateOtp();
    const hash = this.#hashToken(code);
    await this.repo.updateUser(user.id, {
      twoFactorSecret: hash,
      otpExpiresAt: new Date(Date.now() + OTP_TTL_MS)
    });
    await this.mailer.sendOtpCode(user.email, code, "enable");
  }
  /** Confirm enabling 2FA with the emailed code. */
  async confirmTwoFactor(userId, code) {
    const user = await this.repo.findUserById(userId);
    if (!user) throw new UnauthorizedError("User not found");
    if (!user.twoFactorSecret || !user.otpExpiresAt) {
      throw new UnauthorizedError("Verification was not started");
    }
    if (user.otpExpiresAt < /* @__PURE__ */ new Date()) {
      throw new UnauthorizedError("The code has expired. Please try again.");
    }
    const hash = this.#hashToken(code.trim());
    if (hash !== user.twoFactorSecret) throw new UnauthorizedError("Invalid code");
    await this.repo.updateUser(user.id, {
      twoFactorEnabled: true,
      twoFactorSecret: null,
      otpExpiresAt: null
    });
  }
  /** Turn 2FA off. */
  async disableTwoFactor(userId) {
    await this.repo.updateUser(userId, {
      twoFactorEnabled: false,
      twoFactorSecret: null,
      otpExpiresAt: null
    });
  }
  /** Is 2FA enabled for this user? */
  async getTwoFactorStatus(userId) {
    const user = await this.repo.findUserById(userId);
    return { enabled: Boolean(user?.twoFactorEnabled) };
  }
  // ─── Google OAuth ─────────────────────────────────────────────
  getGoogleAuthUrl() {
    return this.googleAuth.getAuthorizationUrl();
  }
  async loginWithGoogle(code) {
    const profile = await this.googleAuth.handleCallback(code);
    if (!profile.email) throw new UnauthorizedError("Google account has no email");
    const tokens = await this.#issueTokenPair(profile.id, profile.email, profile.role);
    return {
      user: { id: profile.id, email: profile.email, fullName: profile.fullName, role: profile.role },
      tokens
    };
  }
  // ─── Refresh ─────────────────────────────────────────────────
  async refresh(input) {
    let payload;
    try {
      payload = this.tokenService.verifyRefresh(input.refreshToken);
    } catch {
      throw new UnauthorizedError("Invalid refresh token");
    }
    const tokenHash = this.#hashToken(input.refreshToken);
    const stored = await this.repo.findRefreshToken(tokenHash);
    if (!stored || stored.revokedAt || stored.expiresAt < /* @__PURE__ */ new Date()) {
      throw new UnauthorizedError("Refresh token is invalid or expired");
    }
    await this.repo.revokeRefreshToken(tokenHash);
    const user = await this.repo.findUserById(payload.sub);
    if (!user || !user.isActive) throw new UnauthorizedError("User not found or deactivated");
    const tokens = await this.#issueTokenPair(user.id, user.email, user.role.name);
    return {
      user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role.name },
      tokens
    };
  }
  // ─── Logout ──────────────────────────────────────────────────
  async logout(input) {
    const tokenHash = this.#hashToken(input.refreshToken);
    await this.repo.revokeRefreshToken(tokenHash);
  }
  // ─── Private Helpers ─────────────────────────────────────────
  async #issueTokenPair(userId, email, role) {
    const jti = import_crypto.default.randomUUID();
    const accessToken = this.tokenService.signAccess({ sub: userId, email, role });
    const refreshToken = this.tokenService.signRefresh({ sub: userId, jti });
    const tokenHash = this.#hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + this.refreshTtlMs);
    await this.repo.createRefreshToken({ userId, tokenHash, expiresAt });
    return { accessToken, refreshToken };
  }
  #hashToken(token) {
    return import_crypto.default.createHash("sha256").update(token).digest("hex");
  }
  /** Generate a random 6-digit OTP code, e.g. "482913". */
  #generateOtp() {
    return import_crypto.default.randomInt(0, 1e6).toString().padStart(6, "0");
  }
};

// src/shared/utils/http-response.ts
function ok(res, data, status = 200) {
  const body = { success: true, data };
  return res.status(status).json(body);
}
function created(res, data) {
  return ok(res, data, 201);
}
function noContent(res) {
  return res.status(204).send();
}
function paginated(res, page) {
  return ok(res, page);
}

// src/shared/utils/async-handler.ts
function asyncHandler(fn) {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}

// src/modules/auth/auth.controller.ts
var AuthController = class {
  constructor(service) {
    this.service = service;
  }
  service;
  register = asyncHandler(async (req, res) => {
    const input = req.body;
    const result = await this.service.register(input);
    const dto = { user: result.user, tokens: result.tokens };
    created(res, dto);
  });
  login = asyncHandler(async (req, res) => {
    const input = req.body;
    const result = await this.service.login(input);
    if (result.requiresTwoFactor) {
      ok(res, { requiresTwoFactor: true, tempToken: result.tempToken });
      return;
    }
    const dto = { user: result.user, tokens: result.tokens };
    ok(res, dto);
  });
  verifyOtp = asyncHandler(async (req, res) => {
    const { tempToken, code } = req.body;
    const result = await this.service.verifyOtp({ tempToken, code });
    const dto = { user: result.user, tokens: result.tokens };
    ok(res, dto);
  });
  setupTwoFactor = asyncHandler(async (req, res) => {
    await this.service.setupTwoFactor(req.user.id);
    ok(res, { message: "Verification code sent to your email" });
  });
  confirmTwoFactor = asyncHandler(async (req, res) => {
    const { code } = req.body;
    await this.service.confirmTwoFactor(req.user.id, code);
    ok(res, { message: "Two-factor authentication enabled" });
  });
  disableTwoFactor = asyncHandler(async (req, res) => {
    await this.service.disableTwoFactor(req.user.id);
    ok(res, { message: "Two-factor authentication disabled" });
  });
  getTwoFactorStatus = asyncHandler(async (req, res) => {
    const status = await this.service.getTwoFactorStatus(req.user.id);
    ok(res, status);
  });
  refresh = asyncHandler(async (req, res) => {
    const input = req.body;
    const result = await this.service.refresh(input);
    const dto = { user: result.user, tokens: result.tokens };
    ok(res, dto);
  });
  logout = asyncHandler(async (req, res) => {
    const input = req.body;
    await this.service.logout(input);
    noContent(res);
  });
  getGoogleAuthUrl = asyncHandler(async (_req, res) => {
    const url = this.service.getGoogleAuthUrl();
    res.redirect(url);
  });
  loginWithGoogle = asyncHandler(async (req, res) => {
    const code = req.query.code;
    if (!code) throw new Error("Missing code from Google");
    const result = await this.service.loginWithGoogle(code);
    const params = new URLSearchParams({
      accessToken: result.tokens.accessToken,
      refreshToken: result.tokens.refreshToken
    });
    res.redirect(`${env.FRONTEND_URL}/auth/callback?${params.toString()}`);
  });
};

// src/modules/auth/bcrypt-password.hasher.ts
var import_bcryptjs = __toESM(require("bcryptjs"), 1);
var BcryptPasswordHasher = class {
  constructor(saltRounds) {
    this.saltRounds = saltRounds;
  }
  saltRounds;
  hash(plain) {
    return import_bcryptjs.default.hash(plain, this.saltRounds);
  }
  compare(plain, hash) {
    return import_bcryptjs.default.compare(plain, hash);
  }
};

// src/modules/auth/jwt-token.service.ts
var import_jsonwebtoken = __toESM(require("jsonwebtoken"), 1);
var JwtTokenService = class {
  constructor(config) {
    this.config = config;
  }
  config;
  signAccess(payload) {
    return import_jsonwebtoken.default.sign(payload, this.config.accessSecret, {
      expiresIn: this.config.accessExpiresIn
    });
  }
  signRefresh(payload) {
    return import_jsonwebtoken.default.sign(payload, this.config.refreshSecret, {
      expiresIn: this.config.refreshExpiresIn
    });
  }
  verifyAccess(token) {
    try {
      return import_jsonwebtoken.default.verify(token, this.config.accessSecret);
    } catch {
      throw new UnauthorizedError("Invalid or expired access token");
    }
  }
  verifyAccessToken(token) {
    return this.verifyAccess(token);
  }
  verifyRefresh(token) {
    try {
      return import_jsonwebtoken.default.verify(token, this.config.refreshSecret);
    } catch {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }
  }
};

// src/modules/auth/google-auth.service.ts
var import_google_auth_library = require("google-auth-library");
var import_client4 = require("@prisma/client");
var GoogleAuthService = class {
  constructor(clientId, clientSecret, callbackUrl, repo) {
    this.repo = repo;
    this.clientId = clientId;
    this.client = new import_google_auth_library.OAuth2Client(clientId, clientSecret, callbackUrl);
  }
  repo;
  client;
  clientId;
  getAuthorizationUrl() {
    return this.client.generateAuthUrl({
      access_type: "online",
      scope: ["openid", "email", "profile"],
      prompt: "select_account"
    });
  }
  async handleCallback(code) {
    const { tokens } = await this.client.getToken(code);
    const idToken = tokens.id_token;
    if (!idToken) throw new Error("No id_token returned from Google");
    const ticket = await this.client.verifyIdToken({
      idToken,
      audience: this.clientId
    });
    const profile = ticket.getPayload();
    if (!profile) throw new Error("Invalid Google profile");
    if (!profile.sub || !profile.email) throw new Error("Invalid Google profile");
    const googleId = profile.sub;
    const email = profile.email;
    const fullName = profile.name ?? email.split("@")[0] ?? "";
    let user = await this.repo.findUserByGoogleId(googleId);
    if (!user) {
      const existingByEmail = await this.repo.findUserByEmail(email);
      if (existingByEmail) {
        user = await this.repo.updateUser(existingByEmail.id, { googleId });
      }
    }
    if (!user) {
      const memberRole = await this.repo.findRoleByName(import_client4.RoleName.MEMBER);
      if (!memberRole) throw new Error("MEMBER role not seeded");
      user = await this.repo.createUser({
        email,
        fullName,
        roleId: memberRole.id,
        googleId
      });
    }
    if (!user.isActive) throw new Error("Account is deactivated");
    return { id: user.id, email: user.email, fullName: user.fullName, role: user.role.name };
  }
};

// src/modules/auth/email.service.ts
var import_nodemailer = __toESM(require("nodemailer"), 1);
var EmailService = class {
  constructor(host, port, user, pass, from) {
    this.host = host;
    this.port = port;
    this.user = user;
    this.pass = pass;
    this.from = from;
    this.transporter = this.host ? import_nodemailer.default.createTransport({
      host: this.host,
      port: this.port,
      secure: this.port === 465,
      auth: this.user ? { user: this.user, pass: this.pass } : void 0
    }) : null;
  }
  host;
  port;
  user;
  pass;
  from;
  transporter;
  async sendOtpCode(to, code, purpose) {
    const title = purpose === "login" ? "\u0643\u0648\u062F \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644" : "\u0643\u0648\u062F \u062A\u0641\u0639\u064A\u0644 \u0627\u0644\u062A\u062D\u0642\u0642 \u0628\u062E\u0637\u0648\u062A\u064A\u0646";
    const html = `
  <div dir="rtl" style="font-family: Arial, sans-serif; background:#f4f6fb; padding:30px;">
    <div style="max-width:480px; margin:auto; background:#ffffff; border-radius:16px; padding:32px; box-shadow:0 2px 8px rgba(0,0,0,0.08);">
      <h2 style="color:#1a5fb4; text-align:center; margin:0 0 8px;">\u0628\u064A\u062A \u0627\u0644\u0637\u0627\u0644\u0628</h2>
      <p style="color:#555; text-align:center; margin:0 0 24px;">${title}</p>
      <p style="color:#333; text-align:center;">\u0627\u0633\u062A\u062E\u062F\u0645 \u0627\u0644\u0643\u0648\u062F \u0627\u0644\u062A\u0627\u0644\u064A:</p>
      <div style="background:#f0f4ff; border:2px dashed #1a5fb4; border-radius:12px; padding:16px; text-align:center; margin:16px 0;">
        <span style="font-size:32px; font-weight:bold; letter-spacing:8px; color:#1a5fb4;">${code}</span>
      </div>
      <p style="color:#999; font-size:13px; text-align:center;">\u0647\u0630\u0627 \u0627\u0644\u0643\u0648\u062F \u0635\u0627\u0644\u062D \u0644\u0645\u062F\u0629 10 \u062F\u0642\u0627\u0626\u0642 \u0641\u0642\u0637</p>
      <p style="color:#999; font-size:13px; text-align:center;">\u0625\u0630\u0627 \u0644\u0645 \u062A\u0637\u0644\u0628 \u0647\u0630\u0627 \u0627\u0644\u0643\u0648\u062F\u060C \u062A\u062C\u0627\u0647\u0644 \u0647\u0630\u0647 \u0627\u0644\u0631\u0633\u0627\u0644\u0629</p>
    </div>
  </div>`;
    if (!this.transporter) {
      console.info(`[OTP] CONSOLE MODE \u2014 code ${code} for ${to} (${purpose})`);
      return;
    }
    console.info(`[OTP] SMTP MODE \u2014 sending real email to ${to} (${purpose})`);
    await this.transporter.sendMail({
      from: this.from,
      to,
      subject: title,
      text: `\u0643\u0648\u062F\u0643 \u0647\u0648: ${code} \u2014 \u0635\u0627\u0644\u062D \u0644\u0645\u062F\u0629 10 \u062F\u0642\u0627\u0626\u0642.`,
      html
      // <-- designed version, email apps use this instead of text
    });
  }
};

// src/modules/authorization/authorization.repository.ts
var AuthorizationRepository = class {
  constructor(db) {
    this.db = db;
  }
  db;
  /** Returns true if the user is assigned as a moderator of the given major. */
  async isMajorAssigned(userId, majorId) {
    const count = await this.db.major.count({
      where: {
        id: majorId,
        moderators: { some: { id: userId } }
      }
    });
    return count > 0;
  }
  /** Returns true if the user is assigned as a moderator of the given scholarship. */
  async isScholarshipAssigned(userId, scholarshipId) {
    const count = await this.db.scholarship.count({
      where: {
        id: scholarshipId,
        moderators: { some: { id: userId } }
      }
    });
    return count > 0;
  }
  /** Returns true if the user is assigned as a moderator of the given course (or the course's major). */
  async isCourseAssigned(userId, courseId) {
    const count = await this.db.course.count({
      where: {
        id: courseId,
        OR: [
          { moderators: { some: { id: userId } } },
          { major: { moderators: { some: { id: userId } } } }
        ]
      }
    });
    return count > 0;
  }
  /** Returns true if the user is assigned to ANY course within the given major. */
  async isAssignedToAnyCourseInMajor(userId, majorId) {
    const count = await this.db.course.count({
      where: {
        majorId,
        moderators: { some: { id: userId } }
      }
    });
    return count > 0;
  }
};

// src/modules/authorization/authorization.service.ts
var import_client5 = require("@prisma/client");
var AuthorizationService = class {
  constructor(reader) {
    this.reader = reader;
  }
  reader;
  // ── Boolean checks ────────────────────────────────────────────
  /** Returns true if the actor may manage the given major. */
  async canManageMajor(actor, majorId) {
    if (actor.role === import_client5.RoleName.SUPER_ADMIN || actor.role === import_client5.RoleName.ADMIN) {
      return true;
    }
    if (actor.role === import_client5.RoleName.MODERATOR) {
      return this.reader.isMajorAssigned(actor.id, majorId);
    }
    return false;
  }
  /** Returns true if the actor may manage the given scholarship. */
  async canManageScholarship(actor, scholarshipId) {
    if (actor.role === import_client5.RoleName.SUPER_ADMIN || actor.role === import_client5.RoleName.ADMIN) {
      return true;
    }
    if (actor.role === import_client5.RoleName.MODERATOR) {
      return this.reader.isScholarshipAssigned(actor.id, scholarshipId);
    }
    return false;
  }
  /** Returns true if the actor may manage the given course. */
  async canManageCourse(actor, courseId) {
    if (actor.role === import_client5.RoleName.SUPER_ADMIN || actor.role === import_client5.RoleName.ADMIN) {
      return true;
    }
    if (actor.role === import_client5.RoleName.MODERATOR) {
      return this.reader.isCourseAssigned(actor.id, courseId);
    }
    return false;
  }
  // ── Assertion guards (throw ForbiddenError on denial) ─────────
  /** Throws ForbiddenError if the actor may not manage the major. */
  async assertCanManageMajor(actor, majorId) {
    const allowed = await this.canManageMajor(actor, majorId);
    if (!allowed) {
      throw new ForbiddenError("You do not have permission to manage this major");
    }
  }
  /** Throws ForbiddenError if the actor may not manage the scholarship. */
  async assertCanManageScholarship(actor, scholarshipId) {
    const allowed = await this.canManageScholarship(actor, scholarshipId);
    if (!allowed) {
      throw new ForbiddenError("You do not have permission to manage this scholarship");
    }
  }
  /** Throws ForbiddenError if the actor may not manage the course. */
  async assertCanManageCourse(actor, courseId) {
    const allowed = await this.canManageCourse(actor, courseId);
    if (!allowed) {
      throw new ForbiddenError("You do not have permission to manage this course");
    }
  }
  /**
   * Gate for files and reviews endpoints.
   * SUPER_ADMIN / ADMIN bypass. MEMBER / VISITOR are not ownership-restricted
   * (they go through permission guards instead). Only MODERATOR is checked
   * against the file's owner entity.
   */
  async assertCanManageFileOwner(actor, ownerType, ownerId) {
    if (actor.role === import_client5.RoleName.SUPER_ADMIN || actor.role === import_client5.RoleName.ADMIN) {
      return;
    }
    if (actor.role === import_client5.RoleName.MEMBER || actor.role === import_client5.RoleName.VISITOR) {
      return;
    }
    if (ownerType === import_client5.FileOwnerType.MAJOR) {
      const direct = await this.canManageMajor(actor, ownerId);
      if (!direct) {
        const viaCourse = await this.reader.isAssignedToAnyCourseInMajor(actor.id, ownerId);
        if (!viaCourse) {
          throw new ForbiddenError("You do not have permission to manage files for this major");
        }
      }
    } else if (ownerType === import_client5.FileOwnerType.SCHOLARSHIP) {
      await this.assertCanManageScholarship(actor, ownerId);
    } else if (ownerType === import_client5.FileOwnerType.COURSE) {
      await this.assertCanManageCourse(actor, ownerId);
    }
  }
};

// src/modules/audit/audit.repository.ts
function toView(row) {
  return {
    id: row.id,
    userId: row.userId,
    action: row.action,
    entityType: row.entityType,
    entityId: row.entityId,
    reason: row.reason,
    metadata: row.metadata,
    createdAt: row.createdAt
  };
}
function buildWhere(filter) {
  const where = {};
  if (filter.entityType != null) where.entityType = filter.entityType;
  if (filter.entityId != null) where.entityId = filter.entityId;
  if (filter.action != null) where.action = filter.action;
  if (filter.userId != null) where.userId = filter.userId;
  return where;
}
var AuditRepository = class {
  constructor(db) {
    this.db = db;
  }
  db;
  /** Insert a new audit log entry. Returns the created row. */
  async create(entry) {
    const row = await this.db.auditLog.create({
      data: {
        userId: entry.userId,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId,
        reason: entry.reason ?? null,
        metadata: entry.metadata != null ? entry.metadata : void 0
      }
    });
    return toView(row);
  }
  /** Paginated list, newest first, with optional filters. */
  async list(filter, page, pageSize) {
    const where = buildWhere(filter);
    const skip = (page - 1) * pageSize;
    const [items, total] = await Promise.all([
      this.db.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize
      }),
      this.db.auditLog.count({ where })
    ]);
    return { items: items.map(toView), total };
  }
};

// src/infrastructure/logger/logger.ts
var import_pino = require("pino");
var logger = (0, import_pino.pino)({
  level: env.LOG_LEVEL,
  transport: isProduction ? void 0 : {
    target: "pino-pretty",
    options: { colorize: true, translateTime: "SYS:standard", ignore: "pid,hostname" }
  }
});

// src/modules/audit/audit.service.ts
var AuditService = class {
  constructor(repo) {
    this.repo = repo;
  }
  repo;
  /**
   * Fire-and-forget audit entry. NEVER throws.
   * On error: logs the failure via pino and returns void.
   */
  async log(entry) {
    try {
      await this.repo.create(entry);
    } catch (err) {
      logger.error({ err, entry }, "Failed to persist audit log");
    }
  }
  /** Paginated, filterable audit log list. CAN throw on error. */
  async list(filter, page, pageSize) {
    const { items, total } = await this.repo.list(filter, page, pageSize);
    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  }
};

// src/modules/audit/audit.controller.ts
var AuditController = class {
  constructor(service) {
    this.service = service;
  }
  service;
  list = asyncHandler(async (req, res) => {
    const query = req.query;
    const filter = {};
    if (query.entityType != null) filter.entityType = query.entityType;
    if (query.entityId != null) filter.entityId = query.entityId;
    if (query.action != null) filter.action = query.action;
    if (query.userId != null) filter.userId = query.userId;
    const result = await this.service.list(filter, query.page, query.pageSize);
    paginated(res, result);
  });
};

// src/modules/users/users.repository.ts
var UsersRepository = class {
  constructor(db) {
    this.db = db;
  }
  db;
  async findAll(opts) {
    const skip = (opts.page - 1) * opts.limit;
    const where = {
      ...opts.search ? {
        OR: [
          { email: { contains: opts.search, mode: "insensitive" } },
          { fullName: { contains: opts.search, mode: "insensitive" } }
        ]
      } : {},
      ...opts.role ? { role: { name: opts.role } } : {}
    };
    const [items, total] = await Promise.all([
      this.db.user.findMany({
        where,
        include: { role: true },
        orderBy: { createdAt: "desc" },
        skip,
        take: opts.limit
      }),
      this.db.user.count({ where })
    ]);
    return { items, total };
  }
  async findById(id) {
    return this.db.user.findUnique({
      where: { id },
      include: { role: true }
    });
  }
  async findByEmail(email) {
    return this.db.user.findUnique({
      where: { email },
      include: { role: true }
    });
  }
  async create(data) {
    return this.db.user.create({
      data,
      include: { role: true }
    });
  }
  async update(id, data) {
    return this.db.user.update({
      where: { id },
      data,
      include: { role: true }
    });
  }
  async delete(id) {
    await this.db.user.delete({ where: { id } });
  }
};

// src/modules/users/users.service.ts
var UsersService = class {
  constructor(repo, hasher, notifier) {
    this.repo = repo;
    this.hasher = hasher;
    this.notifier = notifier;
  }
  repo;
  hasher;
  notifier;
  // ─── List ────────────────────────────────────────────────────
  async list(query) {
    const { items, total } = await this.repo.findAll({
      page: query.page,
      limit: query.limit,
      search: query.search,
      role: query.role
    });
    return {
      items: items.map(this.#toDto),
      total,
      page: query.page,
      limit: query.limit
    };
  }
  // ─── Get one ─────────────────────────────────────────────────
  async getById(id) {
    const user = await this.repo.findById(id);
    if (!user) throw new NotFoundError(`User ${id} not found`);
    return this.#toDto(user);
  }
  // ─── Create ──────────────────────────────────────────────────
  async create(input) {
    const existing = await this.repo.findByEmail(input.email);
    if (existing) throw new ConflictError("Email is already in use");
    const passwordHash = await this.hasher.hash(input.password);
    const user = await this.repo.create({
      email: input.email,
      passwordHash,
      fullName: input.fullName,
      roleId: input.roleId
    });
    return this.#toDto(user);
  }
  // ─── Update ──────────────────────────────────────────────────
  async update(id, input) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundError(`User ${id} not found`);
    const roleChanged = input.roleId && input.roleId !== existing.roleId;
    const user = await this.repo.update(id, {
      fullName: input.fullName,
      isActive: input.isActive,
      roleId: input.roleId
    });
    if (roleChanged && this.notifier) {
      const roleName = user.role.name;
      const title = roleName === "MODERATOR" ? "\u062A\u0631\u0642\u064A\u0629 \u0625\u0644\u0649 \u0645\u0634\u0631\u0641 " : roleName === "ADMIN" ? "\u062A\u0631\u0642\u064A\u0629 \u0625\u0644\u0649 \u0645\u0633\u0624\u0648\u0644 " : "\u062A\u062D\u062F\u064A\u062B \u0627\u0644\u062F\u0648\u0631 ";
      const message = roleName === "MODERATOR" ? "\u062A\u0645\u062A \u062A\u0631\u0642\u064A\u0629 \u062D\u0633\u0627\u0628\u0643 \u0625\u0644\u0649 \u0645\u0634\u0631\u0641 (Moderator). \u064A\u0645\u0643\u0646\u0643 \u0627\u0644\u0622\u0646 \u0627\u0644\u0625\u0634\u0631\u0627\u0641 \u0639\u0644\u0649 \u0627\u0644\u0645\u062D\u062A\u0648\u0649 \u0627\u0644\u0623\u0643\u0627\u062F\u064A\u0645\u064A \u0648\u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u0645\u0644\u0641\u0627\u062A." : roleName === "ADMIN" ? "\u062A\u0645\u062A \u062A\u0631\u0642\u064A\u0629 \u062D\u0633\u0627\u0628\u0643 \u0625\u0644\u0649 \u0645\u0633\u0624\u0648\u0644 (Admin)." : `\u062A\u0645 \u062A\u0639\u062F\u064A\u0644 \u062F\u0648\u0631 \u062D\u0633\u0627\u0628\u0643 \u0625\u0644\u0649 ${roleName}.`;
      this.notifier.notifyUser({
        userId: id,
        title,
        message,
        metadata: { type: "ROLE_CHANGED", newRole: roleName }
      }).catch(() => void 0);
    }
    return this.#toDto(user);
  }
  // ─── Delete ──────────────────────────────────────────────────
  async delete(id) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundError(`User ${id} not found`);
    await this.repo.delete(id);
  }
  // ─── Helpers ─────────────────────────────────────────────────
  #toDto(user) {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role.name,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }
};

// src/modules/users/users.controller.ts
var UsersController = class {
  constructor(service) {
    this.service = service;
  }
  service;
  list = asyncHandler(async (req, res) => {
    const query = req.query;
    const result = await this.service.list(query);
    ok(res, result);
  });
  getById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const user = await this.service.getById(id);
    ok(res, user);
  });
  create = asyncHandler(async (req, res) => {
    const input = req.body;
    const user = await this.service.create(input);
    created(res, user);
  });
  update = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const input = req.body;
    const user = await this.service.update(id, input);
    ok(res, user);
  });
  delete = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await this.service.delete(id);
    noContent(res);
  });
  getMe = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const result = await this.service.getById(userId);
    ok(res, result);
  });
};

// src/modules/roles/roles.repository.ts
var RolesRepository = class {
  constructor(db) {
    this.db = db;
  }
  db;
  async findAll() {
    return this.db.role.findMany({
      orderBy: { name: "asc" },
      include: {
        rolePermissions: {
          include: {
            permission: true
          }
        }
      }
    });
  }
  async findByName(name) {
    return this.db.role.findUnique({ where: { name } });
  }
  async assignRoleToUser(userId, roleId) {
    await this.db.user.update({
      where: { id: userId },
      data: { roleId }
    });
  }
  async findUserById(userId) {
    return this.db.user.findUnique({ where: { id: userId }, select: { id: true } });
  }
};

// src/modules/roles/roles.service.ts
var RolesService = class {
  constructor(repo) {
    this.repo = repo;
  }
  repo;
  async listRoles() {
    const roles = await this.repo.findAll();
    return roles.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      createdAt: r.createdAt,
      permissions: r.rolePermissions?.map((rp) => rp.permission.key) ?? []
    }));
  }
  async list() {
    return this.listRoles();
  }
  async assignRole(userId, roleName) {
    const role = await this.repo.findByName(roleName);
    if (!role) throw new NotFoundError(`Role ${roleName} not found`);
    await this.repo.assignRoleToUser(userId, roleName);
  }
};

// src/modules/roles/roles.controller.ts
var RolesController = class {
  constructor(service) {
    this.service = service;
  }
  service;
  list = asyncHandler(async (_req, res) => {
    const roles = await this.service.list();
    ok(res, roles);
  });
  assign = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const input = req.body;
    await this.service.assignRole(userId, input.roleName);
    noContent(res);
  });
};

// src/modules/colleges/colleges.repository.ts
var CollegesRepository = class {
  constructor(db) {
    this.db = db;
  }
  db;
  toView(row) {
    return {
      id: row.id,
      slug: row.slug,
      category: row.category,
      name: row.name,
      description: row.description,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      majors: row.majors
    };
  }
  async exists(id) {
    const count = await this.db.college.count({ where: { id } });
    return count > 0;
  }
  async findById(id) {
    const row = await this.db.college.findUnique({
      where: { id },
      include: {
        majors: {
          where: { isActive: true, deletedAt: null }
        }
      }
    });
    return row ? this.toView(row) : null;
  }
  async list(page, pageSize) {
    const skip = (page - 1) * pageSize;
    const [items, total] = await Promise.all([
      this.db.college.findMany({ skip, take: pageSize }),
      this.db.college.count()
    ]);
    return {
      items: items.map((row) => this.toView(row)),
      total
    };
  }
  async create(data) {
    const row = await this.db.college.create({ data });
    return this.toView(row);
  }
  async update(id, data) {
    const row = await this.db.college.update({
      where: { id },
      data
    });
    return this.toView(row);
  }
  async delete(id) {
    await this.db.college.delete({ where: { id } });
  }
  async countMajors(collegeId) {
    return this.db.major.count({ where: { collegeId, deletedAt: null } });
  }
};

// src/modules/colleges/colleges.service.ts
var CollegesService = class {
  constructor(repo, majors) {
    this.repo = repo;
    this.majors = majors;
  }
  repo;
  majors;
  async create(input) {
    return this.repo.create({
      slug: input.slug,
      name: input.name,
      description: input.description ?? null,
      isActive: input.isActive ?? true,
      category: input.category ?? ""
    });
  }
  async getById(id) {
    const college = await this.repo.findById(id);
    if (!college) {
      throw new NotFoundError("College not found");
    }
    return college;
  }
  async list(page, pageSize) {
    const { items, total } = await this.repo.list(page, pageSize);
    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  }
  async update(id, data) {
    await this.getById(id);
    return this.repo.update(id, data);
  }
  async delete(id) {
    await this.getById(id);
    const { total: majorsCount } = await this.majors.listByCollege(id, 1, 1);
    if (majorsCount > 0) {
      throw new ConflictError("College still has majors");
    }
    await this.repo.delete(id);
  }
  async listMajors(collegeId, page, pageSize) {
    await this.getById(collegeId);
    const { items, total } = await this.majors.listByCollege(collegeId, page, pageSize);
    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  }
};

// src/shared/utils/params.ts
function param(req, name) {
  const value = req.params[name];
  if (value === void 0) {
    throw new Error(`Route param "${name}" is missing \u2014 is it declared in the path & schema?`);
  }
  return value;
}

// src/modules/colleges/colleges.dto.ts
function toDto(view) {
  return view;
}

// src/modules/colleges/colleges.controller.ts
var CollegesController = class {
  constructor(service) {
    this.service = service;
  }
  service;
  list = asyncHandler(async (req, res) => {
    const query = req.query;
    const result = await this.service.list(query.page, query.pageSize);
    paginated(res, {
      ...result,
      items: result.items.map(toDto)
    });
  });
  getById = asyncHandler(async (req, res) => {
    const id = param(req, "id");
    const result = await this.service.getById(id);
    ok(res, toDto(result));
  });
  listMajors = asyncHandler(async (req, res) => {
    const id = param(req, "id");
    const query = req.query;
    const result = await this.service.listMajors(id, query.page, query.pageSize);
    paginated(res, result);
  });
  create = asyncHandler(async (req, res) => {
    const input = req.body;
    const result = await this.service.create(input);
    created(res, toDto(result));
  });
  update = asyncHandler(async (req, res) => {
    const id = param(req, "id");
    const input = req.body;
    const result = await this.service.update(id, input);
    ok(res, toDto(result));
  });
  delete = asyncHandler(async (req, res) => {
    const id = param(req, "id");
    await this.service.delete(id);
    noContent(res);
  });
};

// src/modules/majors/majors.repository.ts
var MajorsRepository = class {
  constructor(db) {
    this.db = db;
  }
  db;
  toView(row) {
    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      degree: row.degree,
      isActive: row.isActive,
      collegeId: row.collegeId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    };
  }
  async exists(id) {
    const count = await this.db.major.count({ where: { id, deletedAt: null } });
    return count > 0;
  }
  async findById(id) {
    const row = await this.db.major.findFirst({ where: { id, deletedAt: null } });
    return row ? this.toView(row) : null;
  }
  async findBySlug(slug) {
    const row = await this.db.major.findFirst({
      where: { slug, deletedAt: null }
    });
    return row ? this.toView(row) : null;
  }
  async list(params) {
    const where = { deletedAt: null };
    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: "insensitive" } },
        { slug: { contains: params.search, mode: "insensitive" } }
      ];
    }
    if (params.collegeId !== void 0) {
      where.collegeId = params.collegeId;
    }
    if (params.isActive !== void 0) {
      where.isActive = params.isActive;
    }
    const [rows, total] = await Promise.all([
      this.db.major.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: "desc" }
      }),
      this.db.major.count({ where })
    ]);
    return {
      items: rows.map((row) => this.toView(row)),
      total
    };
  }
  async listByCollege(collegeId, params) {
    return this.list({ skip: params.skip, take: params.take, collegeId });
  }
  async create(data) {
    const row = await this.db.major.create({
      data: {
        slug: data.slug,
        name: data.name,
        degree: data.degree ?? "",
        isActive: data.isActive ?? true,
        collegeId: data.collegeId ?? null
      }
    });
    return this.toView(row);
  }
  async update(id, data) {
    const row = await this.db.major.update({
      where: { id },
      data
    });
    return this.toView(row);
  }
  async softDelete(id, deletedById, deleteReason) {
    await this.db.major.update({
      where: { id },
      data: {
        deletedAt: /* @__PURE__ */ new Date(),
        deletedById,
        deleteReason
      }
    });
  }
};

// src/modules/majors/majors.service.ts
var import_client6 = require("@prisma/client");
var MajorsService = class {
  constructor(repo, authz, audit) {
    this.repo = repo;
    this.authz = authz;
    this.audit = audit;
  }
  repo;
  authz;
  audit;
  collegeChecker;
  registerCollegeChecker(checker) {
    this.collegeChecker = checker;
  }
  async create(actor, input) {
    if (input.collegeId) {
      if (!this.collegeChecker) {
        throw new Error("CollegeChecker not registered");
      }
      const collegeExists = await this.collegeChecker.exists(input.collegeId);
      if (!collegeExists) {
        throw new NotFoundError("College not found");
      }
    }
    const existingSlug = await this.repo.findBySlug(input.slug);
    if (existingSlug) {
      throw new ConflictError("Slug already in use");
    }
    const major = await this.repo.create({
      slug: input.slug,
      name: input.name,
      degree: input.degree,
      isActive: input.isActive ?? true,
      collegeId: input.collegeId ?? null
    });
    await this.audit.log({
      userId: actor.id,
      action: import_client6.AuditAction.CREATE,
      entityType: import_client6.AuditEntityType.MAJOR,
      entityId: major.id
    });
    return major;
  }
  async update(actor, id, input) {
    await this.authz.assertCanManageMajor(actor, id);
    const major = await this.repo.findById(id);
    if (!major) {
      throw new NotFoundError("Major not found");
    }
    if (input.slug && input.slug !== major.slug) {
      const existingSlug = await this.repo.findBySlug(input.slug);
      if (existingSlug) {
        throw new ConflictError("Slug already in use");
      }
    }
    if (input.collegeId && input.collegeId !== major.collegeId) {
      if (!this.collegeChecker) {
        throw new Error("CollegeChecker not registered");
      }
      const collegeExists = await this.collegeChecker.exists(input.collegeId);
      if (!collegeExists) {
        throw new NotFoundError("College not found");
      }
    }
    const updated = await this.repo.update(id, {
      slug: input.slug,
      name: input.name,
      degree: input.degree,
      isActive: input.isActive,
      collegeId: input.collegeId
    });
    await this.audit.log({
      userId: actor.id,
      action: import_client6.AuditAction.UPDATE,
      entityType: import_client6.AuditEntityType.MAJOR,
      entityId: updated.id,
      metadata: input
    });
    return updated;
  }
  async softDelete(actor, id, reason) {
    await this.authz.assertCanManageMajor(actor, id);
    const major = await this.repo.findById(id);
    if (!major) {
      throw new NotFoundError("Major not found");
    }
    await this.repo.softDelete(id, actor.id, reason);
    await this.audit.log({
      userId: actor.id,
      action: import_client6.AuditAction.DELETE,
      entityType: import_client6.AuditEntityType.MAJOR,
      entityId: id,
      reason
    });
  }
  async getById(id) {
    const major = await this.repo.findById(id);
    if (!major) {
      throw new NotFoundError("Major not found");
    }
    return major;
  }
  async getBySlug(slug) {
    const major = await this.repo.findBySlug(slug);
    if (!major) {
      throw new NotFoundError("Major not found");
    }
    return major;
  }
  async list(page, pageSize, search, collegeId, isActive) {
    const skip = (page - 1) * pageSize;
    const { items, total } = await this.repo.list({ skip, take: pageSize, search, collegeId, isActive });
    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  }
  async listByCollege(collegeId, page, pageSize) {
    const skip = (page - 1) * pageSize;
    const { items, total } = await this.repo.listByCollege(collegeId, { skip, take: pageSize });
    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  }
  async exists(entityType, id) {
    if (entityType !== import_client6.ContentEntityType.MAJOR) {
      return false;
    }
    return this.repo.exists(id);
  }
  async fileOwnerExists(ownerType, id) {
    if (ownerType !== import_client6.FileOwnerType.MAJOR) {
      return false;
    }
    return this.repo.exists(id);
  }
};

// src/shared/utils/actor.ts
function actorOf(req) {
  if (!req.user) throw new UnauthorizedError();
  return { id: req.user.id, role: req.user.role };
}

// src/modules/majors/majors.dto.ts
function toDto2(view) {
  return view;
}

// src/modules/majors/majors.controller.ts
var MajorsController = class {
  constructor(service) {
    this.service = service;
  }
  service;
  list = asyncHandler(async (req, res) => {
    const query = req.query;
    const result = await this.service.list(query.page, query.pageSize, query.search, query.collegeId, query.isActive);
    paginated(res, {
      ...result,
      items: result.items.map(toDto2)
    });
  });
  getById = asyncHandler(async (req, res) => {
    const id = param(req, "id");
    const result = await this.service.getById(id);
    ok(res, toDto2(result));
  });
  getBySlug = asyncHandler(async (req, res) => {
    const slug = param(req, "slug");
    const result = await this.service.getBySlug(slug);
    ok(res, toDto2(result));
  });
  create = asyncHandler(async (req, res) => {
    const input = req.body;
    const result = await this.service.create(actorOf(req), input);
    created(res, toDto2(result));
  });
  update = asyncHandler(async (req, res) => {
    const id = param(req, "id");
    const input = req.body;
    const result = await this.service.update(actorOf(req), id, input);
    ok(res, toDto2(result));
  });
  delete = asyncHandler(async (req, res) => {
    const id = param(req, "id");
    const { reason } = req.body;
    await this.service.softDelete(actorOf(req), id, reason);
    noContent(res);
  });
};

// src/modules/scholarships/scholarships.repository.ts
var ScholarshipsRepository = class {
  constructor(db) {
    this.db = db;
  }
  db;
  async findAll(opts) {
    const skip = (opts.page - 1) * opts.limit;
    const where = {
      deletedAt: null,
      ...opts.search ? { OR: [
        { name: { contains: opts.search, mode: "insensitive" } },
        { slug: { contains: opts.search, mode: "insensitive" } }
      ] } : {}
    };
    const [items, total] = await Promise.all([
      this.db.scholarship.findMany({ where, orderBy: { name: "asc" }, skip, take: opts.limit }),
      this.db.scholarship.count({ where })
    ]);
    return { items, total };
  }
  async findById(id) {
    return this.db.scholarship.findFirst({ where: { id, deletedAt: null } });
  }
  async findBySlug(slug) {
    return this.db.scholarship.findFirst({ where: { slug, deletedAt: null } });
  }
  async create(data) {
    return this.db.scholarship.create({ data });
  }
  async update(id, data) {
    return this.db.scholarship.update({ where: { id }, data });
  }
  async softDelete(id, deletedById, deleteReason) {
    await this.db.scholarship.update({
      where: { id },
      data: { deletedAt: /* @__PURE__ */ new Date(), deletedById, deleteReason: deleteReason ?? null }
    });
  }
};

// src/modules/scholarships/scholarships.service.ts
var ScholarshipsService = class {
  constructor(repo) {
    this.repo = repo;
  }
  repo;
  async list(query) {
    const { items, total } = await this.repo.findAll({
      page: query.page,
      limit: query.limit,
      search: query.search
    });
    return { items: items.map(this.#toDto), total, page: query.page, limit: query.limit };
  }
  async getById(id) {
    const s = await this.repo.findById(id);
    if (!s) throw new NotFoundError(`Scholarship ${id} not found`);
    return this.#toDto(s);
  }
  async create(input) {
    const existing = await this.repo.findBySlug(input.slug);
    if (existing) throw new ConflictError(`Slug "${input.slug}" is already in use`);
    const s = await this.repo.create(input);
    return this.#toDto(s);
  }
  async update(id, input) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundError(`Scholarship ${id} not found`);
    if (input.slug && input.slug !== existing.slug) {
      const slugTaken = await this.repo.findBySlug(input.slug);
      if (slugTaken) throw new ConflictError(`Slug "${input.slug}" is already in use`);
    }
    const s = await this.repo.update(id, input);
    return this.#toDto(s);
  }
  async delete(id, deletedById, deleteReason) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundError(`Scholarship ${id} not found`);
    await this.repo.softDelete(id, deletedById, deleteReason);
  }
  async exists(entityType, id) {
    if (id === void 0) {
      return await this.repo.findById(entityType) !== null;
    }
    if (entityType !== "SCHOLARSHIP") return false;
    return await this.repo.findById(id) !== null;
  }
  async fileOwnerExists(ownerType, ownerId) {
    if (ownerType !== "SCHOLARSHIP") return false;
    return await this.repo.findById(ownerId) !== null;
  }
  #toDto(s) {
    return {
      id: s.id,
      slug: s.slug,
      name: s.name,
      isActive: s.isActive,
      startDate: s.startDate,
      endDate: s.endDate,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt
    };
  }
};

// src/modules/scholarships/scholarships.controller.ts
var ScholarshipsController = class {
  constructor(service) {
    this.service = service;
  }
  service;
  list = asyncHandler(async (req, res) => {
    const result = await this.service.list(req.query);
    ok(res, result);
  });
  getById = asyncHandler(async (req, res) => {
    const s = await this.service.getById(req.params.id);
    ok(res, s);
  });
  create = asyncHandler(async (req, res) => {
    const s = await this.service.create(req.body);
    created(res, s);
  });
  update = asyncHandler(async (req, res) => {
    const s = await this.service.update(req.params.id, req.body);
    ok(res, s);
  });
  delete = asyncHandler(async (req, res) => {
    await this.service.delete(req.params.id, req.user.id);
    noContent(res);
  });
};

// src/modules/content/content.repository.ts
var ContentRepository = class {
  constructor(db) {
    this.db = db;
  }
  db;
  // ── Sections ────────────────────────────────────────────────
  sectionToView(row) {
    return {
      id: row.id,
      entityType: row.entityType,
      entityId: row.entityId,
      title: row.title,
      content: row.content,
      sortOrder: row.sortOrder,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    };
  }
  async findSections(entityType, entityId) {
    const rows = await this.db.section.findMany({
      where: { entityType, entityId, deletedAt: null },
      orderBy: { sortOrder: "asc" }
    });
    return rows.map((row) => this.sectionToView(row));
  }
  async findSectionById(id) {
    const row = await this.db.section.findFirst({
      where: { id, deletedAt: null }
    });
    return row ? this.sectionToView(row) : null;
  }
  async findFaqById(id) {
    const row = await this.db.faq.findFirst({
      where: { id, deletedAt: null }
    });
    return row ? this.faqToView(row) : null;
  }
  async createSection(entityType, entityId, data) {
    const row = await this.db.section.create({
      data: { entityType, entityId, ...data }
    });
    return this.sectionToView(row);
  }
  async updateSection(id, data) {
    const row = await this.db.section.update({
      where: { id },
      data
    });
    return this.sectionToView(row);
  }
  async deleteSection(id, deletedById, reason) {
    await this.db.section.update({
      where: { id },
      data: { deletedAt: /* @__PURE__ */ new Date(), deletedById, deleteReason: reason || null }
    });
  }
  // ── FAQs ─────────────────────────────────────────────────────
  faqToView(row) {
    return {
      id: row.id,
      entityType: row.entityType,
      entityId: row.entityId,
      question: row.question,
      answer: row.answer,
      sortOrder: row.sortOrder,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    };
  }
  async findFaqs(entityType, entityId) {
    const rows = await this.db.faq.findMany({
      where: { entityType, entityId, deletedAt: null },
      orderBy: { sortOrder: "asc" }
    });
    return rows.map((row) => this.faqToView(row));
  }
  async createFaq(entityType, entityId, data) {
    const row = await this.db.faq.create({
      data: { entityType, entityId, ...data }
    });
    return this.faqToView(row);
  }
  async updateFaq(id, data) {
    const row = await this.db.faq.update({
      where: { id },
      data
    });
    return this.faqToView(row);
  }
  async deleteFaq(id, deletedById, reason) {
    await this.db.faq.update({
      where: { id },
      data: { deletedAt: /* @__PURE__ */ new Date(), deletedById, deleteReason: reason || null }
    });
  }
};

// src/modules/content/content.service.ts
var ContentService = class {
  constructor(repo, db) {
    this.repo = repo;
    this.db = db;
  }
  repo;
  db;
  // ── Sections Logic ──────────────────────────────────────────
  async getSections(entityType, entityId) {
    return this.repo.findSections(entityType, entityId);
  }
  async addSection(entityType, entityId, data) {
    await this.validateParentEntity(entityType, entityId);
    return this.repo.createSection(entityType, entityId, data);
  }
  async editSection(id, data) {
    const existing = await this.repo.findSectionById(id);
    if (!existing) throw new NotFoundError("Section not found");
    return this.repo.updateSection(id, data);
  }
  async removeSection(id, userId, reason) {
    const existing = await this.repo.findSectionById(id);
    if (!existing) throw new NotFoundError("Section not found");
    await this.repo.deleteSection(id, userId, reason);
  }
  // ── FAQs Logic ──────────────────────────────────────────────
  async getFaqs(entityType, entityId) {
    return this.repo.findFaqs(entityType, entityId);
  }
  async addFaq(entityType, entityId, data) {
    await this.validateParentEntity(entityType, entityId);
    return this.repo.createFaq(entityType, entityId, data);
  }
  async editFaq(id, data) {
    const existing = await this.repo.findFaqById(id);
    if (!existing) throw new NotFoundError("FAQ not found");
    return this.repo.updateFaq(id, data);
  }
  async removeFaq(id, userId, reason) {
    const existing = await this.db.faq.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new NotFoundError("FAQ not found");
    await this.repo.deleteFaq(id, userId, reason);
  }
  // Helper to check if Major/Scholarship exists
  async validateParentEntity(entityType, entityId) {
    if (entityType === "MAJOR" /* MAJOR */) {
      const major = await this.db.major.findFirst({ where: { id: entityId, deletedAt: null } });
      if (!major) throw new NotFoundError("Major not found");
    } else if (entityType === "SCHOLARSHIP" /* SCHOLARSHIP */) {
      const scholarship = await this.db.scholarship.findFirst({
        where: { id: entityId, deletedAt: null }
      });
      if (!scholarship) throw new NotFoundError("Scholarship not found");
    }
  }
};

// src/modules/content/content.validation.ts
var import_zod2 = require("zod");
var createSectionSchema = import_zod2.z.object({
  title: import_zod2.z.string().min(1, "Title is required"),
  content: import_zod2.z.string().min(1, "Content is required"),
  sortOrder: import_zod2.z.number().int().min(0).optional().default(0)
});
var createFaqSchema = import_zod2.z.object({
  question: import_zod2.z.string().min(1, "Question is required"),
  answer: import_zod2.z.string().min(1, "Answer is required"),
  sortOrder: import_zod2.z.number().int().min(0).optional().default(0)
});

// src/modules/content/content.controller.ts
var ContentController = class {
  constructor(service) {
    this.service = service;
  }
  service;
  // ── Sections ────────────────────────────────────────────────
  getSections = async (req, res, next) => {
    try {
      const entityType = req.params.entityType;
      const entityId = req.params.entityId;
      const items = await this.service.getSections(entityType, entityId);
      res.status(200).json({ success: true, data: items });
    } catch (err) {
      next(err);
    }
  };
  addSection = async (req, res, next) => {
    try {
      const entityId = req.params.entityId;
      const entityType = req.params.entityType;
      const data = createSectionSchema.parse(req.body);
      const item = await this.service.addSection(entityType, entityId, data);
      res.status(201).json({ success: true, data: item });
    } catch (err) {
      next(err);
    }
  };
  updateSection = async (req, res, next) => {
    try {
      const id = req.params.id;
      const data = createSectionSchema.partial().parse(req.body);
      const item = await this.service.editSection(id, data);
      res.status(200).json({ success: true, data: item });
    } catch (err) {
      next(err);
    }
  };
  deleteSection = async (req, res, next) => {
    try {
      const id = req.params.id;
      const { reason } = req.body;
      await this.service.removeSection(id, req.user?.id || "system", reason);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };
  // ── FAQs ─────────────────────────────────────────────────────
  getFaqs = async (req, res, next) => {
    try {
      const entityId = req.params.entityId;
      const entityType = req.params.entityType;
      const items = await this.service.getFaqs(entityType, entityId);
      res.status(200).json({ success: true, data: items });
    } catch (err) {
      next(err);
    }
  };
  addFaq = async (req, res, next) => {
    try {
      const entityId = req.params.entityId;
      const entityType = req.params.entityType;
      const data = createFaqSchema.parse(req.body);
      const item = await this.service.addFaq(entityType, entityId, data);
      res.status(201).json({ success: true, data: item });
    } catch (err) {
      next(err);
    }
  };
  updateFaq = async (req, res, next) => {
    try {
      const id = req.params.id;
      const data = createFaqSchema.partial().parse(req.body);
      const item = await this.service.editFaq(id, data);
      res.status(200).json({ success: true, data: item });
    } catch (err) {
      next(err);
    }
  };
  deleteFaq = async (req, res, next) => {
    try {
      const id = req.params.id;
      await this.service.removeFaq(id, req.user?.id || "system");
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };
};

// src/modules/deleted-items/deleted-items.service.ts
var DeletedItemsService = class {
  constructor(db) {
    this.db = db;
  }
  db;
  restoreHooks = /* @__PURE__ */ new Map();
  registerRestoreHook(entityType, hook) {
    this.restoreHooks.set(entityType, hook);
  }
  // ─── List deleted queue ───────────────────────────────────────
  async list(query) {
    const skip = (query.page - 1) * query.limit;
    const items = [];
    let total = 0;
    if (!query.entityType || query.entityType === "MAJOR") {
      const majors = await this.db.major.findMany({
        where: { deletedAt: { not: null } },
        skip,
        take: query.limit
      });
      majors.forEach(
        (m) => items.push({
          id: m.id,
          entityType: "MAJOR",
          name: m.name,
          deletedAt: m.deletedAt,
          deletedById: m.deletedById,
          deleteReason: m.deleteReason
        })
      );
      total += await this.db.major.count({ where: { deletedAt: { not: null } } });
    }
    if (!query.entityType || query.entityType === "SCHOLARSHIP") {
      const scholarships = await this.db.scholarship.findMany({
        where: { deletedAt: { not: null } },
        skip,
        take: query.limit
      });
      scholarships.forEach(
        (s) => items.push({
          id: s.id,
          entityType: "SCHOLARSHIP",
          name: s.name,
          deletedAt: s.deletedAt,
          deletedById: s.deletedById,
          deleteReason: s.deleteReason
        })
      );
      total += await this.db.scholarship.count({ where: { deletedAt: { not: null } } });
    }
    return { items, total, page: query.page, limit: query.limit };
  }
  async listQueue() {
    const items = [];
    const majors = await this.db.major.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { deletedAt: "desc" }
    });
    for (const m of majors) {
      items.push({
        entityType: "MAJOR",
        id: m.id,
        label: m.name,
        deletedAt: m.deletedAt,
        deletedById: m.deletedById,
        deleteReason: m.deleteReason
      });
    }
    const scholarships = await this.db.scholarship.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { deletedAt: "desc" }
    });
    for (const s of scholarships) {
      items.push({
        entityType: "SCHOLARSHIP",
        id: s.id,
        label: s.name,
        deletedAt: s.deletedAt,
        deletedById: s.deletedById,
        deleteReason: s.deleteReason
      });
    }
    return items.sort((a, b) => b.deletedAt.getTime() - a.deletedAt.getTime());
  }
  async restore(entityType, entityId, restoredById) {
    await this.#assertExists(entityType, entityId);
    if (entityType === "MAJOR") {
      await this.db.major.update({
        where: { id: entityId },
        data: { deletedAt: null, deletedById: null, deleteReason: null }
      });
    } else if (entityType === "SCHOLARSHIP") {
      await this.db.scholarship.update({
        where: { id: entityId },
        data: { deletedAt: null, deletedById: null, deleteReason: null }
      });
    } else {
      throw new BadRequestError(`Restore not supported for ${entityType}`);
    }
    const hook = this.restoreHooks.get(entityType);
    if (hook) await hook(entityId, restoredById);
  }
  // ─── Permanent delete ─────────────────────────────────────────
  async permanentDelete(entityType, entityId) {
    await this.#assertExists(entityType, entityId);
    if (entityType === "MAJOR") {
      await this.db.major.delete({ where: { id: entityId } });
    } else if (entityType === "SCHOLARSHIP") {
      await this.db.scholarship.delete({ where: { id: entityId } });
    } else {
      throw new BadRequestError(`Permanent delete not supported for ${entityType}`);
    }
  }
  // ─── Helpers ─────────────────────────────────────────────────
  async #assertExists(entityType, entityId) {
    let exists = false;
    if (entityType === "MAJOR") {
      const item = await this.db.major.findFirst({
        where: { id: entityId, deletedAt: { not: null } }
      });
      exists = item !== null;
    } else if (entityType === "SCHOLARSHIP") {
      const item = await this.db.scholarship.findFirst({
        where: { id: entityId, deletedAt: { not: null } }
      });
      exists = item !== null;
    }
    if (!exists) throw new NotFoundError(`Deleted ${entityType} ${entityId} not found`);
  }
};

// src/modules/deleted-items/deleted-items.controller.ts
var DeletedItemsController = class {
  constructor(service) {
    this.service = service;
  }
  service;
  list = asyncHandler(async (req, res) => {
    const result = await this.service.list(req.query);
    ok(res, result);
  });
  restore = asyncHandler(async (req, res) => {
    const { entityType, entityId } = req.params;
    await this.service.restore(entityType, entityId, req.user.id);
    noContent(res);
  });
  permanentDelete = asyncHandler(async (req, res) => {
    const { entityType, entityId } = req.params;
    await this.service.permanentDelete(entityType, entityId);
    noContent(res);
  });
};

// src/infrastructure/storage/local-storage.provider.ts
var import_node_crypto = require("node:crypto");
var import_promises = require("node:fs/promises");
var import_node_path = require("node:path");

// src/infrastructure/storage/upload-constraints.ts
var ALLOWED_TYPES = {
  pdf: ["application/pdf"],
  doc: ["application/msword"],
  docx: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  ppt: ["application/vnd.ms-powerpoint"],
  pptx: ["application/vnd.openxmlformats-officedocument.presentationml.presentation"],
  zip: ["application/zip", "application/x-zip-compressed", "multipart/x-zip"]
};
var ALLOWED_EXTENSIONS = Object.keys(ALLOWED_TYPES);
function safeExtension(originalName) {
  const base = originalName.replace(/^.*[\\/]/, "").trim();
  const parts = base.split(".");
  if (parts.length !== 2) return null;
  const ext = parts[1].toLowerCase();
  return ALLOWED_EXTENSIONS.includes(ext) ? ext : null;
}
function isAllowedType(ext, mimeType) {
  const mimes = ALLOWED_TYPES[ext];
  return mimes ? mimes.includes(mimeType) : false;
}

// src/infrastructure/storage/local-storage.provider.ts
var LocalStorageProvider = class {
  root;
  constructor(baseDir) {
    this.root = (0, import_node_path.resolve)(baseDir);
  }
  async upload(object, keyPrefix) {
    const ext = safeExtension(object.originalName);
    if (!ext) throw new BadRequestError("Unsupported or unsafe file name/extension");
    const safePrefix = this.sanitizePrefix(keyPrefix);
    const storageKey = `${safePrefix}/${(0, import_node_crypto.randomUUID)()}.${ext}`;
    const absPath = this.toAbsolutePath(storageKey);
    await (0, import_promises.mkdir)((0, import_node_path.dirname)(absPath), { recursive: true });
    await (0, import_promises.writeFile)(absPath, object.buffer);
    return { storageKey, sizeBytes: object.buffer.byteLength };
  }
  async delete(storageKey) {
    const absPath = this.toAbsolutePath(storageKey);
    await (0, import_promises.rm)(absPath, { force: true });
  }
  getPublicUrl(storageKey) {
    return `/${storageKey}`;
  }
  async exists(storageKey) {
    try {
      await (0, import_promises.stat)(this.toAbsolutePath(storageKey));
      return true;
    } catch {
      return false;
    }
  }
  async read(storageKey) {
    return (0, import_promises.readFile)(this.toAbsolutePath(storageKey));
  }
  // ── internals ───────────────────────────────────────────────────
  sanitizePrefix(prefix) {
    const segments = prefix.split("/").map((s) => s.replace(/[^a-zA-Z0-9_-]/g, "")).filter(Boolean);
    if (segments.length === 0) return "misc";
    return segments.join("/");
  }
  /** Resolve a storage key to an absolute path, asserting it stays in root. */
  toAbsolutePath(storageKey) {
    const abs = (0, import_node_path.resolve)((0, import_node_path.join)(this.root, storageKey));
    const rel = (0, import_node_path.relative)(this.root, abs);
    if (rel.startsWith("..") || rel.includes(`..${import_node_path.sep}`) || (0, import_node_path.resolve)(abs) !== abs) {
      throw new BadRequestError("Invalid storage key (path traversal detected)");
    }
    return abs;
  }
};

// src/modules/files/files.repository.ts
var FilesRepository = class {
  constructor(db) {
    this.db = db;
  }
  db;
  toView(row) {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      type: row.type,
      status: row.status,
      storageKey: row.storageKey,
      mimeType: row.mimeType,
      sizeBytes: row.sizeBytes,
      tags: row.tags,
      rating: row.rating,
      downloads: row.downloads,
      ownerType: row.ownerType,
      ownerId: row.ownerId,
      uploadedById: row.uploadedById,
      uploadedBy: row.uploadedBy ?? null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt
    };
  }
  includeUploadedBy = {
    uploadedBy: {
      select: { id: true, fullName: true, email: true }
    }
  };
  async create(data) {
    const row = await this.db.file.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        type: data.type,
        status: data.status ?? "PENDING",
        ownerType: data.ownerType,
        ownerId: data.ownerId,
        uploadedById: data.uploadedById ?? "",
        storageKey: data.storageKey,
        mimeType: data.mimeType ?? null,
        sizeBytes: data.sizeBytes ?? null
      },
      include: this.includeUploadedBy
    });
    return this.toView(row);
  }
  async findById(id) {
    const row = await this.db.file.findFirst({
      where: { id, deletedAt: null },
      include: this.includeUploadedBy
    });
    return row ? this.toView(row) : null;
  }
  async findAll(filter) {
    const where = { deletedAt: null };
    if (filter.ownerType) where.ownerType = filter.ownerType;
    if (filter.ownerId) where.ownerId = filter.ownerId;
    if (filter.status) where.status = filter.status;
    if (filter.type) where.type = filter.type;
    if (filter.uploadedById) where.uploadedById = filter.uploadedById;
    const skip = (filter.page - 1) * filter.pageSize;
    const [rows, total] = await Promise.all([
      this.db.file.findMany({
        where,
        skip,
        take: filter.pageSize,
        orderBy: { createdAt: "desc" },
        include: this.includeUploadedBy
      }),
      this.db.file.count({ where })
    ]);
    return { items: rows.map((r) => this.toView(r)), total };
  }
  async findByOwner(ownerType, ownerId, filter) {
    const where = { ownerType, ownerId, deletedAt: null };
    const skip = (filter.page - 1) * filter.pageSize;
    const [rows, total] = await Promise.all([
      this.db.file.findMany({
        where,
        skip,
        take: filter.pageSize,
        orderBy: { createdAt: "desc" },
        include: this.includeUploadedBy
      }),
      this.db.file.count({ where })
    ]);
    return { items: rows.map((r) => this.toView(r)), total };
  }
  async findApprovedByOwner(ownerType, ownerId) {
    const rows = await this.db.file.findMany({
      where: { ownerType, ownerId, status: "APPROVED", deletedAt: null },
      orderBy: { createdAt: "desc" },
      include: this.includeUploadedBy
    });
    return rows.map((r) => this.toView(r));
  }
  async updateStatus(id, status) {
    const row = await this.db.file.update({
      where: { id },
      data: { status },
      include: this.includeUploadedBy
    });
    return this.toView(row);
  }
  async softDelete(id, deletedById, reason) {
    await this.db.file.update({
      where: { id },
      data: {
        deletedAt: /* @__PURE__ */ new Date(),
        deletedById,
        deleteReason: reason ?? null
      }
    });
  }
  async incrementDownloads(id) {
    await this.db.file.update({
      where: { id },
      data: { downloads: { increment: 1 } }
    });
  }
  /**
   * Find all moderator IDs assigned to an owner entity (Course, Major, or Scholarship).
   * For Courses, also includes moderators assigned to the parent Major.
   */
  async findModeratorIdsForOwner(ownerType, ownerId) {
    if (ownerType === "COURSE") {
      const course = await this.db.course.findUnique({
        where: { id: ownerId },
        select: {
          moderators: { select: { id: true } },
          major: {
            select: {
              moderators: { select: { id: true } }
            }
          }
        }
      });
      if (!course) return [];
      const ids = /* @__PURE__ */ new Set();
      course.moderators.forEach((m) => ids.add(m.id));
      course.major?.moderators.forEach((m) => ids.add(m.id));
      return Array.from(ids);
    }
    if (ownerType === "MAJOR") {
      const major = await this.db.major.findUnique({
        where: { id: ownerId },
        select: { moderators: { select: { id: true } } }
      });
      return major?.moderators.map((m) => m.id) ?? [];
    }
    if (ownerType === "SCHOLARSHIP") {
      const scholarship = await this.db.scholarship.findUnique({
        where: { id: ownerId },
        select: { moderators: { select: { id: true } } }
      });
      return scholarship?.moderators.map((m) => m.id) ?? [];
    }
    return [];
  }
};

// src/modules/files/files.service.ts
var import_client7 = require("@prisma/client");
var FilesService = class {
  constructor(repo, authz, audit, storage, notifier) {
    this.repo = repo;
    this.authz = authz;
    this.audit = audit;
    this.storage = storage;
    this.notifier = notifier;
  }
  repo;
  authz;
  audit;
  storage;
  notifier;
  /** Registry of per-ownerType existence checkers. */
  ownerCheckers = /* @__PURE__ */ new Map();
  /** Notify all moderators assigned to the file's owner (major/course/scholarship). Fire-and-forget. */
  async notifyModeratorsOfNewFile(file) {
    if (!this.notifier) return;
    try {
      const moderatorIds = this.repo.findModeratorIdsForOwner ? await this.repo.findModeratorIdsForOwner(file.ownerType, file.ownerId) : [];
      const targetIds = moderatorIds.filter((id) => id !== file.uploadedById);
      if (targetIds.length > 0) {
        for (const modId of targetIds) {
          await this.notifier.notifyUser({
            userId: modId,
            title: "\u0645\u0644\u0641 \u062C\u062F\u064A\u062F \u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u0627\u0644\u0645\u0631\u0627\u062C\u0639\u0629 ",
            message: `\u0642\u0627\u0645 \u0623\u062D\u062F \u0627\u0644\u0637\u0644\u0627\u0628 \u0628\u0631\u0641\u0639 \u0645\u0644\u0641 \u062C\u062F\u064A\u062F "${file.title}" \u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u0645\u0631\u0627\u062C\u0639\u062A\u0643 \u0648\u0627\u0639\u062A\u0645\u0627\u062F\u0647.`,
            metadata: {
              fileId: file.id,
              ownerType: file.ownerType,
              ownerId: file.ownerId,
              type: "FILE_UPLOAD"
            }
          }).catch(() => void 0);
        }
      } else if (this.notifier.notifyRole) {
        await this.notifier.notifyRole(import_client7.RoleName.MODERATOR, {
          title: "\u0645\u0644\u0641 \u062C\u062F\u064A\u062F \u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u0627\u0644\u0645\u0631\u0627\u062C\u0639\u0629 ",
          message: `\u0642\u0627\u0645 \u0623\u062D\u062F \u0627\u0644\u0637\u0644\u0627\u0628 \u0628\u0631\u0641\u0639 \u0645\u0644\u0641 \u062C\u062F\u064A\u062F "${file.title}" \u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u0645\u0631\u0627\u062C\u0639\u062A\u0643 \u0648\u0627\u0639\u062A\u0645\u0627\u062F\u0647.`,
          metadata: {
            fileId: file.id,
            ownerType: file.ownerType,
            ownerId: file.ownerId,
            type: "FILE_UPLOAD"
          }
        }).catch(() => void 0);
      }
    } catch {
    }
  }
  // ── Owner checker registration ─────────────────────────────────────────────
  /** Register an existence checker for a specific ownerType. */
  registerOwnerChecker(ownerType, checker) {
    this.ownerCheckers.set(ownerType, checker);
  }
  // ── Core authorization helper ──────────────────────────────────────────────
  /**
   * Fetch the file (by repository, not raw db) and assert the actor may manage it.
   * Throws NotFoundError if the file does not exist or is soft-deleted.
   * Throws ForbiddenError if the actor's role/assignment denies access.
   * Returns the file view so callers avoid a second round-trip.
   */
  async assertCanManageFile(actor, fileId) {
    const file = await this.repo.findById(fileId);
    if (!file) {
      throw new NotFoundError(`File ${fileId} not found`);
    }
    await this.authz.assertCanManageFileOwner(actor, file.ownerType, file.ownerId);
    return file;
  }
  // ── Status transitions ─────────────────────────────────────────────────────
  /**
   * Transition a file's status (PENDING → APPROVED | REJECTED).
   * Called by ReviewsService after a review decision is persisted.
   * Returns the updated FileView.
   */
  async applyReviewStatus(fileId, status) {
    const file = await this.repo.findById(fileId);
    if (!file) {
      throw new NotFoundError(`File ${fileId} not found`);
    }
    return this.repo.updateStatus(fileId, status);
  }
  // ── Upload (metadata-only, storageKey provided externally) ────────────────
  /**
   * Persist a file record where the binary was already stored externally
   * (storageKey is in the uploadData). Validates owner existence,
   * checks upload authorization, then creates the DB record.
   *
   * @param actor       The authenticated actor performing the upload.
   * @param uploadedById  The user ID to record as the uploader.
   * @param data        Metadata + storageKey of the already-stored binary.
   */
  async upload(actor, uploadedById, data) {
    const checker = this.ownerCheckers.get(data.ownerType);
    if (!checker) {
      throw new BadRequestError(`No checker registered for owner type ${data.ownerType}`);
    }
    const ownerExists = await checker.exists(data.ownerType, data.ownerId);
    if (!ownerExists) {
      throw new NotFoundError(`${data.ownerType} ${data.ownerId} not found`);
    }
    if (actor.role === import_client7.RoleName.MODERATOR) {
      await this.authz.assertCanManageFileOwner(actor, data.ownerType, data.ownerId);
    }
    const file = await this.repo.create({
      ...data,
      uploadedById,
      status: import_client7.FileStatus.PENDING
    });
    await this.audit.log({
      userId: actor.id,
      action: import_client7.AuditAction.CREATE,
      entityType: import_client7.AuditEntityType.FILE,
      entityId: file.id
    });
    void this.notifyModeratorsOfNewFile(file);
    return file;
  }
  // ── Upload (storage-backed, with binary) ──────────────────────────────────
  /**
   * Full upload flow with binary storage:
   * 1. Validate filename (reject unsafe extensions / double-extension attacks).
   * 2. Assert owner exists via registered checker.
   * 3. For MODERATOR actors, assert assignment to the owner entity.
   * 4. Upload binary to StorageProvider; roll back if DB write fails.
   * 5. Persist the File record.
   * 6. Log audit event.
   */
  async uploadFile(actor, uploadedById, meta, binary) {
    const ext = safeExtension(binary.originalName);
    if (!ext) {
      throw new BadRequestError("Unsupported file type, double extension, or unsafe filename");
    }
    const checker = this.ownerCheckers.get(meta.ownerType);
    if (!checker) {
      throw new BadRequestError(`No checker registered for owner type ${meta.ownerType}`);
    }
    const ownerExists = await checker.exists(meta.ownerType, meta.ownerId);
    if (!ownerExists) {
      throw new NotFoundError(`${meta.ownerType} ${meta.ownerId} not found`);
    }
    if (actor.role === import_client7.RoleName.MODERATOR) {
      await this.authz.assertCanManageFileOwner(actor, meta.ownerType, meta.ownerId);
    }
    const keyPrefix = `${meta.ownerType.toLowerCase()}/${meta.ownerId}`;
    const stored = await this.storage.upload(
      {
        buffer: binary.buffer,
        originalName: binary.originalName,
        mimeType: binary.mimeType
      },
      keyPrefix
    );
    let file;
    try {
      file = await this.repo.create({
        title: meta.title,
        description: meta.description ?? null,
        type: meta.type,
        ownerType: meta.ownerType,
        ownerId: meta.ownerId,
        uploadedById,
        storageKey: stored.storageKey,
        mimeType: binary.mimeType,
        sizeBytes: stored.sizeBytes,
        status: import_client7.FileStatus.PENDING
      });
    } catch (err) {
      await this.storage.delete(stored.storageKey).catch(() => void 0);
      throw err;
    }
    await this.audit.log({
      userId: actor.id,
      action: import_client7.AuditAction.CREATE,
      entityType: import_client7.AuditEntityType.FILE,
      entityId: file.id
    });
    void this.notifyModeratorsOfNewFile(file);
    return file;
  }
  // ── Read operations ────────────────────────────────────────────────────────
  /**
   * Returns the full FileView for a non-deleted file.
   * No permission check — READ is enforced by the route guard.
   */
  async getById(id) {
    const file = await this.repo.findById(id);
    if (!file) {
      throw new NotFoundError(`File ${id} not found`);
    }
    return file;
  }
  async getApprovedByOwner(ownerType, ownerId) {
    const result = await this.list({
      ownerType,
      ownerId,
      status: import_client7.FileStatus.APPROVED,
      page: 1,
      pageSize: 100
    });
    return result.items;
  }
  /**
   * Paginated list of non-deleted files with optional filters.
   */
  async list(filter) {
    const { items, total } = await this.repo.findAll(filter);
    const totalPages = Math.ceil(total / filter.pageSize) || 1;
    return {
      items,
      total,
      page: filter.page,
      pageSize: filter.pageSize,
      totalPages
    };
  }
  /**
   * All non-deleted files for a specific owner.
   */
  async listByOwner(ownerType, ownerId) {
    const res = await this.list({ ownerType, ownerId, page: 1, pageSize: 1e3 });
    return res.items;
  }
  /**
   * Approved non-deleted files for a specific owner.
   */
  async findApprovedByOwner(ownerType, ownerId) {
    return this.repo.findApprovedByOwner(ownerType, ownerId);
  }
  // ── Download ───────────────────────────────────────────────────────────────
  /**
   * Permission-gated binary download:
   * - APPROVED files: accessible to any caller (including anonymous).
   * - PENDING/REJECTED files: only the uploader, or ADMIN/SUPER_ADMIN, or an
   *   assigned MODERATOR may download.
   * Throws NotFoundError if the file or binary is absent.
   * Throws ForbiddenError if the actor lacks access.
   */
  async prepareDownload(actor, id) {
    const file = await this.repo.findById(id);
    if (!file) {
      throw new NotFoundError(`File ${id} not found`);
    }
    if (file.status !== import_client7.FileStatus.APPROVED) {
      const isUploader = actor && actor.id === file.uploadedById;
      const isAdmin = actor && (actor.role === import_client7.RoleName.ADMIN || actor.role === import_client7.RoleName.SUPER_ADMIN);
      if (!isUploader && !isAdmin) {
        if (actor && actor.role === import_client7.RoleName.MODERATOR) {
          try {
            await this.authz.assertCanManageFileOwner(actor, file.ownerType, file.ownerId);
          } catch {
            throw new ForbiddenError("You do not have permission to download this file");
          }
        } else {
          throw new ForbiddenError("You do not have permission to download this file");
        }
      }
    }
    const exists = await this.storage.exists(file.storageKey);
    if (!exists) {
      throw new NotFoundError(`Binary for file ${id} not found in storage`);
    }
    const buffer = await this.storage.read(file.storageKey);
    const ext = file.storageKey.split(".").pop();
    const safeTitle = file.title.replace(/[^a-z0-9_\-. ]/gi, "_");
    const fileName = ext ? `${safeTitle}.${ext}` : safeTitle;
    return {
      buffer,
      mimeType: file.mimeType ?? "application/octet-stream",
      fileName,
      filename: fileName
      // alias for controllers using `filename`
    };
  }
  /**
   * Alias for prepareDownload — used by the HTTP controller.
   */
  async getDownload(id, actor) {
    return this.prepareDownload(actor, id);
  }
  // ── Soft delete ────────────────────────────────────────────────────────────
  /**
   * Soft-deletes a file. Actor must be authorised (assertCanManageFile).
   * Purges the binary from storage. Logs audit DELETE.
   */
  async softDelete(actor, id, reason) {
    const file = await this.assertCanManageFile(actor, id);
    await this.repo.softDelete(id, actor.id, reason ?? void 0);
    await this.storage.delete(file.storageKey).catch(() => void 0);
    await this.audit.log({
      userId: actor.id,
      action: import_client7.AuditAction.DELETE,
      entityType: import_client7.AuditEntityType.FILE,
      entityId: id,
      reason: reason ?? void 0,
      metadata: { reason }
    });
  }
};

// src/modules/files/files.dto.ts
function toFileDto(view, publicUrl) {
  return {
    id: view.id,
    title: view.title,
    description: view.description,
    type: view.type,
    status: view.status,
    publicUrl,
    mimeType: view.mimeType,
    sizeBytes: view.sizeBytes,
    // ⬇️ ADD THESE NEW FIELDS ⬇️
    tags: view.tags || [],
    rating: view.rating || 0,
    downloads: view.downloads || 0,
    // ⬆️ ADD THESE NEW FIELDS ⬆️
    ownerType: view.ownerType,
    ownerId: view.ownerId,
    uploadedById: view.uploadedById,
    // ⬇️ ADD THIS TO SHOW THE UPLOADER'S NAME ⬇️
    uploadedBy: view.uploadedBy ? {
      id: view.uploadedBy.id,
      fullName: view.uploadedBy.fullName,
      email: view.uploadedBy.email
    } : null,
    createdAt: view.createdAt,
    updatedAt: view.updatedAt
  };
}

// src/modules/files/files.controller.ts
var FilesController = class {
  constructor(service, storage) {
    this.service = service;
    this.storage = storage;
  }
  service;
  storage;
  /**
   * POST /files — multipart upload.
   * req.file is set by createUploadMiddleware; req.body has validated UploadFileMetaInput.
   */
  upload = asyncHandler(async (req, res) => {
    const actor = actorOf(req);
    const meta = req.body;
    const file = req.file;
    const view = await this.service.uploadFile(actor, actor.id, meta, {
      buffer: file.buffer,
      originalName: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size
    });
    const publicUrl = this.storage.getPublicUrl(view.storageKey);
    created(res, toFileDto(view, publicUrl));
  });
  /**
   * GET /files — paginated list with optional filters.
   */
  list = asyncHandler(async (req, res) => {
    const query = req.query;
    const filter = {
      ownerType: query.ownerType,
      ownerId: query.ownerId,
      status: query.status,
      type: query.type,
      uploadedById: query.uploadedById,
      page: query.page,
      pageSize: query.pageSize
    };
    const result = await this.service.list(filter);
    paginated(res, {
      ...result,
      items: result.items.map(
        (view) => toFileDto(view, this.storage.getPublicUrl(view.storageKey))
      )
    });
  });
  /**
   * GET /files/:fileId — single file by ID.
   */
  getById = asyncHandler(async (req, res) => {
    const fileId = param(req, "fileId");
    const view = await this.service.getById(fileId);
    const publicUrl = this.storage.getPublicUrl(view.storageKey);
    ok(res, toFileDto(view, publicUrl));
  });
  /**
   * GET /files/:fileId/download — stream binary to client.
   */
  download = asyncHandler(async (req, res) => {
    const fileId = param(req, "fileId");
    let actor;
    try {
      actor = actorOf(req);
    } catch {
      actor = void 0;
    }
    const file = await this.service.prepareDownload(actor, fileId);
    res.setHeader("Content-Type", file.mimeType ?? "application/octet-stream");
    res.setHeader("Content-Disposition", `attachment; filename="${file.fileName}"`);
    res.send(file.buffer);
  });
  // getOwner of file
  /**
  * GET /files/owner/:ownerType/:ownerId
  */
  getByOwner = asyncHandler(async (req, res) => {
    const ownerType = param(req, "ownerType");
    const ownerId = param(req, "ownerId");
    const result = await this.service.list({
      ownerType,
      ownerId,
      page: 1,
      pageSize: 100
    });
    ok(
      res,
      result.items.map(
        (view) => toFileDto(view, this.storage.getPublicUrl(view.storageKey))
      )
    );
  });
  getApprovedByOwner = asyncHandler(async (req, res) => {
    const ownerType = param(req, "ownerType");
    const ownerId = param(req, "ownerId");
    const files = await this.service.getApprovedByOwner(
      ownerType,
      ownerId
    );
    ok(
      res,
      files.map(
        (view) => toFileDto(view, this.storage.getPublicUrl(view.storageKey))
      )
    );
  });
  /**
   * DELETE /files/:fileId — soft-delete a file.
   * Optional body: { reason?: string }.
   */
  remove = asyncHandler(async (req, res) => {
    const actor = actorOf(req);
    const fileId = param(req, "fileId");
    const { reason } = req.body;
    await this.service.softDelete(actor, fileId, reason);
    noContent(res);
  });
};

// src/modules/search/search.service.ts
var SearchService = class {
  constructor(db) {
    this.db = db;
  }
  db;
  async globalSearch(query) {
    if (!query || query.trim().length === 0) {
      return { majors: [], scholarships: [], colleges: [], total: 0 };
    }
    const searchTerm = query.trim();
    const majors = await this.db.major.findMany({
      where: {
        name: { contains: searchTerm, mode: "insensitive" },
        deletedAt: null,
        isActive: true
      },
      take: 20
    });
    const scholarships = await this.db.scholarship.findMany({
      where: {
        name: { contains: searchTerm, mode: "insensitive" },
        deletedAt: null,
        isActive: true
      },
      take: 20
    });
    const colleges = await this.db.college.findMany({
      where: {
        name: { contains: searchTerm, mode: "insensitive" },
        isActive: true
      },
      take: 20
    });
    return {
      majors,
      scholarships,
      colleges,
      total: majors.length + scholarships.length + colleges.length
    };
  }
};

// src/modules/search/search.controller.ts
var SearchController = class {
  constructor(searchService) {
    this.searchService = searchService;
  }
  searchService;
  search = asyncHandler(async (req, res) => {
    const q = req.query.q || "";
    const results = await this.searchService.globalSearch(q);
    ok(res, {
      query: q,
      majors: results.majors,
      scholarships: results.scholarships,
      colleges: results.colleges,
      total: results.total
    });
  });
};

// src/modules/notifications/notifications.repository.ts
function toView2(row) {
  return {
    id: row.id,
    userId: row.userId,
    title: row.title,
    message: row.message,
    isRead: row.isRead,
    metadata: row.metadata,
    createdAt: row.createdAt
  };
}
var NotificationsRepository = class {
  constructor(db) {
    this.db = db;
  }
  db;
  async create(data) {
    const row = await this.db.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        message: data.message,
        metadata: data.metadata != null ? data.metadata : void 0
      }
    });
    return toView2(row);
  }
  /**
   * Bulk insert for role broadcast. Accepts a list of target user IDs and
   * a shared notification payload. Returns the count of created rows.
   */
  async createMany(userIds, data) {
    const result = await this.db.notification.createMany({
      data: userIds.map((userId) => ({
        userId,
        title: data.title,
        message: data.message,
        metadata: data.metadata != null ? data.metadata : void 0
      }))
    });
    return result.count;
  }
  /** Paginated list for one user, newest first. */
  async listForUser(userId, page, pageSize) {
    const skip = (page - 1) * pageSize;
    const [items, total] = await Promise.all([
      this.db.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize
      }),
      this.db.notification.count({ where: { userId } })
    ]);
    return { items: items.map(toView2), total };
  }
  /** Count of unread notifications for a user. */
  async unreadCount(userId) {
    return this.db.notification.count({
      where: { userId, isRead: false }
    });
  }
  /**
   * Mark a single notification read. Returns false if not found, not owned
   * by userId, OR already read (but the record still exists).
   */
  async markRead(userId, notifId) {
    const result = await this.db.notification.updateMany({
      where: { id: notifId, userId, isRead: false },
      data: { isRead: true }
    });
    return result.count > 0;
  }
  /**
   * Check whether a notification with the given id exists for the user,
   * regardless of read state. Used to distinguish "already read" from
   * "not found / not yours" when markRead returns false.
   */
  async existsForUser(userId, notifId) {
    const row = await this.db.notification.findFirst({
      where: { id: notifId, userId },
      select: { id: true }
    });
    return row !== null;
  }
  /** Mark all of a user's notifications read. Returns the count updated. */
  async markAllRead(userId) {
    const result = await this.db.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });
    return result.count;
  }
  /** Find all active user IDs that hold a given role (used for role broadcast). */
  async findUserIdsByRole(role) {
    const users = await this.db.user.findMany({
      where: { role: { name: role }, isActive: true },
      select: { id: true }
    });
    return users.map((u) => u.id);
  }
};

// src/modules/notifications/notifications.service.ts
var NotificationService = class {
  constructor(repo) {
    this.repo = repo;
  }
  repo;
  // ── Fire-and-forget helpers ───────────────────────────────────
  /** Persist a notification for a single user. Never throws. */
  async notifyUser(data) {
    try {
      await this.repo.create(data);
    } catch (err) {
      logger.error({ err, userId: data.userId, title: data.title }, "Failed to persist notification");
    }
  }
  /**
   * Broadcast a notification to every active user holding `role`. Never throws.
   * Returns the number of notifications sent, or 0 on failure.
   */
  async notifyRole(role, data) {
    try {
      const userIds = await this.repo.findUserIdsByRole(role);
      if (userIds.length === 0) return 0;
      return await this.repo.createMany(userIds, data);
    } catch (err) {
      logger.error({ err, role, title: data.title }, "Failed to broadcast notification to role");
      return 0;
    }
  }
  // ── User-facing operations (CAN throw) ────────────────────────
  /** Paginated notification list for the authenticated user. */
  async list(userId, page, pageSize) {
    const { items, total } = await this.repo.listForUser(userId, page, pageSize);
    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  }
  /** Unread notification count for a user. */
  async unreadCount(userId) {
    return this.repo.unreadCount(userId);
  }
  /**
   * Mark a single notification as read.
   * - No-op if the notification exists but is already read.
   * - Throws NotFoundError if the notification does not belong to the user.
   */
  async markRead(userId, notifId) {
    const updated = await this.repo.markRead(userId, notifId);
    if (!updated) {
      const exists = await this.repo.existsForUser(userId, notifId);
      if (!exists) {
        throw new NotFoundError("Notification not found");
      }
    }
  }
  /** Mark all unread notifications as read. Returns the count updated. */
  async markAllRead(userId) {
    return this.repo.markAllRead(userId);
  }
  /**
   * Create an announcement.
   * - WITH targetRole: broadcast to every user of that role via createMany.
   * - WITHOUT targetRole: self-addressed notification for the acting admin.
   */
  async createAnnouncement(actorId, input) {
    if (input.targetRole) {
      const userIds = await this.repo.findUserIdsByRole(input.targetRole);
      const sent = await this.repo.createMany(userIds, {
        title: input.title,
        message: input.message
      });
      return { broadcast: true, targetRole: input.targetRole, sent };
    }
    await this.repo.create({
      userId: actorId,
      title: input.title,
      message: input.message
    });
    return { broadcast: false, sent: 1 };
  }
};

// src/modules/notifications/notifications.controller.ts
var NotificationsController = class {
  constructor(service) {
    this.service = service;
  }
  service;
  list = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { page, pageSize } = req.query;
    const result = await this.service.list(userId, page, pageSize);
    paginated(res, result);
  });
  getUnreadCount = asyncHandler(async (req, res) => {
    const count = await this.service.unreadCount(req.user.id);
    ok(res, { unreadCount: count });
  });
  markAllRead = asyncHandler(async (req, res) => {
    const updated = await this.service.markAllRead(req.user.id);
    ok(res, { updated });
  });
  markRead = asyncHandler(async (req, res) => {
    await this.service.markRead(req.user.id, param(req, "id"));
    noContent(res);
  });
  createAnnouncement = asyncHandler(async (req, res) => {
    const result = await this.service.createAnnouncement(
      req.user.id,
      req.body
    );
    created(res, result);
  });
};

// src/modules/reviews/reviews.repository.ts
var ReviewsRepository = class {
  constructor(db) {
    this.db = db;
  }
  db;
  /** Maps a raw Prisma FileReview row to the domain view. Never exposes raw Prisma models. */
  toView(row) {
    return {
      id: row.id,
      fileId: row.fileId,
      reviewerId: row.reviewerId,
      action: row.action,
      comment: row.comment ?? null,
      createdAt: row.createdAt
    };
  }
  /** Persist a new review record. Reviews are immutable — no update or delete. */
  async create(data) {
    const row = await this.db.fileReview.create({
      data: {
        fileId: data.fileId,
        reviewerId: data.reviewerId,
        action: data.action,
        comment: data.comment ?? null
      }
    });
    return this.toView(row);
  }
  /** Return all reviews for a given file, newest first. */
  async listForFile(fileId) {
    const rows = await this.db.fileReview.findMany({
      where: { fileId },
      orderBy: { createdAt: "desc" }
    });
    return rows.map((row) => this.toView(row));
  }
};

// src/modules/reviews/reviews.service.ts
var import_client8 = require("@prisma/client");
var ReviewsService = class {
  constructor(repo, files, audit, notifications) {
    this.repo = repo;
    this.files = files;
    this.audit = audit;
    this.notifications = notifications;
  }
  repo;
  files;
  audit;
  notifications;
  /**
   * Submit a review decision for a file.
   * Steps execute in strict order: authorize → check status → persist → transition → audit → notify.
   */
  async review(actor, fileId, input) {
    const file = await this.files.assertCanManageFile(actor, fileId);
    if (file.status !== import_client8.FileStatus.PENDING) {
      throw new ConflictError("File has already been reviewed");
    }
    const review = await this.repo.create({
      fileId,
      reviewerId: actor.id,
      action: input.action,
      comment: input.comment ?? null
    });
    const newStatus = input.action === import_client8.ReviewAction.APPROVE ? import_client8.FileStatus.APPROVED : import_client8.FileStatus.REJECTED;
    await this.files.applyReviewStatus(fileId, newStatus);
    await this.audit.log({
      userId: actor.id,
      action: import_client8.AuditAction.UPDATE,
      entityType: import_client8.AuditEntityType.FILE,
      entityId: fileId,
      metadata: { action: input.action, reviewId: review.id }
    });
    const isApproved = input.action === import_client8.ReviewAction.APPROVE;
    const title = isApproved ? "\u062A\u0645\u062A \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629 \u0639\u0644\u0649 \u0627\u0644\u0645\u0644\u0641 \u2705" : "\u062A\u0645 \u0631\u0641\u0636 \u0627\u0644\u0645\u0644\u0641 \u274C";
    const message = isApproved ? `\u062A\u0645\u062A \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629 \u0639\u0644\u0649 \u0645\u0644\u0641\u0643 "${file.title}" \u0628\u0646\u062C\u0627\u062D.` : input.comment ? `\u062A\u0645 \u0631\u0641\u0636 \u0645\u0644\u0641\u0643 "${file.title}". \u0633\u0628\u0628 \u0627\u0644\u0631\u0641\u0636: ${input.comment}` : `\u062A\u0645 \u0631\u0641\u0636 \u0645\u0644\u0641\u0643 "${file.title}".`;
    try {
      await this.notifications.notifyUser({
        userId: file.uploadedById,
        title,
        message,
        metadata: { fileId, action: input.action, reason: input.comment }
      });
    } catch {
    }
    return review;
  }
  /**
   * Return the review history (audit trail) for a file, newest first.
   * The actor must be authorised to manage the file before reading its history.
   * An empty array is valid when no reviews exist yet.
   */
  async history(actor, fileId) {
    await this.files.assertCanManageFile(actor, fileId);
    return this.repo.listForFile(fileId);
  }
};

// src/modules/reviews/reviews.dto.ts
function toDto3(view) {
  return view;
}

// src/modules/reviews/reviews.controller.ts
var ReviewsController = class {
  constructor(service) {
    this.service = service;
  }
  service;
  submit = asyncHandler(async (req, res) => {
    const fileId = param(req, "fileId");
    const input = req.body;
    const result = await this.service.review(actorOf(req), fileId, input);
    created(res, toDto3(result));
  });
  list = asyncHandler(async (req, res) => {
    const fileId = param(req, "fileId");
    const results = await this.service.history(actorOf(req), fileId);
    ok(res, results.map(toDto3));
  });
};

// src/modules/contact/contact.repository.ts
var ContactRepository = class {
  constructor(db) {
    this.db = db;
  }
  db;
  /**
   * Maps a raw Prisma ContactMessage row to the domain view.
   *
   * NOTE: The Prisma schema names the text column `message`, but the domain
   * view exposes it as `body` for consistency with the API spec. This mapper
   * is the single bridge between those two names.
   */
  toView(row) {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      subject: row.subject,
      body: row.message,
      isHandled: row.isHandled ?? false,
      createdAt: row.createdAt
    };
  }
  async create(data) {
    const row = await this.db.contactMessage.create({
      data: {
        name: data.name,
        email: data.email,
        subject: data.subject,
        // `body` in the domain maps to the `message` column in the DB.
        message: data.body
      }
    });
    return this.toView(row);
  }
  async findById(id) {
    const row = await this.db.contactMessage.findUnique({ where: { id } });
    return row ? this.toView(row) : null;
  }
  async list(params) {
    const where = {};
    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: "insensitive" } },
        { email: { contains: params.search, mode: "insensitive" } },
        { subject: { contains: params.search, mode: "insensitive" } }
      ];
    }
    const [rows, total] = await Promise.all([
      this.db.contactMessage.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: "desc" }
      }),
      this.db.contactMessage.count({ where })
    ]);
    return {
      items: rows.map((row) => this.toView(row)),
      total
    };
  }
  /**
   * Marks a contact message as handled.
   * Returns the updated view, or null if the id was not found.
   */
  async markHandled(id) {
    try {
      const row = await this.db.contactMessage.update({
        where: { id },
        data: { isHandled: true }
      });
      return this.toView(row);
    } catch {
      return null;
    }
  }
  /**
   * Hard-deletes a contact message by id.
   * Returns `true` if a row was deleted, `false` if the id was not found.
   */
  async delete(id) {
    const result = await this.db.contactMessage.deleteMany({ where: { id } });
    return result.count > 0;
  }
};

// src/modules/contact/contact.service.ts
var import_client9 = require("@prisma/client");
var ContactService = class {
  constructor(repo, audit) {
    this.repo = repo;
    this.audit = audit;
  }
  repo;
  audit;
  async submit(data) {
    const message = await this.repo.create(data);
    return message;
  }
  async getById(id) {
    const message = await this.repo.findById(id);
    if (!message) {
      throw new NotFoundError("Contact message not found");
    }
    return message;
  }
  async list(query = { page: 1, pageSize: 20 }) {
    const page = query?.page ?? 1;
    const pageSize = query?.pageSize ?? 20;
    const skip = (page - 1) * pageSize;
    const { items, total } = await this.repo.list({
      skip,
      take: pageSize,
      search: query?.search
    });
    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  }
  /**
   * Marks a contact message as handled. Throws NotFoundError if the message
   * does not exist.
   */
  async markHandled(id) {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new NotFoundError("Contact message not found");
    }
    const updated = await this.repo.markHandled(id);
    if (!updated) {
      throw new NotFoundError("Contact message not found");
    }
    return updated;
  }
  async delete(actor, id) {
    const deleted = await this.repo.delete(id);
    if (!deleted) throw new NotFoundError("Contact message not found");
    await this.audit.log({
      action: import_client9.AuditAction.DELETE,
      entityType: import_client9.AuditEntityType.FILE,
      // placeholder — see NOTE above
      entityId: id,
      userId: actor.id
    });
  }
};

// src/modules/contact/contact.dto.ts
function toDto4(view) {
  return view;
}

// src/modules/contact/contact.controller.ts
var ContactController = class {
  constructor(service) {
    this.service = service;
  }
  service;
  submit = asyncHandler(async (req, res) => {
    const input = req.body;
    const result = await this.service.submit(input);
    created(res, toDto4(result));
  });
  getById = asyncHandler(async (req, res) => {
    const id = param(req, "id");
    const result = await this.service.getById(id);
    ok(res, toDto4(result));
  });
  list = asyncHandler(async (req, res) => {
    const query = req.query;
    const result = await this.service.list(query);
    paginated(res, { ...result, items: result.items.map(toDto4) });
  });
  markHandled = asyncHandler(async (req, res) => {
    const id = param(req, "id");
    const result = await this.service.markHandled(id);
    ok(res, toDto4(result));
  });
  delete = asyncHandler(async (req, res) => {
    const id = param(req, "id");
    await this.service.delete(actorOf(req), id);
    noContent(res);
  });
};

// src/modules/courses/courses.repository.ts
var CoursesRepository = class {
  constructor(db) {
    this.db = db;
  }
  db;
  async findByMajorId(majorId) {
    return this.db.course.findMany({
      where: { majorId },
      include: {
        moderators: {
          select: { id: true, fullName: true, email: true }
        }
      },
      orderBy: [{ year: "asc" }, { code: "asc" }]
    });
  }
  async findById(id) {
    return this.db.course.findUnique({ where: { id } });
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async create(majorId, courseData) {
    return this.db.course.create({
      data: { ...courseData, majorId }
    });
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async update(id, courseData) {
    return this.db.course.update({
      where: { id },
      data: courseData
    });
  }
  async delete(id) {
    return this.db.course.delete({ where: { id } });
  }
  async findModerators() {
    return this.db.user.findMany({
      where: { role: { name: "MODERATOR" } },
      select: { id: true, fullName: true, email: true }
    });
  }
  async assignModerator(courseId, userId) {
    return this.db.course.update({
      where: { id: courseId },
      data: { moderators: { connect: { id: userId } } }
    });
  }
  async revokeModerator(courseId, userId) {
    return this.db.course.update({
      where: { id: courseId },
      data: { moderators: { disconnect: { id: userId } } }
    });
  }
};

// src/modules/courses/courses.service.ts
var CoursesService = class {
  constructor(repo) {
    this.repo = repo;
  }
  repo;
  async getCoursesByMajor(majorId) {
    return this.repo.findByMajorId(majorId);
  }
  async findById(id) {
    return this.repo.findById(id);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async createCourse(majorId, courseData) {
    return this.repo.create(majorId, courseData);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async updateCourse(id, courseData) {
    return this.repo.update(id, courseData);
  }
  async deleteCourse(id) {
    return this.repo.delete(id);
  }
  async getModeratorsList() {
    return this.repo.findModerators();
  }
  async assignModerator(courseId, userId) {
    return this.repo.assignModerator(courseId, userId);
  }
  async revokeModerator(courseId, userId) {
    return this.repo.revokeModerator(courseId, userId);
  }
  async exists(_ownerType, ownerId) {
    const course = await this.repo.findById(ownerId);
    return course !== null;
  }
};

// src/modules/courses/courses.controller.ts
var CoursesController = class {
  constructor(coursesService) {
    this.coursesService = coursesService;
  }
  coursesService;
  getByMajor = asyncHandler(async (req, res) => {
    const majorId = req.params.majorId;
    const courses = await this.coursesService.getCoursesByMajor(majorId);
    ok(res, courses);
  });
  create = asyncHandler(async (req, res) => {
    const majorId = req.params.majorId;
    const course = await this.coursesService.createCourse(majorId, req.body);
    ok(res, course);
  });
  update = asyncHandler(async (req, res) => {
    const id = req.params.id;
    const course = await this.coursesService.updateCourse(id, req.body);
    ok(res, course);
  });
  delete = asyncHandler(async (req, res) => {
    const id = req.params.id;
    await this.coursesService.deleteCourse(id);
    ok(res, null);
  });
  getModeratorsList = asyncHandler(async (_req, res) => {
    const list = await this.coursesService.getModeratorsList();
    ok(res, list);
  });
  assignModerator = asyncHandler(async (req, res) => {
    const courseId = req.params.id;
    const userId = req.params.userId;
    const result = await this.coursesService.assignModerator(courseId, userId);
    ok(res, result);
  });
  revokeModerator = asyncHandler(async (req, res) => {
    const courseId = req.params.id;
    const userId = req.params.userId;
    const result = await this.coursesService.revokeModerator(courseId, userId);
    ok(res, result);
  });
};

// src/modules/moderators/moderators.service.ts
var ModeratorsService = class {
  constructor(db, notifier) {
    this.db = db;
    this.notifier = notifier;
  }
  db;
  notifier;
  async listModerators() {
    return this.db.user.findMany({
      where: { role: { name: "MODERATOR" } },
      select: { id: true, fullName: true, email: true },
      orderBy: { fullName: "asc" }
    });
  }
  // ── Major assignments ──────────────────────────────────────
  async getMajorModerators(majorId) {
    const major = await this.db.major.findUnique({ where: { id: majorId } });
    if (!major) throw new NotFoundError(`Major ${majorId} not found`);
    const user = await this.db.major.findUnique({
      where: { id: majorId },
      select: {
        moderators: {
          select: { id: true, fullName: true, email: true },
          orderBy: { fullName: "asc" }
        }
      }
    });
    return user?.moderators ?? [];
  }
  async assignMajorModerator(majorId, userId) {
    const major = await this.db.major.findUnique({ where: { id: majorId } });
    if (!major) throw new NotFoundError(`Major ${majorId} not found`);
    const user = await this.db.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError(`User ${userId} not found`);
    await this.db.major.update({
      where: { id: majorId },
      data: { moderators: { connect: { id: userId } } }
    });
    if (this.notifier) {
      this.notifier.notifyUser({
        userId,
        title: "\u062A\u0639\u064A\u064A\u0646 \u0643\u0645\u0634\u0631\u0641 \u062C\u062F\u064A\u062F \u{1F6E1}\uFE0F",
        message: `\u062A\u0645 \u062A\u0639\u064A\u064A\u0646\u0643 \u0643\u0645\u0634\u0631\u0641 \u0639\u0644\u0649 \u062A\u062E\u0635\u0635 "${major.name}". \u064A\u0645\u0643\u0646\u0643 \u0627\u0644\u0622\u0646 \u0645\u0631\u0627\u062C\u0639\u0629 \u0648\u0627\u0639\u062A\u0645\u0627\u062F \u0627\u0644\u0645\u0644\u0641\u0627\u062A \u0627\u0644\u0645\u0631\u0641\u0648\u0639\u0629 \u0644\u0647\u0630\u0627 \u0627\u0644\u062A\u062E\u0635\u0635.`,
        metadata: { type: "MODERATOR_ASSIGNED", entityType: "MAJOR", entityId: majorId }
      }).catch(() => void 0);
    }
  }
  async removeMajorModerator(majorId, userId) {
    const major = await this.db.major.findUnique({ where: { id: majorId } });
    if (!major) throw new NotFoundError(`Major ${majorId} not found`);
    await this.db.major.update({
      where: { id: majorId },
      data: { moderators: { disconnect: { id: userId } } }
    });
  }
  // ── Scholarship assignments ────────────────────────────────
  async getScholarshipModerators(scholarshipId) {
    const scholarship = await this.db.scholarship.findUnique({ where: { id: scholarshipId } });
    if (!scholarship) throw new NotFoundError(`Scholarship ${scholarshipId} not found`);
    const result = await this.db.scholarship.findUnique({
      where: { id: scholarshipId },
      select: {
        moderators: {
          select: { id: true, fullName: true, email: true },
          orderBy: { fullName: "asc" }
        }
      }
    });
    return result?.moderators ?? [];
  }
  async assignScholarshipModerator(scholarshipId, userId) {
    const scholarship = await this.db.scholarship.findUnique({ where: { id: scholarshipId } });
    if (!scholarship) throw new NotFoundError(`Scholarship ${scholarshipId} not found`);
    const user = await this.db.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError(`User ${userId} not found`);
    await this.db.scholarship.update({
      where: { id: scholarshipId },
      data: { moderators: { connect: { id: userId } } }
    });
    if (this.notifier) {
      this.notifier.notifyUser({
        userId,
        title: "\u062A\u0639\u064A\u064A\u0646 \u0643\u0645\u0634\u0631\u0641 \u062C\u062F\u064A\u062F \u{1F6E1}\uFE0F",
        message: `\u062A\u0645 \u062A\u0639\u064A\u064A\u0646\u0643 \u0643\u0645\u0634\u0631\u0641 \u0639\u0644\u0649 \u0645\u0646\u062D\u0629 "${scholarship.name}". \u064A\u0645\u0643\u0646\u0643 \u0627\u0644\u0622\u0646 \u0645\u0631\u0627\u062C\u0639\u0629 \u0648\u0627\u0639\u062A\u0645\u0627\u062F \u0627\u0644\u0645\u0644\u0641\u0627\u062A \u0627\u0644\u0645\u0631\u062A\u0628\u0637\u0629 \u0628\u0647\u0630\u0647 \u0627\u0644\u0645\u0646\u062D\u0629.`,
        metadata: { type: "MODERATOR_ASSIGNED", entityType: "SCHOLARSHIP", entityId: scholarshipId }
      }).catch(() => void 0);
    }
  }
  async removeScholarshipModerator(scholarshipId, userId) {
    const scholarship = await this.db.scholarship.findUnique({ where: { id: scholarshipId } });
    if (!scholarship) throw new NotFoundError(`Scholarship ${scholarshipId} not found`);
    await this.db.scholarship.update({
      where: { id: scholarshipId },
      data: { moderators: { disconnect: { id: userId } } }
    });
  }
  // ── Course assignments ─────────────────────────────────────
  async getCourseModerators(courseId) {
    const course = await this.db.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundError(`Course ${courseId} not found`);
    const result = await this.db.course.findUnique({
      where: { id: courseId },
      select: {
        moderators: {
          select: { id: true, fullName: true, email: true },
          orderBy: { fullName: "asc" }
        }
      }
    });
    return result?.moderators ?? [];
  }
  async assignCourseModerator(courseId, userId) {
    const course = await this.db.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundError(`Course ${courseId} not found`);
    const user = await this.db.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError(`User ${userId} not found`);
    await this.db.course.update({
      where: { id: courseId },
      data: { moderators: { connect: { id: userId } } }
    });
    if (this.notifier) {
      const courseName = course.nameAr || course.name;
      this.notifier.notifyUser({
        userId,
        title: "\u062A\u0639\u064A\u064A\u0646 \u0643\u0645\u0634\u0631\u0641 \u062C\u062F\u064A\u062F \u{1F6E1}\uFE0F",
        message: `\u062A\u0645 \u062A\u0639\u064A\u064A\u0646\u0643 \u0643\u0645\u0634\u0631\u0641 \u0639\u0644\u0649 \u0645\u0633\u0627\u0642 "${courseName}". \u064A\u0645\u0643\u0646\u0643 \u0627\u0644\u0622\u0646 \u0645\u0631\u0627\u062C\u0639\u0629 \u0648\u0627\u0639\u062A\u0645\u0627\u062F \u0627\u0644\u0645\u0644\u0641\u0627\u062A \u0627\u0644\u0645\u0631\u0641\u0648\u0639\u0629 \u0644\u0647\u0630\u0627 \u0627\u0644\u0645\u0633\u0627\u0642.`,
        metadata: { type: "MODERATOR_ASSIGNED", entityType: "COURSE", entityId: courseId }
      }).catch(() => void 0);
    }
  }
  async removeCourseModerator(courseId, userId) {
    const course = await this.db.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundError(`Course ${courseId} not found`);
    await this.db.course.update({
      where: { id: courseId },
      data: { moderators: { disconnect: { id: userId } } }
    });
  }
  // ── List entities ──────────────────────────────────────────
  async listMajors() {
    return this.db.major.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" }
    });
  }
  async listScholarships() {
    return this.db.scholarship.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" }
    });
  }
  async listCourses() {
    return this.db.course.findMany({
      select: { id: true, name: true, nameAr: true, code: true },
      orderBy: [{ year: "asc" }, { code: "asc" }]
    });
  }
};

// src/modules/moderators/moderators.controller.ts
var ModeratorsController = class {
  constructor(service) {
    this.service = service;
  }
  service;
  // ── List all moderators ────────────────────────────────────
  listModerators = asyncHandler(async (_req, res) => {
    const list = await this.service.listModerators();
    ok(res, list);
  });
  // ── List entities ──────────────────────────────────────────
  listMajors = asyncHandler(async (_req, res) => {
    const list = await this.service.listMajors();
    ok(res, list);
  });
  listScholarships = asyncHandler(async (_req, res) => {
    const list = await this.service.listScholarships();
    ok(res, list);
  });
  listCourses = asyncHandler(async (_req, res) => {
    const list = await this.service.listCourses();
    ok(res, list);
  });
  // ── Major assignments ──────────────────────────────────────
  getMajorModerators = asyncHandler(async (req, res) => {
    const { majorId } = req.params;
    const list = await this.service.getMajorModerators(majorId);
    ok(res, list);
  });
  assignMajorModerator = asyncHandler(async (req, res) => {
    const { majorId, userId } = req.params;
    await this.service.assignMajorModerator(majorId, userId);
    noContent(res);
  });
  removeMajorModerator = asyncHandler(async (req, res) => {
    const { majorId, userId } = req.params;
    await this.service.removeMajorModerator(majorId, userId);
    noContent(res);
  });
  // ── Scholarship assignments ────────────────────────────────
  getScholarshipModerators = asyncHandler(async (req, res) => {
    const { scholarshipId } = req.params;
    const list = await this.service.getScholarshipModerators(scholarshipId);
    ok(res, list);
  });
  assignScholarshipModerator = asyncHandler(async (req, res) => {
    const { scholarshipId, userId } = req.params;
    await this.service.assignScholarshipModerator(scholarshipId, userId);
    noContent(res);
  });
  removeScholarshipModerator = asyncHandler(async (req, res) => {
    const { scholarshipId, userId } = req.params;
    await this.service.removeScholarshipModerator(scholarshipId, userId);
    noContent(res);
  });
  // ── Course assignments ─────────────────────────────────────
  getCourseModerators = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const list = await this.service.getCourseModerators(courseId);
    ok(res, list);
  });
  assignCourseModerator = asyncHandler(async (req, res) => {
    const { courseId, userId } = req.params;
    await this.service.assignCourseModerator(courseId, userId);
    noContent(res);
  });
  removeCourseModerator = asyncHandler(async (req, res) => {
    const { courseId, userId } = req.params;
    await this.service.removeCourseModerator(courseId, userId);
    noContent(res);
  });
};

// src/container.ts
function buildContainer(db = prisma) {
  const hasher = new BcryptPasswordHasher(env.BCRYPT_SALT_ROUNDS);
  const tokenService = new JwtTokenService({
    accessSecret: env.JWT_ACCESS_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET,
    accessExpiresIn: env.JWT_ACCESS_EXPIRES_IN,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN
  });
  const authMiddleware = authenticate(tokenService);
  const authRepo = new AuthRepository(db);
  const refreshTtlMs = 7 * 24 * 60 * 60 * 1e3;
  const googleAuthService = new GoogleAuthService(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    env.GOOGLE_CALLBACK_URL,
    authRepo
  );
  const emailService = new EmailService(
    env.SMTP_HOST,
    env.SMTP_PORT,
    env.SMTP_USER,
    env.SMTP_PASS,
    env.MAIL_FROM
  );
  const authService = new AuthService(authRepo, hasher, tokenService, refreshTtlMs, googleAuthService, emailService);
  const authController = new AuthController(authService);
  const authzRepo = new AuthorizationRepository(db);
  const authzService = new AuthorizationService(authzRepo);
  const auditRepo = new AuditRepository(db);
  const auditService = new AuditService(auditRepo);
  const auditController = new AuditController(auditService);
  const notificationsRepo = new NotificationsRepository(db);
  const notificationService = new NotificationService(notificationsRepo);
  const notificationsController = new NotificationsController(notificationService);
  const usersRepo = new UsersRepository(db);
  const usersService = new UsersService(usersRepo, hasher, notificationService);
  const usersController = new UsersController(usersService);
  const rolesRepo = new RolesRepository(db);
  const rolesService = new RolesService(rolesRepo);
  const rolesController = new RolesController(rolesService);
  const majorsRepo = new MajorsRepository(db);
  const majorsService = new MajorsService(majorsRepo, authzService, auditService);
  const majorsController = new MajorsController(majorsService);
  const collegesRepo = new CollegesRepository(db);
  const collegesService = new CollegesService(collegesRepo, majorsService);
  const collegesController = new CollegesController(collegesService);
  majorsService.registerCollegeChecker({
    exists: (id) => collegesRepo.findById(id).then((c) => c !== null)
  });
  const scholarshipsRepo = new ScholarshipsRepository(db);
  const scholarshipsService = new ScholarshipsService(scholarshipsRepo);
  const scholarshipsController = new ScholarshipsController(scholarshipsService);
  const contentRepo = new ContentRepository(db);
  const contentService = new ContentService(contentRepo, db);
  const contentController = new ContentController(contentService);
  const deletedItemsService = new DeletedItemsService(db);
  const deletedItemsController = new DeletedItemsController(deletedItemsService);
  const searchService = new SearchService(db);
  const searchController = new SearchController(searchService);
  const reviewsRepo = new ReviewsRepository(db);
  const reviewsService = new ReviewsService(
    reviewsRepo,
    {
      assertCanManageFile: (actor, fileId) => filesService.assertCanManageFile(actor, fileId),
      applyReviewStatus: (fileId, status) => filesService.applyReviewStatus(fileId, status).then(() => void 0)
    },
    auditService,
    notificationService
  );
  const reviewsController = new ReviewsController(reviewsService);
  const coursesRepo = new CoursesRepository(db);
  const coursesService = new CoursesService(coursesRepo);
  const coursesController = new CoursesController(coursesService);
  const storageProvider = new LocalStorageProvider(env.UPLOAD_DIR);
  const filesRepo = new FilesRepository(db);
  const filesService = new FilesService(
    filesRepo,
    authzService,
    auditService,
    storageProvider,
    notificationService
  );
  filesService.registerOwnerChecker("MAJOR", majorsService);
  filesService.registerOwnerChecker("SCHOLARSHIP", scholarshipsService);
  filesService.registerOwnerChecker("COURSE", coursesService);
  const filesController = new FilesController(filesService, storageProvider);
  filesService.registerOwnerChecker("COURSE", {
    exists: (_ownerType, id) => coursesService.findById(id).then((c) => c !== null)
  });
  const moderatorsService = new ModeratorsService(db, notificationService);
  const moderatorsController = new ModeratorsController(moderatorsService);
  const contactRepo = new ContactRepository(db);
  const contactService = new ContactService(contactRepo, auditService);
  const contactController = new ContactController(contactService);
  void authService;
  void authzService;
  void auditService;
  void rolesService;
  void usersService;
  void majorsService;
  void scholarshipsService;
  void searchService;
  return {
    authenticate: authMiddleware,
    authController,
    usersController,
    rolesController,
    collegesController,
    majorsController,
    scholarshipsController,
    contentController,
    deletedItemsController,
    filesController,
    searchController,
    reviewsController,
    contactController,
    notificationsController,
    auditController,
    tokenService,
    coursesController,
    moderatorsController
  };
}

// src/routes.ts
var import_express17 = require("express");

// src/modules/auth/auth.routes.ts
var import_express = require("express");

// src/infrastructure/http/middlewares/validate.ts
var import_zod3 = require("zod");
function validate(schemas) {
  return (req, _res, next) => {
    try {
      if (schemas.body) req.body = schemas.body.parse(req.body);
      if (schemas.params) req.params = schemas.params.parse(req.params);
      if (schemas.query) {
        Object.assign(req.query, schemas.query.parse(req.query));
      }
      next();
    } catch (err) {
      if (err instanceof import_zod3.ZodError) {
        next(new ValidationError("Request validation failed", err.flatten()));
        return;
      }
      next(err);
    }
  };
}

// src/modules/auth/auth.validation.ts
var import_zod4 = require("zod");
var registerSchema = import_zod4.z.object({
  email: import_zod4.z.string().email("Invalid email address"),
  password: import_zod4.z.string().min(8, "Password must be at least 8 characters").max(72, "Password must be at most 72 characters"),
  fullName: import_zod4.z.string().min(2, "Full name must be at least 2 characters").max(100, "Full name must be at most 100 characters").trim()
});
var loginSchema = import_zod4.z.object({
  email: import_zod4.z.string().email("Invalid email address"),
  password: import_zod4.z.string().min(1, "Password is required")
});
var refreshSchema = import_zod4.z.object({
  refreshToken: import_zod4.z.string().min(1, "Refresh token is required")
});
var logoutSchema = import_zod4.z.object({
  refreshToken: import_zod4.z.string().min(1, "Refresh token is required")
});
var verifyOtpSchema = import_zod4.z.object({
  tempToken: import_zod4.z.string().min(1, "Temporary token is required"),
  code: import_zod4.z.string().length(6, "Code must be 6 digits")
});
var twoFactorCodeSchema = import_zod4.z.object({
  code: import_zod4.z.string().length(6, "Code must be 6 digits")
});

// src/modules/auth/auth.routes.ts
function createAuthRouter(controller, authenticate2) {
  const router = (0, import_express.Router)();
  router.post("/register", validate({ body: registerSchema }), controller.register);
  router.post("/login", validate({ body: loginSchema }), controller.login);
  router.post("/refresh", validate({ body: refreshSchema }), controller.refresh);
  router.post("/logout", validate({ body: logoutSchema }), controller.logout);
  router.get("/google", controller.getGoogleAuthUrl);
  router.get("/google/callback", controller.loginWithGoogle);
  router.post("/verify-otp", validate({ body: verifyOtpSchema }), controller.verifyOtp);
  router.get("/2fa/status", authenticate2, controller.getTwoFactorStatus);
  router.post("/2fa/setup", authenticate2, controller.setupTwoFactor);
  router.post("/2fa/confirm", authenticate2, validate({ body: twoFactorCodeSchema }), controller.confirmTwoFactor);
  router.post("/2fa/disable", authenticate2, controller.disableTwoFactor);
  return router;
}

// src/modules/users/users.routes.ts
var import_express2 = require("express");

// src/infrastructure/http/middlewares/role.guard.ts
function ensureAuthenticated(req) {
  if (!req.user) throw new UnauthorizedError("Authentication required");
  return req.user;
}
function requirePermission(...required) {
  return (req, _res, next) => {
    const user = ensureAuthenticated(req);
    const missing = required.filter((p) => !user.permissions.has(p));
    if (missing.length > 0) {
      throw new ForbiddenError(`Missing permission(s): ${missing.join(", ")}`);
    }
    next();
  };
}
function requireAnyPermission(...anyOf) {
  return (req, _res, next) => {
    const user = ensureAuthenticated(req);
    if (!anyOf.some((p) => user.permissions.has(p))) {
      throw new ForbiddenError(`Requires one of: ${anyOf.join(", ")}`);
    }
    next();
  };
}
function requireRole(...roles) {
  return (req, _res, next) => {
    const user = ensureAuthenticated(req);
    if (!roles.includes(user.role)) {
      throw new ForbiddenError(`Requires role: ${roles.join(" | ")}`);
    }
    next();
  };
}

// src/modules/users/users.validation.ts
var import_zod5 = require("zod");
var createUserSchema = import_zod5.z.object({
  email: import_zod5.z.string().email(),
  password: import_zod5.z.string().min(8).max(72),
  fullName: import_zod5.z.string().min(2).max(100).trim(),
  roleId: import_zod5.z.string().min(1)
});
var updateUserSchema = import_zod5.z.object({
  fullName: import_zod5.z.string().min(2).max(100).trim().optional(),
  isActive: import_zod5.z.boolean().optional(),
  roleId: import_zod5.z.string().min(1).optional()
});
var userIdParamsSchema = import_zod5.z.object({
  id: import_zod5.z.string().min(1)
});
var listUsersQuerySchema = import_zod5.z.object({
  page: import_zod5.z.coerce.number().int().min(1).default(1),
  limit: import_zod5.z.coerce.number().int().min(1).max(100).default(20),
  search: import_zod5.z.string().optional(),
  role: import_zod5.z.string().optional()
});

// src/modules/users/users.routes.ts
function createUsersRouter(controller, tokenService) {
  const router = (0, import_express2.Router)();
  const auth = authenticate(tokenService);
  router.get(
    "/",
    auth,
    requirePermission(PERMISSIONS.USERS_READ),
    validate({ query: listUsersQuerySchema }),
    controller.list
  );
  router.post(
    "/",
    auth,
    requirePermission(PERMISSIONS.USERS_MANAGE),
    validate({ body: createUserSchema }),
    controller.create
  );
  router.get("/me", auth, controller.getMe);
  router.get(
    "/:id",
    auth,
    requirePermission(PERMISSIONS.USERS_READ),
    validate({ params: userIdParamsSchema }),
    controller.getById
  );
  router.patch(
    "/:id",
    auth,
    requirePermission(PERMISSIONS.USERS_MANAGE),
    validate({ params: userIdParamsSchema, body: updateUserSchema }),
    controller.update
  );
  router.delete(
    "/:id",
    auth,
    requirePermission(PERMISSIONS.USERS_MANAGE),
    validate({ params: userIdParamsSchema }),
    controller.delete
  );
  return router;
}

// src/modules/roles/roles.routes.ts
var import_express3 = require("express");

// src/modules/roles/roles.validation.ts
var import_zod6 = require("zod");
var import_client10 = require("@prisma/client");
var assignRoleParamsSchema = import_zod6.z.object({
  userId: import_zod6.z.string().min(1)
});
var assignRoleBodySchema = import_zod6.z.object({
  roleName: import_zod6.z.nativeEnum(import_client10.RoleName)
});

// src/modules/roles/roles.routes.ts
function createRolesRouter(controller, tokenService) {
  const router = (0, import_express3.Router)();
  const auth = authenticate(tokenService);
  router.get(
    "/",
    auth,
    requirePermission(PERMISSIONS.ROLES_READ),
    controller.list
  );
  router.put(
    "/:userId/assign",
    auth,
    requirePermission(PERMISSIONS.ROLES_ASSIGN),
    validate({ params: assignRoleParamsSchema, body: assignRoleBodySchema }),
    controller.assign
  );
  return router;
}

// src/modules/colleges/colleges.routes.ts
var import_express4 = require("express");

// src/modules/colleges/colleges.validation.ts
var import_zod7 = require("zod");
var createCollegeSchema = import_zod7.z.object({
  slug: import_zod7.z.string().min(2).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: import_zod7.z.string().min(2).max(200),
  category: import_zod7.z.string().min(2).max(200).optional(),
  description: import_zod7.z.string().max(2e3).nullable().optional(),
  isActive: import_zod7.z.boolean().optional()
});
var updateCollegeSchema = import_zod7.z.object({
  slug: import_zod7.z.string().min(2).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
  name: import_zod7.z.string().min(2).max(200).optional(),
  category: import_zod7.z.string().min(2).max(200).optional(),
  description: import_zod7.z.string().max(2e3).nullable().optional(),
  isActive: import_zod7.z.boolean().optional()
}).refine((data) => Object.keys(data).length > 0, {
  message: "At least one field must be provided for update"
});
var collegeIdParamsSchema = import_zod7.z.object({
  id: import_zod7.z.string().cuid()
});
var listCollegesQuerySchema = import_zod7.z.object({
  page: import_zod7.z.coerce.number().int().min(1).default(1),
  pageSize: import_zod7.z.coerce.number().int().min(1).max(100).default(20)
});

// src/modules/colleges/colleges.routes.ts
function createCollegesRouter(controller, authenticate2) {
  const router = (0, import_express4.Router)();
  router.get(
    "/",
    validate({ query: listCollegesQuerySchema }),
    controller.list
  );
  router.get(
    "/:id",
    validate({ params: collegeIdParamsSchema }),
    controller.getById
  );
  router.get(
    "/:id/majors",
    validate({ params: collegeIdParamsSchema, query: listCollegesQuerySchema }),
    controller.listMajors
  );
  router.post(
    "/",
    authenticate2,
    requirePermission(PERMISSIONS.MAJORS_MANAGE),
    validate({ body: createCollegeSchema }),
    controller.create
  );
  router.patch(
    "/:id",
    authenticate2,
    requirePermission(PERMISSIONS.MAJORS_MANAGE),
    validate({ params: collegeIdParamsSchema, body: updateCollegeSchema }),
    controller.update
  );
  router.delete(
    "/:id",
    authenticate2,
    requirePermission(PERMISSIONS.MAJORS_MANAGE),
    validate({ params: collegeIdParamsSchema }),
    controller.delete
  );
  return router;
}

// src/modules/majors/majors.routes.ts
var import_express5 = require("express");

// src/modules/majors/majors.validation.ts
var import_zod8 = require("zod");
var createMajorSchema = import_zod8.z.object({
  slug: import_zod8.z.string().min(2).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: import_zod8.z.string().min(2).max(200),
  degree: import_zod8.z.string().min(2).max(100).optional(),
  isActive: import_zod8.z.boolean().optional(),
  collegeId: import_zod8.z.string().cuid().nullable().optional()
});
var updateMajorSchema = import_zod8.z.object({
  slug: import_zod8.z.string().min(2).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
  name: import_zod8.z.string().min(2).max(200).optional(),
  degree: import_zod8.z.string().min(2).max(100).optional(),
  isActive: import_zod8.z.boolean().optional(),
  collegeId: import_zod8.z.string().cuid().nullable().optional()
}).refine((data) => Object.keys(data).length > 0, {
  message: "At least one field must be provided for update"
});
var majorIdParamsSchema = import_zod8.z.object({
  id: import_zod8.z.string().cuid()
});
var majorSlugParamsSchema = import_zod8.z.object({
  slug: import_zod8.z.string().min(2).max(120)
});
var listMajorsQuerySchema = import_zod8.z.object({
  page: import_zod8.z.coerce.number().int().min(1).default(1),
  pageSize: import_zod8.z.coerce.number().int().min(1).max(100).default(20),
  search: import_zod8.z.string().max(100).optional(),
  collegeId: import_zod8.z.string().cuid().optional(),
  isActive: import_zod8.z.coerce.boolean().optional()
});
var deleteMajorSchema = import_zod8.z.object({
  reason: import_zod8.z.string().max(500).optional()
});

// src/modules/majors/majors.routes.ts
function createMajorsRouter(controller, authenticate2) {
  const router = (0, import_express5.Router)();
  router.get(
    "/",
    validate({ query: listMajorsQuerySchema }),
    controller.list.bind(controller)
  );
  router.get(
    "/slug/:slug",
    validate({ params: majorSlugParamsSchema }),
    controller.getBySlug.bind(controller)
  );
  router.get(
    "/:id",
    validate({ params: majorIdParamsSchema }),
    controller.getById.bind(controller)
  );
  router.post(
    "/",
    authenticate2,
    requireAnyPermission(PERMISSIONS.MAJORS_MANAGE),
    validate({ body: createMajorSchema }),
    controller.create.bind(controller)
  );
  router.patch(
    "/:id",
    authenticate2,
    requireAnyPermission(PERMISSIONS.MAJORS_MANAGE),
    validate({ params: majorIdParamsSchema, body: updateMajorSchema }),
    controller.update.bind(controller)
  );
  router.delete(
    "/:id",
    authenticate2,
    requireAnyPermission(PERMISSIONS.MAJORS_MANAGE),
    validate({ params: majorIdParamsSchema, body: deleteMajorSchema }),
    controller.delete.bind(controller)
  );
  return router;
}

// src/modules/scholarships/scholarships.routes.ts
var import_express6 = require("express");

// src/modules/scholarships/scholarships.validation.ts
var import_zod9 = require("zod");
var createScholarshipSchema = import_zod9.z.object({
  slug: import_zod9.z.string().min(2).max(100).regex(/^[a-z0-9-]+$/),
  name: import_zod9.z.string().min(2).max(200).trim(),
  startDate: import_zod9.z.coerce.date(),
  endDate: import_zod9.z.coerce.date(),
  isActive: import_zod9.z.boolean().optional()
});
var updateScholarshipSchema = import_zod9.z.object({
  slug: import_zod9.z.string().min(2).max(100).regex(/^[a-z0-9-]+$/).optional(),
  name: import_zod9.z.string().min(2).max(200).trim().optional(),
  startDate: import_zod9.z.coerce.date().optional(),
  endDate: import_zod9.z.coerce.date().optional(),
  isActive: import_zod9.z.boolean().optional()
});
var scholarshipIdParamsSchema = import_zod9.z.object({
  id: import_zod9.z.string().min(1)
});
var listScholarshipsQuerySchema = import_zod9.z.object({
  page: import_zod9.z.coerce.number().int().min(1).default(1),
  limit: import_zod9.z.coerce.number().int().min(1).max(100).default(20),
  search: import_zod9.z.string().optional()
});

// src/modules/scholarships/scholarships.routes.ts
function createScholarshipsRouter(controller, tokenService) {
  const router = (0, import_express6.Router)();
  const auth = authenticate(tokenService);
  router.get("/", validate({ query: listScholarshipsQuerySchema }), controller.list);
  router.get("/:id", validate({ params: scholarshipIdParamsSchema }), controller.getById);
  router.post("/", auth, requirePermission(PERMISSIONS.SCHOLARSHIPS_MANAGE), validate({ body: createScholarshipSchema }), controller.create);
  router.patch("/:id", auth, requirePermission(PERMISSIONS.SCHOLARSHIPS_MANAGE), validate({ params: scholarshipIdParamsSchema, body: updateScholarshipSchema }), controller.update);
  router.delete("/:id", auth, requirePermission(PERMISSIONS.SCHOLARSHIPS_MANAGE), validate({ params: scholarshipIdParamsSchema }), controller.delete);
  return router;
}

// src/modules/content/content.routes.ts
var import_express7 = require("express");
function createContentRouter(contentController, authenticate2) {
  const router = (0, import_express7.Router)();
  router.get("/:entityType/:entityId/sections", contentController.getSections);
  router.get("/:entityType/:entityId/faqs", contentController.getFaqs);
  if (authenticate2) {
    router.post("/:entityType/:entityId/sections", authenticate2, contentController.addSection);
    router.post("/:entityType/:entityId/faqs", authenticate2, contentController.addFaq);
    router.patch("/sections/:id", authenticate2, contentController.updateSection);
    router.delete("/sections/:id", authenticate2, contentController.deleteSection);
    router.patch("/faqs/:id", authenticate2, contentController.updateFaq);
    router.delete("/faqs/:id", authenticate2, contentController.deleteFaq);
  }
  return router;
}

// src/modules/deleted-items/deleted-items.routes.ts
var import_express8 = require("express");

// src/modules/deleted-items/deleted-items.validation.ts
var import_zod10 = require("zod");
var import_client11 = require("@prisma/client");
var queueQuerySchema = import_zod10.z.object({
  page: import_zod10.z.coerce.number().int().min(1).default(1),
  limit: import_zod10.z.coerce.number().int().min(1).max(100).default(20),
  entityType: import_zod10.z.nativeEnum(import_client11.AuditEntityType).optional()
});
var deletedItemParamsSchema = import_zod10.z.object({
  entityType: import_zod10.z.nativeEnum(import_client11.AuditEntityType),
  entityId: import_zod10.z.string().min(1)
});
var permanentDeleteBodySchema = import_zod10.z.object({
  confirm: import_zod10.z.literal(true, { errorMap: () => ({ message: "Must confirm permanent deletion" }) })
});

// src/modules/deleted-items/deleted-items.routes.ts
function createDeletedItemsRouter(controller, tokenService) {
  const router = (0, import_express8.Router)();
  const auth = authenticate(tokenService);
  router.get(
    "/",
    auth,
    requirePermission(PERMISSIONS.MAJORS_MANAGE),
    validate({ query: queueQuerySchema }),
    controller.list
  );
  router.post(
    "/:entityType/:entityId/restore",
    auth,
    requirePermission(PERMISSIONS.MAJORS_MANAGE),
    validate({ params: deletedItemParamsSchema }),
    controller.restore
  );
  router.delete(
    "/:entityType/:entityId",
    auth,
    requirePermission(PERMISSIONS.MAJORS_MANAGE),
    validate({ params: deletedItemParamsSchema, body: permanentDeleteBodySchema }),
    controller.permanentDelete
  );
  return router;
}

// src/modules/search/search.routes.ts
var import_express9 = require("express");

// src/modules/search/search.validation.ts
var import_zod11 = require("zod");
var searchQuerySchema = import_zod11.z.object({
  q: import_zod11.z.string().min(1, "Search term is required").max(200),
  types: import_zod11.z.string().optional().transform(
    (val) => val ? val.split(",").map((t) => t.trim()) : void 0
  ),
  page: import_zod11.z.coerce.number().int().min(1).default(1),
  pageSize: import_zod11.z.coerce.number().int().min(1).max(50).default(20)
});

// src/modules/search/search.routes.ts
function createSearchRouter(controller) {
  const router = (0, import_express9.Router)();
  router.get("/", validate({ query: searchQuerySchema }), controller.search);
  return router;
}

// src/modules/files/files.routes.ts
var import_express10 = require("express");

// src/shared/soft-delete/delete-reason.schema.ts
var import_zod12 = require("zod");
var deleteReasonBodySchema = import_zod12.z.object({
  reason: import_zod12.z.string().max(2e3).optional()
});

// src/modules/files/files.validation.ts
var import_zod13 = require("zod");
var import_client12 = require("@prisma/client");
var uploadFileSchema = import_zod13.z.object({
  title: import_zod13.z.string().min(1).max(200),
  description: import_zod13.z.string().max(2e3).nullish().transform((v) => v ?? null),
  type: import_zod13.z.nativeEnum(import_client12.FileType),
  ownerType: import_zod13.z.nativeEnum(import_client12.FileOwnerType),
  ownerId: import_zod13.z.string().min(1)
});
var uploadFileMetaSchema = uploadFileSchema;
var fileIdParamsSchema = import_zod13.z.object({
  fileId: import_zod13.z.string().min(1)
});
var fileOwnerParamsSchema = import_zod13.z.object({
  ownerType: import_zod13.z.nativeEnum(import_client12.FileOwnerType),
  ownerId: import_zod13.z.string().min(1)
});
var listFilesQuerySchema = import_zod13.z.object({
  ownerType: import_zod13.z.nativeEnum(import_client12.FileOwnerType).optional(),
  ownerId: import_zod13.z.string().optional(),
  status: import_zod13.z.nativeEnum(import_client12.FileStatus).optional(),
  type: import_zod13.z.nativeEnum(import_client12.FileType).optional(),
  uploadedById: import_zod13.z.string().optional(),
  page: import_zod13.z.coerce.number().int().min(1).default(1),
  pageSize: import_zod13.z.coerce.number().int().min(1).max(100).default(20)
});

// src/modules/files/files.routes.ts
function createFilesRouter(controller, authenticate2, uploadMiddleware) {
  const router = (0, import_express10.Router)();
  router.get("/owner/:ownerType/:ownerId/approved", controller.getApprovedByOwner.bind(controller));
  router.post(
    "/",
    authenticate2,
    requirePermission("files:upload"),
    uploadMiddleware,
    validate({ body: uploadFileMetaSchema }),
    controller.upload.bind(controller)
  );
  router.get(
    "/",
    authenticate2,
    requirePermission("files:read"),
    validate({ query: listFilesQuerySchema }),
    controller.list.bind(controller)
  );
  router.get(
    "/owner/:ownerType/:ownerId",
    authenticate2,
    requirePermission("files:read"),
    controller.getByOwner.bind(controller)
  );
  router.get(
    "/:fileId/download",
    authenticate2,
    requirePermission("files:read"),
    validate({ params: fileIdParamsSchema }),
    controller.download.bind(controller)
  );
  router.get(
    "/:fileId",
    authenticate2,
    requirePermission("files:read"),
    validate({ params: fileIdParamsSchema }),
    controller.getById.bind(controller)
  );
  router.delete(
    "/:fileId",
    authenticate2,
    requireAnyPermission("files:manage"),
    validate({ params: fileIdParamsSchema, body: deleteReasonBodySchema }),
    controller.remove.bind(controller)
  );
  return router;
}

// src/infrastructure/http/middlewares/upload.middleware.ts
var import_multer = __toESM(require("multer"), 1);
function createUploadMiddleware(maxFileSizeMb) {
  const upload = (0, import_multer.default)({
    storage: import_multer.default.memoryStorage(),
    limits: {
      fileSize: maxFileSizeMb * 1024 * 1024,
      files: 1
    },
    fileFilter: (_req, file, cb) => {
      const ext = safeExtension(file.originalname);
      if (!ext) {
        cb(new BadRequestError("Unsupported file type, double extension, or unsafe filename"));
        return;
      }
      if (!isAllowedType(ext, file.mimetype)) {
        cb(new BadRequestError(`File content (${file.mimetype}) does not match .${ext}`));
        return;
      }
      cb(null, true);
    }
  }).single("file");
  return (req, res, next) => {
    upload(req, res, (err) => {
      if (err) {
        next(normalizeUploadError(err));
        return;
      }
      if (!req.file) {
        next(new BadRequestError('No file uploaded (expected multipart field "file")'));
        return;
      }
      next();
    });
  };
}
function normalizeUploadError(err) {
  if (err instanceof BadRequestError) return err;
  if (err instanceof import_multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") return new BadRequestError("File exceeds the maximum allowed size");
    if (err.code === "LIMIT_FILE_COUNT") return new BadRequestError("Only one file may be uploaded");
    return new BadRequestError(`Upload error: ${err.message}`);
  }
  return err instanceof Error ? err : new BadRequestError("Upload failed");
}

// src/modules/reviews/reviews.routes.ts
var import_express11 = require("express");

// src/modules/reviews/reviews.validation.ts
var import_client13 = require("@prisma/client");
var import_zod14 = require("zod");
var fileReviewParamsSchema = import_zod14.z.object({
  fileId: import_zod14.z.string().cuid()
});
var createReviewSchema = import_zod14.z.object({
  /** Field is `action`, NOT `decision`. Uses z.nativeEnum, NOT z.enum([...]). */
  action: import_zod14.z.nativeEnum(import_client13.ReviewAction),
  comment: import_zod14.z.string().min(1).max(2e3).optional()
});

// src/modules/reviews/reviews.routes.ts
function createReviewsRouter(controller, authenticate2) {
  const router = (0, import_express11.Router)({ mergeParams: true });
  router.post(
    "/",
    authenticate2,
    requirePermission(PERMISSIONS.FILES_REVIEW),
    validate({ params: fileReviewParamsSchema, body: createReviewSchema }),
    controller.submit
  );
  router.post(
    "/approve",
    authenticate2,
    requirePermission(PERMISSIONS.FILES_REVIEW),
    (req, _res, next) => {
      req.body = { action: "APPROVE", comment: req.body?.comment ?? req.body?.reason };
      next();
    },
    validate({ params: fileReviewParamsSchema, body: createReviewSchema }),
    controller.submit
  );
  router.post(
    "/reject",
    authenticate2,
    requirePermission(PERMISSIONS.FILES_REVIEW),
    (req, _res, next) => {
      req.body = { action: "REJECT", comment: req.body?.comment ?? req.body?.reason };
      next();
    },
    validate({ params: fileReviewParamsSchema, body: createReviewSchema }),
    controller.submit
  );
  router.get(
    "/",
    authenticate2,
    requirePermission(PERMISSIONS.FILES_READ),
    validate({ params: fileReviewParamsSchema }),
    controller.list
  );
  return router;
}

// src/modules/contact/contact.routes.ts
var import_express12 = require("express");

// src/modules/contact/contact.validation.ts
var import_zod15 = require("zod");
var submitContactSchema = import_zod15.z.object({
  name: import_zod15.z.string().min(2).max(100),
  email: import_zod15.z.string().email(),
  subject: import_zod15.z.string().min(3).max(200),
  body: import_zod15.z.string().min(10).max(5e3)
});
var contactIdParamsSchema = import_zod15.z.object({
  id: import_zod15.z.string().cuid()
});
var listContactQuerySchema = import_zod15.z.object({
  page: import_zod15.z.coerce.number().int().min(1).default(1),
  pageSize: import_zod15.z.coerce.number().int().min(1).max(100).default(20),
  search: import_zod15.z.string().max(100).optional()
});

// src/modules/contact/contact.routes.ts
function createContactRouter(controller, authenticate2) {
  const router = (0, import_express12.Router)();
  router.post(
    "/",
    validate({ body: submitContactSchema }),
    controller.submit
  );
  router.get(
    "/",
    authenticate2,
    requireAnyPermission(PERMISSIONS.CONTACT_MANAGE),
    validate({ query: listContactQuerySchema }),
    controller.list
  );
  router.get(
    "/:id",
    authenticate2,
    requireAnyPermission(PERMISSIONS.CONTACT_MANAGE),
    validate({ params: contactIdParamsSchema }),
    controller.getById
  );
  router.patch(
    "/:id/handle",
    authenticate2,
    requireAnyPermission(PERMISSIONS.CONTACT_MANAGE),
    validate({ params: contactIdParamsSchema }),
    controller.markHandled
  );
  router.delete(
    "/:id",
    authenticate2,
    requireAnyPermission(PERMISSIONS.CONTACT_MANAGE),
    validate({ params: contactIdParamsSchema }),
    controller.delete
  );
  return router;
}

// src/modules/notifications/notifications.routes.ts
var import_express13 = require("express");

// src/modules/notifications/notifications.validation.ts
var import_zod16 = require("zod");
var import_client14 = require("@prisma/client");
var listNotificationsQuerySchema = import_zod16.z.object({
  page: import_zod16.z.coerce.number().int().min(1).default(1),
  pageSize: import_zod16.z.coerce.number().int().min(1).max(100).default(20)
});
var notificationIdParamsSchema = import_zod16.z.object({
  id: import_zod16.z.string().cuid()
});
var createAnnouncementSchema = import_zod16.z.object({
  title: import_zod16.z.string().min(1).max(200),
  message: import_zod16.z.string().min(1).max(5e3),
  targetRole: import_zod16.z.nativeEnum(import_client14.RoleName).optional()
});

// src/modules/notifications/notifications.routes.ts
function createNotificationsRouter(controller, authenticate2) {
  const router = (0, import_express13.Router)();
  router.get(
    "/",
    authenticate2,
    validate({ query: listNotificationsQuerySchema }),
    controller.list
  );
  router.get(
    "/unread-count",
    authenticate2,
    controller.getUnreadCount
  );
  router.patch(
    "/read-all",
    authenticate2,
    controller.markAllRead
  );
  router.patch(
    "/:id/read",
    authenticate2,
    validate({ params: notificationIdParamsSchema }),
    controller.markRead
  );
  router.post(
    "/",
    authenticate2,
    requireRole("ADMIN", "SUPER_ADMIN"),
    validate({ body: createAnnouncementSchema }),
    controller.createAnnouncement
  );
  return router;
}

// src/modules/audit/audit.routes.ts
var import_express14 = require("express");

// src/modules/audit/audit.validation.ts
var import_zod17 = require("zod");
var import_client15 = require("@prisma/client");
var listAuditQuerySchema = import_zod17.z.object({
  entityType: import_zod17.z.nativeEnum(import_client15.AuditEntityType).optional(),
  entityId: import_zod17.z.string().cuid().optional(),
  action: import_zod17.z.nativeEnum(import_client15.AuditAction).optional(),
  userId: import_zod17.z.string().cuid().optional(),
  page: import_zod17.z.coerce.number().int().min(1).default(1),
  pageSize: import_zod17.z.coerce.number().int().min(1).max(100).default(20)
});

// src/modules/audit/audit.routes.ts
function createAuditRouter(controller, authenticate2) {
  const router = (0, import_express14.Router)();
  router.get(
    "/",
    authenticate2,
    requireRole("ADMIN", "SUPER_ADMIN"),
    validate({ query: listAuditQuerySchema }),
    controller.list
  );
  return router;
}

// src/modules/courses/courses.routes.ts
var import_express15 = require("express");
function createCoursesRouter(controller, authenticate2) {
  const router = (0, import_express15.Router)();
  const auth = authenticate2;
  router.get("/majors/:majorId/courses", controller.getByMajor.bind(controller));
  router.post(
    "/majors/:majorId/courses",
    auth,
    requirePermission(PERMISSIONS.MAJORS_MANAGE),
    controller.create.bind(controller)
  );
  router.patch(
    "/courses/:id",
    auth,
    requirePermission(PERMISSIONS.MAJORS_MANAGE),
    controller.update.bind(controller)
  );
  router.delete(
    "/courses/:id",
    auth,
    requirePermission(PERMISSIONS.MAJORS_MANAGE),
    controller.delete.bind(controller)
  );
  router.get(
    "/courses/:id/moderators",
    auth,
    requirePermission(PERMISSIONS.MODERATORS_MANAGE),
    controller.getModeratorsList.bind(controller)
  );
  router.post(
    "/courses/:id/moderators/:userId",
    auth,
    requirePermission(PERMISSIONS.MODERATORS_MANAGE),
    controller.assignModerator.bind(controller)
  );
  router.delete(
    "/courses/:id/moderators/:userId",
    auth,
    requirePermission(PERMISSIONS.MODERATORS_MANAGE),
    controller.revokeModerator.bind(controller)
  );
  return router;
}

// src/modules/moderators/moderators.routes.ts
var import_express16 = require("express");
function createModeratorsRouter(controller, authenticate2) {
  const router = (0, import_express16.Router)();
  const auth = authenticate2;
  router.get(
    "/",
    auth,
    requirePermission(PERMISSIONS.MODERATORS_MANAGE),
    controller.listModerators
  );
  router.get(
    "/majors",
    auth,
    requirePermission(PERMISSIONS.MODERATORS_MANAGE),
    controller.listMajors
  );
  router.get(
    "/scholarships",
    auth,
    requirePermission(PERMISSIONS.MODERATORS_MANAGE),
    controller.listScholarships
  );
  router.get(
    "/courses",
    auth,
    requirePermission(PERMISSIONS.MODERATORS_MANAGE),
    controller.listCourses
  );
  router.get(
    "/major/:majorId",
    auth,
    requirePermission(PERMISSIONS.MODERATORS_MANAGE),
    controller.getMajorModerators
  );
  router.post(
    "/major/:majorId/user/:userId",
    auth,
    requirePermission(PERMISSIONS.MODERATORS_MANAGE),
    controller.assignMajorModerator
  );
  router.delete(
    "/major/:majorId/user/:userId",
    auth,
    requirePermission(PERMISSIONS.MODERATORS_MANAGE),
    controller.removeMajorModerator
  );
  router.get(
    "/scholarship/:scholarshipId",
    auth,
    requirePermission(PERMISSIONS.MODERATORS_MANAGE),
    controller.getScholarshipModerators
  );
  router.post(
    "/scholarship/:scholarshipId/user/:userId",
    auth,
    requirePermission(PERMISSIONS.MODERATORS_MANAGE),
    controller.assignScholarshipModerator
  );
  router.delete(
    "/scholarship/:scholarshipId/user/:userId",
    auth,
    requirePermission(PERMISSIONS.MODERATORS_MANAGE),
    controller.removeScholarshipModerator
  );
  router.get(
    "/course/:courseId",
    auth,
    requirePermission(PERMISSIONS.MODERATORS_MANAGE),
    controller.getCourseModerators
  );
  router.post(
    "/course/:courseId/user/:userId",
    auth,
    requirePermission(PERMISSIONS.MODERATORS_MANAGE),
    controller.assignCourseModerator
  );
  router.delete(
    "/course/:courseId/user/:userId",
    auth,
    requirePermission(PERMISSIONS.MODERATORS_MANAGE),
    controller.removeCourseModerator
  );
  return router;
}

// src/routes.ts
function createApiRouter(container) {
  const router = (0, import_express17.Router)();
  const authMiddleware = authenticate(container.tokenService);
  const uploadMiddleware = createUploadMiddleware(Number(env.MAX_FILE_SIZE_MB));
  router.use("/auth", createAuthRouter(container.authController, authMiddleware));
  router.use("/search", createSearchRouter(container.searchController));
  router.use("/users", createUsersRouter(container.usersController, container.tokenService));
  router.use("/roles", createRolesRouter(container.rolesController, container.tokenService));
  router.use(
    "/scholarships",
    createScholarshipsRouter(container.scholarshipsController, container.tokenService)
  );
  router.use(
    "/deleted-items",
    createDeletedItemsRouter(container.deletedItemsController, container.tokenService)
  );
  router.use("/majors", createMajorsRouter(container.majorsController, authMiddleware));
  router.use("/colleges", createCollegesRouter(container.collegesController, authMiddleware));
  router.use("/content", createContentRouter(container.contentController, authMiddleware));
  router.use(
    "/files",
    createFilesRouter(container.filesController, authMiddleware, uploadMiddleware)
  );
  router.use(
    "/files/:fileId/reviews",
    createReviewsRouter(container.reviewsController, container.authenticate)
  );
  router.use("/contact", createContactRouter(container.contactController, authMiddleware));
  router.use(
    "/notifications",
    createNotificationsRouter(container.notificationsController, authMiddleware)
  );
  router.use("/audit-logs", createAuditRouter(container.auditController, authMiddleware));
  router.use(createCoursesRouter(container.coursesController, authMiddleware));
  router.use(
    "/moderators",
    createModeratorsRouter(container.moderatorsController, container.authenticate)
  );
  return router;
}

// src/infrastructure/http/middlewares/error.middleware.ts
var import_client16 = require("@prisma/client");
function notFoundHandler(req, res) {
  const body = {
    success: false,
    error: { code: "NOT_FOUND", message: `Route not found: ${req.method} ${req.originalUrl}` }
  };
  res.status(404).json(body);
}
function errorHandler(err, _req, res, _next) {
  const mapped = mapError(err);
  if (mapped.statusCode >= 500) {
    logger.error({ err }, "Unhandled error");
  } else {
    logger.warn({ code: mapped.code, message: mapped.message }, "Handled error");
  }
  const body = {
    success: false,
    error: {
      code: mapped.code,
      message: mapped.message,
      ...mapped.details !== void 0 ? { details: mapped.details } : {}
    }
  };
  res.status(mapped.statusCode).json(body);
}
function mapError(err) {
  if (err instanceof AppError) {
    return {
      statusCode: err.statusCode,
      code: err.code,
      message: err.message,
      details: err.details
    };
  }
  if (err instanceof import_client16.Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002":
        return { statusCode: 409, code: "CONFLICT", message: "Unique constraint violation" };
      case "P2025":
        return { statusCode: 404, code: "NOT_FOUND", message: "Record not found" };
      case "P2003":
        return { statusCode: 400, code: "BAD_REQUEST", message: "Foreign key constraint failed" };
      default:
        return { statusCode: 400, code: "DB_ERROR", message: "Database request error" };
    }
  }
  return {
    statusCode: 500,
    code: "INTERNAL_ERROR",
    message: isProduction ? "Internal server error" : err instanceof Error ? err.message : "Internal server error"
  };
}

// src/app.ts
function createApp(container) {
  const app2 = (0, import_express18.default)();
  app2.use((0, import_cors.default)({ origin: env.CORS_ORIGIN }));
  app2.use(import_express18.default.json());
  app2.use(import_express18.default.urlencoded({ extended: true }));
  app2.get("/health", (_req, res) => {
    res.json({ success: true, data: { status: "ok" } });
  });
  const resolved = container ?? buildContainer();
  app2.use(env.API_PREFIX, createApiRouter(resolved));
  app2.use(notFoundHandler);
  app2.use(errorHandler);
  return app2;
}

// api/index.ts
var app = createApp();
var handler = (req, res, next) => {
  app(req, res, next);
};
var index_default = handler;
