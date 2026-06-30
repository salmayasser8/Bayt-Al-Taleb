--
-- PostgreSQL database dump
--

\restrict zTfwSYzbaTnfPfp1hhFeE7ELAtthNolP5hF6mWedSEekQUpuFshO5CYE4H6NdgL

-- Dumped from database version 16.14
-- Dumped by pg_dump version 16.14

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- Name: AuditAction; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AuditAction" AS ENUM (
    'CREATE',
    'UPDATE',
    'DELETE',
    'RESTORE',
    'APPROVE',
    'REJECT'
);


ALTER TYPE public."AuditAction" OWNER TO postgres;

--
-- Name: AuditEntityType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AuditEntityType" AS ENUM (
    'MAJOR',
    'SCHOLARSHIP',
    'FILE',
    'SECTION',
    'FAQ'
);


ALTER TYPE public."AuditEntityType" OWNER TO postgres;

--
-- Name: ContentEntityType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ContentEntityType" AS ENUM (
    'MAJOR',
    'SCHOLARSHIP'
);


ALTER TYPE public."ContentEntityType" OWNER TO postgres;

--
-- Name: FileOwnerType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."FileOwnerType" AS ENUM (
    'MAJOR',
    'SCHOLARSHIP'
);


ALTER TYPE public."FileOwnerType" OWNER TO postgres;

--
-- Name: FileStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."FileStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);


ALTER TYPE public."FileStatus" OWNER TO postgres;

--
-- Name: FileType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."FileType" AS ENUM (
    'SUMMARY',
    'PREVIOUS_EXAM',
    'SYLLABUS',
    'OTHER'
);


ALTER TYPE public."FileType" OWNER TO postgres;

--
-- Name: ReviewAction; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ReviewAction" AS ENUM (
    'APPROVE',
    'REJECT'
);


ALTER TYPE public."ReviewAction" OWNER TO postgres;

--
-- Name: RoleName; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."RoleName" AS ENUM (
    'SUPER_ADMIN',
    'ADMIN',
    'MODERATOR',
    'MEMBER',
    'VISITOR'
);


ALTER TYPE public."RoleName" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _MajorModerators; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."_MajorModerators" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_MajorModerators" OWNER TO postgres;

--
-- Name: _ScholarshipModerators; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."_ScholarshipModerators" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_ScholarshipModerators" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id text NOT NULL,
    "userId" text NOT NULL,
    action public."AuditAction" NOT NULL,
    "entityType" public."AuditEntityType" NOT NULL,
    "entityId" text NOT NULL,
    reason text,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- Name: colleges; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.colleges (
    id text NOT NULL,
    slug text NOT NULL,
    name text NOT NULL,
    description text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.colleges OWNER TO postgres;

--
-- Name: contact_messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contact_messages (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    subject text NOT NULL,
    message text NOT NULL,
    "isHandled" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.contact_messages OWNER TO postgres;

--
-- Name: faqs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.faqs (
    id text NOT NULL,
    "entityType" public."ContentEntityType" NOT NULL,
    "entityId" text NOT NULL,
    question text NOT NULL,
    answer text NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "deletedById" text,
    "deleteReason" text
);


ALTER TABLE public.faqs OWNER TO postgres;

--
-- Name: file_reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.file_reviews (
    id text NOT NULL,
    "fileId" text NOT NULL,
    "reviewerId" text NOT NULL,
    action public."ReviewAction" NOT NULL,
    comment text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.file_reviews OWNER TO postgres;

--
-- Name: files; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.files (
    id text NOT NULL,
    title text NOT NULL,
    description text,
    type public."FileType" NOT NULL,
    status public."FileStatus" DEFAULT 'PENDING'::public."FileStatus" NOT NULL,
    "storageKey" text NOT NULL,
    "mimeType" text,
    "sizeBytes" integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "ownerType" public."FileOwnerType" NOT NULL,
    "ownerId" text NOT NULL,
    "uploadedById" text NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "deletedById" text,
    "deleteReason" text
);


ALTER TABLE public.files OWNER TO postgres;

--
-- Name: majors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.majors (
    id text NOT NULL,
    slug text NOT NULL,
    name text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "collegeId" text,
    "deletedAt" timestamp(3) without time zone,
    "deletedById" text,
    "deleteReason" text
);


ALTER TABLE public.majors OWNER TO postgres;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id text NOT NULL,
    "userId" text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    "isRead" boolean DEFAULT false NOT NULL,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permissions (
    id text NOT NULL,
    key text NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.permissions OWNER TO postgres;

--
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.refresh_tokens (
    id text NOT NULL,
    "userId" text NOT NULL,
    "tokenHash" text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "revokedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.refresh_tokens OWNER TO postgres;

--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role_permissions (
    "roleId" text NOT NULL,
    "permissionId" text NOT NULL
);


ALTER TABLE public.role_permissions OWNER TO postgres;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id text NOT NULL,
    name public."RoleName" NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: scholarships; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.scholarships (
    id text NOT NULL,
    slug text NOT NULL,
    name text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "deletedById" text,
    "deleteReason" text
);


ALTER TABLE public.scholarships OWNER TO postgres;

--
-- Name: sections; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sections (
    id text NOT NULL,
    "entityType" public."ContentEntityType" NOT NULL,
    "entityId" text NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "deletedById" text,
    "deleteReason" text
);


ALTER TABLE public.sections OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id text NOT NULL,
    email text NOT NULL,
    "passwordHash" text NOT NULL,
    "fullName" text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "roleId" text NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Data for Name: _MajorModerators; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."_MajorModerators" ("A", "B") FROM stdin;
\.


--
-- Data for Name: _ScholarshipModerators; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."_ScholarshipModerators" ("A", "B") FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
55d810ec-58d6-40f7-8078-ea98e43b5941	0fce0a4dfa97f3e2a33befed12c90bf59236e014bc188ae3d1c693d93cda44d3	2026-06-29 13:31:07.637217+03	20260612133718_init	\N	\N	2026-06-29 13:31:07.392424+03	1
bf3270d3-9bef-4a95-ab78-0d61278945ff	1ddd0f1cfc4bbe0b83c2c596f6979fb9c096cd22585248afca9efb11ddd5bcb8	2026-06-29 13:31:07.647329+03	20260623100618_init	\N	\N	2026-06-29 13:31:07.637894+03	1
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, "userId", action, "entityType", "entityId", reason, metadata, "createdAt") FROM stdin;
\.


--
-- Data for Name: colleges; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.colleges (id, slug, name, description, "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: contact_messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.contact_messages (id, name, email, subject, message, "isHandled", "createdAt") FROM stdin;
\.


--
-- Data for Name: faqs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.faqs (id, "entityType", "entityId", question, answer, "sortOrder", "createdAt", "updatedAt", "deletedAt", "deletedById", "deleteReason") FROM stdin;
\.


--
-- Data for Name: file_reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.file_reviews (id, "fileId", "reviewerId", action, comment, "createdAt") FROM stdin;
\.


--
-- Data for Name: files; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.files (id, title, description, type, status, "storageKey", "mimeType", "sizeBytes", "createdAt", "updatedAt", "ownerType", "ownerId", "uploadedById", "deletedAt", "deletedById", "deleteReason") FROM stdin;
\.


--
-- Data for Name: majors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.majors (id, slug, name, "isActive", "createdAt", "updatedAt", "collegeId", "deletedAt", "deletedById", "deleteReason") FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, "userId", title, message, "isRead", metadata, "createdAt") FROM stdin;
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.permissions (id, key, description, "createdAt") FROM stdin;
cmqz2ux550000t3a46j91n08t	users:read	\N	2026-06-29 10:31:08.873
cmqz2ux5e0001t3a4x1ehugva	users:manage	\N	2026-06-29 10:31:08.882
cmqz2ux5g0002t3a4lhx8hju7	roles:read	\N	2026-06-29 10:31:08.885
cmqz2ux5j0003t3a431lx76sh	roles:assign	\N	2026-06-29 10:31:08.887
cmqz2ux5l0004t3a4u4hwl6fd	moderators:manage	\N	2026-06-29 10:31:08.89
cmqz2ux5o0005t3a4fj9yw983	majors:read	\N	2026-06-29 10:31:08.892
cmqz2ux5q0006t3a4hhufsaza	majors:manage	\N	2026-06-29 10:31:08.894
cmqz2ux5s0007t3a48drcpg7z	scholarships:read	\N	2026-06-29 10:31:08.896
cmqz2ux5v0008t3a4ftgz38nm	scholarships:manage	\N	2026-06-29 10:31:08.899
cmqz2ux5x0009t3a4u4s21mvh	content:manage	\N	2026-06-29 10:31:08.902
cmqz2ux5z000at3a4gssaskcj	files:read	\N	2026-06-29 10:31:08.904
cmqz2ux62000bt3a4f27iws6w	files:upload	\N	2026-06-29 10:31:08.906
cmqz2ux64000ct3a4yy9q7sc2	files:manage	\N	2026-06-29 10:31:08.909
cmqz2ux67000dt3a4r4a0i1wj	files:review	\N	2026-06-29 10:31:08.911
cmqz2ux69000et3a4sjw0n6dy	contact:submit	\N	2026-06-29 10:31:08.913
cmqz2ux6b000ft3a4llpw2ji9	contact:manage	\N	2026-06-29 10:31:08.915
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.refresh_tokens (id, "userId", "tokenHash", "expiresAt", "revokedAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.role_permissions ("roleId", "permissionId") FROM stdin;
cmqz2ux6d000gt3a45vzw96uj	cmqz2ux550000t3a46j91n08t
cmqz2ux6d000gt3a45vzw96uj	cmqz2ux5e0001t3a4x1ehugva
cmqz2ux6d000gt3a45vzw96uj	cmqz2ux5g0002t3a4lhx8hju7
cmqz2ux6d000gt3a45vzw96uj	cmqz2ux5j0003t3a431lx76sh
cmqz2ux6d000gt3a45vzw96uj	cmqz2ux5l0004t3a4u4hwl6fd
cmqz2ux6d000gt3a45vzw96uj	cmqz2ux5o0005t3a4fj9yw983
cmqz2ux6d000gt3a45vzw96uj	cmqz2ux5q0006t3a4hhufsaza
cmqz2ux6d000gt3a45vzw96uj	cmqz2ux5s0007t3a48drcpg7z
cmqz2ux6d000gt3a45vzw96uj	cmqz2ux5v0008t3a4ftgz38nm
cmqz2ux6d000gt3a45vzw96uj	cmqz2ux5x0009t3a4u4s21mvh
cmqz2ux6d000gt3a45vzw96uj	cmqz2ux5z000at3a4gssaskcj
cmqz2ux6d000gt3a45vzw96uj	cmqz2ux62000bt3a4f27iws6w
cmqz2ux6d000gt3a45vzw96uj	cmqz2ux64000ct3a4yy9q7sc2
cmqz2ux6d000gt3a45vzw96uj	cmqz2ux67000dt3a4r4a0i1wj
cmqz2ux6d000gt3a45vzw96uj	cmqz2ux69000et3a4sjw0n6dy
cmqz2ux6d000gt3a45vzw96uj	cmqz2ux6b000ft3a4llpw2ji9
cmqz2ux81000ht3a44p0dh4qf	cmqz2ux550000t3a46j91n08t
cmqz2ux81000ht3a44p0dh4qf	cmqz2ux5l0004t3a4u4hwl6fd
cmqz2ux81000ht3a44p0dh4qf	cmqz2ux5o0005t3a4fj9yw983
cmqz2ux81000ht3a44p0dh4qf	cmqz2ux5q0006t3a4hhufsaza
cmqz2ux81000ht3a44p0dh4qf	cmqz2ux5s0007t3a48drcpg7z
cmqz2ux81000ht3a44p0dh4qf	cmqz2ux5v0008t3a4ftgz38nm
cmqz2ux81000ht3a44p0dh4qf	cmqz2ux5x0009t3a4u4s21mvh
cmqz2ux81000ht3a44p0dh4qf	cmqz2ux5z000at3a4gssaskcj
cmqz2ux81000ht3a44p0dh4qf	cmqz2ux64000ct3a4yy9q7sc2
cmqz2ux81000ht3a44p0dh4qf	cmqz2ux6b000ft3a4llpw2ji9
cmqz2ux8y000it3a4olfcw91e	cmqz2ux5o0005t3a4fj9yw983
cmqz2ux8y000it3a4olfcw91e	cmqz2ux5q0006t3a4hhufsaza
cmqz2ux8y000it3a4olfcw91e	cmqz2ux5s0007t3a48drcpg7z
cmqz2ux8y000it3a4olfcw91e	cmqz2ux5v0008t3a4ftgz38nm
cmqz2ux8y000it3a4olfcw91e	cmqz2ux5x0009t3a4u4s21mvh
cmqz2ux8y000it3a4olfcw91e	cmqz2ux5z000at3a4gssaskcj
cmqz2ux8y000it3a4olfcw91e	cmqz2ux67000dt3a4r4a0i1wj
cmqz2ux9m000jt3a4ajat4kmu	cmqz2ux5o0005t3a4fj9yw983
cmqz2ux9m000jt3a4ajat4kmu	cmqz2ux5s0007t3a48drcpg7z
cmqz2ux9m000jt3a4ajat4kmu	cmqz2ux5z000at3a4gssaskcj
cmqz2ux9m000jt3a4ajat4kmu	cmqz2ux62000bt3a4f27iws6w
cmqz2ux9m000jt3a4ajat4kmu	cmqz2ux69000et3a4sjw0n6dy
cmqz2uxa3000kt3a4sngyrhtt	cmqz2ux5o0005t3a4fj9yw983
cmqz2uxa3000kt3a4sngyrhtt	cmqz2ux5s0007t3a48drcpg7z
cmqz2uxa3000kt3a4sngyrhtt	cmqz2ux5z000at3a4gssaskcj
cmqz2uxa3000kt3a4sngyrhtt	cmqz2ux69000et3a4sjw0n6dy
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, name, description, "createdAt", "updatedAt") FROM stdin;
cmqz2ux6d000gt3a45vzw96uj	SUPER_ADMIN	\N	2026-06-29 10:31:08.917	2026-06-29 10:31:08.917
cmqz2ux81000ht3a44p0dh4qf	ADMIN	\N	2026-06-29 10:31:08.977	2026-06-29 10:31:08.977
cmqz2ux8y000it3a4olfcw91e	MODERATOR	\N	2026-06-29 10:31:09.01	2026-06-29 10:31:09.01
cmqz2ux9m000jt3a4ajat4kmu	MEMBER	\N	2026-06-29 10:31:09.034	2026-06-29 10:31:09.034
cmqz2uxa3000kt3a4sngyrhtt	VISITOR	\N	2026-06-29 10:31:09.052	2026-06-29 10:31:09.052
\.


--
-- Data for Name: scholarships; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.scholarships (id, slug, name, "isActive", "createdAt", "updatedAt", "deletedAt", "deletedById", "deleteReason") FROM stdin;
\.


--
-- Data for Name: sections; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sections (id, "entityType", "entityId", title, content, "sortOrder", "createdAt", "updatedAt", "deletedAt", "deletedById", "deleteReason") FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, "passwordHash", "fullName", "isActive", "createdAt", "updatedAt", "roleId") FROM stdin;
cmqz2uxoz000mt3a44te3rei6	superadmin@bayt.com	$2a$12$ns/8ZGfZiEogrokGQglpsOhwKFOSyfqbGRReS7UG2BxMR1svoB.82	Super Admin	t	2026-06-29 10:31:09.587	2026-06-29 10:31:09.587	cmqz2ux6d000gt3a45vzw96uj
cmqz2uy30000ot3a4bvjgbw2d	admin@bayt.com	$2a$12$tqltfTSFip4/EpVRqKu3LueqpSXdW3MIW7qRthCDJrnzH.s3HHZjS	Admin	t	2026-06-29 10:31:10.092	2026-06-29 10:31:10.092	cmqz2ux81000ht3a44p0dh4qf
cmqz2uyfq000qt3a426fxgbk4	moderator@bayt.com	$2a$12$ySJo87Dsx1GlJmzBSlvZVe6CooDZ3cIHEMGzSo5jrU.1helx6fq9a	Moderator	t	2026-06-29 10:31:10.55	2026-06-29 10:31:10.55	cmqz2ux8y000it3a4olfcw91e
\.


--
-- Name: _MajorModerators _MajorModerators_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_MajorModerators"
    ADD CONSTRAINT "_MajorModerators_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: _ScholarshipModerators _ScholarshipModerators_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_ScholarshipModerators"
    ADD CONSTRAINT "_ScholarshipModerators_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: colleges colleges_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.colleges
    ADD CONSTRAINT colleges_pkey PRIMARY KEY (id);


--
-- Name: contact_messages contact_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contact_messages
    ADD CONSTRAINT contact_messages_pkey PRIMARY KEY (id);


--
-- Name: faqs faqs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faqs
    ADD CONSTRAINT faqs_pkey PRIMARY KEY (id);


--
-- Name: file_reviews file_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.file_reviews
    ADD CONSTRAINT file_reviews_pkey PRIMARY KEY (id);


--
-- Name: files files_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_pkey PRIMARY KEY (id);


--
-- Name: majors majors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.majors
    ADD CONSTRAINT majors_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY ("roleId", "permissionId");


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: scholarships scholarships_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scholarships
    ADD CONSTRAINT scholarships_pkey PRIMARY KEY (id);


--
-- Name: sections sections_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sections
    ADD CONSTRAINT sections_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: _MajorModerators_B_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_MajorModerators_B_index" ON public."_MajorModerators" USING btree ("B");


--
-- Name: _ScholarshipModerators_B_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_ScholarshipModerators_B_index" ON public."_ScholarshipModerators" USING btree ("B");


--
-- Name: audit_logs_action_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX audit_logs_action_idx ON public.audit_logs USING btree (action);


--
-- Name: audit_logs_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "audit_logs_createdAt_idx" ON public.audit_logs USING btree ("createdAt");


--
-- Name: audit_logs_entityType_entityId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "audit_logs_entityType_entityId_idx" ON public.audit_logs USING btree ("entityType", "entityId");


--
-- Name: audit_logs_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "audit_logs_userId_idx" ON public.audit_logs USING btree ("userId");


--
-- Name: colleges_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX colleges_slug_key ON public.colleges USING btree (slug);


--
-- Name: contact_messages_isHandled_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "contact_messages_isHandled_idx" ON public.contact_messages USING btree ("isHandled");


--
-- Name: faqs_deletedAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "faqs_deletedAt_idx" ON public.faqs USING btree ("deletedAt");


--
-- Name: faqs_entityType_entityId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "faqs_entityType_entityId_idx" ON public.faqs USING btree ("entityType", "entityId");


--
-- Name: file_reviews_fileId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "file_reviews_fileId_idx" ON public.file_reviews USING btree ("fileId");


--
-- Name: file_reviews_reviewerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "file_reviews_reviewerId_idx" ON public.file_reviews USING btree ("reviewerId");


--
-- Name: files_deletedAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "files_deletedAt_idx" ON public.files USING btree ("deletedAt");


--
-- Name: files_ownerType_ownerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "files_ownerType_ownerId_idx" ON public.files USING btree ("ownerType", "ownerId");


--
-- Name: files_ownerType_ownerId_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "files_ownerType_ownerId_type_idx" ON public.files USING btree ("ownerType", "ownerId", type);


--
-- Name: files_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX files_status_idx ON public.files USING btree (status);


--
-- Name: files_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX files_type_idx ON public.files USING btree (type);


--
-- Name: files_uploadedById_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "files_uploadedById_idx" ON public.files USING btree ("uploadedById");


--
-- Name: majors_collegeId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "majors_collegeId_idx" ON public.majors USING btree ("collegeId");


--
-- Name: majors_deletedAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "majors_deletedAt_idx" ON public.majors USING btree ("deletedAt");


--
-- Name: majors_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX majors_slug_key ON public.majors USING btree (slug);


--
-- Name: notifications_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "notifications_createdAt_idx" ON public.notifications USING btree ("createdAt");


--
-- Name: notifications_isRead_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "notifications_isRead_idx" ON public.notifications USING btree ("isRead");


--
-- Name: notifications_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "notifications_userId_idx" ON public.notifications USING btree ("userId");


--
-- Name: permissions_key_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX permissions_key_key ON public.permissions USING btree (key);


--
-- Name: refresh_tokens_tokenHash_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "refresh_tokens_tokenHash_key" ON public.refresh_tokens USING btree ("tokenHash");


--
-- Name: refresh_tokens_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "refresh_tokens_userId_idx" ON public.refresh_tokens USING btree ("userId");


--
-- Name: role_permissions_permissionId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "role_permissions_permissionId_idx" ON public.role_permissions USING btree ("permissionId");


--
-- Name: roles_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX roles_name_key ON public.roles USING btree (name);


--
-- Name: scholarships_deletedAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "scholarships_deletedAt_idx" ON public.scholarships USING btree ("deletedAt");


--
-- Name: scholarships_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX scholarships_slug_key ON public.scholarships USING btree (slug);


--
-- Name: sections_deletedAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "sections_deletedAt_idx" ON public.sections USING btree ("deletedAt");


--
-- Name: sections_entityType_entityId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "sections_entityType_entityId_idx" ON public.sections USING btree ("entityType", "entityId");


--
-- Name: sections_entityType_entityId_sortOrder_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "sections_entityType_entityId_sortOrder_idx" ON public.sections USING btree ("entityType", "entityId", "sortOrder");


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: users_roleId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "users_roleId_idx" ON public.users USING btree ("roleId");


--
-- Name: _MajorModerators _MajorModerators_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_MajorModerators"
    ADD CONSTRAINT "_MajorModerators_A_fkey" FOREIGN KEY ("A") REFERENCES public.majors(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _MajorModerators _MajorModerators_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_MajorModerators"
    ADD CONSTRAINT "_MajorModerators_B_fkey" FOREIGN KEY ("B") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _ScholarshipModerators _ScholarshipModerators_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_ScholarshipModerators"
    ADD CONSTRAINT "_ScholarshipModerators_A_fkey" FOREIGN KEY ("A") REFERENCES public.scholarships(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _ScholarshipModerators _ScholarshipModerators_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_ScholarshipModerators"
    ADD CONSTRAINT "_ScholarshipModerators_B_fkey" FOREIGN KEY ("B") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: audit_logs audit_logs_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: file_reviews file_reviews_fileId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.file_reviews
    ADD CONSTRAINT "file_reviews_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES public.files(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: file_reviews file_reviews_reviewerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.file_reviews
    ADD CONSTRAINT "file_reviews_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: files files_uploadedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT "files_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: majors majors_collegeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.majors
    ADD CONSTRAINT "majors_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES public.colleges(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: notifications notifications_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_permissionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT "role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES public.permissions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT "role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: users users_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict zTfwSYzbaTnfPfp1hhFeE7ELAtthNolP5hF6mWedSEekQUpuFshO5CYE4H6NdgL

