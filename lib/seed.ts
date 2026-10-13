import { derivePriority } from "./constants";
import { slaDueFrom } from "./sla";
import type {
  Activity,
  Article,
  CatalogItem,
  Impact,
  Priority,
  ServiceRequest,
  Ticket,
  TicketState,
  Urgency,
  User,
} from "./types";

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

export function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * HOUR).toISOString();
}

export function daysAgo(days: number): string {
  return new Date(Date.now() - days * DAY).toISOString();
}

export function daysFromNow(days: number): string {
  return new Date(Date.now() + days * DAY).toISOString();
}

export const seedUsers: User[] = [
  {
    id: "u-admin",
    name: "Alex Morgan",
    email: "alex.morgan@acme.io",
    role: "admin",
    title: "IT Service Manager",
    department: "IT Operations",
    location: "Singapore",
    avatarColor: "bg-violet-500",
    active: true,
  },
  {
    id: "u-agent-1",
    name: "Priya Nair",
    email: "priya.nair@acme.io",
    role: "agent",
    title: "Senior Support Engineer",
    department: "Service Desk",
    location: "Bengaluru",
    avatarColor: "bg-emerald-500",
    active: true,
  },
  {
    id: "u-agent-2",
    name: "Marcus Lee",
    email: "marcus.lee@acme.io",
    role: "agent",
    title: "Network Engineer",
    department: "Network Operations",
    location: "Sydney",
    avatarColor: "bg-sky-500",
    active: true,
  },
  {
    id: "u-agent-3",
    name: "Sofia Alvarez",
    email: "sofia.alvarez@acme.io",
    role: "agent",
    title: "Identity Analyst",
    department: "Identity & Access",
    location: "Madrid",
    avatarColor: "bg-rose-500",
    active: true,
  },
  {
    id: "u-user-1",
    name: "Jordan Blake",
    email: "jordan.blake@acme.io",
    role: "user",
    title: "Account Executive",
    department: "Sales",
    location: "London",
    avatarColor: "bg-amber-500",
    active: true,
  },
  {
    id: "u-user-2",
    name: "Hana Kim",
    email: "hana.kim@acme.io",
    role: "user",
    title: "Product Designer",
    department: "Product",
    location: "Seoul",
    avatarColor: "bg-cyan-500",
    active: true,
  },
];

interface TicketSeed {
  shortDescription: string;
  description: string;
  state: TicketState;
  impact: Impact;
  urgency: Urgency;
  category: string;
  assignmentGroup: string;
  assigneeId: string | null;
  callerId: string;
  channel: Ticket["channel"];
  createdHoursAgo: number;
}

const ticketSeeds: TicketSeed[] = [
  {
    shortDescription: "Unable to connect to corporate VPN from home",
    description:
      "Since this morning the VPN client fails with 'authentication failed' when connecting from home Wi-Fi. Password was reset yesterday. Need access to shared drives.",
    state: "In Progress",
    impact: "1 - High",
    urgency: "2 - Medium",
    category: "Network",
    assignmentGroup: "Network Operations",
    assigneeId: "u-agent-2",
    callerId: "u-user-1",
    channel: "Phone",
    createdHoursAgo: 6,
  },
  {
    shortDescription: "Production database latency spike on orders cluster",
    description:
      "Monitoring reports p95 query latency above 2s on the orders database. Checkout service is intermittently timing out.",
    state: "In Progress",
    impact: "1 - High",
    urgency: "1 - High",
    category: "Database",
    assignmentGroup: "Application Support",
    assigneeId: "u-agent-1",
    callerId: "u-admin",
    channel: "Self-service",
    createdHoursAgo: 2,
  },
  {
    shortDescription: "New laptop setup for onboarding — Hana Kim",
    description:
      "New designer joining the Product team next Monday. Needs a MacBook Pro configured with design tools and SSO enrollment.",
    state: "New",
    impact: "3 - Low",
    urgency: "2 - Medium",
    category: "Hardware",
    assignmentGroup: "Service Desk",
    assigneeId: null,
    callerId: "u-admin",
    channel: "Email",
    createdHoursAgo: 30,
  },
  {
    shortDescription: "Password reset not working for domain account",
    description:
      "Self-service password reset link returns 'user not found'. Cannot log in to email or intranet.",
    state: "Resolved",
    impact: "2 - Medium",
    urgency: "1 - High",
    category: "Access & Identity",
    assignmentGroup: "Identity & Access",
    assigneeId: "u-agent-3",
    callerId: "u-user-2",
    channel: "Chat",
    createdHoursAgo: 28,
  },
  {
    shortDescription: "Outlook keeps prompting for credentials",
    description:
      "Outlook desktop repeatedly asks for password even though webmail works fine. Started after last Windows update.",
    state: "On Hold",
    impact: "3 - Low",
    urgency: "2 - Medium",
    category: "Email & Collaboration",
    assignmentGroup: "Service Desk",
    assigneeId: "u-agent-1",
    callerId: "u-user-1",
    channel: "Walk-in",
    createdHoursAgo: 52,
  },
  {
    shortDescription: "Printer on 4th floor shows offline",
    description:
      "The shared printer near the break room is marked offline for the whole floor. No jobs are printing.",
    state: "New",
    impact: "3 - Low",
    urgency: "3 - Low",
    category: "Hardware",
    assignmentGroup: "Field Services",
    assigneeId: null,
    callerId: "u-user-2",
    channel: "Self-service",
    createdHoursAgo: 20,
  },
  {
    shortDescription: "Cannot install approved analytics software",
    description:
      "Software Center shows the analytics toolkit but install fails with error 0x80070005 (access denied).",
    state: "In Progress",
    impact: "2 - Medium",
    urgency: "2 - Medium",
    category: "Software",
    assignmentGroup: "Application Support",
    assigneeId: "u-agent-1",
    callerId: "u-user-1",
    channel: "Email",
    createdHoursAgo: 44,
  },
  {
    shortDescription: "Slack notifications delayed across the org",
    description:
      "Message delivery is delayed by 10-15 minutes. Suspected integration with the notification gateway.",
    state: "Resolved",
    impact: "2 - Medium",
    urgency: "1 - High",
    category: "Email & Collaboration",
    assignmentGroup: "Application Support",
    assigneeId: "u-agent-1",
    callerId: "u-admin",
    channel: "Chat",
    createdHoursAgo: 74,
  },
  {
    shortDescription: "Requesting read access to finance SharePoint site",
    description:
      "Need read access to the quarterly reporting folder for a project. Manager approval attached.",
    state: "Closed",
    impact: "3 - Low",
    urgency: "3 - Low",
    category: "Access & Identity",
    assignmentGroup: "Identity & Access",
    assigneeId: "u-agent-3",
    callerId: "u-user-1",
    channel: "Self-service",
    createdHoursAgo: 96,
  },
  {
    shortDescription: "Wi-Fi drops repeatedly in meeting room Orion",
    description:
      "Video calls in meeting room Orion disconnect every few minutes. Other rooms seem fine.",
    state: "In Progress",
    impact: "2 - Medium",
    urgency: "1 - High",
    category: "Network",
    assignmentGroup: "Network Operations",
    assigneeId: "u-agent-2",
    callerId: "u-user-2",
    channel: "Phone",
    createdHoursAgo: 12,
  },
  {
    shortDescription: "MFA device lost — need backup codes",
    description:
      "Phone was replaced and the authenticator app did not transfer. Locked out of all SSO apps.",
    state: "Resolved",
    impact: "2 - Medium",
    urgency: "1 - High",
    category: "Access & Identity",
    assignmentGroup: "Identity & Access",
    assigneeId: "u-agent-3",
    callerId: "u-user-1",
    channel: "Phone",
    createdHoursAgo: 120,
  },
  {
    shortDescription: "Excel crashes when opening large reports",
    description:
      "Excel closes unexpectedly when opening the monthly sales workbook from the shared drive.",
    state: "On Hold",
    impact: "3 - Low",
    urgency: "3 - Low",
    category: "Software",
    assignmentGroup: "Service Desk",
    assigneeId: "u-agent-1",
    callerId: "u-user-2",
    channel: "Email",
    createdHoursAgo: 160,
  },
  {
    shortDescription: "USB docking station not detecting monitors",
    description:
      "After the dock was swapped, only one of two external monitors is detected. Cables and ports verified.",
    state: "New",
    impact: "3 - Low",
    urgency: "2 - Medium",
    category: "Hardware",
    assignmentGroup: "Field Services",
    assigneeId: null,
    callerId: "u-user-1",
    channel: "Walk-in",
    createdHoursAgo: 8,
  },
  {
    shortDescription: "Email attachments blocked from external domains",
    description:
      "Inbound attachments from partner domains are quarantined. The security team has not flagged them.",
    state: "In Progress",
    impact: "2 - Medium",
    urgency: "3 - Low",
    category: "Email & Collaboration",
    assignmentGroup: "Application Support",
    assigneeId: "u-agent-2",
    callerId: "u-admin",
    channel: "Self-service",
    createdHoursAgo: 36,
  },
];

export function buildSeedTickets(): { tickets: Ticket[]; activities: Activity[] } {
  const tickets: Ticket[] = [];
  const activities: Activity[] = [];

  ticketSeeds.forEach((seed, index) => {
    const id = `t-${String(index + 1).padStart(3, "0")}`;
    const number = `INC00${String(10001 + index)}`;
    const createdAt = hoursAgo(seed.createdHoursAgo);
    const priority: Priority = derivePriority(seed.impact, seed.urgency);
    const isSettled = seed.state === "Resolved" || seed.state === "Closed";
    const resolvedAt = isSettled
      ? new Date(
          new Date(createdAt).getTime() + (priority === "Critical" ? 3 : 9) * HOUR,
        ).toISOString()
      : null;

    tickets.push({
      id,
      number,
      shortDescription: seed.shortDescription,
      description: seed.description,
      state: seed.state,
      priority,
      impact: seed.impact,
      urgency: seed.urgency,
      category: seed.category,
      assignmentGroup: seed.assignmentGroup,
      assigneeId: seed.assigneeId,
      callerId: seed.callerId,
      channel: seed.channel,
      createdAt,
      updatedAt: hoursAgo(Math.max(seed.createdHoursAgo - 1, 0.5)),
      resolvedAt,
      closedAt: seed.state === "Closed" ? resolvedAt : null,
      slaDueAt: slaDueFrom(createdAt, priority),
      relatedArticleIds: [],
    });

    activities.push({
      id: `${id}-a-open`,
      ticketId: id,
      authorId: seed.callerId,
      body: "Incident created from " + seed.channel.toLowerCase() + ".",
      kind: "activity",
      createdAt,
    });

    if (seed.assigneeId) {
      activities.push({
        id: `${id}-a-assign`,
        ticketId: id,
        authorId: "u-admin",
        body: "Assigned to " + groupLabel(seed.assignmentGroup) + ".",
        kind: "activity",
        createdAt: hoursAgo(Math.max(seed.createdHoursAgo - 0.5, 0.2)),
      });
    }

    if (seed.state !== "New") {
      activities.push({
        id: `${id}-a-note`,
        ticketId: id,
        authorId: seed.assigneeId ?? "u-agent-1",
        body:
          seed.state === "Resolved"
            ? "Root cause identified and fix verified with the caller. Resolving now."
            : "Investigated and identified the likely cause. Working on a fix.",
        kind: "work_note",
        createdAt: hoursAgo(Math.max(seed.createdHoursAgo - 1.5, 0.3)),
      });
    }

    if (isSettled) {
      activities.push({
        id: `${id}-a-resolve`,
        ticketId: id,
        authorId: seed.assigneeId ?? "u-agent-1",
        body: "Incident resolved and confirmed working.",
        kind: "activity",
        createdAt: resolvedAt ?? hoursAgo(1),
      });
    }
  });

  return { tickets, activities };
}

function groupLabel(group: string): string {
  return group === "Service Desk" ? "the Service Desk" : group;
}

export const seedCatalogItems: CatalogItem[] = [
  {
    id: "cat-laptop",
    name: "Standard Laptop",
    shortDescription: "Request a managed laptop for a new or replacement device.",
    description:
      "A fully managed laptop configured with the standard software image, encryption, and endpoint protection. Choose a model and we will handle provisioning and delivery.",
    category: "Hardware",
    icon: "Laptop",
    price: 1400,
    deliveryTime: "5-7 business days",
    popular: true,
    fields: [
      {
        name: "model",
        label: "Model",
        type: "select",
        required: true,
        options: ["MacBook Pro 14\"", "Dell Latitude 7440", "Lenovo ThinkPad X1"],
      },
      {
        name: "justification",
        label: "Business justification",
        type: "textarea",
        required: true,
        placeholder: "Why do you need this device?",
      },
    ],
  },
  {
    id: "cat-monitor",
    name: "External Monitor",
    shortDescription: "Add a second display to your workstation.",
    description:
      "27-inch QHD monitor with a USB-C dock connection. Includes a stand, cables, and ergonomic setup assistance.",
    category: "Hardware",
    icon: "Monitor",
    price: 320,
    deliveryTime: "3-5 business days",
    popular: true,
    fields: [
      {
        name: "quantity",
        label: "Quantity",
        type: "number",
        required: true,
        placeholder: "1",
      },
      {
        name: "deskLocation",
        label: "Desk location",
        type: "text",
        required: false,
        placeholder: "e.g. Level 4, Desk 42",
      },
    ],
  },
  {
    id: "cat-vpn",
    name: "VPN Access",
    shortDescription: "Get secure remote access to internal resources.",
    description:
      "Provision remote VPN access with the standard corporate profile. Requires manager approval and MFA enrollment.",
    category: "Network & Access",
    icon: "ShieldCheck",
    price: 0,
    deliveryTime: "1 business day",
    popular: true,
    fields: [
      {
        name: "reason",
        label: "Reason for access",
        type: "textarea",
        required: true,
        placeholder: "Describe your remote work needs",
      },
      {
        name: "duration",
        label: "Access duration",
        type: "select",
        required: true,
        options: ["30 days", "90 days", "Permanent"],
      },
    ],
  },
  {
    id: "cat-software",
    name: "Software Installation",
    shortDescription: "Request installation of approved business software.",
    description:
      "Install an approved application on your managed device. A license check and approval may be required for premium titles.",
    category: "Software",
    icon: "AppWindow",
    price: 0,
    deliveryTime: "1-2 business days",
    popular: false,
    fields: [
      {
        name: "software",
        label: "Software title",
        type: "select",
        required: true,
        options: ["Adobe Creative Cloud", "JetBrains IntelliJ", "Tableau Desktop", "Microsoft Visio"],
      },
      {
        name: "device",
        label: "Device name",
        type: "text",
        required: true,
        placeholder: "e.g. ACME-MBP-0142",
      },
    ],
  },
  {
    id: "cat-password",
    name: "Password Reset",
    shortDescription: "Reset your domain or application password.",
    description:
      "Reset a password for a domain account or supported application. Identity verification is required before the reset is processed.",
    category: "Access & Identity",
    icon: "KeyRound",
    price: 0,
    deliveryTime: "Within 1 hour",
    popular: true,
    fields: [
      {
        name: "account",
        label: "Account or system",
        type: "text",
        required: true,
        placeholder: "e.g. domain account",
      },
      {
        name: "verified",
        label: "Identity verification method",
        type: "select",
        required: true,
        options: ["Manager confirmation", "Security questions", "Video call"],
      },
    ],
  },
  {
    id: "cat-mailbox",
    name: "Shared Mailbox",
    shortDescription: "Create a shared team mailbox with a distribution list.",
    description:
      "Create a shared mailbox, grant access to team members, and set up routing rules. Includes a distribution list alias.",
    category: "Email & Collaboration",
    icon: "MailPlus",
    price: 0,
    deliveryTime: "2-3 business days",
    popular: false,
    fields: [
      {
        name: "mailboxName",
        label: "Mailbox name",
        type: "text",
        required: true,
        placeholder: "e.g. support@acme.io",
      },
      {
        name: "members",
        label: "Initial members",
        type: "textarea",
        required: false,
        placeholder: "Comma separated email addresses",
      },
    ],
  },
  {
    id: "cat-mobile",
    name: "Mobile Device Enrollment",
    shortDescription: "Enroll a phone or tablet in mobile device management.",
    description:
      "Enroll a personal or corporate mobile device with MDM so you can securely access email and internal apps.",
    category: "Access & Identity",
    icon: "Smartphone",
    price: 0,
    deliveryTime: "Same day",
    popular: false,
    fields: [
      {
        name: "deviceType",
        label: "Device type",
        type: "select",
        required: true,
        options: ["iPhone", "Android", "iPad", "Android Tablet"],
      },
      {
        name: "corporateOwned",
        label: "Ownership",
        type: "select",
        required: true,
        options: ["Corporate owned", "Personal (BYOD)"],
      },
    ],
  },
  {
    id: "cat-access",
    name: "Application Access",
    shortDescription: "Request access to a business application.",
    description:
      "Request role-based access to a business application. Access is granted based on your role and manager approval.",
    category: "Access & Identity",
    icon: "UserCog",
    price: 0,
    deliveryTime: "1-3 business days",
    popular: true,
    fields: [
      {
        name: "application",
        label: "Application",
        type: "select",
        required: true,
        options: ["Salesforce", "Jira & Confluence", "Workday", "Snowflake", "ServiceNow"],
      },
      {
        name: "role",
        label: "Access level",
        type: "select",
        required: true,
        options: ["Read only", "Contributor", "Administrator"],
      },
    ],
  },
];

export function buildSeedRequests(): ServiceRequest[] {
  return [
    {
      id: "req-001",
      number: "REQ0010001",
      itemId: "cat-monitor",
      itemName: "External Monitor",
      itemIcon: "Monitor",
      requestedForId: "u-user-1",
      requestedById: "u-user-1",
      state: "Fulfilled",
      values: { quantity: "1", deskLocation: "Level 4, Desk 42" },
      price: 320,
      createdAt: daysAgo(9),
      updatedAt: daysAgo(6),
      dueAt: daysAgo(6),
    },
    {
      id: "req-002",
      number: "REQ0010002",
      itemId: "cat-vpn",
      itemName: "VPN Access",
      itemIcon: "ShieldCheck",
      requestedForId: "u-user-2",
      requestedById: "u-user-2",
      state: "In Fulfillment",
      values: { reason: "Remote design reviews with clients", duration: "Permanent" },
      price: 0,
      createdAt: daysAgo(2),
      updatedAt: daysAgo(1),
      dueAt: daysFromNow(1),
    },
    {
      id: "req-003",
      number: "REQ0010003",
      itemId: "cat-software",
      itemName: "Software Installation",
      itemIcon: "AppWindow",
      requestedForId: "u-user-1",
      requestedById: "u-user-1",
      state: "Approved",
      values: { software: "Tableau Desktop", device: "ACME-MBP-0142" },
      price: 0,
      createdAt: daysAgo(1),
      updatedAt: hoursAgo(8),
      dueAt: daysFromNow(1),
    },
    {
      id: "req-004",
      number: "REQ0010004",
      itemId: "cat-mailbox",
      itemName: "Shared Mailbox",
      itemIcon: "MailPlus",
      requestedForId: "u-admin",
      requestedById: "u-admin",
      state: "Submitted",
      values: { mailboxName: "support@acme.io", members: "priya.nair@acme.io" },
      price: 0,
      createdAt: hoursAgo(5),
      updatedAt: hoursAgo(5),
      dueAt: daysFromNow(2),
    },
  ];
}

export const seedArticles: Article[] = [
  {
    id: "kb-001",
    number: "KB0010001",
    title: "How to connect to the corporate VPN",
    summary:
      "Step-by-step instructions for installing and connecting the VPN client on managed and personal devices.",
    category: "Network & VPN",
    tags: ["vpn", "remote", "access"],
    authorId: "u-agent-2",
    createdAt: daysAgo(120),
    updatedAt: daysAgo(14),
    views: 4820,
    helpful: 312,
    notHelpful: 18,
    body: `## Before you start
Make sure you have enrolled in multi-factor authentication and have your corporate credentials ready.

## Install the client
1. Open the software portal and search for "VPN Client".
2. Select your operating system and click **Install**.
3. Approve the prompt in your MDM enrollment app if asked.

## Connect
- Launch the client and choose the **Corporate** profile.
- Enter your email address and password.
- Approve the MFA push notification on your phone.

## Troubleshooting
If you see an authentication error, confirm your password has not expired and that MFA is working in the browser.`,
  },
  {
    id: "kb-002",
    number: "KB0010002",
    title: "Reset your password using self-service",
    summary:
      "Use the self-service portal to reset your domain password without contacting the service desk.",
    category: "Account & Access",
    tags: ["password", "self-service", "account"],
    authorId: "u-agent-3",
    createdAt: daysAgo(200),
    updatedAt: daysAgo(30),
    views: 6310,
    helpful: 421,
    notHelpful: 44,
    body: `## Reset your password
1. Go to the self-service portal and choose **Reset password**.
2. Enter your username and complete the security check.
3. Choose a new password that meets the policy below.

## Password policy
- At least 14 characters
- Mix of upper, lower, numbers, and symbols
- Cannot reuse any of your last 10 passwords

## Still locked out?
If you lost your MFA device, submit a **Password Reset** catalog request or call the service desk for identity verification.`,
  },
  {
    id: "kb-003",
    number: "KB0010003",
    title: "Set up your new laptop",
    summary:
      "First-time setup checklist for a newly issued managed laptop, from sign-in to software enrollment.",
    category: "Getting Started",
    tags: ["laptop", "onboarding", "setup"],
    authorId: "u-agent-1",
    createdAt: daysAgo(95),
    updatedAt: daysAgo(9),
    views: 2740,
    helpful: 188,
    notHelpful: 12,
    body: `## First sign in
Power on the device and sign in with your corporate account. Complete MFA when prompted.

## Let management finish
Wait for the management profile to install. The desktop will show a "Setting up your device" progress bar.

## Enroll in software
- Open the software portal to install your role-based apps.
- Install the VPN client if you work remotely.
- Enroll in mobile device management from **Settings > Enrollment**.

## Verify
Confirm you can open email, chat, and the intranet before returning your old device.`,
  },
  {
    id: "kb-004",
    number: "KB0010004",
    title: "Fixing delayed or missing email attachments",
    summary:
      "Understand why attachments are quarantined and how to release legitimate files.",
    category: "Email",
    tags: ["email", "attachments", "quarantine"],
    authorId: "u-agent-1",
    createdAt: daysAgo(60),
    updatedAt: daysAgo(21),
    views: 1560,
    helpful: 96,
    notHelpful: 23,
    body: `## Why attachments are held
The mail gateway quarantines attachments that match certain file types or come from unrecognized senders.

## Release a legitimate attachment
1. Open the quarantine digest email you received.
2. Select the attachment and choose **Release**.
3. If the sender is a trusted partner, choose **Release and always allow**.

## Report a phishing attempt
If you were not expecting the message, choose **Report phishing** instead. Never release attachments you do not trust.`,
  },
  {
    id: "kb-005",
    number: "KB0010005",
    title: "Troubleshooting Wi-Fi connectivity issues",
    summary:
      "Common fixes for dropped connections and slow Wi-Fi in offices and meeting rooms.",
    category: "Network & VPN",
    tags: ["wifi", "network", "connectivity"],
    authorId: "u-agent-2",
    createdAt: daysAgo(45),
    updatedAt: daysAgo(7),
    views: 2210,
    helpful: 141,
    notHelpful: 19,
    body: `## Quick checks
- Confirm you are on the corporate network, not a guest SSID.
- Toggle Wi-Fi off and on to force a reconnect.
- Move away from dense metal furniture or microwave ovens.

## Meeting room issues
If video calls drop in a specific room, report the room name in an incident. We can check the access point health and channel usage.

## Still slow?
Run a speed test and attach the result to your incident so we can compare against the baseline for that floor.`,
  },
  {
    id: "kb-006",
    number: "KB0010006",
    title: "Requesting access to a business application",
    summary:
      "How role-based application access is requested, approved, and provisioned.",
    category: "Account & Access",
    tags: ["access", "application", "approval"],
    authorId: "u-agent-3",
    createdAt: daysAgo(38),
    updatedAt: daysAgo(5),
    views: 1890,
    helpful: 102,
    notHelpful: 15,
    body: `## Submit a request
1. Open the service catalog and choose **Application Access**.
2. Select the application and the access level you need.
3. Provide a business justification for the reviewer.

## Approval
Your manager reviews the request. High-privilege roles also require an application owner to approve.

## Provisioning
Once approved, access is granted automatically for standard roles. Administrative roles may require an onboarding session.`,
  },
];
