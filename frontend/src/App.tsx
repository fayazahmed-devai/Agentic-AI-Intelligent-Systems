import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FileProvider } from './context/FileContext';
import ErrorBoundary from './components/ErrorBoundary';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import FileUploaderModal from './components/FileUploaderModal';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import KnowledgeLibraryPage from './pages/KnowledgeLibraryPage';
import ChatPage from './pages/ChatPage';
import ConnectedIntelligencePage from './pages/ConnectedIntelligencePage';
import ContentStudioPage from './pages/ContentStudioPage';
import QuizStudioPage from './pages/QuizStudioPage';
import GlobalSearchPage from './pages/GlobalSearchPage';
import DocumentationPage from './pages/DocumentationPage';

// Advanced Part 2 Feature Pages
import DetectivePage from './pages/DetectivePage';
import KnowledgeGraphPage from './pages/KnowledgeGraphPage';
import VoiceAssistantPage from './pages/VoiceAssistantPage';
import LearningMentorPage from './pages/LearningMentorPage';
import EvidenceTrustPage from './pages/EvidenceTrustPage';
import ResearchAgentPage from './pages/ResearchAgentPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-navy-900 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function MainLayout({ children }: { children: React.ReactNode }) {
  const [uploaderOpen, setUploaderOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#fcfbfc] text-slate-800 flex flex-col">
      <Navbar onOpenUpload={() => setUploaderOpen(true)} />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-x-hidden min-h-[calc(100vh-4rem)]">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>
      <FileUploaderModal isOpen={uploaderOpen} onClose={() => setUploaderOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary fallbackTitle="Application Recovery">
      <BrowserRouter>
        <AuthProvider>
          <FileProvider>
            <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Core Workspace Pages */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <DashboardPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/library"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <KnowledgeLibraryPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <ChatPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/connected-intelligence"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <ConnectedIntelligencePage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* Advanced Intelligence Pages (Part 2) */}
            <Route
              path="/detective"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <DetectivePage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/graph"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <KnowledgeGraphPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/voice"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <VoiceAssistantPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/mentor"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <LearningMentorPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/evidence"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <EvidenceTrustPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/research-agent"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <ResearchAgentPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* Studio & Search Pages */}
            <Route
              path="/quiz"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <QuizStudioPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/content-studio"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <ContentStudioPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/search"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <GlobalSearchPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* Documentation Page */}
            <Route
              path="/docs"
              element={
                <MainLayout>
                  <DocumentationPage />
                </MainLayout>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </FileProvider>
      </AuthProvider>
    </BrowserRouter>
  </ErrorBoundary>
);
}
