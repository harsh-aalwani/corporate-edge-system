import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";


const WEIGHTS = {
    "skills": 0.40,
    "specialization": 0.20,
    "educationQualification": 0.15,
    "responsibilities": 0.10,
    "totalYearsOfExperience": 0.15
};

// ✅ Main Function to Generate a Well-Designed Resume PDF
function generatePDF(formData) {
    if (!formData) {
        console.error("❌ Error: formData is undefined");
        return;
    }
    
    const doc = new jsPDF("p", "mm", "a4");

    // ✅ Add Border for a Professional Look
    doc.setDrawColor(0, 122, 204);
    doc.rect(5, 5, 200, 287);

    // ✅ Define text position
    const textX = 15;  // Left-aligned text
    const textY = 30;  // Y-position
    const imageX = 160; // Right-aligned image
    const imageY = 15;  // Same row level

    // ✅ Candidate Image (if available)
    let imageUrl = formData.candidatePicture || formData.picture;
    if (imageUrl) {
        fetchImageAsBase64(imageUrl).then((imgData) => {
            if (imgData) {
                doc.addImage(imgData, "JPEG", imageX, imageY, 35, 45); // Align image to the right
            }
            addResumeContent(doc, formData, textX, textY);
        });
    } else {
        addResumeContent(doc, formData, textX, textY);
    }
}

// ✅ Convert Image to Base64
async function fetchImageAsBase64(imageUrl) {
    try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = () => resolve(reader.result);
        });
    } catch (error) {
        console.error("❌ Error loading image:", error);
        return null;
    }
}

function formatDate(date) {
    if (!date) return "N/A"; // Return "N/A" if no date is provided
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0"); // Add leading zero if day < 10
    const month = String(d.getMonth() + 1).padStart(2, "0"); // Add leading zero if month < 10
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}

// ✅ Function to Add Resume Content
function addResumeContent(doc, formData, textX, textY) {
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(0, 0, 0);
    doc.text(`${formData.firstName || ""} ${formData.fatherName || ""} ${formData.surName || ""}`.trim(), textX, textY);

    doc.setFontSize(12);
    doc.setFont("Helvetica", "normal");
    doc.setTextColor(100);
    doc.text(`${formData.email || "N/A"}`, textX, textY + 8);

    // ✅ Add Candidate Evaluation below email and phone
    const candidateEvaluation = formData.candidateEvaluation || "N/A";
    doc.text(`Candidate Evaluation: ${formData.candidateEvaluation}%`, textX, textY + 16);

    // ✅ Section Title Function
    const sectionTitle = (title, y) => {
        doc.setFontSize(14);
        doc.setFont("Helvetica", "bold");
        doc.setTextColor(0, 122, 204);
        doc.text(title, 15, y);
        doc.setDrawColor(0, 122, 204);
        doc.line(15, y + 2, 195, y + 2); // Underline
        doc.setTextColor(0, 0, 0);
    };

    // ✅ Personal Information
    sectionTitle("Personal Information", 70);
    const personalInfo = [
        ["Date of Birth", formatDate(formData.dob) || "N/A"],  // Use formatDate here
        ["Age", formData.age || "N/A"],
        ["Gender", formData.gender || "N/A"],
        ["Marital Status", formData.maritalStatus || "N/A"],
        ["Nationality", formData.nationality || "N/A"],
        ["Native Place", formData.nativePlace || "N/A"],
        ["Languages Known", formData.languagesKnown || "N/A"],
        ["Present Address", formData.presentAddress || "N/A"],
        ["Permanent Address", formData.permanentAddress || "N/A"],
    ];
    autoTable(doc, {
        startY: 75,
        head: [["Field", "Value"]],
        body: personalInfo,
        theme: "striped",
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [0, 122, 204], textColor: 255, fontStyle: "bold" },
    });

    // ✅ Evaluation Scores Table
    sectionTitle("Evaluation Breakdown", doc.lastAutoTable.finalY + 12);
    const detailedEvaluation = formData.detailedEvaluation || [];
    const evaluationData = detailedEvaluation.map((item, index) => [
        index + 1,
        item.criteria
            .replace(/_/g, " ") // Replace underscores with spaces
            .replace(/([a-z])([A-Z])/g, "$1 $2") // Add space before capital letters in camelCase
            .replace(/\b\w/g, (char) => char.toUpperCase()), // Capitalize first letter of each word
        `${item.weightedScore}%`,
        `${(WEIGHTS[item.criteria] * 100).toFixed(2)}%` // Max obtainable percentage
    ]);

    // ✅ Add Total Evaluation row
    evaluationData.push([
        "",
        "Total Evaluation", 
        `${formData.candidateEvaluation || "N/A"}%`,
        "100%" // Maximum obtainable percentage
    ]);

    autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 17,
        head: [["#", "Category", "Score", "Max Score"]],
        body: evaluationData.length ? evaluationData : [["N/A", "No data available", "N/A", "N/A"]],
        theme: "striped",
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [0, 122, 204], textColor: 255, fontStyle: "bold" },
        bodyStyles: { fontSize: 10 },
        footStyles: { fillColor: [0, 122, 204], textColor: 255, fontStyle: "bold" },
    });

    // ✅ Add Page Break After Job Details
    doc.addPage();

    // ✅ Add Border for Page 2
    doc.setDrawColor(0, 122, 204);
    doc.rect(5, 5, 200, 287);

    // ✅ Education
    sectionTitle("Education", 20);
    const educationData = formData.educationQualification?.length
        ? formData.educationQualification.map((edu, index) => [
            index + 1,
            edu.field || "N/A",
            edu.nameOfUniversity || edu.nameOfBoard || "N/A",
            edu.yearOfPassing || "N/A",
            edu.percentage || "N/A",
        ])
        : [["N/A", "N/A", "N/A", "N/A", "N/A"]];
    autoTable(doc, {
        startY: 25,
        head: [["#", "Field", "University/Board", "Year", "Percentage"]],
        body: educationData,
        theme: "striped",
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [0, 122, 204], textColor: 255, fontStyle: "bold" },
    });

    // ✅ Job Details
    sectionTitle("Job Details", doc.lastAutoTable.finalY + 12);
    const jobDetails = [
        ["Position Applied", formData.position || "N/A"],
        ["Department", `${formData.departmentId || "N/A"} - ${formData.departmentName || "N/A"}`], // Show both departmentId and departmentName
        ["Skills", formData.skills || "N/A"],
        ["Specialization", formData.specialization || "N/A"],
        ["Expected Salary", formData.salary || "N/A"],
    ];
    autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 17,
        head: [["Field", "Value"]],
        body: jobDetails,
        theme: "striped",
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [0, 122, 204], textColor: 255, fontStyle: "bold" },
    });

    // ✅ Work Experience
    if (formData.lastWorkPlace || formData.yearsOfExperience || formData.totalYearsOfExperience || formData.addressOfWorkPlace || formData.responsibilities || formData.referenceContact) {
        sectionTitle("Work Experience", doc.lastAutoTable.finalY + 12);
        const workExperience = [
            ["Last Workplace", formData.lastWorkPlace || "None"],
            ["Years of Experience", formData.yearsOfExperience || "None"],
            ["Total Experience", formData.totalYearsOfExperience || "None"],
            ["Work Address", formData.addressOfWorkPlace || "None"],
            ["Responsibilities", formData.responsibilities || "None"],
            ["Reference Contact", formData.referenceContact || "None"],
        ];
        autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 17,
            head: [["Field", "Value"]],
            body: workExperience,
            theme: "striped",
            styles: { fontSize: 10, cellPadding: 3 },
            headStyles: { fillColor: [0, 122, 204], textColor: 255, fontStyle: "bold" },
        });
    }
    // ✅ Save PDF with Candidate Name
    doc.save(`Resume_${formData.candidateId || "Unknown"}_Candidate.pdf`);
}


export { generatePDF };
