-- CreateTable
CREATE TABLE "comments" (
    "id" VARCHAR(256) NOT NULL,
    "story_id" VARCHAR(256) NOT NULL,
    "parent_id" VARCHAR(256),
    "username" VARCHAR(256),
    "comment" TEXT NOT NULL,
    "author" VARCHAR(256),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stories" (
    "id" VARCHAR(256) NOT NULL,
    "type" VARCHAR NOT NULL,
    "title" VARCHAR(256) NOT NULL,
    "text" TEXT,
    "url" VARCHAR(256),
    "domain" VARCHAR(256),
    "username" VARCHAR(256),
    "points" INTEGER NOT NULL DEFAULT 0,
    "submitted_by" VARCHAR(256),
    "comments_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" VARCHAR(256) NOT NULL,
    "username" VARCHAR(256) NOT NULL,
    "email" VARCHAR(256),
    "karma" INTEGER NOT NULL DEFAULT 0,
    "password" VARCHAR(256) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "c_author_idx" ON "comments"("author");

-- CreateIndex
CREATE INDEX "c_created_at_idx" ON "comments"("created_at");

-- CreateIndex
CREATE INDEX "c_story_id_idx" ON "comments"("story_id");

-- CreateIndex
CREATE INDEX "created_at_idx" ON "stories"("created_at");

-- CreateIndex
CREATE INDEX "trgm_idx" ON "stories"("title");

-- CreateIndex
CREATE INDEX "type_idx" ON "stories"("type");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_unique" ON "users"("username");

-- CreateIndex
CREATE INDEX "username_idx" ON "users"("username");

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_author_users_id_fk" FOREIGN KEY ("author") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_id_comments_id_fk" FOREIGN KEY ("parent_id") REFERENCES "comments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_story_id_stories_id_fk" FOREIGN KEY ("story_id") REFERENCES "stories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "stories" ADD CONSTRAINT "stories_submitted_by_users_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

