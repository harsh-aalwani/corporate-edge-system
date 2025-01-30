import React, { createContext, useState, useEffect } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user role when the app loads
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/users/getUserRole', {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setUserRole(data.userRoleid);
          localStorage.setItem('userRoleid', data.userRoleid);
        } else {
          setUserRole(null);
          localStorage.removeItem('userRoleid');
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        setUserRole(null);
        localStorage.removeItem('userRoleid');
      } finally {
        setIsLoading(false);
      }
    };

    const storedRole = localStorage.getItem('userRoleid');
    if (storedRole) {
      setUserRole(storedRole);
      setIsLoading(false);
    } else {
      fetchUserRole();
    }
  }, []);

  // Function to update role after login
  const handleLoginSuccess = async () => {
    await fetchUserRole(); // Fetch the new role after login
  };

  return (
    <UserContext.Provider value={{ userRole, isLoading, handleLoginSuccess }}>
      {children}
    </UserContext.Provider>
  );
};
