import { useState, useCallback, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import { useParams } from 'react-router-dom';
import { getSingleCollectionInfo } from '../utils/fetch';
import DetailsCard from '../components/collections/DetailsCard';
import TokensGallery from '../components/collections/TokensGallery';
import * as types from '../utils/types';

/* eslint-disable  @typescript-eslint/no-empty-function */

const CollectionDetail = () => {
  const { collectionId } = useParams();
  const [collectionInfo, setCollectionInfo] = useState<types.CollectionsRow | null>(null);

  const [loadingInfo, setLoadingInfo] = useState(true);

  const getBasicInfo = useCallback(async () => {
    try {
      if (collectionId) {
        setLoadingInfo(true);
        const response = await getSingleCollectionInfo(collectionId);
        if (response.status === 200) {
          setCollectionInfo(response.data);
        }
      }
    } catch (err) {
      console.error('Error loading data', 'error');
    }
    setLoadingInfo(false);
  }, [collectionId]);

  useEffect(() => {
    getBasicInfo();
  }, [getBasicInfo]);

  return (
    <Container maxWidth={false}>
      {collectionInfo && (
        <>
          <Grid container wrap="nowrap" sx={{ height: '100%', overflow: 'auto' }}>
            <Grid item md={4} xs={12}>
              <DetailsCard collection={collectionInfo} loadingPage={loadingInfo} />
            </Grid>
            <Grid item md={8} xs={12}>
              {collectionInfo.status === 'active' && (
                <TokensGallery
                  contractAddress={collectionInfo.contractAddress}
                  collectionId={collectionInfo._id}
                />
              )}
            </Grid>
          </Grid>
        </>
      )}
      {/* {loadingPage && <Loader loading />} */}
    </Container>
  );
};

export default CollectionDetail;
