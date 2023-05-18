import { FunctionComponent, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import PropTypes from 'prop-types';
import PageLayout from './components/layout/PageLayout';
import Dashboard from './pages/Dashboard';
import Landing from './pages/Landing';
import Issue from './pages/Issue';
import Claim from './pages/Claim';
import MyProfile from './pages/Profile';
import CollectionDetail from './pages/CollectionDetail';
import { useAdminAccount } from './utils/hooks';

function App() {
  const isAdminLoggedIn = useAdminAccount();

  return (
    <PageLayout>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/profile" element={<MyProfile />} />
        <Route path="/claim" element={<Claim />} />
        <Route path="/home" element={<Dashboard />} />
        <Route path="/issue" element={<Issue />} />
        <Route path="/collection/:collectionId/details" element={<CollectionDetail />} />
      </Routes>
    </PageLayout>
  );
}

export default App;
