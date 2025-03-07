import Announcement from "../models/announcementModel.js";
import Department from "../models/departmentsModel.js";
import User from "../models/userModel.js";
import Candidate from "../models/candidateModel.js";

export const createAnnouncement = async (req, res) => {
  try {
    // Retrieve createdBy from session
    const createdBy = req.session.userId;
    if (!createdBy) {
      return res.status(401).json({ error: "Unauthorized: Please log in to create an announcement." });
    }

    // Destructure fields from req.body, including jobDescription
    const {
      announcementTitle,
      announcementDescription,
      announcementTag,
      announcementScheduleTime,
      announcementPublic,
      sendDiscord = false,
      sendEmail = false,
      jobPosition,
      jobType,
      jobDescription,  // ✅ New field
      salaryRange,
      requiredExperience,
      skillsRequired,
      educationQualification,
      totalVacancy,
      applicationDeadline,
      departmentId
    } = req.body;

    // Validate required fields
    if (!announcementTitle || !announcementDescription || !announcementTag || !announcementScheduleTime) {
      return res.status(400).json({ error: "All required fields must be filled!" });
    }

    // Validate schedule time (must be in the future)
    const scheduleTime = new Date(announcementScheduleTime);
    if (isNaN(scheduleTime.getTime()) || scheduleTime.getTime() <= Date.now() + 60000) {
      return res.status(400).json({ error: "Invalid schedule time. It must be at least 1 minute in the future." });
    }

    // Convert announcementPublic to Boolean
    const isPublic = Boolean(announcementPublic);

    // Create the announcement object
    const newAnnouncement = new Announcement({
      announcementTitle,
      announcementDescription,
      announcementTag,
      announcementPublic: isPublic,
      announcementScheduleTime: scheduleTime.toISOString(),
      announcementSend: { sendDiscord, sendEmail },
      createdBy,
    });

    // Add job details only if the announcement is public
    if (isPublic) {
      newAnnouncement.jobPosition = jobPosition || null;
      newAnnouncement.jobType = jobType || null;
      newAnnouncement.jobDescription = jobDescription || null; // ✅ Store job description
      newAnnouncement.salaryRange = salaryRange || { currency: null, min: null, max: null };
      newAnnouncement.requiredExperience = requiredExperience || null;
      newAnnouncement.skillsRequired = skillsRequired 
        ? skillsRequired.split(",").map(s => s.trim()).filter(s => s) 
        : [];
      newAnnouncement.educationQualification = educationQualification || null;
      newAnnouncement.totalVacancy = totalVacancy ? Number(totalVacancy) : null;
      newAnnouncement.applicationDeadline = applicationDeadline 
        ? new Date(applicationDeadline).toISOString() 
        : null;
      newAnnouncement.departmentId = departmentId || null;
    }

    // Save to the database
    await newAnnouncement.save();
    res.status(201).json({ message: "Announcement created successfully!", data: newAnnouncement });

  } catch (error) {
    console.error("❌ Error creating announcement:", error);
    res.status(500).json({ error: "Error creating announcement" });
  }
};

// ✅ Fetch Announcements with User Data
export const getAnnouncements = async (req, res) => {
  try {
    // Fetch announcements & populate user data in one query
    const announcements = await Announcement.find()
      .populate("createdBy", "fullName userDesignation userDepartment") // Fetch user details
      .sort({ announcementScheduleTime: -1 }); // Sort by latest announcements

    // Map enriched announcements
    const enrichedAnnouncements = announcements.map((announcement) => ({
      ...announcement.toObject(),
      fullName: announcement.createdBy?.fullName || "N/A",
      designation: announcement.createdBy?.userDesignation || "N/A",
      department: announcement.createdBy?.userDepartment || "N/A",
    }));

    res.json(enrichedAnnouncements);
  } catch (error) {
    console.error("❌ Error fetching announcements:", error);
    res.status(500).json({ message: "Failed to fetch announcements" });
  }
};

// ✅ Fetch Eligible Users
export const getEligibleUsers = async (req, res) => {
  try {
    const eligibleRoleIds = ["R1", "R2", "R3"]; // ✅ SuperAdmin, SystemAdmin, HR

    const eligibleUsers = await User.find(
      { userRoleid: { $in: eligibleRoleIds } },
      "userId fullName userRoleid"
    );

    if (eligibleUsers.length === 0) {
      return res.status(404).json({ message: "No eligible users found!", users: [] });
    }

    res.status(200).json(eligibleUsers);
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    res.status(500).json({ message: "Failed to fetch users", users: [] });
  }
};

// ✅ Delete Announcements by `announcementId`
export const deleteAnnouncements = async (req, res) => {
  try {

    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "No valid announcement IDs provided" });
    }

    const deleteResult = await Announcement.deleteMany({ announcementId: { $in: ids } });

    if (deleteResult.deletedCount === 0) {
      return res.status(404).json({ message: "No announcements found for deletion" });
    }

    res.json({ message: "Announcements deleted successfully", deletedCount: deleteResult.deletedCount });
  } catch (error) {
    console.error("❌ Error deleting announcements:", error);
    res.status(500).json({ message: "Failed to delete announcements" });
  }
};
// ✅ Update Announcement by `announcementId`

/** ✅ Update an Announcement */
export const updateAnnouncement = async (req, res) => {
  try {

    const { announcementId, ...updateData } = req.body;

    if (!announcementId) {
      return res.status(400).json({ message: "Announcement ID is required" });
    }

    const existingAnnouncement = await Announcement.findOne({ announcementId });

    if (!existingAnnouncement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    // ✅ Remove undefined or null values from updateData
    Object.keys(updateData).forEach(
      (key) => (updateData[key] === undefined || updateData[key] === null) && delete updateData[key]
    );

    const updatedAnnouncement = await Announcement.findOneAndUpdate(
      { announcementId },
      { $set: updateData },
      { new: true }
    );

    if (!updatedAnnouncement) {
      return res.status(500).json({ message: "Could not update announcement" });
    }

    res.json({ message: "Announcement updated successfully", updatedAnnouncement });

  } catch (error) {
    console.error("❌ Error updating announcement:", error);
    res.status(500).json({ message: "Failed to update announcement" });
  }
};


// ✅ Get Single Announcement by `announcementId`
export const getAnnouncementById = async (req, res) => {
  try {
    const { announcementId } = req.params;

    if (!announcementId) {
      return res.status(400).json({ message: "Announcement ID is required" });
    }

    const announcement = await Announcement.findOne({ announcementId });

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    // ✅ Fetch User Details
    const user = await User.findOne(
      { userId: announcement.createdBy },
      "fullName userDesignation userDepartment"
    );

    res.json({
      ...announcement.toObject(),
      fullName: user?.fullName || "N/A",
      designation: user?.userDesignation || "N/A",
      department: user?.userDepartment || "N/A",
    });

  } catch (error) {
    console.error("❌ Error fetching announcement:", error);
    res.status(500).json({ message: "Error fetching announcement" });
  }
};


// ✅ Get Public Announcements with User Details
export const getPublicAnnouncements = async (req, res) => {
  try {
    const publicAnnouncements = await Announcement.find({ announcementPublic: true });
    res.status(200).json(publicAnnouncements);
  } catch (error) {
    res.status(500).json({ error: "Error fetching public announcements" });
  }
};


// ✅ Get Private Announcements with User Details
export const getPrivateAnnouncements = async (req, res) => {
  try {

    // ✅ Fetch announcements where `announcementPublic` is `false`
    const announcements = await Announcement.find({ announcementPublic: false }).sort({ announcementScheduleTime: -1 });

    if (!announcements.length) {
      return res.status(404).json({ message: "No private announcements found" });
    }

    // ✅ Fetch user details for each announcement
    const announcementsWithUserDetails = await Promise.all(
      announcements.map(async (announcement) => {
        const user = await User.findOne(
          { userId: announcement.createdBy },
          "fullName userDesignation userDepartment"
        );

        return {
          ...announcement.toObject(),
          fullName: user?.fullName || "N/A",
          designation: user?.userDesignation || "N/A",
          department: user?.userDepartment || "N/A",
        };
      })
    );

    res.status(200).json(announcementsWithUserDetails);
  } catch (error) {
    console.error("❌ Error fetching private announcements:", error);
    res.status(500).json({ message: "Failed to fetch private announcements" });
  }
};

export const getJobData = async (req, res) => {
  try {
    // Fetch only announcements with a valid jobPosition and departmentId
    const announcements = await Announcement.find({
      jobPosition: { $exists: true, $nin: [null, ""] },
      departmentId: { $exists: true, $nin: [null, ""] }
    }).sort({ createdAt: -1 });

    const enrichedAnnouncements = await Promise.all(
      announcements.map(async (announcement) => {
        const department = await Department.findOne({ departmentid: announcement.departmentId });

        return {
          announcementId: announcement.announcementId, // ✅ Added announcementId
          position: announcement.jobPosition,
          departmentId: announcement.departmentId, // ✅ Send to server
          departmentName: department ? department.departmentName : "Unknown", // ✅ Show to user
        };
      })
    );

    res.status(200).json(enrichedAnnouncements);
  } catch (error) {
    console.error("❌ Error fetching job data:", error);
    res.status(500).json({ error: "Failed to fetch job positions" });
  }
};


export const getJobListings = async (req, res) => {
  try {
    // Fetch job announcements with valid jobPosition and departmentId
    const announcements = await Announcement.find({
      jobPosition: { $exists: true, $nin: [null, ""] },
      departmentId: { $exists: true, $nin: [null, ""] } // Department ID is stored as a string
    }).sort({ createdAt: -1 });

    // Extract unique department IDs and announcement IDs
    const departmentIds = [...new Set(announcements.map(a => a.departmentId))];
    const announcementIds = announcements.map(a => a.announcementId);

    // Fetch department details
    const departments = await Department.find({ departmentid: { $in: departmentIds } }, "departmentid departmentName");

    // Create a lookup map for department names
    const departmentMap = {};
    departments.forEach(dept => {
      departmentMap[dept.departmentid] = dept.departmentName;
    });

    // Extract unique job positions
    const jobPositions = [...new Set(announcements.map(a => a.jobPosition))];

    // Count total candidates for each announcementId
    const candidateCounts = await Candidate.aggregate([
      { $match: { announcementId: { $in: announcementIds } } },
      {
        $group: {
          _id: "$announcementId",
          count: { $sum: 1 }
        }
      }
    ]);

    // Convert candidate counts into a lookup object
    const candidateCountMap = {};
    candidateCounts.forEach(({ _id, count }) => {
      candidateCountMap[_id] = count;
    });

    // Count selected candidates for each job position and department
    const selectedCounts = await Candidate.aggregate([
      {
        $match: {
          position: { $in: jobPositions },
          departmentId: { $in: departmentIds },
          selected: true
        }
      },
      {
        $group: {
          _id: { position: "$position", departmentId: "$departmentId" },
          count: { $sum: 1 }
        }
      }
    ]);

    // Convert selected counts into a lookup object
    const selectedCountMap = {};
    selectedCounts.forEach(({ _id, count }) => {
      selectedCountMap[`${_id.position}_${_id.departmentId}`] = count;
    });

    // Process job listings
    const jobListings = announcements.map((announcement) => {
      const departmentName = departmentMap[announcement.departmentId] || "Unknown";
      const selectedCount = selectedCountMap[`${announcement.jobPosition}_${announcement.departmentId}`] || 0;
      const totalCandidates = candidateCountMap[announcement.announcementId] || 0;

      return {
        announcementId: announcement.announcementId,
        position: announcement.jobPosition,
        departmentId: announcement.departmentId, // Stored as string
        departmentName,
        totalVacancy: announcement.totalVacancy || 0,
        totalSelected: selectedCount,
        totalCandidates, // New field for total candidates count
        salaryRange: announcement.salaryRange || { currency: "N/A", min: 0, max: 0 }
      };
    });

    res.status(200).json(jobListings);
  } catch (error) {
    console.error("Error fetching job listings:", error);
    res.status(500).json({ error: "Failed to fetch job listings" });
  }
};
