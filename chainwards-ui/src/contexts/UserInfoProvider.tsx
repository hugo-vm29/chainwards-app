import { useContext, createContext, useEffect } from 'react';
import { useLocation, matchPath, useNavigate } from 'react-router-dom';

/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function ,  @typescript-eslint/ban-types, no-empty */

type UserContextType = {};

const defaultState = {};

export const UserInfoContext = createContext<UserContextType>(defaultState);

const UserInfoProvider = ({ children }: UserInfoProviderProps) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (matchPath('/', pathname)) {
    }
  }, []);

  const contextValue = {};

  return (
    <UserInfoContext.Provider value={contextValue}>{children}</UserInfoContext.Provider>
  );
};

const useUserContext = () => useContext(UserInfoContext);

type UserInfoProviderProps = {
  children: string | JSX.Element | JSX.Element[];
};

export { UserInfoProvider, useUserContext };
