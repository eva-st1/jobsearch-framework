ALTER TABLE "applications" ADD COLUMN "source_key" text;--> statement-breakpoint
UPDATE "applications" AS "application"
SET "source_url" = "snapshot"."payload"->>'sourceUrl'
FROM "application_documents" AS "snapshot"
WHERE "snapshot"."application_id" = "application"."id"
  AND "snapshot"."type" = 'job_snapshot'
  AND "snapshot"."revision" = 1
  AND "application"."source_url" IS NULL
  AND NULLIF("snapshot"."payload"->>'sourceUrl', '') IS NOT NULL;--> statement-breakpoint
UPDATE "applications"
SET "source_key" = CASE
  WHEN "source_url" ~* 'linkedin\.com/jobs/view/(?:[^/?#]*-)?[0-9]+'
    THEN 'linkedin:' || substring("source_url" from 'linkedin\.com/jobs/view/(?:[^/?#]*-)?([0-9]+)')
  WHEN "source_url" ~* 'finn\.no/job/(?:[^/]+/)?ad/[0-9]+'
    THEN 'finn:' || substring("source_url" from 'finn\.no/job/(?:[^/]+/)?ad/([0-9]+)')
  WHEN "source_url" ~* 'finnkode=[0-9]+'
    THEN 'finn:' || substring("source_url" from 'finnkode=([0-9]+)')
  WHEN "source_url" ~* 'pracuj\.pl/[^?#]*,(?:oferta|job),[0-9]+'
    THEN 'pracuj:' || substring("source_url" from ',(?:oferta|job),([0-9]+)')
  ELSE 'url:' || regexp_replace(
    regexp_replace(
      regexp_replace(lower(split_part("source_url", '#', 1)), '^http://', 'https://'),
      '^https://www\.',
      'https://'
    ),
    '/(\?|$)',
    '\1'
  )
END
WHERE "source_url" IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "applications_profile_source_key_unique" ON "applications" USING btree ("profile_id","source_key") WHERE "applications"."source_key" is not null;
