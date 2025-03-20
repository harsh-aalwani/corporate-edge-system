import User from '../models/userModel.js';  // Import the User model


export const getSystemAdmin = async (req, res) => {
  try {
    const systemAdmin = await User.find({ userRoleid: 'R2' });

    if (!systemAdmin.length) {
      return res.status(404).json({ message: 'no System Admin Found' });
    }

    return res.status(200).json({ systemAdmin });
  } catch (error) {
    console.error('Error fetching HR Managers:', error.message);
    return res.status(500).json({ message: 'Error fetching HR Managers' });
  }
};

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

export const getDeptManager = async (req, res) => {
  try {
    const deptManager = await User.find({ userRoleid: 'R4' });

    if (!deptManager.length) {
      return res.status(404).json({ message: 'No Deparment Manager Found' });
    }

    return res.status(200).json({ deptManager });
  } catch (error) {
    console.error('Error fetching Department Manager:', error.message);
    return res.status(500).json({ message: 'Error fetching Department Manager' });
  }
};

export const getEmployee = async (req, res) => {
  try {
    const employees = await User.find({ userRoleid: 'R5' });

    if (!employees.length) {
      return res.status(404).json({ message: 'No Employee Found' });
    }

    return res.status(200).json({ employees });
  } catch (error) {
    console.error('Error fetching Employess:', error.message);
    return res.status(500).json({ message: 'Error fetching Employess' });
  }
};
