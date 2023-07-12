import { Routes, Route } from 'react-router-dom';
import PageLayout from './components/layout/PageLayout';
import Landing from './pages/Landing';
import Collections from './pages/Collections';
import Claim from './pages/Claim';
import MyProfile from './pages/Profile';
import CollectionDetail from './pages/CollectionDetail';

function App() {
  return (
    <PageLayout>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/profile" element={<MyProfile />} />
        <Route path="/claim" element={<Claim />} />
        <Route path="/collections" element={<Collections />} />
        <Route path="/collection/:collectionId/details" element={<CollectionDetail />} />
      </Routes>
    </PageLayout>
  );
}

export default App;
