-- Cascade delete: when a user is deleted, remove their audit logs,
-- uploaded files, and file reviews so the delete is not blocked.
ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_userId_fkey";
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "files" DROP CONSTRAINT "files_uploadedById_fkey";
ALTER TABLE "files" ADD CONSTRAINT "files_uploadedById_fkey"
  FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "file_reviews" DROP CONSTRAINT "file_reviews_reviewerId_fkey";
ALTER TABLE "file_reviews" ADD CONSTRAINT "file_reviews_reviewerId_fkey"
  FOREIGN KEY ("reviewerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
