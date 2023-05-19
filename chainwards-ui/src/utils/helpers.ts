export const isChainValid = (chainId: number) => {
  if (chainId == 80001 || chainId == 5) return true;
  else false;
};

export const getNetworkName = (chainId: number) => {
  let networkName = '';

  if (chainId == 5) {
    networkName = 'Goerli';
  } else if (chainId == 80001) {
    networkName = 'Polygon Mumbai';
  }
  return networkName;
};

export const formatAddress = (address: string) => {
  try {
    if (!address) return '';
    return `${address.slice(0, 4)}...${address.slice(-6)}`;
  } catch (err) {
    return '';
  }
};

export const formatDate = (date: Date) => {
  try {
    if (!date) return '';

    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const edtTimeSring = new Date(date).toLocaleString('en-US', {
      timeZone: userTimeZone,
      dateStyle: 'medium',
      timeStyle: 'long',
      hour12: false,
    });

    return edtTimeSring.replace(',', '');
  } catch (err) {
    return date;
  }
};

export const formatTxHash = (txHash: string) => {
  try {
    if (!txHash) return '';
    return `${txHash.slice(0, 10)}...${txHash.slice(-12)}`;
  } catch (err) {
    return '';
  }
};
