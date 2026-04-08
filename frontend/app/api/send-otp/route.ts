import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { db } from "@/lib/firebase";
import { ref, set, get } from "firebase/database";

// ─── Transporter ─────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASS,
  },
});

// ─── POST /api/send-otp ──────────────────────────────────────
export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const key = email.replace(/\./g, "_").replace(/@/g, "_at_");

  // Store OTP with 10-min expiry
  await set(ref(db, `otps/${key}`), {
    otp,
    expires: Date.now() + 10 * 60 * 1000,
  });

  try {
    await transporter.sendMail({
      from: `"Tikajoshi" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: "Your Tikajoshi verification code",
      html: `
        <div style="font-family:sans-serif;max-width:420px;margin:0 auto;padding:32px 24px;background:#080d14;border-radius:16px;color:#f1f5f9">
          <div style="font-size:28px;font-weight:900;margin-bottom:8px">tikajoshi</div>
          <p style="color:#64748b;margin-bottom:28px">Your one-time verification code:</p>
          <div style="font-size:48px;font-weight:900;letter-spacing:12px;color:#6366f1;margin-bottom:28px">${otp}</div>
          <p style="color:#475569;font-size:13px">This code expires in <strong>10 minutes</strong>. If you didn't request this, ignore this email.</p>
        </div>`,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("SMTP error:", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}

// ─── PUT /api/send-otp — verify ──────────────────────────────
export async function PUT(req: NextRequest) {
  const { email, otp } = await req.json();
  const key = email.replace(/\./g, "_").replace(/@/g, "_at_");
  const snap = await get(ref(db, `otps/${key}`));
  if (!snap.exists()) return NextResponse.json({ error: "No OTP found" }, { status: 400 });

  const { otp: stored, expires } = snap.val();
  if (Date.now() > expires)  return NextResponse.json({ error: "OTP expired" }, { status: 400 });
  if (otp !== stored)        return NextResponse.json({ error: "Wrong OTP" },   { status: 400 });

  // Clear after use
  await set(ref(db, `otps/${key}`), null);
  return NextResponse.json({ ok: true });
}
