import {
  useState, 
  useContext,
  createContext, 
  FunctionComponent,
  SetStateAction,
  Dispatch,
  useCallback,
  useMemo,
  useEffect
} from 'react';
import PropTypes from 'prop-types';
import { useLocation, matchPath, useNavigate } from 'react-router-dom';

// interface IUserContext {
//   name: string;
//   setName: Dispatch<SetStateAction<string>>;
// }

export const UserContext = createContext({
  name: "",
  updateName: (param:string) => {},
});


const UserInfoProvider : FunctionComponent<UserInfoProviderProps> = ({ children }) => {

  const { pathname } = useLocation();
  const [name, setName] = useState('default');
  const navigate = useNavigate();
  
  const updateName = useCallback( (newName:string) => {
    setName(newName);
    navigate('/dashboard');
  },[]);

  const contextValue = useMemo(() => ({
    name,
    updateName
  }), [name, updateName]);

  useEffect(() => {
    if( matchPath("/", pathname)){
      //setName("ALEJANDRO");
      //window.location.href = "/dashboard";
    }
  },[]);

  // const value = {
  //   name,
  //   setName,
  // };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

const useUserContext = () => useContext(UserContext);

const propTypes = {
  children: PropTypes.node.isRequired,
};
type UserInfoProviderProps = PropTypes.InferProps<typeof propTypes>;
UserInfoProvider.propTypes = propTypes

export { UserInfoProvider, useUserContext };
