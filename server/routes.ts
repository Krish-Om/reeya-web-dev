import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertJobSchema, insertApplicationSchema } from "@shared/schema";
import multer from "multer";

const upload = multer({ dest: "uploads/" });

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Jobs routes
  app.get("/api/jobs", async (req, res) => {
    const jobs = await storage.getAllJobs();
    res.json(jobs);
  });

  app.post("/api/jobs", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "EMPLOYER") {
      return res.status(403).send("Only employers can post jobs");
    }

    const parsed = insertJobSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(parsed.error);
    }

    const job = await storage.createJob({
      ...parsed.data,
      employerId: req.user.id,
    });
    res.status(201).json(job);
  });

  app.get("/api/jobs/:id", async (req, res) => {
    const job = await storage.getJob(parseInt(req.params.id));
    if (!job) return res.status(404).send("Job not found");
    res.json(job);
  });

  // Applications routes
  app.post("/api/jobs/:id/apply", upload.single("resume"), async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "JOB_SEEKER") {
      return res.status(403).send("Only job seekers can apply to jobs");
    }

    const jobId = parseInt(req.params.id);
    const job = await storage.getJob(jobId);
    if (!job) return res.status(404).send("Job not found");

    if (!req.file) {
      return res.status(400).send("Resume is required");
    }

    const parsed = insertApplicationSchema.safeParse({
      ...req.body,
      jobId,
      userId: req.user.id,
      resumeUrl: req.file.path,
    });

    if (!parsed.success) {
      return res.status(400).json(parsed.error);
    }

    const application = await storage.createApplication(parsed.data);
    res.status(201).json(application);
  });

  app.get("/api/applications", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Unauthorized");
    }

    let applications;
    if (req.user.role === "JOB_SEEKER") {
      applications = await storage.getUserApplications(req.user.id);
    } else if (req.user.role === "EMPLOYER") {
      const jobs = await storage.getAllJobs();
      const employerJobs = jobs.filter(job => job.employerId === req.user.id);
      applications = [];
      for (const job of employerJobs) {
        const jobApplications = await storage.getJobApplications(job.id);
        applications.push(...jobApplications);
      }
    } else {
      return res.status(403).send("Invalid role");
    }

    res.json(applications);
  });

  app.patch("/api/applications/:id/status", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "EMPLOYER") {
      return res.status(403).send("Only employers can update application status");
    }

    const status = req.body.status as "PENDING" | "ACCEPTED" | "REJECTED";
    if (!status) {
      return res.status(400).send("Status is required");
    }

    const application = await storage.updateApplicationStatus(
      parseInt(req.params.id),
      status
    );

    if (!application) {
      return res.status(404).send("Application not found");
    }

    res.json(application);
  });

  const httpServer = createServer(app);
  return httpServer;
}
