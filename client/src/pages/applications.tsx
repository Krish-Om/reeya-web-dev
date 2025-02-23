import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Application } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, FileText, Calendar, CheckCircle, XCircle, Clock } from "lucide-react";

export default function Applications() {
  const { user } = useAuth();
  
  const { data: applications, isLoading } = useQuery<Application[]>({
    queryKey: ["/api/applications"],
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: Application['status'] }) => {
      const res = await apiRequest("PATCH", `/api/applications/${id}/status`, { status });
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
      <h1 className="text-3xl font-bold mb-8">
        {user?.role === "EMPLOYER" ? "Received Applications" : "My Applications"}
      </h1>

      <div className="grid gap-6">
        {applications?.map((application) => (
          <Card key={application.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Application #{application.id}</span>
                <StatusBadge status={application.status} />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <a 
                      href={application.resumeUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      View Resume
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Applied: {new Date(application.appliedAt).toLocaleDateString()}
                    </span>
                  </div>
                  {application.coverLetter && (
                    <div className="mt-4">
                      <h3 className="font-semibold mb-2">Cover Letter</h3>
                      <p className="text-sm text-muted-foreground">
                        {application.coverLetter}
                      </p>
                    </div>
                  )}
                </div>

                {user?.role === "EMPLOYER" && (
                  <div className="space-y-4">
                    <h3 className="font-semibold">Update Status</h3>
                    <Select
                      value={application.status}
                      onValueChange={(value: Application['status']) => 
                        statusMutation.mutate({ 
                          id: application.id, 
                          status: value 
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="ACCEPTED">Accept</SelectItem>
                        <SelectItem value="REJECTED">Reject</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {(!applications || applications.length === 0) && (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              {user?.role === "EMPLOYER"
                ? "No applications received yet."
                : "You haven't applied to any jobs yet."}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Application['status'] }) {
  const config = {
    PENDING: {
      icon: Clock,
      className: "bg-yellow-100 text-yellow-800",
    },
    ACCEPTED: {
      icon: CheckCircle,
      className: "bg-green-100 text-green-800",
    },
    REJECTED: {
      icon: XCircle,
      className: "bg-red-100 text-red-800",
    },
  };

  const { icon: Icon, className } = config[status];

  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${className}`}>
      <Icon className="h-4 w-4" />
      <span>{status}</span>
    </div>
  );
}
