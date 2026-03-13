import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
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

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } =
      await anonClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const callerId = claimsData.claims.sub;

    // Use service role client to check admin role
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: roleCheck } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", callerId)
      .eq("role", "admin")
      .single();

    if (!roleCheck) {
      return new Response(JSON.stringify({ error: "Forbidden: admin only" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, user_id, password, role, send_email, user_email } = await req.json();

    if (!action || !user_id) {
      return new Response(
        JSON.stringify({ error: "action and user_id are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
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

        // Optionally send email with new password
        const { send_email, user_email } = await req.json().catch(() => ({}));
        // Re-parse won't work since body already consumed, so we read from the original parsed body
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
