import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export type UserRole = 'ADMIN' | 'EMPLOYER' | 'JOB_SEEKER';

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  role: text("role").$type<UserRole>().notNull().default('JOB_SEEKER'),
  companyName: text("company_name"),
});

export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  company: text("company").notNull(),
  location: text("location").notNull(),
  salary: text("salary"),
  employerId: integer("employer_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").notNull(),
  userId: integer("user_id").notNull(),
  status: text("status").$type<'PENDING' | 'ACCEPTED' | 'REJECTED'>().notNull().default('PENDING'),
  resumeUrl: text("resume_url").notNull(),
  coverLetter: text("cover_letter"),
  appliedAt: timestamp("applied_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).extend({
  password: z.string().min(6),
  email: z.string().email(),
});

export const insertJobSchema = createInsertSchema(jobs).omit({ 
  id: true,
  createdAt: true 
});

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  appliedAt: true
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Job = typeof jobs.$inferSelect;
export type Application = typeof applications.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
