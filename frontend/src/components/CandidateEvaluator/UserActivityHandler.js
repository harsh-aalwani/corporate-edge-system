import { useState } from 'react';
import { useSnackbar } from 'notistack';
import { removeUserRoleCookie } from '../../utils/cookieHelper';
import {  useNavigate  } from "react-router-dom";

const UserActivityHandler = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  const handleLogoutBackend = async () => {
    setIsLoggingOut(true);

    try {
      const response = await fetch('http://localhost:5000/api/users/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        removeUserRoleCookie();
        navigate('/EvaluatorLogin'); 
      } else {
        const errorData = await response.json();
        enqueueSnackbar(errorData.message || 'Failed to log out', { variant: 'error' });
      }
    } catch (error) {
      console.error('Logout error:', error);
      enqueueSnackbar('An error occurred during logout', { variant: 'error' });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleLogoutBackend}
        className="dropdown-item"
        disabled={isLoggingOut}
      >
        {isLoggingOut ? 'Logging out...' : 'Logout'}
      </button>
    </div>
  );
};

export default UserActivityHandler;
