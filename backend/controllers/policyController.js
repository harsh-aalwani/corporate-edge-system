import Policy from "../models/policyModel.js";

// Function to generate auto-incremented policy ID
const generatePolicyId = async () => {
  const lastPolicy = await Policy.findOne().sort({ _id: -1 });
  const lastId = lastPolicy ? parseInt(lastPolicy.policyId.substring(1)) : 0;
  return `P${lastId + 1}`;
};

// Create Policy
export const createPolicy = async (req, res) => {
    try {
      const { policyTitle, policyDescription, policyTag, policyScheduleTime } = req.body;
      // Generate and assign the policy ID
      const policyId = await generatePolicyId();
  
      const newPolicy = new Policy({
        policyId,  // Now defined
        policyTitle,
        policyDescription,
        policyTag,
        policyScheduleTime,
      });
  
      await newPolicy.save();
      res.status(201).json({ message: "Policy created successfully", policy: newPolicy });
    } catch (error) {
      console.error("Error creating policy:", error);
      res.status(500).json({ error: "Failed to create policy" });
    }
  };

// Get All Policies
export const getAllPolicies = async (req, res) => {
  try {
    const policies = await Policy.find().sort({ _id: -1 });
    res.json(policies);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch policies" });
  }
};

// Get Policy by ID
export const getPolicyById = async (req, res) => {
  try {
    const policy = await Policy.findOne({ policyId: req.params.id });
    if (!policy) {
      return res.status(404).json({ error: "Policy not found" });
    }
    res.json(policy);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch policy" });
  }
};

// Update Policy
export const updatePolicy = async (req, res) => {
  try {
    const { policyTitle, policyDescription, policyTag, policyScheduleTime } = req.body;
    const policy = await Policy.findOneAndUpdate(
      { policyId: req.params.id },
      { policyTitle, policyDescription, policyTag, policyScheduleTime },
      { new: true }
    );

    if (!policy) {
      return res.status(404).json({ error: "Policy not found" });
    }

    res.json({ message: "Policy updated successfully", policy });
  } catch (error) {
    res.status(500).json({ error: "Failed to update policy" });
  }
};

// Delete Policy
export const deletePolicy = async (req, res) => {
  try {
    const { ids } = req.body;
    await Policy.deleteMany({ policyId: { $in: ids } });
    res.json({ message: "Policies deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete policies" });
  }
};

// Get active policy count
export const getPolicyCount = async (req, res) => {
  try {
      const count = await Policy.countDocuments();
      console.log(count);
      res.json({ count });
  } catch (error) {
      console.error("Error fetching policy count:", error);
      res.status(500).json({ message: "Internal server error" });
  }
};