import React, { useEffect, useState } from "react";
import axios from "axios";
import { Modal, Button, Alert } from "react-bootstrap";
import DownloadIcon from "@mui/icons-material/Download";
import html2pdf from "html2pdf.js";  
import { useSnackbar } from "notistack";

const ReceiveAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [pdfDownloaded, setPdfDownloaded] = useState(false); 
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/announcements/private");
        setAnnouncements(response.data || []);
      } catch (err) {
        setError("Failed to load announcements");
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);
  
  const handleShowModal = (announcement) => {
    setSelectedAnnouncement(announcement);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedAnnouncement(null);
  };

  const { enqueueSnackbar } = useSnackbar(); 
  
  const generatePDF = () => {
    if (!selectedAnnouncement) return;
  
    const content = document.createElement("div");
   // 📝 PDF for Private Announcement
   content.innerHTML = `
   <div style="padding:20px; font-family: 'Times New Roman'; font-size:14px;">
     <h2 style="font-weight:bold; color:#000;">📢 Private Announcement</h2>
     <hr style="border:1px solid #000; width:100%">

     <h3 style="font-weight:bold;">📝 Description:</h3>
     <div>${selectedAnnouncement.announcementDescription}</div>
     <hr style="border:1px solid #000; width:100%">

     <p style="color:#000;"><strong>📅 Date:</strong> ${new Date(selectedAnnouncement.createdAt).toLocaleDateString()}</p>
     <p style="color:#000;"><strong>🏷️ Keywords:</strong> ${selectedAnnouncement.announcementTag}</p>
     <hr style="border:1px solid #000; width:100%">

     <p style="color:#000;"><strong>👤 From:</strong> ${selectedAnnouncement.fullName || "N/A"}</p>
     <p style="color:#000;"><strong>🏢 Designation:</strong> ${selectedAnnouncement.designation || "N/A"}</p>
     <p style="color:#000;"><strong>📌 Department:</strong> ${selectedAnnouncement.department || "N/A"}</p>
   </div>`;
  
    html2pdf()
      .set({
        margin: 10,
        filename: "announcement.pdf",
        image: { type: "jpeg", quality: 1.0 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] },
      })
      .from(content)
      .save();
  };
  
  return (
    <div className="container mt-4">
      {pdfDownloaded && (
        <Alert variant="success" className="text-center">
          ✅ PDF downloaded successfully!
        </Alert>
      )}
      
      <div className="row">
        {announcements.map((announcement) => (
          <div key={announcement._id} className="col-lg-4 col-md-6 col-sm-12 mb-4">
            <div 
              className="card shadow-sm announcement-card" 
              onClick={() => handleShowModal(announcement)}
              style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}
            >
              <div className="card-body d-flex flex-column">
                <h5 className="card-title announcement-title">{announcement.announcementTitle}</h5>
                <div style={{ width: "100%", height: "2px", backgroundColor: "#000", marginBottom: "10px" }}></div>
                <p style={{ color: "#000" }}><strong>🏷️ Tag:</strong> {announcement.announcementTag}</p>
                <p style={{ color: "#000" }}><strong>🌍 Public:</strong> {announcement.announcementPublic ? "Yes" : "No"}</p>
                <p style={{ color: "#000" }}><strong>⏳ Schedule Date:</strong> {new Date(announcement.announcementScheduleTime).toLocaleDateString()}</p>
                <p style={{ color: "#000" }}><strong>⏰ Schedule Time:</strong> {new Date(announcement.announcementScheduleTime).toLocaleTimeString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{selectedAnnouncement?.announcementTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ textAlign: "left", color: "black" }}>
          <p  style={{ color: "#000" }}><strong>🏷️ Tag:</strong> {selectedAnnouncement?.announcementTag}</p>
          <p  style={{ color: "#000" }}><strong>🌍 Public:</strong> {selectedAnnouncement?.announcementPublic ? "Yes" : "No"}</p>
          <p style={{ color: "#000" }}><strong>⏳ Schedule Date:</strong> {new Date(selectedAnnouncement?.announcementScheduleTime).toLocaleDateString()}</p>
          <p style={{ color: "#000" }}><strong>⏰ Schedule Time:</strong> {new Date(selectedAnnouncement?.announcementScheduleTime).toLocaleTimeString()}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleCloseModal}>Go Back</Button>
          <Button onClick={generatePDF}><DownloadIcon /> Download PDF</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ReceiveAnnouncements;
