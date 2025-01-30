import { useState, useEffect } from 'react';
import { useSnackbar } from 'notistack';

const UserActivityHandler = () => {
  const { enqueueSnackbar } = useSnackbar(); // To show snackbar notifications
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogoutBackend = async () => {
    setIsLoggingOut(true); // Set the state to indicate logging out

    try {
      // Send request to mark user status as false and clear session on the backend
      const response = await fetch('http://localhost:5000/api/users/logout', {
        method: 'POST',
        credentials: 'include', // Ensure cookies are included
      });

      if (response.ok) {
        localStorage.removeItem('userRoleid');
        localStorage.removeItem('userStatus'); // Clear user status from localStorage
        window.location.href = '/login'; // Redirect to login page after logout
      } else {
        const errorData = await response.json();
        enqueueSnackbar(errorData.message || 'Failed to log out', { variant: 'error' });
      }
    } catch (error) {
      console.error('Logout error:', error);
      enqueueSnackbar('An error occurred during logout', { variant: 'error' });
    } finally {
      setIsLoggingOut(false); // Reset logging out state
    }
  };

  useEffect(() => {
    // Handle page unload (close or navigate away)
    const handleBeforeUnload = (event) => {
      if (!isLoggingOut) {
        // Only show message when we're not already logging out
        const message = "Are you sure you want to leave?";
        event.returnValue = message; // Standard for modern browsers
        return message; // For older browsers
      }
    };

    const handleUnload = () => {
      if (!isLoggingOut) {
        handleLogoutBackend(); // Perform cleanup when the user leaves the page
      }
    };

    // Add event listeners for beforeunload and unload
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('unload', handleUnload);

    // Cleanup event listeners when component is unmounted
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unload', handleUnload);
    };
  }, [isLoggingOut]);  // Only run the effect when isLoggingOut changes

  return (
    <div>
      {/* Logout button to manually trigger logout */}
        <button
          onClick={handleLogoutBackend}  // Trigger logout logic when clicked
          className="dropdown-item"
          disabled={isLoggingOut} // Disable button while logging out
        >
          {isLoggingOut ? 'Logging out...' : 'Logout'}
        </button>
    </div>
  );
};

export default UserActivityHandler;
