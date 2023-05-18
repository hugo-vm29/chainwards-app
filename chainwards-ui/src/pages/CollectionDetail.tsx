import { useState, useCallback, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import { useParams } from 'react-router-dom';
import {getSingleCollectionInfo , getIssuersList} from  '../utils/fetch';
import Loader  from '../components/shared/Loader';
import { CollectionInfoType }  from '../utils/types';
import DetailsCard from '../components/collections/DetailsCard'
import SearchField from '../components/collections/SearchField'


const styles = {
  label: {
    color: '#707070',
    marginBottom: 0.5,
  }
}

const CollectionDetail = () => {

  const { collectionId } = useParams();
  const [loadingPage , setLoadingPage] = useState(true);
  const [collectionInfo , setCollectionInfo] = useState<CollectionInfoType|null>(null);


  const getBasicInfo = useCallback(async () => {
    try {
      if(collectionId){
        setLoadingPage(true);
        const response = await getSingleCollectionInfo(collectionId);
        //console.log("here", response);
        if (response.status === 200) {
          setCollectionInfo(response.data);
        }
      }
    } catch (err) {
      console.error('Error loading data', 'error');
    }
    setLoadingPage(false);
  }, [collectionId]);


  useEffect(() => {
    getBasicInfo();
  }, [getBasicInfo]);
  
  return (
    <Container maxWidth={false}>
      <Loader loading={loadingPage} />
      { collectionInfo && !loadingPage && (
        <>
          <Grid container wrap="nowrap" sx={{ height: '100%', overflow: 'auto' }}>
            <Grid item md={4} xs={12}>
              <DetailsCard 
                collectionInfo={collectionInfo}
              />
            </Grid>
            <Grid item md={8} xs={12}>
              
              <Box sx={{ px: 8 , mt: 8  }}>
                <Typography variant="h4" sx={{fontWeight: "bold",  mb: 2}} >
                  NFTs in this collection
                </Typography>
                
                <Typography sx={{mb: 2}} >
                  Unique items: 0
                </Typography>

                <SearchField handleSearch={()=>{}}/>

              </Box>


            </Grid>
          </Grid>
        </>
      )}
      {loadingPage && <Loader loading />}
    </Container>
  );

}

export default CollectionDetail;