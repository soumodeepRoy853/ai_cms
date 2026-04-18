# AI Content CMS API

Backend API for an AI-assisted CMS with roles, editorial workflow, revisions, comments, notifications, and public content APIs.

## Features
- JWT + session auth
- Role-based access (`admin`, `editor`, `author`, `reviewer`, `viewer`)
- Content CRUD with draft/review/published status
- AI generation (Gemini) + generate-and-save
- Categories and tags (stored as models)
- Review workflow (assign, approve, reject, changes)
- Revisions/history per content
- Comments with moderation (hide/delete)
- Notifications for review/comment/publish events
- Public content APIs with pagination, filtering, search
- Media uploads
- Audit + activity logs

## Quick Start
```bash
npm install
npm run dev
```

## Environment Variables
Create a `.env` with values like:
```
NODE_ENV=production
MONGODB_URI=YOUR_MONGO_URI
JWT_SECRET=YOUR_JWT_SECRET
JWT_EXPIRES=24h
SESSION_SECRET=YOUR_SESSION_SECRET
SESSION_MAX_AGE=604800000
GEMINI_API_KEY=YOUR_GEMINI_KEY
GEMINI_MODEL=models/gemini-2.5-flash
UPLOAD_LIMIT=10MB
UPLOAD_MAX_BYTES=5242880
UPLOAD_ALLOWED_TYPES=image/png,image/jpeg,image/webp,application/pdf
RATE_LIMIT_WINDOW=15
RATE_LIMIT_REQUESTS=100
AI_RATE_LIMIT_WINDOW=15
AI_RATE_LIMIT_REQUESTS=20
```

## Auth
All protected routes require:
```
Authorization: Bearer <JWT>
```

### Register
`POST /api/auth/register`

Request
```json
{
  "userName": "Jane Doe",
  "email": "jane@example.com",
  "password": "secret123",
  "phone": "9999999999",
  "role": "author"
}
```

Response
```json
{
  "success": true,
  "user": {
    "_id": "USER_ID",
    "userName": "Jane Doe",
    "email": "jane@example.com",
    "phone": "9999999999",
    "role": "author"
  }
}
```

### Login
`POST /api/auth/login`

Request
```json
{
  "email": "jane@example.com",
  "password": "secret123"
}
```

Response
```json
{
  "success": true,
  "user": {
    "_id": "USER_ID",
    "userName": "Jane Doe",
    "email": "jane@example.com",
    "phone": "9999999999",
    "role": "author"
  },
  "token": "JWT_TOKEN"
}
```

### Me
`GET /api/auth/me`

Response
```json
{
  "success": true,
  "user": {
    "_id": "USER_ID",
    "userName": "Jane Doe",
    "email": "jane@example.com",
    "phone": "9999999999",
    "role": "author"
  }
}
```

### Logout
`POST /api/auth/logout`

Response
```json
{ "success": true }
```

## Content
### Create Content
`POST /api/content` (roles: `admin`, `editor`, `author`)

Request
```json
{
  "title": "AI CMS Intro",
  "type": "article",
  "status": "draft",
  "excerpt": "Short intro...",
  "body": "Full content body",
  "tags": ["cms", "ai"],
  "category": "Product",
  "coverImage": "https://...",
  "seo": { "title": "AI CMS", "description": "Intro" }
}
```

Response
```json
{
  "success": true,
  "content": {
    "_id": "CONTENT_ID",
    "title": "AI CMS Intro",
    "slug": "ai-cms-intro",
    "status": "draft"
  }
}
```

### List Content (private)
`GET /api/content`

Query params
- `mine=true|false`
- `status=draft|review|published|archived|all`
- `search=term`

Response
```json
{
  "success": true,
  "items": [
    { "_id": "CONTENT_ID", "title": "AI CMS Intro", "status": "draft" }
  ]
}
```

### Get Content
`GET /api/content/:id`

Response
```json
{
  "success": true,
  "content": { "_id": "CONTENT_ID", "title": "AI CMS Intro", "status": "draft" }
}
```

### Update Content
`PUT /api/content/:id`

Request
```json
{
  "title": "Updated Title",
  "body": "Updated body",
  "status": "review"
}
```

Response
```json
{
  "success": true,
  "content": { "_id": "CONTENT_ID", "title": "Updated Title", "status": "review" }
}
```

### Delete Content
`DELETE /api/content/:id`

Response
```json
{ "success": true, "deleted": true }
```

### Publish Content
`POST /api/content/:id/publish` (roles: `admin`, `editor`)

Response
```json
{
  "success": true,
  "content": { "_id": "CONTENT_ID", "status": "published" }
}
```

## Public Content APIs
### List Published Content
`GET /api/public/content`

Query params
- `page=1`
- `limit=10`
- `search=term` or `q=term`
- `tag=ai,cms`
- `category=Product`
- `sort=latest|oldest`

Response
```json
{
  "success": true,
  "items": [
    { "_id": "CONTENT_ID", "title": "AI CMS Intro", "slug": "ai-cms-intro" }
  ],
  "pagination": { "total": 1, "page": 1, "limit": 10, "pages": 1 }
}
```

### Get Published Content by Slug
`GET /api/public/content/:slug`

Response
```json
{
  "success": true,
  "content": { "_id": "CONTENT_ID", "title": "AI CMS Intro", "slug": "ai-cms-intro" }
}
```

## AI
### Generate (no save)
`POST /api/ai/generate`

Request
```json
{
  "prompt": "Write a short product intro for a CMS",
  "title": "AI Content CMS",
  "contentType": "article",
  "tone": "professional",
  "length": "short",
  "keywords": ["cms", "ai", "content"],
  "model": "models/gemini-2.5-flash",
  "temperature": 0.7,
  "maxOutputTokens": 800
}
```

Response
```json
{
  "success": true,
  "generationId": "GEN_ID",
  "output": "Generated text...",
  "model": "models/gemini-2.5-flash",
  "usage": { "promptTokens": 10, "completionTokens": 20, "totalTokens": 30 }
}
```

### Generate and Save to Content
`POST /api/ai/generate-and-save` (roles: `admin`, `editor`, `author`)

Request
```json
{
  "prompt": "Write a short product intro for a CMS",
  "title": "AI Content CMS",
  "contentType": "article",
  "status": "draft",
  "tags": ["cms", "ai"],
  "category": "Product"
}
```

Response
```json
{
  "success": true,
  "generationId": "GEN_ID",
  "content": { "_id": "CONTENT_ID", "title": "AI Content CMS" },
  "output": "Generated text...",
  "model": "models/gemini-2.5-flash"
}
```

## Categories
`GET /api/categories`

Response
```json
{ "success": true, "items": [], "pagination": { "total": 0, "page": 1, "limit": 20, "pages": 0 } }
```

`POST /api/categories` (roles: `admin`, `editor`)
```json
{ "name": "Product", "description": "Product posts" }
```

## Tags
`GET /api/tags`

Response
```json
{ "success": true, "items": [], "pagination": { "total": 0, "page": 1, "limit": 50, "pages": 0 } }
```

`POST /api/tags` (roles: `admin`, `editor`)
```json
{ "name": "cms", "description": "CMS related" }
```

## Reviews
### Assign Review
`POST /api/reviews/assign` (roles: `admin`, `editor`)

Request
```json
{ "contentId": "CONTENT_ID", "reviewerId": "USER_ID", "dueAt": "2026-04-30T10:00:00.000Z" }
```

Response
```json
{ "success": true, "review": { "_id": "REVIEW_ID", "status": "assigned" } }
```

### Reviewer Decisions
`POST /api/reviews/:id/decision`

Request
```json
{ "status": "approved", "notes": "Looks good" }
```

Response
```json
{ "success": true, "review": { "_id": "REVIEW_ID", "status": "approved" } }
```

### List Assigned Reviews
`GET /api/reviews/assigned`

Response
```json
{ "success": true, "items": [] }
```

## Revisions
`GET /api/content/:id/revisions`

Response
```json
{ "success": true, "items": [ { "_id": "REV_ID", "version": 1 } ] }
```

`GET /api/content/:id/revisions/:revisionId`

Response
```json
{ "success": true, "revision": { "_id": "REV_ID", "version": 1 } }
```

## Comments + Moderation
### List Comments
`GET /api/content/:id/comments`

Query params
- `page`, `limit`
- `includeAll=true` (moderators only)

Response
```json
{ "success": true, "items": [ { "_id": "COMMENT_ID", "body": "Nice" } ], "pagination": { "total": 1, "page": 1, "limit": 50, "pages": 1 } }
```

### Add Comment
`POST /api/content/:id/comments`

Request
```json
{ "body": "Great post", "parentId": "PARENT_COMMENT_ID" }
```

Response
```json
{ "success": true, "comment": { "_id": "COMMENT_ID", "status": "visible" } }
```

### Hide Comment
`PATCH /api/content/:id/comments/:commentId/hide`

Response
```json
{ "success": true, "comment": { "_id": "COMMENT_ID", "status": "hidden" } }
```

### Delete Comment
`DELETE /api/content/:id/comments/:commentId`

Response
```json
{ "success": true, "comment": { "_id": "COMMENT_ID", "status": "deleted" } }
```

## Media
`POST /api/media/upload`

Request: multipart/form-data
- `file`: the file to upload

Response
```json
{
  "success": true,
  "media": {
    "_id": "MEDIA_ID",
    "url": "https://YOUR_DOMAIN/uploads/FILE_NAME"
  }
}
```

## Notifications
`GET /api/notifications`

Query params
- `unread=true`

Response
```json
{ "success": true, "items": [], "pagination": { "total": 0, "page": 1, "limit": 25, "pages": 0 } }
```

`POST /api/notifications/:id/read`

Response
```json
{ "success": true, "notification": { "_id": "NOTIF_ID", "readAt": "2026-04-18T10:00:00.000Z" } }
```

`POST /api/notifications/read-all`

Response
```json
{ "success": true, "updated": true }
```

## Audit + Activity
`GET /api/audit` (admin only)

Response
```json
{ "success": true, "items": [], "pagination": { "total": 0, "page": 1, "limit": 50, "pages": 0 } }
```

`GET /api/activity`

Response
```json
{ "success": true, "items": [], "pagination": { "total": 0, "page": 1, "limit": 25, "pages": 0 } }
```

## Error Format
```json
{
  "success": false,
  "message": "Error message"
}
```

## Notes
- Review assignments automatically set content status to `review`.
- Revisions are created on create, update, and publish.
- Public APIs only return `published` content.
- Comment moderation is allowed for `admin`, `editor`, or the content author.
