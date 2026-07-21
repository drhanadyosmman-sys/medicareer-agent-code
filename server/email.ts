import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "MediCareer Agent <support@hqcsai.uk>";

// ─── HTML Template Helper ────────────────────────────────────────────────────
function baseTemplate(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background: #f4f6f9; font-family: 'Segoe UI', Arial, sans-serif; }
    .wrapper { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #0a1628 0%, #0d2040 100%); padding: 32px 40px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.5px; }
    .header p { color: #14b8a6; margin: 6px 0 0; font-size: 13px; letter-spacing: 1px; text-transform: uppercase; }
    .body { padding: 36px 40px; color: #1e293b; line-height: 1.7; font-size: 15px; }
    .body h2 { color: #0a1628; font-size: 20px; margin-top: 0; }
    .body p { margin: 0 0 16px; }
    .highlight-box { background: #f0fdf9; border-left: 4px solid #14b8a6; border-radius: 6px; padding: 16px 20px; margin: 20px 0; }
    .highlight-box p { margin: 0; color: #0f766e; font-weight: 500; }
    .btn { display: inline-block; background: #14b8a6; color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px; margin: 8px 0; }
    .divider { border: none; border-top: 1px solid #e2e8f0; margin: 28px 0; }
    .footer { background: #0a1628; padding: 24px 40px; text-align: center; }
    .footer p { color: rgba(255,255,255,0.5); font-size: 12px; margin: 4px 0; }
    .footer a { color: #14b8a6; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>MediCareer Agent</h1>
      <p>Expert UK Medical Career Support</p>
    </div>
    <div class="body">
      ${body}
    </div>
    <div class="footer">
      <p>MediCareer Agent &mdash; Powered by <strong style="color:#14b8a6">TMLA Group</strong></p>
      <p>Registered in Saudi Arabia &bull; CR: 7053685355</p>
      <p><a href="https://agent.hcqsai.uk">agent.hcqsai.uk</a> &bull; <a href="mailto:support@hqcsai.uk">support@hqcsai.uk</a></p>
    </div>
  </div>
</body>
</html>`;
}

// ─── 1. Welcome / Registration Email ────────────────────────────────────────
export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  const body = `
    <h2>Welcome to MediCareer Agent, ${name}! 👋</h2>
    <p>We're thrilled to have you on board. Your account has been successfully created and you're now one step closer to securing your NHS position in the UK.</p>
    <div class="highlight-box">
      <p>🎯 Our team will review your profile within <strong>48 hours</strong> and reach out with your personalised career roadmap.</p>
    </div>
    <p>In the meantime, here's what you can do:</p>
    <ul>
      <li>Complete your profile assessment if you haven't already</li>
      <li>Upload your CV and supporting documents</li>
      <li>Explore available NHS roles in your specialty</li>
    </ul>
    <p style="text-align:center;margin-top:28px;">
      <a class="btn" href="https://agent.hcqsai.uk/dashboard">Go to Your Dashboard</a>
    </p>
    <hr class="divider" />
    <p style="font-size:13px;color:#64748b;">If you have any questions, simply reply to this email or contact us at <a href="mailto:support@hqcsai.uk" style="color:#14b8a6">support@hqcsai.uk</a>.</p>
  `;
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Welcome to MediCareer Agent 🎉",
    html: baseTemplate("Welcome to MediCareer Agent", body),
  });
}

// ─── 2. Application Submitted Confirmation ───────────────────────────────────
export async function sendApplicationConfirmationEmail(
  to: string,
  name: string,
  applicationId: string
): Promise<void> {
  const body = `
    <h2>Application Received ✅</h2>
    <p>Dear ${name},</p>
    <p>We have successfully received your application. Our career consultants will begin reviewing your profile and documents within <strong>48 hours</strong>.</p>
    <div class="highlight-box">
      <p>📋 Application Reference: <strong>${applicationId}</strong></p>
    </div>
    <p><strong>What happens next?</strong></p>
    <ol>
      <li><strong>Profile Review</strong> — Our team reviews your CV, qualifications, and career goals</li>
      <li><strong>Readiness Assessment</strong> — We identify gaps and opportunities in your profile</li>
      <li><strong>Job Matching</strong> — We match you with suitable NHS roles across the UK</li>
      <li><strong>Application Preparation</strong> — We tailor your CV and cover letters for each role</li>
    </ol>
    <p style="text-align:center;margin-top:28px;">
      <a class="btn" href="https://agent.hcqsai.uk/dashboard">Track Your Application</a>
    </p>
    <hr class="divider" />
    <p style="font-size:13px;color:#64748b;">Questions? Contact us at <a href="mailto:support@hqcsai.uk" style="color:#14b8a6">support@hqcsai.uk</a></p>
  `;
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Your Application Has Been Received — MediCareer Agent",
    html: baseTemplate("Application Received", body),
  });
}

// ─── 3. New Message Notification ─────────────────────────────────────────────
export async function sendNewMessageNotificationEmail(
  to: string,
  name: string,
  messagePreview: string
): Promise<void> {
  const body = `
    <h2>You Have a New Message 💬</h2>
    <p>Dear ${name},</p>
    <p>Your career consultant has sent you a new message on MediCareer Agent:</p>
    <div class="highlight-box">
      <p>"${messagePreview}"</p>
    </div>
    <p style="text-align:center;margin-top:28px;">
      <a class="btn" href="https://agent.hcqsai.uk/dashboard">Read Full Message</a>
    </p>
    <hr class="divider" />
    <p style="font-size:13px;color:#64748b;">You are receiving this because you have an active application with MediCareer Agent. <a href="mailto:support@hqcsai.uk" style="color:#14b8a6">Contact us</a> if you have any questions.</p>
  `;
  await resend.emails.send({
    from: FROM,
    to,
    subject: "New Message from Your Career Consultant — MediCareer Agent",
    html: baseTemplate("New Message", body),
  });
}

// ─── 4. Application Status Update ────────────────────────────────────────────
export async function sendStatusUpdateEmail(
  to: string,
  name: string,
  newStatus: string,
  details?: string
): Promise<void> {
  const statusLabels: Record<string, string> = {
    submitted: "Submitted",
    "under-review": "Under Review",
    "cv-review": "CV Under Review",
    matching: "Job Matching in Progress",
    applied: "Application Submitted to NHS",
    interview: "Interview Stage",
    offered: "Job Offer Received 🎉",
    rejected: "Application Unsuccessful",
  };
  const label = statusLabels[newStatus] || newStatus;
  const isOffer = newStatus === "offered";

  const body = `
    <h2>Application Status Update ${isOffer ? "🎉" : "📋"}</h2>
    <p>Dear ${name},</p>
    <p>Your application status has been updated:</p>
    <div class="highlight-box">
      <p>New Status: <strong>${label}</strong></p>
      ${details ? `<p style="margin-top:8px;color:#0f766e;">${details}</p>` : ""}
    </div>
    ${isOffer ? `<p>Congratulations! Our team will be in touch shortly with the next steps to finalise your offer.</p>` : `<p>Log in to your dashboard to see the full details and any required actions.</p>`}
    <p style="text-align:center;margin-top:28px;">
      <a class="btn" href="https://agent.hcqsai.uk/dashboard">View Dashboard</a>
    </p>
    <hr class="divider" />
    <p style="font-size:13px;color:#64748b;">Questions? Contact us at <a href="mailto:support@hqcsai.uk" style="color:#14b8a6">support@hqcsai.uk</a></p>
  `;
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Application Update: ${label} — MediCareer Agent`,
    html: baseTemplate("Application Status Update", body),
  });
}

// ─── 5. Admin: New Application Alert ─────────────────────────────────────────
export async function sendAdminNewApplicationAlert(
  adminEmail: string,
  applicantName: string,
  applicantEmail: string,
  applicationId: string
): Promise<void> {
  const body = `
    <h2>New Application Received 🔔</h2>
    <p>A new application has been submitted on MediCareer Agent:</p>
    <div class="highlight-box">
      <p><strong>Name:</strong> ${applicantName}</p>
      <p><strong>Email:</strong> ${applicantEmail}</p>
      <p><strong>Application ID:</strong> ${applicationId}</p>
      <p><strong>Submitted:</strong> ${new Date().toLocaleString("en-GB", { timeZone: "Europe/London" })}</p>
    </div>
    <p style="text-align:center;margin-top:28px;">
      <a class="btn" href="https://agent.hcqsai.uk/admin/applications">Review Application</a>
    </p>
  `;
  await resend.emails.send({
    from: FROM,
    to: adminEmail,
    subject: `New Application: ${applicantName} — MediCareer Agent`,
    html: baseTemplate("New Application Alert", body),
  });
}

// ─── 6. Job Shared with Doctor ────────────────────────────────────────────────
export async function sendJobSharedEmail(
  to: string,
  name: string,
  jobTitle: string,
  hospital: string,
  location: string
): Promise<void> {
  const body = `
    <h2>A New Job Has Been Matched For You 🎯</h2>
    <p>Dear ${name},</p>
    <p>Your career consultant has found a suitable NHS role that matches your profile:</p>
    <div class="highlight-box">
      <p><strong>Role:</strong> ${jobTitle}</p>
      <p><strong>Hospital:</strong> ${hospital}</p>
      <p><strong>Location:</strong> ${location}</p>
    </div>
    <p>Log in to your dashboard to review the full job details and let us know if you'd like us to apply on your behalf.</p>
    <p style="text-align:center;margin-top:28px;">
      <a class="btn" href="https://agent.hcqsai.uk/dashboard">View Matched Job</a>
    </p>
    <hr class="divider" />
    <p style="font-size:13px;color:#64748b;">Questions? Contact us at <a href="mailto:support@hqcsai.uk" style="color:#14b8a6">support@hqcsai.uk</a></p>
  `;
  await resend.emails.send({
    from: FROM,
    to,
    subject: `New Job Match: ${jobTitle} at ${hospital} — MediCareer Agent`,
    html: baseTemplate("New Job Matched", body),
  });
}
