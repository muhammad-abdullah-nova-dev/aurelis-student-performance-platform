# ✅ Final Deployment Steps

## Status: ALMOST COMPLETE

### ✅ Completed
1. ✅ Supabase CLI installed and authenticated
2. ✅ Project linked to `tbdslkstlsshbowqtufq`
3. ✅ Database schema deployed (up to date)
4. ✅ All HTML files updated with correct project URL and API key
5. ✅ `create-ta-profile` Edge Function deployed with security fixes (v2)

### ⚠️ ONE TASK REMAINING

**Deploy `cleanup-failed-signup` manually** (CLI bundler error - needs manual upload)

---

## 🔴 CRITICAL: Manual Deployment Required

The `cleanup-failed-signup` function needs to be deployed manually through the Supabase Dashboard.

### Step-by-Step Instructions:

1. **Go to Edge Functions page:**
   https://supabase.com/dashboard/project/tbdslkstlsshbowqtufq/functions

2. **Find `cleanup-failed-signup` in the list**
   - It may already exist (old version without security fixes)
   - Click on it to open

3. **Edit the function:**
   - Click **"Edit Function"** or **"Deploy"** button
   - You'll see a code editor

4. **Copy the ENTIRE contents of this file:**
   `supabase/functions/cleanup-failed-signup/index.ts`

5. **Paste it into the dashboard editor**
   - Select all existing code (Ctrl+A)
   - Paste the new code (Ctrl+V)

6. **Click "Deploy"**
   - Wait for deployment to complete
   - Should see "Successfully deployed"

### 📋 Quick Copy (Entire Function Code)

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Called by login.html ONLY when Step 2 of signup (create-ta-profile) fails
// right after Step 1 (auth.signUp) already succeeded. Deletes the just-created
// auth user so the person can retry signup with the same email instead of
// getting stuck on "User already registered" forever.
//
// SECURITY: Requires JWT authentication. Users can only delete their own
// failed signup within a 5-minute window. Profile existence check prevents
// deletion of fully-created accounts.
serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    // 1. Require and verify JWT authentication
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized - authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create client with the user's JWT to verify authentication
    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify JWT and get authenticated user
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create service role client for admin operations
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 2. Parse request body
    const { auth_user_id } = await req.json();
    
    if (!auth_user_id) {
      return new Response(
        JSON.stringify({ error: "Missing auth_user_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Enforce ownership - caller can only delete their own account
    if (auth_user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: "Forbidden - can only delete your own failed signup" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Check time window - only allow cleanup within 5 minutes of account creation
    const { data: authUser, error: getUserError } = await supabase.auth.admin.getUserById(auth_user_id);
    
    if (getUserError || !authUser) {
      return new Response(
        JSON.stringify({ error: "Account not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const createdAt = new Date(authUser.user.created_at);
    const now = new Date();
    const ageMinutes = (now.getTime() - createdAt.getTime()) / 1000 / 60;

    if (ageMinutes > 5) {
      return new Response(
        JSON.stringify({ error: "Cleanup window expired" }),
        { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 5. Safety check: only delete if this user has NO ta_profiles row —
    // never delete a real, fully-created account.
    const { data: profile } = await supabase
      .from("ta_profiles")
      .select("id")
      .eq("id", auth_user_id)
      .maybeSingle();

    if (profile) {
      return new Response(
        JSON.stringify({ error: "Account is already complete" }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 6. Delete the auth user (allows retry with same email)
    const { error } = await supabase.auth.admin.deleteUser(auth_user_id);
    
    if (error) {
      return new Response(
        JSON.stringify({ error: "Failed to cleanup account" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
```

---

## ✅ After Deployment

Once you've manually deployed `cleanup-failed-signup`, everything will be ready!

### Test Your Application

1. **Refresh your browser** (to load updated HTML files)
2. **Go to:** http://127.0.0.1:8000/login.html
3. **Try signing up** with a NEW email address
4. **Signup should work completely!**

### What's Fixed

- ✅ Edge Functions now require JWT authentication
- ✅ Users can only create/delete their own profiles
- ✅ Cleanup has 5-minute time window
- ✅ Email validation enforced
- ✅ No more "User already exists" on failed signups
- ✅ All security vulnerabilities (CVE-1 through CVE-5) resolved

---

## 🚀 Your Application Is Ready!

**Frontend:** http://127.0.0.1:8000  
**Supabase Dashboard:** https://supabase.com/dashboard/project/tbdslkstlsshbowqtufq  
**Edge Functions:** https://supabase.com/dashboard/project/tbdslkstlsshbowqtufq/functions

**Project:** muhammad-abdullah-nova-dev's Project (`tbdslkstlsshbowqtufq`)
