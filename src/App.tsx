import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import { WalletProvider } from './contexts/WalletContext';
import { PreferencesProvider } from './contexts/PreferencesContext';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { Pricing } from './pages/PricingPage';
import { DashboardPage } from './pages/DashboardPage';
import { FeaturesPage } from './pages/FeaturesPage';
import { CancellationRefundPage } from './pages/CancellationRefundPage';
import { TermsConditionsPage } from './pages/TermsConditionsPage';
import { ShippingDeliveryPage } from './pages/ShippingDeliveryPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { ContactUsPage } from './pages/ContactUsPage';
import { AuthCallback } from './pages/AuthCallback';
import { VerificationSuccessPage } from './pages/VerificationSuccessPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { SubscriptionGate } from './components/SubscriptionGate';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SubscriptionProvider>
          <WalletProvider>
            <PreferencesProvider>
              <Router>
                <div className="font-montserrat min-h-screen bg-light-base dark:bg-dark-base text-light-text dark:text-dark-text font-editorial transition-colors duration-300">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/features" element={<FeaturesPage />} />
                    <Route path="/cancellation-refund" element={<CancellationRefundPage />} />
                    <Route path="/terms" element={<TermsConditionsPage />} />
                    <Route path="/shipping" element={<ShippingDeliveryPage />} />
                    <Route path="/privacy" element={<PrivacyPolicyPage />} />
                    <Route path="/contact" element={<ContactUsPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignUpPage />} />
                    <Route path="/verify-success" element={<VerificationSuccessPage />} />
                    <Route path="/auth/callback" element={<AuthCallback />} />
                    <Route path="/pricing" element={
                      <ProtectedRoute>
                        <Pricing />
                      </ProtectedRoute>
                    } />
                    <Route path="/dashboard/*" element={
                      <ProtectedRoute>
                        <SubscriptionGate>
                          <DashboardPage />
                        </SubscriptionGate>
                      </ProtectedRoute>
                    } />
                  </Routes>
                </div>
              </Router>
            </PreferencesProvider>
          </WalletProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;