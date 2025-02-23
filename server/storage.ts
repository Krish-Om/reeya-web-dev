import { User, Job, Application, InsertUser, InsertJob, InsertApplication, users, jobs, applications } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Job operations
  createJob(job: InsertJob): Promise<Job>;
  getJob(id: number): Promise<Job | undefined>;
  getAllJobs(): Promise<Job[]>;
  updateJob(id: number, job: Partial<InsertJob>): Promise<Job | undefined>;
  deleteJob(id: number): Promise<boolean>;

  // Application operations
  createApplication(application: InsertApplication): Promise<Application>;
  getApplication(id: number): Promise<Application | undefined>;
  getUserApplications(userId: number): Promise<Application[]>;
  getJobApplications(jobId: number): Promise<Application[]>;
  updateApplicationStatus(id: number, status: Application['status']): Promise<Application | undefined>;

  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  readonly sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async createJob(job: InsertJob): Promise<Job> {
    const [newJob] = await db.insert(jobs).values(job).returning();
    return newJob;
  }

  async getJob(id: number): Promise<Job | undefined> {
    const [job] = await db.select().from(jobs).where(eq(jobs.id, id));
    return job;
  }

  async getAllJobs(): Promise<Job[]> {
    return await db.select().from(jobs);
  }

  async updateJob(id: number, jobUpdate: Partial<InsertJob>): Promise<Job | undefined> {
    const [updatedJob] = await db
      .update(jobs)
      .set(jobUpdate)
      .where(eq(jobs.id, id))
      .returning();
    return updatedJob;
  }

  async deleteJob(id: number): Promise<boolean> {
    const result = await db.delete(jobs).where(eq(jobs.id, id));
    return true;
  }

  async createApplication(application: InsertApplication): Promise<Application> {
    const [newApplication] = await db.insert(applications).values(application).returning();
    return newApplication;
  }

  async getApplication(id: number): Promise<Application | undefined> {
    const [application] = await db.select().from(applications).where(eq(applications.id, id));
    return application;
  }

  async getUserApplications(userId: number): Promise<Application[]> {
    return await db.select().from(applications).where(eq(applications.userId, userId));
  }

  async getJobApplications(jobId: number): Promise<Application[]> {
    return await db.select().from(applications).where(eq(applications.jobId, jobId));
  }

  async updateApplicationStatus(
    id: number,
    status: Application['status']
  ): Promise<Application | undefined> {
    const [updatedApplication] = await db
      .update(applications)
      .set({ status })
      .where(eq(applications.id, id))
      .returning();
    return updatedApplication;
  }
}

export const storage = new DatabaseStorage();