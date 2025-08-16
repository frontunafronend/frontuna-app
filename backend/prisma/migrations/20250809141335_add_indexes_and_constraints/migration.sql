/*
  Warnings:

  - A unique constraint covering the columns `[userId,name]` on the table `Component` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "Component_userId_createdAt_idx" ON "public"."Component"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Component_framework_idx" ON "public"."Component"("framework");

-- CreateIndex
CREATE INDEX "Component_style_idx" ON "public"."Component"("style");

-- CreateIndex
CREATE UNIQUE INDEX "Component_userId_name_key" ON "public"."Component"("userId", "name");

-- CreateIndex
CREATE INDEX "Subscription_userId_idx" ON "public"."Subscription"("userId");

-- CreateIndex
CREATE INDEX "Subscription_plan_status_idx" ON "public"."Subscription"("plan", "status");

-- CreateIndex
CREATE INDEX "Subscription_stripeId_idx" ON "public"."Subscription"("stripeId");

-- CreateIndex
CREATE INDEX "UsageLog_userId_createdAt_idx" ON "public"."UsageLog"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "UsageLog_route_idx" ON "public"."UsageLog"("route");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "public"."User"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "User_role_idx" ON "public"."User"("role");
