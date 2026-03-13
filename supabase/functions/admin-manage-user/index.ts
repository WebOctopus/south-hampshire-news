import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify caller is admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const anonClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user: callerUser }, error: userError } = await anonClient.auth.getUser();
    if (userError || !callerUser) {
      console.error("Auth verification failed:", userError?.message);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const callerId = callerUser.id;

    // Use service role client to check admin role
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: roleCheck } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", callerId)
      .eq("role", "admin")
      .single();

    if (!roleCheck) {
      console.error("Admin role check failed for user:", callerId);
      return new Response(JSON.stringify({ error: "Forbidden: admin only" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { action, user_id, password, role, send_email, user_email, ...extraFields } = body;

    if (!action) {
      return new Response(
        JSON.stringify({ error: "action is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // create_user doesn't need user_id; all others do
    if (action !== 'create_user' && !user_id) {
      return new Response(
        JSON.stringify({ error: "user_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Prevent admin from deleting themselves
    if (action === "delete_user" && user_id === callerId) {
      return new Response(
        JSON.stringify({ error: "Cannot delete your own account" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let result: any = {};

    switch (action) {
      case "delete_user": {
        const { error } = await adminClient.auth.admin.deleteUser(user_id);
        if (error) throw error;
        result = { success: true, message: "User deleted successfully" };
        break;
      }

      case "set_password": {
        if (!password || password.length < 6) {
          return new Response(
            JSON.stringify({
              error: "Password must be at least 6 characters",
            }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
        const { error } = await adminClient.auth.admin.updateUserById(
          user_id,
          { password }
        );
        if (error) throw error;
        result = { success: true, message: "Password updated successfully" };

        // Optionally send email with new password via Resend
        if (send_email && user_email) {
          const resendApiKey = Deno.env.get("RESEND_API_KEY");
          if (resendApiKey) {
            // Try to fetch template from email_templates table
            let htmlBody = '';
            const { data: template } = await adminClient
              .from('email_templates')
              .select('html_body, subject')
              .eq('name', 'password_set_admin')
              .single();

            if (template?.html_body) {
              htmlBody = template.html_body
                .replace(/\{\{password\}\}/g, password)
                .replace(/\{\{email\}\}/g, user_email);
            } else {
              // Fallback branded HTML email
              htmlBody = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px 20px;">
                  <div style="text-align: center; margin-bottom: 30px;">
                    <img src="https://peacockpixelmedia.co.uk/lovable-uploads/discover-logo.png" alt="Discover Magazine" style="max-width: 200px;" />
                  </div>
                  <h2 style="color: #333; text-align: center;">Your Password Has Been Updated</h2>
                  <p style="color: #555; font-size: 16px;">Hello,</p>
                  <p style="color: #555; font-size: 16px;">Your account password has been updated by an administrator. You can now log in with the following credentials:</p>
                  <div style="background: #f5f5f5; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
                    <p style="margin: 0 0 8px 0; color: #777; font-size: 14px;">Email</p>
                    <p style="margin: 0 0 16px 0; color: #333; font-size: 16px; font-weight: bold;">${user_email}</p>
                    <p style="margin: 0 0 8px 0; color: #777; font-size: 14px;">New Password</p>
                    <p style="margin: 0; color: #333; font-size: 18px; font-weight: bold; letter-spacing: 1px;">${password}</p>
                  </div>
                  <p style="color: #555; font-size: 16px;">We recommend changing your password after logging in for security purposes.</p>
                  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
                  <div style="text-align: center; color: #999; font-size: 12px;">
                    <p>📞 023 8026 6388 &nbsp; ✉ discover@discovermagazines.co.uk</p>
                    <p>📍 30 Leigh Road, Eastleigh, SO50 9DT Hampshire</p>
                    <p style="margin-top: 10px;">Connecting South Hampshire communities since 2014</p>
                  </div>
                </div>
              `;
            }

            const emailSubject = template?.subject || 'Your account password has been updated';

            try {
              await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${resendApiKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  from: 'Discover Magazine <discovermagazines@peacockpixelmedia.co.uk>',
                  to: [user_email],
                  subject: emailSubject,
                  html: htmlBody,
                }),
              });
              result.email_sent = true;
            } catch (emailError) {
              console.error('Failed to send password email:', emailError);
              result.email_sent = false;
              result.email_error = 'Failed to send email';
            }
          }
        }
        break;
      }

      case "update_role": {
        if (role === "admin") {
          // Add admin role
          const { error } = await adminClient.from("user_roles").upsert(
            { user_id, role: "admin" },
            { onConflict: "user_id,role" }
          );
          if (error) throw error;
          result = { success: true, message: "Admin role assigned" };
        } else {
          // Remove admin role (set to regular user)
          const { error } = await adminClient
            .from("user_roles")
            .delete()
            .eq("user_id", user_id)
            .eq("role", "admin");
          if (error) throw error;
          result = { success: true, message: "Admin role removed" };
        }
        break;
      }

      case "get_user_email": {
        const { data, error } = await adminClient.auth.admin.getUserById(
          user_id
        );
        if (error) throw error;
        result = { email: data.user?.email };
        break;
      }

      case "list_users_with_email": {
        const { data, error } = await adminClient.auth.admin.listUsers({
          perPage: 1000,
        });
        if (error) throw error;
        const emailMap: Record<string, string> = {};
        for (const u of data.users) {
          emailMap[u.id] = u.email || "";
        }
        result = { emailMap };
        break;
      }

      case "create_user": {
        // All fields already destructured from the single req.json() call above
        const createEmail = body.email;
        const createPassword = body.password;
        const createDisplayName = body.display_name;
        const createSendEmail = body.send_email;

        if (!createEmail || !createPassword) {
          return new Response(
            JSON.stringify({ error: "email and password are required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        if (createPassword.length < 6) {
          return new Response(
            JSON.stringify({ error: "Password must be at least 6 characters" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
          email: createEmail,
          password: createPassword,
          email_confirm: true,
          user_metadata: createDisplayName ? { display_name: createDisplayName } : undefined,
        });
        if (createError) throw createError;
        result = { success: true, message: "User created successfully", user_id: newUser.user?.id };

        // Optionally send credentials email
        if (createSendEmail && createEmail) {
          const resendApiKey = Deno.env.get("RESEND_API_KEY");
          if (resendApiKey) {
            const { data: template } = await adminClient
              .from('email_templates')
              .select('html_body, subject')
              .eq('name', 'new_user_credentials')
              .single();

            let htmlBody = template?.html_body
              ? template.html_body
                  .replace(/\{\{password\}\}/g, createPassword)
                  .replace(/\{\{email\}\}/g, createEmail)
                  .replace(/\{\{display_name\}\}/g, createDisplayName || createEmail)
              : `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px 20px;">
                  <div style="text-align: center; margin-bottom: 30px;">
                    <img src="https://peacockpixelmedia.co.uk/lovable-uploads/discover-logo.png" alt="Discover Magazine" style="max-width: 200px;" />
                  </div>
                  <h2 style="color: #333; text-align: center;">Welcome! Your Account Has Been Created</h2>
                  <p style="color: #555; font-size: 16px;">Hello${createDisplayName ? ' ' + createDisplayName : ''},</p>
                  <p style="color: #555; font-size: 16px;">An account has been created for you. You can log in with the following credentials:</p>
                  <div style="background: #f5f5f5; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
                    <p style="margin: 0 0 8px 0; color: #777; font-size: 14px;">Email</p>
                    <p style="margin: 0 0 16px 0; color: #333; font-size: 16px; font-weight: bold;">${createEmail}</p>
                    <p style="margin: 0 0 8px 0; color: #777; font-size: 14px;">Password</p>
                    <p style="margin: 0; color: #333; font-size: 18px; font-weight: bold; letter-spacing: 1px;">${createPassword}</p>
                  </div>
                  <p style="color: #555; font-size: 16px;">We recommend changing your password after logging in for security purposes.</p>
                  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
                  <div style="text-align: center; color: #999; font-size: 12px;">
                    <p>📞 023 8026 6388 &nbsp; ✉ discover@discovermagazines.co.uk</p>
                    <p>📍 30 Leigh Road, Eastleigh, SO50 9DT Hampshire</p>
                  </div>
                </div>
              `;

            try {
              await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${resendApiKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  from: 'Discover Magazine <discovermagazines@peacockpixelmedia.co.uk>',
                  to: [createEmail],
                  subject: template?.subject || 'Your new account credentials',
                  html: htmlBody,
                }),
              });
              result.email_sent = true;
            } catch (emailError) {
              console.error('Failed to send credentials email:', emailError);
              result.email_sent = false;
            }
          }
        }
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("admin-manage-user error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
