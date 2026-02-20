import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Save, X, Eye, Code, Mail } from "lucide-react";
import { format } from "date-fns";

interface EmailTemplate {
  id: string;
  name: string;
  display_name: string;
  subject: string;
  html_body: string;
  available_variables: string[];
  updated_at: string;
  updated_by: string | null;
  created_at: string;
}

const SAMPLE_DATA: Record<string, string> = {
  customer_name: "John Smith",
  package_type: "Fixed Term",
  ad_size: "Half Page",
  duration: "6 months",
  circulation: "25,000",
  total_cost: "£540.00",
  monthly_price: "£90.00",
  duration_discount: "10%",
  dashboard_url: "https://example.com/dashboard",
  type_label: "Booking",
  model_label: "Fixed Term",
  email: "john@example.com",
  phone: "023 9298 9314",
  company: "Smith & Co Ltd",
  details_table: '<table style="width:100%;"><tr><td>Package</td><td>Fixed Term</td></tr></table>',
  admin_url: "https://example.com/admin",
  // Bogof-specific
  paid_areas: "Fareham, Gosport",
  free_areas: "Portchester",
  total_circulation: "15,000",
  // Leafleting-specific
  leaflet_size: "A5",
  number_of_areas: "3",
  distribution_start: "March 2025",
};

function applyPreviewVariables(html: string, variables: string[]): string {
  let result = html;
  for (const v of variables) {
    const regex = new RegExp(`\\{\\{${v}\\}\\}`, "g");
    result = result.replace(regex, SAMPLE_DATA[v] || `[${v}]`);
  }
  return result;
}

export default function EmailTemplatesManagement() {
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [editSubject, setEditSubject] = useState("");
  const [editHtmlBody, setEditHtmlBody] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["email-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_templates" as any)
        .select("*")
        .order("created_at");
      if (error) throw error;
      return (data as unknown as EmailTemplate[]) || [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async ({ id, subject, html_body }: { id: string; subject: string; html_body: string }) => {
      const { error } = await supabase
        .from("email_templates" as any)
        .update({ subject, html_body } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Saved", description: "Email template updated successfully." });
      queryClient.invalidateQueries({ queryKey: ["email-templates"] });
      setEditingTemplate(null);
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const startEditing = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setEditSubject(template.subject);
    setEditHtmlBody(template.html_body);
  };

  const handleSave = () => {
    if (!editingTemplate) return;
    saveMutation.mutate({ id: editingTemplate.id, subject: editSubject, html_body: editHtmlBody });
  };

  if (editingTemplate) {
    const previewHtml = applyPreviewVariables(editHtmlBody, editingTemplate.available_variables);

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setEditingTemplate(null)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h2 className="text-xl font-bold">{editingTemplate.display_name}</h2>
              <p className="text-sm text-muted-foreground">Editing email template</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEditingTemplate(null)}>
              <X className="h-4 w-4 mr-2" /> Cancel
            </Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending}>
              <Save className="h-4 w-4 mr-2" /> {saveMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>

        {/* Subject line */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Subject Line</label>
          <Input value={editSubject} onChange={(e) => setEditSubject(e.target.value)} />
        </div>

        {/* Available Variables */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-muted-foreground">Variables:</span>
          {editingTemplate.available_variables.map((v) => (
            <Badge
              key={v}
              variant="secondary"
              className="cursor-pointer font-mono text-xs"
              onClick={() => {
                setEditHtmlBody((prev) => prev + `{{${v}}}`);
              }}
            >
              {`{{${v}}}`}
            </Badge>
          ))}
        </div>

        {/* Editor + Preview split */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" style={{ minHeight: "500px" }}>
          {/* Code editor */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Code className="h-4 w-4" /> HTML Editor
            </div>
            <textarea
              value={editHtmlBody}
              onChange={(e) => setEditHtmlBody(e.target.value)}
              className="w-full h-[500px] rounded-md border border-input bg-zinc-950 text-green-400 font-mono text-xs p-4 resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              spellCheck={false}
            />
          </div>

          {/* Live preview */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Eye className="h-4 w-4" /> Live Preview
            </div>
            <div
              className="w-full h-[500px] rounded-md border border-input bg-white overflow-auto p-4"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Email Templates</h2>
        <p className="text-muted-foreground">
          Manage email templates used for booking confirmations, quotes, and welcome emails.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" /> Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8 text-muted-foreground">Loading templates...</p>
          ) : templates.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No templates found. Run the database seed to create default templates.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Template</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.display_name}</TableCell>
                    <TableCell className="max-w-[300px] truncate text-muted-foreground">{t.subject}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(t.updated_at), "dd MMM yyyy HH:mm")}
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => startEditing(t)}>
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
