CREATE TYPE "public"."application_status" AS ENUM('discovered', 'researching', 'preparing', 'ready', 'applied', 'screening', 'interviewing', 'offer', 'rejected', 'withdrawn', 'no_response');--> statement-breakpoint
CREATE TYPE "public"."artifact_state" AS ENUM('draft', 'final', 'submitted');--> statement-breakpoint
CREATE TYPE "public"."artifact_type" AS ENUM('cv', 'cover_letter', 'application_answer', 'outreach_message');--> statement-breakpoint
CREATE TYPE "public"."application_document_type" AS ENUM('job_snapshot', 'company_research', 'positioning_strategy', 'retrospective');--> statement-breakpoint
CREATE TYPE "public"."event_actor" AS ENUM('agent', 'user', 'employer', 'system');--> statement-breakpoint
CREATE TYPE "public"."feedback_type" AS ENUM('employer_feedback', 'observed_outcome', 'agent_hypothesis', 'validated_finding');--> statement-breakpoint
CREATE TYPE "public"."application_language" AS ENUM('en', 'pl', 'no');--> statement-breakpoint
CREATE TYPE "public"."verification_status" AS ENUM('unverified', 'verified');--> statement-breakpoint
CREATE TABLE "application_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"application_id" uuid NOT NULL,
	"type" "application_document_type" NOT NULL,
	"revision" integer NOT NULL,
	"payload" jsonb NOT NULL,
	"sources" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"inferences" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "application_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"application_id" uuid NOT NULL,
	"type" text NOT NULL,
	"actor" "event_actor" NOT NULL,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"company" text NOT NULL,
	"position" text NOT NULL,
	"source_url" text,
	"source_type" text DEFAULT 'other' NOT NULL,
	"language" "application_language" NOT NULL,
	"current_status" "application_status" DEFAULT 'discovered' NOT NULL,
	"current_artifact_id" uuid,
	"applied_at" timestamp with time zone,
	"follow_up_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "artifacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"application_id" uuid NOT NULL,
	"type" "artifact_type" NOT NULL,
	"revision" integer NOT NULL,
	"state" "artifact_state" DEFAULT 'draft' NOT NULL,
	"language" "application_language" NOT NULL,
	"content" jsonb NOT NULL,
	"strategy" jsonb NOT NULL,
	"decisions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"scorecard" jsonb NOT NULL,
	"methodology" jsonb NOT NULL,
	"used_fact_ids" uuid[] DEFAULT '{}'::uuid[] NOT NULL,
	"profile_source_snapshot_id" uuid,
	"standalone_html" text,
	"pdf" "bytea",
	"html_sha256" text,
	"pdf_sha256" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"rendered_at" timestamp with time zone,
	"frozen_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"application_id" uuid NOT NULL,
	"name" text NOT NULL,
	"role" text,
	"email" text,
	"linkedin_url" text,
	"notes" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "facts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"category" text NOT NULL,
	"label" text NOT NULL,
	"value" jsonb NOT NULL,
	"evidence" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"verification_status" "verification_status" DEFAULT 'unverified' NOT NULL,
	"verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"application_id" uuid NOT NULL,
	"type" "feedback_type" NOT NULL,
	"payload" jsonb NOT NULL,
	"source" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "interviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"application_id" uuid NOT NULL,
	"stage" text NOT NULL,
	"scheduled_at" timestamp with time zone,
	"participants" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"notes" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"outcome" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profile_sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"adapter" text NOT NULL,
	"locale" "application_language" NOT NULL,
	"source_locator" text,
	"source_revision" text,
	"content_hash" text NOT NULL,
	"snapshot" jsonb NOT NULL,
	"imported_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"auth_user_id" text NOT NULL,
	"email" text NOT NULL,
	"display_name" text NOT NULL,
	"preferences" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"private_profile" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "application_documents" ADD CONSTRAINT "application_documents_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application_events" ADD CONSTRAINT "application_events_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "artifacts" ADD CONSTRAINT "artifacts_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "artifacts" ADD CONSTRAINT "artifacts_profile_source_snapshot_id_profile_sources_id_fk" FOREIGN KEY ("profile_source_snapshot_id") REFERENCES "public"."profile_sources"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "facts" ADD CONSTRAINT "facts_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_sources" ADD CONSTRAINT "profile_sources_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "application_documents_revision_unique" ON "application_documents" USING btree ("application_id","type","revision");--> statement-breakpoint
CREATE INDEX "application_documents_application_idx" ON "application_documents" USING btree ("application_id","created_at");--> statement-breakpoint
CREATE INDEX "application_events_application_occurred_idx" ON "application_events" USING btree ("application_id","occurred_at");--> statement-breakpoint
CREATE INDEX "applications_profile_status_idx" ON "applications" USING btree ("profile_id","current_status");--> statement-breakpoint
CREATE INDEX "applications_profile_created_idx" ON "applications" USING btree ("profile_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "artifacts_revision_unique" ON "artifacts" USING btree ("application_id","type","revision");--> statement-breakpoint
CREATE INDEX "artifacts_application_created_idx" ON "artifacts" USING btree ("application_id","created_at");--> statement-breakpoint
CREATE INDEX "contacts_application_idx" ON "contacts" USING btree ("application_id");--> statement-breakpoint
CREATE INDEX "facts_profile_status_idx" ON "facts" USING btree ("profile_id","verification_status");--> statement-breakpoint
CREATE INDEX "facts_profile_category_idx" ON "facts" USING btree ("profile_id","category");--> statement-breakpoint
CREATE INDEX "feedback_application_type_idx" ON "feedback" USING btree ("application_id","type");--> statement-breakpoint
CREATE INDEX "interviews_application_idx" ON "interviews" USING btree ("application_id","scheduled_at");--> statement-breakpoint
CREATE INDEX "profile_sources_profile_imported_idx" ON "profile_sources" USING btree ("profile_id","imported_at");--> statement-breakpoint
CREATE UNIQUE INDEX "profile_sources_snapshot_unique" ON "profile_sources" USING btree ("profile_id","adapter","locale","content_hash");--> statement-breakpoint
CREATE UNIQUE INDEX "profiles_auth_user_id_unique" ON "profiles" USING btree ("auth_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "profiles_email_unique" ON "profiles" USING btree ("email");