import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Application, Job } from "@shared/schema";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Briefcase, Building2, User } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  
  const { data: jobs } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
    enabled: user?.role === "EMPLOYER",
  });

  const { data: applications } = useQuery<Application[]>({
    queryKey: ["/api/applications"],
  });

  return (
    <div className="container mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-muted-foreground">Welcome, {user?.username}</span>
          {user?.role === "EMPLOYER" && (
            <Link href="/jobs">
              <Button>Post a Job</Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">
              {user?.role === "EMPLOYER" ? "Posted Jobs" : "Available Jobs"}
            </CardTitle>
            <Briefcase className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {user?.role === "EMPLOYER" ? jobs?.length || 0 : "-"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Applications</CardTitle>
            <User className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{applications?.length || 0}</p>
          </CardContent>
        </Card>

        {user?.role === "EMPLOYER" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Company</CardTitle>
              <Building2 className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-lg">{user.companyName || "Not set"}</p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        {applications?.slice(0, 5).map((application) => (
          <div
            key={application.id}
            className="flex items-center justify-between p-4 border rounded-lg mb-2"
          >
            <div>
              <p className="font-medium">Application #{application.id}</p>
              <p className="text-sm text-muted-foreground">
                Applied: {new Date(application.appliedAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center">
              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  application.status === "PENDING"
                    ? "bg-yellow-100 text-yellow-800"
                    : application.status === "ACCEPTED"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {application.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
