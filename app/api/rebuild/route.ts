import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GITHUB_TOKEN = process.env.REPO_GITHUB_TOKEN; // Create as repo secret
const GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY; // owner/repo
const WORKFLOW_FILE = "deploy.yml"; // workflow filename to dispatch

export async function POST(req: Request) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE || !GITHUB_TOKEN || !GITHUB_REPOSITORY) {
    return NextResponse.json(
      { error: "Server not configured: missing SUPABASE_SERVICE_ROLE_KEY or REPO_GITHUB_TOKEN or GITHUB_REPOSITORY" },
      { status: 500 }
    );
  }

  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.replace("Bearer ", "").trim();

  if (!token) {
    return NextResponse.json({ error: "Missing authorization token" }, { status: 401 });
  }

  // Verify Supabase session using service role key
  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    const { data, error } = await admin.auth.getUser(token as string);
    if (error || !data?.user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }
  } catch (err) {
    return NextResponse.json({ error: "Failed to validate session" }, { status: 500 });
  }

  // Dispatch GitHub workflow
  const [owner, repo] = GITHUB_REPOSITORY.split("/");

  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${WORKFLOW_FILE}/dispatches`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github+json",
        },
        body: JSON.stringify({ ref: "main" }),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: "GitHub dispatch failed", detail: text }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to contact GitHub" }, { status: 500 });
  }
}
