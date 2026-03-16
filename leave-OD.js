const TEMPLATE_ID = "1bRRjcnXqNl-aY_gMN0SdDgyYxkRJJ1ZLx8nkm8H2RB8";
const FOLDER_ID   = "1KniJW0hYgc7dLrO3sEBMAKzWUkmflhWy";
const SIGN_ID     = "1uPKALF3LQNFdCUicNSUb409MR63Sf9-2";
const SCRIPT_URL  = "https://script.google.com/macros/s/AKfycbykSjOf3Nsl-UZNc1_7vcEjiYMEXBLmb9EIBYxlg5Wu78vI0kSk10MLgUOI8vNRH6HO1A/exec";

const HOD_EMAIL = "dummy@example.com";

// ✅ TEACHER DIRECTORY
// Names must match EXACTLY with Google Form dropdown (spacing, capitalisation)
const TEACHERS = {
  "Dummy Teacher1": "teacher@edu.in",
  "Dummy Teacher2": "teacher@edu.in",
  "Dummy Teacher3": "teacher@edu.in",
  "Dummy Teacher4": "teacher@edu.in",
  "Dummy Teacher5": "teacher@edu.in",
  "Dummy Teacher6": "teacher@edu.in"
};
function getTeacherEmail(name) {
  var email = TEACHERS[name.trim()];
  if (!email) {
    Logger.log("WARNING: No email found for teacher: " + name);
    return HOD_EMAIL;
  }
  return email;
}

// ─────────────────────────────────────────────────────────────
function onFormSubmit(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var row   = sheet.getLastRow();

  var studentEmail = sheet.getRange(row, 2).getValue();
  var student      = sheet.getRange(row, 3).getValue();
  var roll         = sheet.getRange(row, 4).getValue();
  var department   = sheet.getRange(row, 5).getValue();
  var section      = sheet.getRange(row, 6).getValue();
  var semester     = sheet.getRange(row, 7).getValue();
  var reason       = sheet.getRange(row, 10).getValue();
  var fromDate     = new Date(sheet.getRange(row, 12).getValue());
  var toDate       = new Date(sheet.getRange(row, 13).getValue());
  var phone        = sheet.getRange(row, 15).getValue().toString().trim();
  var advisorName  = sheet.getRange(row, 16).getValue().toString().trim();
  var mentorName   = sheet.getRange(row, 17).getValue().toString().trim();

  var advisorEmail = getTeacherEmail(advisorName);
  var mentorEmail  = getTeacherEmail(mentorName);

  var leaveDays = Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24)) + 1;
  var f = Utilities.formatDate(fromDate, Session.getScriptTimeZone(), "dd/MM/yyyy");
  var t = Utilities.formatDate(toDate,   Session.getScriptTimeZone(), "dd/MM/yyyy");

  var id    = Utilities.getUuid();
  var token = Math.random().toString(36).substring(2);

  sheet.getRange(row, 23).setValue(id);
  sheet.getRange(row, 24).setValue(token);

  // Store resolved emails for use in doGet()
  sheet.getRange(row, 26).setValue(advisorEmail);
  sheet.getRange(row, 27).setValue(mentorEmail);

  var advisorApprove = SCRIPT_URL + "?role=advisor&id=" + id + "&action=approve";
  var advisorReject  = SCRIPT_URL + "?role=advisor&id=" + id + "&action=reject";
  var mentorApprove  = SCRIPT_URL + "?role=mentor&id="  + id + "&action=approve";
  var mentorReject   = SCRIPT_URL + "?role=mentor&id="  + id + "&action=reject";

  var btnA = "display:inline-block;background:#28a745;color:white;padding:12px 30px;text-decoration:none;border-radius:5px;margin-right:20px;font-size:16px;font-weight:bold;";
  var btnR = "display:inline-block;background:#d9534f;color:white;padding:12px 30px;text-decoration:none;border-radius:5px;font-size:16px;font-weight:bold;";

  var details =
    "<b>Name:</b> "         + student    + "<br>" +
    "<b>Register No:</b> "  + roll       + "<br>" +
    "<b>Department:</b> "   + department + "<br>" +
    "<b>Section:</b> "      + section    + "<br>" +
    "<b>Semester:</b> "     + semester   + "<br>" +
    "<b>Reason:</b> "       + reason     + "<br>" +
    "<b>Leave Period:</b> " + f + " - " + t + " & " + leaveDays + " Days<br>" +
    "<b>Parent Phone:</b> " + phone      + "<br><br>";

  MailApp.sendEmail({
    to: advisorEmail,
    subject: "Advisor Approval Required - " + student,
    htmlBody:
      "<h3>Leave Approval Required</h3>" + details +
      "<div style='margin-top:20px;'>" +
        "<a href='" + advisorApprove + "' style='" + btnA + "'>Approve</a>" +
        "<a href='" + advisorReject  + "' style='" + btnR + "'>Reject</a>" +
      "</div>"
  });

  MailApp.sendEmail({
    to: mentorEmail,
    subject: "Mentor Approval Required - " + student,
    htmlBody:
      "<h3>Leave Approval Required</h3>" + details +
      "<div style='margin-top:20px;'>" +
        "<a href='" + mentorApprove + "' style='" + btnA + "'>Approve</a>" +
        "<a href='" + mentorReject  + "' style='" + btnR + "'>Reject</a>" +
      "</div>"
  });
}

// ─────────────────────────────────────────────────────────────
function doGet(e) {
  var id     = e.parameter.id;
  var role   = e.parameter.role;
  var action = e.parameter.action;

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data  = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (data[i][22] == id) {

      var studentEmail = data[i][1];
      var studentName  = data[i][2];
      var advisorName  = data[i][15].toString().trim();
      var mentorName   = data[i][16].toString().trim();
      var advisorEmail = data[i][25] ? data[i][25] : getTeacherEmail(advisorName);
      var mentorEmail  = data[i][26] ? data[i][26] : getTeacherEmail(mentorName);

      // ── ADVISOR ────────────────────────────────────────
      if (role == "advisor") {
        var cur = sheet.getRange(i + 1, 19).getValue();
        if (cur != "") return HtmlService.createHtmlOutput("You have already responded. Thank you.");
        sheet.getRange(i + 1, 19).setValue(action == "approve" ? "Approved" : "Rejected");
        SpreadsheetApp.flush();
        if (action == "reject") {
          MailApp.sendEmail({
            to:      studentEmail,
            subject: "Leave Request Rejected",
            body:    "Dear " + studentName + ",\n\nYour leave request has been rejected by your Class Adviser (" + advisorName + "). Please contact them for details.\n\nRegards,\nDepartment of Artificial Intelligence"
          });
          return HtmlService.createHtmlOutput("Rejection recorded. Student has been notified.");
        }
      }

      // ── MENTOR ─────────────────────────────────────────
      if (role == "mentor") {
        var cur = sheet.getRange(i + 1, 20).getValue();
        if (cur != "") return HtmlService.createHtmlOutput("You have already responded. Thank you.");
        sheet.getRange(i + 1, 20).setValue(action == "approve" ? "Approved" : "Rejected");
        SpreadsheetApp.flush();
        if (action == "reject") {
          MailApp.sendEmail({
            to:      studentEmail,
            subject: "Leave Request Rejected",
            body:    "Dear " + studentName + ",\n\nYour leave request has been rejected by your Mentor (" + mentorName + "). Please contact them for details.\n\nRegards,\nDepartment of Artificial Intelligence"
          });
          return HtmlService.createHtmlOutput("Rejection recorded. Student has been notified.");
        }
      }

      SpreadsheetApp.flush();
      var advisorStatus = sheet.getRange(i + 1, 19).getValue();
      var mentorStatus  = sheet.getRange(i + 1, 20).getValue();
      var hodStatus     = sheet.getRange(i + 1, 21).getValue();
      var hodEmailSent  = sheet.getRange(i + 1, 25).getValue();

      // ── SEND TO HOD (once only) ─────────────────────────
      if (advisorStatus == "Approved" && mentorStatus == "Approved" &&
          hodStatus == "" && hodEmailSent == "") {

        sheet.getRange(i + 1, 25).setValue("SENT");
        SpreadsheetApp.flush();

        var student    = data[i][2];
        var roll       = data[i][3];
        var department = data[i][4];
        var section    = data[i][5];
        var semester   = data[i][6];
        var reason     = data[i][9];
        var fromDate   = data[i][11];
        var toDate     = data[i][12];
        var phone      = data[i][14];
        var leaveDays  = Math.ceil((new Date(toDate) - new Date(fromDate)) / (1000 * 60 * 60 * 24)) + 1;
        var f = Utilities.formatDate(new Date(fromDate), Session.getScriptTimeZone(), "dd/MM/yyyy");
        var t = Utilities.formatDate(new Date(toDate),   Session.getScriptTimeZone(), "dd/MM/yyyy");

        var hodApprove = SCRIPT_URL + "?role=hod&id=" + id + "&action=approve";
        var hodReject  = SCRIPT_URL + "?role=hod&id=" + id + "&action=reject";

        var hodBody =
          "<h2>HOD Approval Required</h2>" +
          "<b>Name:</b> "           + student     + "<br>" +
          "<b>Register Number:</b> "+ roll        + "<br>" +
          "<b>Department:</b> "     + department  + "<br>" +
          "<b>Section:</b> "        + section     + "<br>" +
          "<b>Semester:</b> "       + semester    + "<br>" +
          "<b>Reason:</b> "         + reason      + "<br>" +
          "<b>Leave Period:</b> "   + f + " - " + t + " & " + leaveDays + " Days<br>" +
          "<b>Parent Mobile:</b> "  + phone       + "<br>" +
          "<b>Advisor:</b> "        + advisorName + " ✅ Approved<br>" +
          "<b>Mentor:</b> "         + mentorName  + " ✅ Approved<br><br>" +
          "<div style='margin-top:20px;'>" +
            "<a href='" + hodApprove + "' style='display:inline-block;background:#28a745;color:white;padding:12px 30px;text-decoration:none;border-radius:5px;margin-right:20px;font-size:16px;font-weight:bold;'>Approve</a>" +
            "<a href='" + hodReject  + "' style='display:inline-block;background:#d9534f;color:white;padding:12px 30px;text-decoration:none;border-radius:5px;font-size:16px;font-weight:bold;'>Reject</a>" +
          "</div>";

        MailApp.sendEmail({
          to:       HOD_EMAIL,
          subject:  "Leave Approval Required - HOD - " + student,
          htmlBody: hodBody
        });
      }

      // ── HOD ────────────────────────────────────────────
      if (role == "hod") {
        var cur = sheet.getRange(i + 1, 21).getValue();
        if (cur != "") return HtmlService.createHtmlOutput("HOD has already responded. Thank you.");

        if (action == "approve") {
          sheet.getRange(i + 1, 21).setValue("Approved");
          sheet.getRange(i + 1, 22).setValue("FINAL APPROVED");
          SpreadsheetApp.flush();
          generatePDF(i + 1);
          return HtmlService.createHtmlOutput("Approved! Leave form has been generated and sent to the student.");
        } else {
          sheet.getRange(i + 1, 21).setValue("Rejected");
          sheet.getRange(i + 1, 22).setValue("FINAL REJECTED");
          SpreadsheetApp.flush();
          MailApp.sendEmail({
            to:      studentEmail,
            subject: "Leave Request Rejected by HOD",
            body:    "Dear " + studentName + ",\n\nYour leave request has been rejected by the HOD. Please contact the department office.\n\nRegards,\nDepartment of Artificial Intelligence"
          });
          return HtmlService.createHtmlOutput("Rejected. Student has been notified.");
        }
      }

      return HtmlService.createHtmlOutput("Response recorded successfully.");
    }
  }

  return HtmlService.createHtmlOutput("Request not found. It may have already been processed.");
}

// ─────────────────────────────────────────────────────────────
function generatePDF(row) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  var studentEmail = sheet.getRange(row, 2).getValue();
  var student      = sheet.getRange(row, 3).getValue();
  var roll         = sheet.getRange(row, 4).getValue();
  var department   = sheet.getRange(row, 5).getValue();
  var section      = sheet.getRange(row, 6).getValue();
  var semester     = sheet.getRange(row, 7).getValue();
  var requestType  = sheet.getRange(row, 8).getValue().toString().trim(); // ✅ col 8 = Type of Request
  var reason       = sheet.getRange(row, 10).getValue();
  var fromDate     = new Date(sheet.getRange(row, 12).getValue());
  var toDate       = new Date(sheet.getRange(row, 13).getValue());
  var proofUrl     = sheet.getRange(row, 14).getValue().toString().trim();
  var phone        = sheet.getRange(row, 15).getValue().toString().trim();
  var advisorName  = sheet.getRange(row, 16).getValue().toString().trim();
  var mentorName   = sheet.getRange(row, 17).getValue().toString().trim();
  var informed     = sheet.getRange(row, 18).getValue().toString().trim();

  var joinYear     = 2000 + parseInt(roll.substring(4, 6));
  var academicYear = joinYear + "-" + (joinYear + 4);
  var leaveDays    = Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24)) + 1;
  var f = Utilities.formatDate(fromDate, Session.getScriptTimeZone(), "dd/MM/yyyy");
  var t = Utilities.formatDate(toDate,   Session.getScriptTimeZone(), "dd/MM/yyyy");

  var template = DriveApp.getFileById(TEMPLATE_ID);
  var folder   = DriveApp.getFolderById(FOLDER_ID);
  var copy     = template.makeCopy("TEMP_Leave_" + roll, folder);
  var doc      = DocumentApp.openById(copy.getId());
  var body     = doc.getBody();

  // ── Replace all placeholders ──────────────────────────
  body.replaceText("\\{\\{DATE\\}\\}",             Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd-MM-yyyy"));
  body.replaceText("\\{\\{ACADEMIC_YEAR\\}\\}",    academicYear);
  body.replaceText("\\{\\{STUDENT_NAME\\}\\}",     student);
  body.replaceText("\\{\\{REGISTER_NUMBER\\}\\}",  roll);
  body.replaceText("\\{\\{BATCH\\}\\}",            department);
  body.replaceText("\\{\\{SEMESTER\\}\\}",         semester);
  body.replaceText("\\{\\{REASON\\}\\}",           reason);
  body.replaceText("\\{\\{FROM_DATE\\}\\}",        f);
  body.replaceText("\\{\\{TO_DATE\\}\\}",          t);
  body.replaceText("\\{\\{LEAVE_DAY\\}\\}",        leaveDays.toString() + " Days");
  body.replaceText("\\{\\{TOTAL_LEAVE\\}\\}",      leaveDays.toString());
  body.replaceText("\\{\\{P_C\\}\\}",              informed);
  body.replaceText("\\{\\{PHONE\\}\\}",            phone);
  body.replaceText("\\{\\{MENTOR_APPROVED\\}\\}",  "Approved By " + mentorName);
  body.replaceText("\\{\\{ADVISOR_APPROVED\\}\\}", "Approved By " + advisorName);

  // ── Underline Leave or OD terms based on request type ─
  var isOD = (requestType.toLowerCase().indexOf("on duty") !== -1 ||
              requestType.toLowerCase().indexOf("od") !== -1);

  var underlineTerms = isOD ? ["On Duty", "OD"] : ["Leave"];

  underlineTerms.forEach(function(term) {
    var result = body.findText(term);
    while (result) {
      var el    = result.getElement();
      var start = result.getStartOffset();
      var end   = result.getEndOffsetInclusive();
      el.asText().setUnderline(start, end, true);
      result = body.findText(term, result);
    }
  });

  // ── HOD Signature ─────────────────────────────────────
  var signBlob = DriveApp.getFileById(SIGN_ID).getBlob();
  var found    = body.findText("\\{\\{HOD_SIGN\\}\\}");
  if (found) {
    var el      = found.getElement();
    var para    = el.getParent().asParagraph();
    var paraIdx = body.getChildIndex(para);
    el.asText().setText("");
    var imgPara = body.insertParagraph(paraIdx, "");
    imgPara.setAlignment(DocumentApp.HorizontalAlignment.RIGHT);
    imgPara.setIndentEnd(80);
    var img = imgPara.appendInlineImage(signBlob);
    img.setWidth(120);
    img.setHeight(35);
  }

  // ── Append proof BEFORE saving ─────────────────────────
  var proofPdfBlob = null;

  if (proofUrl != "") {
    try {
      var proofFileId = "";
      var matchOpen   = proofUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
      var matchId     = proofUrl.match(/id=([a-zA-Z0-9_-]+)/);
      if (matchOpen)    proofFileId = matchOpen[1];
      else if (matchId) proofFileId = matchId[1];

      if (proofFileId != "") {
        var proofFile = DriveApp.getFileById(proofFileId);
        var proofMime = proofFile.getMimeType();

        if (proofMime.indexOf("image/") === 0) {
          // ✅ Image — append as new page inside the doc
          body.appendPageBreak();

          var proofHead = body.appendParagraph("Supporting Document / Proof");
          proofHead.setHeading(DocumentApp.ParagraphHeading.HEADING2);
          proofHead.setAlignment(DocumentApp.HorizontalAlignment.CENTER);

          body.appendParagraph("Student: " + student + "   |   Register No: " + roll)
              .setAlignment(DocumentApp.HorizontalAlignment.CENTER);
          body.appendParagraph("");

          var proofBlob = proofFile.getBlob();
          var proofImg  = body.appendImage(proofBlob);

          var pageWidth = doc.getPageWidth() - doc.getMarginLeft() - doc.getMarginRight();
          var origW     = proofImg.getWidth();
          var origH     = proofImg.getHeight();
          if (origW > pageWidth) {
            proofImg.setWidth(pageWidth);
            proofImg.setHeight(Math.floor(origH * (pageWidth / origW)));
          }

        } else if (proofMime === "application/pdf") {
          // ✅ PDF proof — send as second attachment
          proofPdfBlob = proofFile.getBlob().setName("Proof_" + roll + ".pdf");
        }
      }
    } catch (err) {
      Logger.log("Proof append error: " + err);
    }
  }

  // ── Save and export as PDF ─────────────────────────────
  doc.saveAndClose();

  var pdfBlob = DriveApp.getFileById(copy.getId())
                  .getBlob()
                  .getAs("application/pdf")
                  .setName(roll + ".pdf");

  var pdfFile = folder.createFile(pdfBlob);
  DriveApp.getFileById(copy.getId()).setTrashed(true); // delete temp doc

  // ── Send to student only ───────────────────────────────
  var attachments = [pdfFile];
  if (proofPdfBlob) attachments.push(proofPdfBlob);

  var emailBody =
    "Dear " + student + ",\n\n" +
    "Your leave request has been approved by all authorities.\n\n" +
    "Attached:\n" +
    "1. Your approved leave letter (" + roll + ".pdf)\n" +
    (proofPdfBlob ? "2. Your submitted proof document\n" : "") +
    "\nRegards,\nDepartment of Artificial Intelligence\nM. Kumarasamy College of Engineering";

  MailApp.sendEmail({
    to:          studentEmail,
    subject:     "Leave Approved - " + roll,
    body:        emailBody,
    attachments: attachments
  });
}