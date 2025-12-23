# Database Schema Design - GitHub Clone

## Overview
This document outlines the database schema for the GitHub clone project using Prisma ORM with PostgreSQL.

---

## Prisma Schema Template

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// USER & AUTHENTICATION
// ============================================

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  bio           String?   @db.Text
  location      String?
  website       String?
  company       String?
  twitterUsername String?
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // Relations
  accounts      Account[]
  sessions      Session[]
  repositories  Repository[]
  issues        Issue[]
  pullRequests  PullRequest[]
  comments      Comment[]
  stars         Star[]
  watches       Watch[]
  followers     Follow[]  @relation("UserFollowers")
  following     Follow[]  @relation("UserFollowing")
  
  ownedOrganizations Organization[] @relation("OrganizationOwner")
  organizationMembers OrganizationMember[]
  
  assignedIssues Issue[] @relation("IssueAssignees")
  reviewRequests PullRequestReview[]
  
  @@map("users")
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verification_tokens")
}

// ============================================
// REPOSITORIES
// ============================================

model Repository {
  id          String   @id @default(cuid())
  name        String
  slug        String
  description String?  @db.Text
  
  isPrivate   Boolean  @default(false)
  isTemplate  Boolean  @default(false)
  isFork      Boolean  @default(false)
  
  defaultBranch String @default("main")
  
  homepage    String?
  topics      String[] // Array of topic tags
  
  hasIssues   Boolean  @default(true)
  hasProjects Boolean  @default(true)
  hasWiki     Boolean  @default(true)
  
  forkedFromId String?
  forkedFrom   Repository? @relation("RepositoryForks", fields: [forkedFromId], references: [id])
  forks        Repository[] @relation("RepositoryForks")
  
  ownerId     String
  owner       User     @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  
  organizationId String?
  organization   Organization? @relation(fields: [organizationId], references: [id])
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  pushedAt    DateTime @default(now())
  
  // Relations
  branches    Branch[]
  commits     Commit[]
  issues      Issue[]
  pullRequests PullRequest[]
  stars       Star[]
  watches     Watch[]
  collaborators RepositoryCollaborator[]
  webhooks    Webhook[]
  deployKeys  DeployKey[]
  
  @@unique([ownerId, slug])
  @@index([ownerId])
  @@index([organizationId])
  @@map("repositories")
}

model RepositoryCollaborator {
  id           String     @id @default(cuid())
  repositoryId String
  userId       String
  permission   Permission @default(READ)
  
  repository   Repository @relation(fields: [repositoryId], references: [id], onDelete: Cascade)
  
  createdAt    DateTime   @default(now())
  
  @@unique([repositoryId, userId])
  @@map("repository_collaborators")
}

enum Permission {
  READ
  WRITE
  ADMIN
}

// ============================================
// GIT OBJECTS
// ============================================

model Branch {
  id           String     @id @default(cuid())
  name         String
  repositoryId String
  
  isProtected  Boolean    @default(false)
  isDefault    Boolean    @default(false)
  
  lastCommitId String?
  lastCommit   Commit?    @relation("BranchLastCommit", fields: [lastCommitId], references: [id])
  
  repository   Repository @relation(fields: [repositoryId], references: [id], onDelete: Cascade)
  
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
  
  pullRequestsBase PullRequest[] @relation("PRBaseBranch")
  pullRequestsHead PullRequest[] @relation("PRHeadBranch")
  
  @@unique([repositoryId, name])
  @@index([repositoryId])
  @@map("branches")
}

model Commit {
  id           String     @id @default(cuid())
  sha          String     @unique
  message      String     @db.Text
  
  authorName   String
  authorEmail  String
  authorDate   DateTime
  
  committerName  String
  committerEmail String
  committerDate  DateTime
  
  repositoryId String
  repository   Repository @relation(fields: [repositoryId], references: [id], onDelete: Cascade)
  
  parentIds    String[]   // Array of parent commit SHAs
  
  additions    Int        @default(0)
  deletions    Int        @default(0)
  changedFiles Int        @default(0)
  
  createdAt    DateTime   @default(now())
  
  branches     Branch[]   @relation("BranchLastCommit")
  fileChanges  FileChange[]
  
  @@index([repositoryId])
  @@index([sha])
  @@map("commits")
}

model FileChange {
  id         String @id @default(cuid())
  commitId   String
  
  filename   String
  status     FileChangeStatus
  additions  Int    @default(0)
  deletions  Int    @default(0)
  changes    Int    @default(0)
  
  patch      String? @db.Text
  
  commit     Commit @relation(fields: [commitId], references: [id], onDelete: Cascade)
  
  @@index([commitId])
  @@map("file_changes")
}

enum FileChangeStatus {
  ADDED
  MODIFIED
  DELETED
  RENAMED
  COPIED
}

// ============================================
// ISSUES
// ============================================

model Issue {
  id           String      @id @default(cuid())
  number       Int
  title        String
  body         String?     @db.Text
  state        IssueState  @default(OPEN)
  
  repositoryId String
  repository   Repository  @relation(fields: [repositoryId], references: [id], onDelete: Cascade)
  
  authorId     String
  author       User        @relation(fields: [authorId], references: [id])
  
  assignees    User[]      @relation("IssueAssignees")
  
  labels       Label[]
  milestoneId  String?
  milestone    Milestone?  @relation(fields: [milestoneId], references: [id])
  
  comments     Comment[]
  
  closedAt     DateTime?
  
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt
  
  @@unique([repositoryId, number])
  @@index([repositoryId])
  @@index([authorId])
  @@index([state])
  @@map("issues")
}

enum IssueState {
  OPEN
  CLOSED
}

model Label {
  id          String  @id @default(cuid())
  name        String
  color       String  // Hex color code
  description String?
  
  repositoryId String?
  
  issues      Issue[]
  pullRequests PullRequest[]
  
  createdAt   DateTime @default(now())
  
  @@map("labels")
}

model Milestone {
  id          String   @id @default(cuid())
  title       String
  description String?  @db.Text
  state       MilestoneState @default(OPEN)
  dueOn       DateTime?
  
  repositoryId String
  
  issues      Issue[]
  pullRequests PullRequest[]
  
  closedAt    DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@map("milestones")
}

enum MilestoneState {
  OPEN
  CLOSED
}

// ============================================
// PULL REQUESTS
// ============================================

model PullRequest {
  id           String      @id @default(cuid())
  number       Int
  title        String
  body         String?     @db.Text
  state        PRState     @default(OPEN)
  
  repositoryId String
  repository   Repository  @relation(fields: [repositoryId], references: [id], onDelete: Cascade)
  
  authorId     String
  author       User        @relation(fields: [authorId], references: [id])
  
  baseBranchId String
  baseBranch   Branch      @relation("PRBaseBranch", fields: [baseBranchId], references: [id])
  
  headBranchId String
  headBranch   Branch      @relation("PRHeadBranch", fields: [headBranchId], references: [id])
  
  isDraft      Boolean     @default(false)
  isMerged     Boolean     @default(false)
  mergedAt     DateTime?
  
  labels       Label[]
  milestoneId  String?
  milestone    Milestone?  @relation(fields: [milestoneId], references: [id])
  
  comments     Comment[]
  reviews      PullRequestReview[]
  
  closedAt     DateTime?
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt
  
  @@unique([repositoryId, number])
  @@index([repositoryId])
  @@index([authorId])
  @@index([state])
  @@map("pull_requests")
}

enum PRState {
  OPEN
  CLOSED
  MERGED
}

model PullRequestReview {
  id            String       @id @default(cuid())
  pullRequestId String
  pullRequest   PullRequest  @relation(fields: [pullRequestId], references: [id], onDelete: Cascade)
  
  reviewerId    String
  reviewer      User         @relation(fields: [reviewerId], references: [id])
  
  state         ReviewState
  body          String?      @db.Text
  
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
  
  @@index([pullRequestId])
  @@map("pull_request_reviews")
}

enum ReviewState {
  PENDING
  APPROVED
  CHANGES_REQUESTED
  COMMENTED
}

// ============================================
// COMMENTS
// ============================================

model Comment {
  id        String   @id @default(cuid())
  body      String   @db.Text
  
  authorId  String
  author    User     @relation(fields: [authorId], references: [id])
  
  issueId   String?
  issue     Issue?   @relation(fields: [issueId], references: [id], onDelete: Cascade)
  
  pullRequestId String?
  pullRequest   PullRequest? @relation(fields: [pullRequestId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([issueId])
  @@index([pullRequestId])
  @@index([authorId])
  @@map("comments")
}

// ============================================
// SOCIAL FEATURES
// ============================================

model Star {
  id           String     @id @default(cuid())
  userId       String
  repositoryId String
  
  user         User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  repository   Repository @relation(fields: [repositoryId], references: [id], onDelete: Cascade)
  
  createdAt    DateTime   @default(now())
  
  @@unique([userId, repositoryId])
  @@index([userId])
  @@index([repositoryId])
  @@map("stars")
}

model Watch {
  id           String     @id @default(cuid())
  userId       String
  repositoryId String
  
  user         User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  repository   Repository @relation(fields: [repositoryId], references: [id], onDelete: Cascade)
  
  createdAt    DateTime   @default(now())
  
  @@unique([userId, repositoryId])
  @@index([userId])
  @@index([repositoryId])
  @@map("watches")
}

model Follow {
  id          String   @id @default(cuid())
  followerId  String
  followingId String
  
  follower    User     @relation("UserFollowers", fields: [followerId], references: [id], onDelete: Cascade)
  following   User     @relation("UserFollowing", fields: [followingId], references: [id], onDelete: Cascade)
  
  createdAt   DateTime @default(now())
  
  @@unique([followerId, followingId])
  @@index([followerId])
  @@index([followingId])
  @@map("follows")
}

// ============================================
// ORGANIZATIONS
// ============================================

model Organization {
  id          String   @id @default(cuid())
  name        String   @unique
  slug        String   @unique
  description String?  @db.Text
  email       String?
  website     String?
  location    String?
  avatarUrl   String?
  
  ownerId     String
  owner       User     @relation("OrganizationOwner", fields: [ownerId], references: [id])
  
  repositories Repository[]
  members      OrganizationMember[]
  teams        Team[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@map("organizations")
}

model OrganizationMember {
  id             String       @id @default(cuid())
  organizationId String
  userId         String
  role           OrgRole      @default(MEMBER)
  
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  user           User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  createdAt      DateTime     @default(now())
  
  @@unique([organizationId, userId])
  @@map("organization_members")
}

enum OrgRole {
  OWNER
  ADMIN
  MEMBER
}

model Team {
  id             String       @id @default(cuid())
  name           String
  slug           String
  description    String?      @db.Text
  
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
  
  @@unique([organizationId, slug])
  @@map("teams")
}

// ============================================
// WEBHOOKS & INTEGRATIONS
// ============================================

model Webhook {
  id           String     @id @default(cuid())
  url          String
  secret       String?
  events       String[]   // Array of event types
  active       Boolean    @default(true)
  
  repositoryId String
  repository   Repository @relation(fields: [repositoryId], references: [id], onDelete: Cascade)
  
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
  
  deliveries   WebhookDelivery[]
  
  @@map("webhooks")
}

model WebhookDelivery {
  id         String   @id @default(cuid())
  webhookId  String
  webhook    Webhook  @relation(fields: [webhookId], references: [id], onDelete: Cascade)
  
  event      String
  payload    Json
  response   Json?
  statusCode Int?
  success    Boolean  @default(false)
  
  createdAt  DateTime @default(now())
  
  @@index([webhookId])
  @@map("webhook_deliveries")
}

model DeployKey {
  id           String     @id @default(cuid())
  title        String
  key          String     @db.Text
  readOnly     Boolean    @default(true)
  
  repositoryId String
  repository   Repository @relation(fields: [repositoryId], references: [id], onDelete: Cascade)
  
  createdAt    DateTime   @default(now())
  
  @@map("deploy_keys")
}

// ============================================
// NOTIFICATIONS
// ============================================

model Notification {
  id        String           @id @default(cuid())
  type      NotificationType
  title     String
  message   String?          @db.Text
  read      Boolean          @default(false)
  
  userId    String
  
  metadata  Json?            // Additional data (repo, issue, PR, etc.)
  
  createdAt DateTime         @default(now())
  
  @@map("notifications")
}

enum NotificationType {
  ISSUE_CREATED
  ISSUE_CLOSED
  ISSUE_COMMENT
  PR_CREATED
  PR_MERGED
  PR_CLOSED
  PR_REVIEW
  MENTION
  STAR
  FORK
  FOLLOW
}
```

---

## Setup Instructions

### 1. Install Prisma
```bash
cd frontend
npm install prisma @prisma/client
npx prisma init
```

### 2. Configure Database
Update `frontend/.env.local`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/contra?schema=public"
```

### 3. Create Schema
Copy the schema above to `frontend/prisma/schema.prisma`

### 4. Generate Prisma Client
```bash
npx prisma generate
```

### 5. Create Migration
```bash
npx prisma migrate dev --name init
```

### 6. (Optional) Seed Database
Create `frontend/prisma/seed.ts` for sample data

---

## Usage Examples

### Create Repository
```typescript
const repository = await prisma.repository.create({
  data: {
    name: "my-repo",
    slug: "my-repo",
    description: "My awesome repository",
    ownerId: user.id,
    defaultBranch: "main",
  },
});
```

### Create Issue
```typescript
const issue = await prisma.issue.create({
  data: {
    title: "Bug: Something is broken",
    body: "Description of the bug...",
    number: 1,
    repositoryId: repo.id,
    authorId: user.id,
  },
});
```

### Star Repository
```typescript
const star = await prisma.star.create({
  data: {
    userId: user.id,
    repositoryId: repo.id,
  },
});
```

---

## Indexes & Performance

The schema includes indexes on:
- Foreign keys
- Frequently queried fields (state, userId, repositoryId)
- Unique constraints for data integrity

Consider adding additional indexes based on query patterns.

---

## Next Steps

1. Review and customize the schema for your needs
2. Set up database (local PostgreSQL or cloud service)
3. Run migrations
4. Create seed data for testing
5. Build API routes using Prisma Client
6. Implement repository pattern for data access

---

**Note:** This schema is a starting point. Adjust based on your specific requirements and scale considerations.
