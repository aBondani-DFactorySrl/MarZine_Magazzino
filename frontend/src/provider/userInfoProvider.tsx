import { createContext, ReactNode, useState, useEffect } from "react";

interface User {
  displayName: string;
  email: string;
  role: string;
  reparto: string;
  name: string;
  surname: string;
}

interface AuthProviderProps {
  children: ReactNode;
}

interface UserContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  updateReparto: (reparto: string) => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  updateReparto: () => {},
  isLoading: true,
});

export const UserProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize user from localStorage on app startup
  useEffect(() => {
    const initializeUser = () => {
      try {
        const userSession = localStorage.getItem("user");
        if (userSession) {
          const userData = JSON.parse(userSession);
          // Check if user has defaultPwd (same logic as App.tsx)
          if (!userData.defaultPwd) {
            setUser(userData);
          }
        }
      } catch (error) {
        console.error("Error parsing user session:", error);
        localStorage.removeItem("user");
      } finally {
        setIsLoading(false);
      }
    };

    initializeUser();
  }, []);

  const login = (user: User) => {
    setUser(user);
    localStorage.setItem("user", JSON.stringify(user));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const updateReparto = (reparto: string) => {
    setUser((prevUser) => {
      if (prevUser) {
        const updatedUser = { ...prevUser, reparto };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        return updatedUser;
      }
      return prevUser;
    });
  };

  return (
    <UserContext.Provider value={{ user, login, logout, updateReparto, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
