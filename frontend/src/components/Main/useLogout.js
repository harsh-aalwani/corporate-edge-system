import { useState } from 'react';
import { useSnackbar } from 'notistack';
import { removeUserRoleCookie } from '../../utils/cookieHelper';
const useLogout = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const response = await fetch('http://localhost:5000/api/users/logout', {
        method: 'POST',
        credentials: 'include', // Ensure cookies are included
      });

      if (response.ok) {
        removeUserRoleCookie();
        enqueueSnackbar('Logged out successfully', { variant: 'success' });
        window.location.href = '/login'; // Redirect to login page
      } else {
        const errorData = await response.json();
        enqueueSnackbar(errorData.message, { variant: 'error' });
      }
    } catch (error) {
      console.error('Logout error:', error);
      enqueueSnackbar('An error occurred during logout', { variant: 'error' });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return { handleLogout, isLoggingOut };
};

export default useLogout;
