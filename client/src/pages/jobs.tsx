import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Job, insertJobSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, MapPin, Building2, DollarSign, Briefcase } from "lucide-react";
import { useState } from "react";

export default function Jobs() {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { data: jobs, isLoading } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
  });

  const jobMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/jobs", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      setIsDialogOpen(false);
    },
  });

  const applicationMutation = useMutation({
    mutationFn: async ({ jobId, formData }: { jobId: number; formData: FormData }) => {
      const res = await fetch(`/api/jobs/${jobId}/apply`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to apply");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Jobs</h1>
        {user?.role === "EMPLOYER" && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>Post New Job</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Post a New Job</DialogTitle>
              </DialogHeader>
              <PostJobForm onSubmit={(data) => jobMutation.mutate(data)} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs?.map((job) => (
          <JobCard 
            key={job.id} 
            job={job} 
            onApply={(formData) => 
              applicationMutation.mutate({ jobId: job.id, formData })
            }
            isEmployer={user?.role === "EMPLOYER"}
          />
        ))}
      </div>
    </div>
  );
}

function PostJobForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const form = useForm({
    resolver: zodResolver(insertJobSchema),
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="company"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="salary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Salary (Optional)</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Post Job
        </Button>
      </form>
    </Form>
  );
}

function JobCard({ 
  job, 
  onApply,
  isEmployer 
}: { 
  job: Job; 
  onApply: (formData: FormData) => void;
  isEmployer: boolean;
}) {
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-xl">{job.title}</span>
          <Briefcase className="h-5 w-5 text-muted-foreground" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Building2 className="h-4 w-4" />
          <span>{job.company}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{job.location}</span>
        </div>
        {job.salary && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            <span>{job.salary}</span>
          </div>
        )}
        <p className="text-sm mt-4">{job.description}</p>
      </CardContent>
      <CardFooter>
        {!isEmployer && (
          <Dialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full">Apply Now</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Apply for {job.title}</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  onApply(formData);
                  setIsApplyDialogOpen(false);
                }}
                className="space-y-4"
              >
                <div>
                  <FormLabel>Resume</FormLabel>
                  <Input type="file" name="resume" required accept=".pdf,.doc,.docx" />
                </div>
                <div>
                  <FormLabel>Cover Letter (Optional)</FormLabel>
                  <Textarea name="coverLetter" />
                </div>
                <Button type="submit" className="w-full">Submit Application</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </CardFooter>
    </Card>
  );
}
