// const ProtectedRoute = ({ children, allowedRoles }) => {
//   const [userRole, setUserRole] = useState(null);

//   useEffect(() => {
//     const role = Cookies.get('userRoleid');
//     setUserRole(role);
//   }, []);

//   if (!allowedRoles || !userRole) {
//     return <Loader />; // You can show a loader until userRole is available
//   }

//   if (allowedRoles.includes(userRole)) {
//     return children;  // Show the protected content if user role matches
//   }

//   // Redirect to login page if role is not allowed
//   return <Navigate to="/Login" />;
// };

// export default ProtectedRoute;
