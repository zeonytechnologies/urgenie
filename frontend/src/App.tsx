import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import DashboardLayout from './components/layout/DashboardLayout';
import Home from './pages/Home';
import Browse from './pages/Browse';
import AdDetails from './pages/AdDetails';
import PostAd from './pages/PostAd';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import MyAds from './pages/MyAds';
import SavedAds from './pages/SavedAds';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="browse" element={<Browse />} />
            <Route path="category/:category" element={<Browse />} />
            <Route path="category/:category/:subcategory" element={<Browse />} />
            <Route path="ad/:slug" element={<AdDetails />} />
            <Route path="post-ad" element={<PostAd />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password" element={<ResetPassword />} />
            
            <Route path="profile" element={<DashboardLayout />}>
              <Route index element={<Profile />} />
              <Route path="ads" element={<MyAds />} />
              <Route path="saved" element={<SavedAds />} />
            </Route>

            <Route path="admin" element={<AdminDashboard />} />
            
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
