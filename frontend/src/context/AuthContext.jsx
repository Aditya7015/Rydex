// import { createContext, useState, useContext, useEffect } from 'react';
// import axios from 'axios';
// import toast from 'react-hot-toast';

// const AuthContext = createContext();

// export const useAuth = () => useContext(AuthContext);

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [token, setToken] = useState(localStorage.getItem('token'));

//   axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  
//   useEffect(() => {
//     if (token) {
//       axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//       fetchUser();
//     } else {
//       setLoading(false);
//     }
//   }, [token]);

//   const fetchUser = async () => {
//     try {
//       const { data } = await axios.get('/auth/me');
//       setUser(data.user);
//     } catch (error) {
//       console.error('Fetch user error:', error);
//       logout();
//     } finally {
//       setLoading(false);
//     }
//   };

//   const login = async (phone, password) => {
//     try {
//       const { data } = await axios.post('/auth/login', { phone, password });
//       setToken(data.token);
//       localStorage.setItem('token', data.token);
//       setUser(data.user);
//       toast.success('Logged in successfully!');
//       return true;
//     } catch (error) {
//       toast.error(error.response?.data?.error || 'Login failed');
//       return false;
//     }
//   };

//   const register = async (phone, otp, name, email, password) => {
//     try {
//       const { data } = await axios.post('/auth/verify-otp', { phone, otp, name, email, password });
//       setToken(data.token);
//       localStorage.setItem('token', data.token);
//       setUser(data.user);
//       toast.success('Registration successful!');
//       return true;
//     } catch (error) {
//       toast.error(error.response?.data?.error || 'Registration failed');
//       return false;
//     }
//   };

//   const sendOTP = async (phone) => {
//     try {
//       const { data } = await axios.post('/auth/send-otp', { phone });
//       toast.success('OTP sent successfully!');
//       return data.devOTP; // Remove in production
//     } catch (error) {
//       toast.error(error.response?.data?.error || 'Failed to send OTP');
//       return null;
//     }
//   };

//   const logout = () => {
//     setUser(null);
//     setToken(null);
//     localStorage.removeItem('token');
//     delete axios.defaults.headers.common['Authorization'];
//     toast.success('Logged out');
//   };

//   const updateProfile = async (updates) => {
//     try {
//       const { data } = await axios.put('/auth/update-profile', updates);
//       setUser(data.user);
//       toast.success('Profile updated!');
//       return true;
//     } catch (error) {
//       toast.error(error.response?.data?.error || 'Update failed');
//       return false;
//     }
//   };

//   return (
//     <AuthContext.Provider value={{
//       user,
//       loading,
//       login,
//       register,
//       sendOTP,
//       logout,
//       updateProfile
//     }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };


import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const { data } = await axios.get('/auth/me');
      setUser(data.user);
    } catch (error) {
      console.error('Fetch user error:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  // Register function for email OTP
  // const register = async (email, otp, name, password) => {
  //   try {
  //     const { data } = await axios.post('/auth/verify-otp', { 
  //       email, 
  //       otp, 
  //       name, 
  //       password,
  //       purpose: 'verification'
  //     });
  //     setToken(data.token);
  //     localStorage.setItem('token', data.token);
  //     axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
  //     setUser(data.user);
  //     toast.success('Registration successful!');
  //     return true;
  //   } catch (error) {
  //     toast.error(error.response?.data?.error || 'Registration failed');
  //     return false;
  //   }
  // };

  // Register function for email OTP with phone
const register = async (email, otp, name, phone, password) => {
  try {
    const { data } = await axios.post('/auth/verify-otp', { 
      email, 
      otp, 
      name, 
      phone,
      password,
      purpose: 'verification'
    });
    setToken(data.token);
    localStorage.setItem('token', data.token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    setUser(data.user);
    toast.success('Registration successful!');
    return true;
  } catch (error) {
    toast.error(error.response?.data?.error || 'Registration failed');
    return false;
  }
};

  // Send OTP function
  const sendOTP = async (email) => {
    try {
      const { data } = await axios.post('/auth/send-otp', { 
        email, 
        purpose: 'verification' 
      });
      toast.success('OTP sent to your email!');
      return data.success;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send OTP');
      return false;
    }
  };

  // const login = async (email, password) => {
  //   try {
  //     const { data } = await axios.post('/auth/login', { email, password });
  //     setToken(data.token);
  //     localStorage.setItem('token', data.token);
  //     axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
  //     setUser(data.user);
  //     toast.success('Logged in successfully!');
  //     return true;
  //   } catch (error) {
  //     toast.error(error.response?.data?.error || 'Login failed');
  //     return false;
  //   }
  // };

  const login = async (emailOrPhone, password) => {
  try {
    const { data } = await axios.post('/auth/login', { 
      emailOrPhone,  // Can be email or phone
      password 
    });
    setToken(data.token);
    localStorage.setItem('token', data.token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    setUser(data.user);
    toast.success('Logged in successfully!');
    return true;
  } catch (error) {
    toast.error(error.response?.data?.error || 'Login failed');
    return false;
  }
};

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    toast.success('Logged out');
  };

  const updateProfile = async (updates) => {
    try {
      const { data } = await axios.put('/auth/update-profile', updates);
      setUser(data.user);
      toast.success('Profile updated!');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Update failed');
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      sendOTP,
      logout,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};