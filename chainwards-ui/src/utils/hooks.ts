import { useEffect, useState } from 'react';
import { useMetamaskContext } from '../contexts/MetamaskProvider';

export const useAdminAccount = () => {
  const { walletAddress, isWalletRegistered } = useMetamaskContext();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (walletAddress !== '' && isWalletRegistered) {
      setIsAdmin(true);
    }
  }, [setIsAdmin, walletAddress, isWalletRegistered]);

  return isAdmin;
};
