import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// 🔹 Helper function to format date as DD/MM/YYYY
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Invalid Date"; // Handle invalid dates
  return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${date.getFullYear()}`;
};

const generateReport = async (announcement, candidates = []) => {
  if (!announcement) {
    console.error("❌ Error: Announcement data is missing.");
    return;
  }

  const doc = new jsPDF("p", "mm", "a4");

  // ✅ First Page - Job Details
  doc.setDrawColor(0, 122, 204);
  doc.rect(10, 10, 190, 277);

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(0, 0, 0);
  doc.text("Job Announcement Report", 50, 20);

  doc.setFontSize(18);
  doc.setTextColor(0, 122, 204);
  doc.text("Job Details", 15, 35);

  // ✅ Job Details Table
  autoTable(doc, {
    startY: 40,
    head: [["Field", "Details"]],
    body: [
      ["Announcement Title", announcement.announcementTitle],
      ["Job Position", announcement.jobPosition],
      ["Job Type", announcement.jobType],
      ["Department", announcement.departmentId],
      ["Total Vacancies", announcement.totalVacancy],
      ["Required Experience", `${announcement.requiredExperience} years`],
      ["Education Qualification", announcement.educationQualification],
      ["Skills Required", announcement.skillsRequired ? announcement.skillsRequired.join(", ") : "Not specified"],
      announcement.salaryRange
        ? ["Salary Range", `${announcement.salaryRange.currency} ${announcement.salaryRange.min} - ${announcement.salaryRange.max}`]
        : null,
      announcement.applicationDeadline
        ? ["Application Deadline", formatDate(announcement.applicationDeadline.$date || announcement.applicationDeadline)]
        : null,
      ["Created By", announcement.createdBy || "Unknown"],
      ["Created At", formatDate(announcement.createdAt.$date || announcement.createdAt)],
      ["Evaluators Assigned", announcement.assignedEvaluators.length > 0 ? announcement.assignedEvaluators.join(", ") : "None"],
      ["Public Announcement", announcement.announcementPublic ? "Yes" : "No"],
      ["Job Description", announcement.jobDescription || "No description provided."]
    ].filter(Boolean),
    theme: "grid",
    styles: { fontSize: 10, cellPadding: 3 },
    headStyles: { fillColor: [0, 122, 204], textColor: 255, fontStyle: "bold" }
  });

  // ✅ Hired Candidates Table
  const hiredCandidates = candidates.filter((candidate) => candidate.recruited === true);
  let finalY = doc.lastAutoTable.finalY + 15;

  if (hiredCandidates.length > 0) {
    autoTable(doc, {
      startY: finalY,
      head: [["ID", "Name", "Email", "Phone", "Performance", "Details"]],
      body: hiredCandidates.map((candidate) => [
        candidate.candidateId,
        `${candidate.firstName} ${candidate.surName}`,
        candidate.email,
        candidate.phone,
        candidate.candidatePerformance ? `${candidate.candidatePerformance}%` : "N/A",
        { content: "View More", styles: { textColor: [0, 0, 255] }, link: `https://yourwebsite.com/candidate/${candidate.candidateId}` }
      ]),
      theme: "grid",
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [0, 122, 204], textColor: 255, fontStyle: "bold" }
    });

    finalY = doc.lastAutoTable.finalY + 10;
  } else {
    doc.text("No recruited candidates.", 15, finalY);
    finalY += 10;
  }

  // ✅ "Download All" Link
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 255);
  doc.textWithLink("Download All Candidate Data", 15, finalY, { url: "https://yourwebsite.com/download-all" });

  // ✅ Save the Report
  doc.save(`VacancyReport_${announcement.announcementId || "Unknown"}.pdf`);
};

export { generateReport };
