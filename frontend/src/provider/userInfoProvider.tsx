import { createContext, ReactNode, useState, useEffect } from "react";

interface User {
  name: string;
  surname: string;
  role: string;
  reparto: string;
  defaultPwd?: boolean;
}

interface AuthProviderProps {
  children: ReactNode;
}

interface UserContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType>({
  user: null,
  login: () => {},
  logout: () => {},
});

export const UserProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser({
          name: parsedUser.name,
          surname: parsedUser.surname,
          role: parsedUser.role,
          reparto: parsedUser.reparto,
          defaultPwd: parsedUser.defaultPwd,
        });
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("marplannerUser");
      }
    }
    setLoading(false);
  }, []);

  const login = (user: User) => {
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {!loading && children}
    </UserContext.Provider>
  );
};

export default UserContext;
