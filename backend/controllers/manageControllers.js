import User from '../models/userModel.js';  // Import the User model

// Controller to get HR Managers (RoleID = 'R3')
export const getHRManagers = async (req, res) => {
  try {
    const hrManagers = await User.find({ userRoleid: 'R3' });


    if (!hrManagers.length) {
      return res.status(404).json({ message: 'No HR Managers found' });
    }

    return res.status(200).json({ hrManagers });
  } catch (error) {
    console.error('Error fetching HR Managers:', error.message);
    return res.status(500).json({ message: 'Error fetching HR Managers' });
  }
};
