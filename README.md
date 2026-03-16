<div align="center">

# 🎓 CampusFlow

### Automated Leave & On-Duty Approval Workflow for Educational Institutions

[![Google Apps Script](https://img.shields.io/badge/Google%20Apps%20Script-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://script.google.com)
[![Google Workspace](https://img.shields.io/badge/Google%20Workspace-0F9D58?style=for-the-badge&logo=google&logoColor=white)](https://workspace.google.com)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
[![Maintained](https://img.shields.io/badge/Maintained-yes-green.svg?style=for-the-badge)](https://github.com/ANURA4G/CampusFlow)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)](https://github.com/ANURA4G/CampusFlow/pulls)

<br/>

> **CampusFlow** is a zero-cost, fully automated Leave and On-Duty (OD) approval system built entirely on Google Workspace — Google Forms, Sheets, Docs, Drive, and Gmail — powered by Google Apps Script.

</div>

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🔄 How It Works](#-how-it-works)
- [🚀 Implementation Guide](#-implementation-guide)
  - [Step 1 — Create the Google Form](#step-1--create-the-google-form)
  - [Step 2 — Set Up the Google Sheet](#step-2--set-up-the-google-sheet)
  - [Step 3 — Create the Google Docs Template](#step-3--create-the-google-docs-template)
  - [Step 4 — Upload HOD Signature to Drive](#step-4--upload-hod-signature-to-drive)
  - [Step 5 — Open Apps Script Editor](#step-5--open-apps-script-editor)
  - [Step 6 — Configure Constants](#step-6--configure-constants)
  - [Step 7 — Set Up the Form Submit Trigger](#step-7--set-up-the-form-submit-trigger)
  - [Step 8 — Deploy as a Web App](#step-8--deploy-as-a-web-app)
  - [Step 9 — Update SCRIPT_URL and Redeploy](#step-9--update-script_url-and-redeploy)
- [📊 Google Sheet Column Reference](#-google-sheet-column-reference)
- [📄 Google Docs Template Placeholders](#-google-docs-template-placeholders)
- [⚙️ Configuration Reference](#️-configuration-reference)
- [🛠️ Tech Stack](#️-tech-stack)
- [🤝 Contributing](#-contributing)

---

## ✨ Features

| Feature | Description |
|---|---|
| 📝 **Form-Driven** | Students submit leave/OD requests via a Google Form |
| 🔀 **Multi-Level Approval** | Sequential approval: Class Adviser → Mentor → HOD |
| 📧 **Instant Email Alerts** | One-click Approve / Reject buttons sent directly to faculty email |
| 🔒 **Duplicate-Click Guard** | Each approver can only respond once; duplicate clicks are blocked |
| 📄 **Auto PDF Generation** | Approved leave letters are generated from a Google Docs template and emailed to the student |
| 🖊️ **HOD Digital Signature** | Automatically inserts the HOD's signature image into the PDF |
| 📎 **Proof Attachment** | Supporting proof (image or PDF) submitted via the form is attached to the final letter |
| 🔍 **Leave vs OD Detection** | Automatically underlines "Leave" or "On Duty / OD" terms in the letter based on request type |
| 🗂️ **Drive Storage** | Approved PDFs are saved to a designated Google Drive folder |
| ♻️ **Fallback Routing** | Unknown teacher names fall back to HOD email to prevent lost approvals |

---

## 🔄 How It Works

```
Student fills Google Form
          │
          ▼
   onFormSubmit() triggers
          │
          ├─► Emails Class Adviser  [Approve] [Reject]
          └─► Emails Mentor         [Approve] [Reject]
                    │
          ┌─────────┴─────────┐
      Both Approved?         One Rejected?
          │                       │
          ▼                       ▼
  Email sent to HOD        Student notified
  [Approve] [Reject]
          │
    ┌─────┴─────┐
 Approved?   Rejected?
    │              │
    ▼              ▼
 PDF generated  Student
 & emailed to   notified
  student
```

---

## 🚀 Implementation Guide

### Step 1 — Create the Google Form

1. Go to [Google Forms](https://forms.google.com) and create a new form.
2. Add fields in **exactly this order** (they map to sheet columns):

| # | Field Label | Type |
|---|---|---|
| 1 | *(Timestamp — auto)* | — |
| 2 | Email Address | Short answer *(collect email)* |
| 3 | Student Name | Short answer |
| 4 | Register Number | Short answer |
| 5 | Department | Short answer / Dropdown |
| 6 | Section | Short answer |
| 7 | Semester | Dropdown |
| 8 | Type of Request | Dropdown (`Leave` / `On Duty`) |
| 9 | *(Reserved)* | — |
| 10 | Reason for Leave/OD | Paragraph |
| 11 | *(Reserved)* | — |
| 12 | From Date | Date |
| 13 | To Date | Date |
| 14 | Proof (Google Drive link) | Short answer |
| 15 | Parent/Guardian Phone | Short answer |
| 16 | Class Adviser Name | Dropdown *(names must match `TEACHERS` map)* |
| 17 | Mentor Name | Dropdown *(names must match `TEACHERS` map)* |
| 18 | Parent Informed? | Short answer / Dropdown |

> **💡 Tip:** Enable "Collect email addresses" in Form Settings so column 2 is filled automatically.

---

### Step 2 — Set Up the Google Sheet

1. Open the form → click **Responses** → click the **Google Sheets icon** to link a spreadsheet.
2. The sheet is created automatically. Response data starts from **row 2** (row 1 = headers).
3. Columns 19–27 are **automatically managed** by the script — do not fill them manually.

---

### Step 3 — Create the Google Docs Template

1. Create a new **Google Doc** that will serve as the leave letter template.
2. Design your letterhead with college name, logo, etc.
3. Insert the following placeholders **exactly** (including the double curly braces) wherever you want the data to appear:

```
{{DATE}}              {{ACADEMIC_YEAR}}     {{STUDENT_NAME}}
{{REGISTER_NUMBER}}   {{BATCH}}             {{SEMESTER}}
{{REASON}}            {{FROM_DATE}}         {{TO_DATE}}
{{LEAVE_DAY}}         {{TOTAL_LEAVE}}       {{P_C}}
{{PHONE}}             {{MENTOR_APPROVED}}   {{ADVISOR_APPROVED}}
{{HOD_SIGN}}
```

4. Copy the **Document ID** from the URL:
   ```
   https://docs.google.com/document/d/<<DOCUMENT_ID>>/edit
   ```

---

### Step 4 — Upload HOD Signature to Drive

1. Prepare a transparent-background PNG of the HOD's signature (recommended: `120 x 35 px`).
2. Upload it to **Google Drive**.
3. Copy the **File ID** from the file URL:
   ```
   https://drive.google.com/file/d/<<FILE_ID>>/view
   ```

---

### Step 5 — Open Apps Script Editor

1. Open your linked **Google Sheet**.
2. Click **Extensions → Apps Script**.
3. Delete any existing code in the editor.
4. Paste the contents of [`leave-OD.js`](leave-OD.js) into the editor.
5. Click **Save** (💾).

---

### Step 6 — Configure Constants

At the top of the script, fill in your own values:

```js
const TEMPLATE_ID = "YOUR_GOOGLE_DOCS_TEMPLATE_ID";
const FOLDER_ID   = "YOUR_GOOGLE_DRIVE_FOLDER_ID";   // where approved PDFs are saved
const SIGN_ID     = "YOUR_HOD_SIGNATURE_FILE_ID";
const SCRIPT_URL  = "";  // leave empty for now — fill after Step 8

const HOD_EMAIL = "hod@yourcollege.edu";

const TEACHERS = {
  "Dr. A. Example":  "a.example@college.edu",
  "Prof. B. Sample": "b.sample@college.edu",
  // Add ALL adviser and mentor names exactly as they appear in the Google Form dropdown
};
```

> ⚠️ **Important:** Teacher names in `TEACHERS` must match the Google Form dropdown options **exactly** — including spacing and capitalisation.

---

### Step 7 — Set Up the Form Submit Trigger

1. In the Apps Script editor, click **Triggers** (⏱ clock icon in the left sidebar).
2. Click **+ Add Trigger**.
3. Configure as follows:

| Setting | Value |
|---|---|
| Function to run | `onFormSubmit` |
| Deployment | Head |
| Event source | From spreadsheet |
| Event type | On form submit |

4. Click **Save** and authorise the script with your Google account.

---

### Step 8 — Deploy as a Web App

1. In the Apps Script editor, click **Deploy → New deployment**.
2. Click the ⚙️ gear icon next to "Select type" → choose **Web app**.
3. Configure as follows:

| Setting | Value |
|---|---|
| Description | `CampusFlow Leave Approval` |
| Execute as | **Me** (your Google account) |
| Who has access | **Anyone** |

4. Click **Deploy** → **Authorise access**.
5. Copy the **Web App URL** shown after deployment.

---

### Step 9 — Update SCRIPT_URL and Redeploy

1. Paste the copied URL into `SCRIPT_URL` in the script:
   ```js
   const SCRIPT_URL = "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec";
   ```
2. Click **Deploy → Manage deployments**.
3. Click the ✏️ edit icon on your existing deployment → set version to **"New version"** → click **Deploy**.

> 🎉 **You're all set!** Students can now fill the form, and the entire approval chain runs automatically.

---

## 📊 Google Sheet Column Reference

| Column | Content | Managed by |
|---|---|---|
| A (1) | Timestamp | Google Forms |
| B (2) | Student Email | Google Forms |
| C (3) | Student Name | Google Forms |
| D (4) | Register Number | Google Forms |
| E (5) | Department | Google Forms |
| F (6) | Section | Google Forms |
| G (7) | Semester | Google Forms |
| H (8) | Type of Request | Google Forms |
| I (9) | *(Reserved)* | — |
| J (10) | Reason | Google Forms |
| K (11) | *(Reserved)* | — |
| L (12) | From Date | Google Forms |
| M (13) | To Date | Google Forms |
| N (14) | Proof URL | Google Forms |
| O (15) | Parent Phone | Google Forms |
| P (16) | Class Adviser Name | Google Forms |
| Q (17) | Mentor Name | Google Forms |
| R (18) | Parent Informed | Google Forms |
| S (19) | Adviser Approval Status | **Script** |
| T (20) | Mentor Approval Status | **Script** |
| U (21) | HOD Approval Status | **Script** |
| V (22) | Final Status | **Script** |
| W (23) | Unique Request ID | **Script** |
| X (24) | Token | **Script** |
| Y (25) | HOD Email Sent Flag | **Script** |
| Z (26) | Resolved Adviser Email | **Script** |
| AA (27) | Resolved Mentor Email | **Script** |

---

## 📄 Google Docs Template Placeholders

| Placeholder | Replaced with |
|---|---|
| `{{DATE}}` | Approval date (dd-MM-yyyy) |
| `{{ACADEMIC_YEAR}}` | e.g. `2022-2026` (derived from register number) |
| `{{STUDENT_NAME}}` | Student's full name |
| `{{REGISTER_NUMBER}}` | Student's register number |
| `{{BATCH}}` | Department name |
| `{{SEMESTER}}` | Current semester |
| `{{REASON}}` | Reason for leave/OD |
| `{{FROM_DATE}}` | Leave start date (dd/MM/yyyy) |
| `{{TO_DATE}}` | Leave end date (dd/MM/yyyy) |
| `{{LEAVE_DAY}}` | e.g. `3 Days` |
| `{{TOTAL_LEAVE}}` | Number of days as a number |
| `{{P_C}}` | Whether parent/guardian was informed |
| `{{PHONE}}` | Parent/guardian phone number |
| `{{MENTOR_APPROVED}}` | e.g. `Approved By Dr. A. Example` |
| `{{ADVISOR_APPROVED}}` | e.g. `Approved By Prof. B. Sample` |
| `{{HOD_SIGN}}` | Replaced by HOD's signature image |

---

## ⚙️ Configuration Reference

| Constant | Description |
|---|---|
| `TEMPLATE_ID` | Google Docs template file ID |
| `FOLDER_ID` | Google Drive folder ID where approved PDFs are saved |
| `SIGN_ID` | Google Drive file ID of the HOD's signature image |
| `SCRIPT_URL` | Web App deployment URL (obtained in Step 8) |
| `HOD_EMAIL` | HOD's email address (also used as fallback for unknown teacher names) |
| `TEACHERS` | Object mapping teacher names → email addresses |

---

## 🛠️ Tech Stack

| Technology | Role |
|---|---|
| **Google Forms** | Student request submission |
| **Google Sheets** | Data store & approval state tracking |
| **Google Apps Script** | Workflow automation & email routing |
| **Google Docs** | Leave letter template |
| **Google Drive** | PDF storage, signature & proof files |
| **Gmail / MailApp** | Sending approval request and notification emails |

---

## 🤝 Contributing

Contributions, issues and feature requests are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

<div align="center">

Made with ❤️ for educational institutions

⭐ **Star this repo** if CampusFlow saves your department time!

</div>
