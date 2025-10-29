import React, { useState, useEffect, useCallback } from 'react';
import { getDatabase, ref, onValue, set, update, push, child } from 'firebase/database';
import { database } from './firebase';

import useLocalStorage from './hooks/useLocalStorage';
import Header from './components/Header';
import AttendeeView from './components/AttendeeView';
import OrganizerView from './components/OrganizerView';
import ConfigSetup from './components/ConfigSetup';
import OrganizerLoginModal from './components/OrganizerLoginModal';
import SurveyModal from './components/SurveyModal';

import { Report, Announcement, LostAndFoundItem, ReportStatus, SurveySubmission } from './types';

function App() {
  const [isFirebaseReady, setIsFirebaseReady] = useState(!!database);
  const [view, setView] = useLocalStorage< 'attendee' | 'organizer'>('view', 'attendee');
  const [language, setLanguage] = useLocalStorage('language', 'en');
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');
  
  const [reports, setReports] = useState<Report[]>([]);
  const [lostAndFoundItems, setLostAndFoundItems] = useState<LostAndFoundItem[]>([]);
  const [surveySubmissions, setSurveySubmissions] = useState<SurveySubmission[]>([]);
  const [announcement, setAnnouncement] = useState<Announcement | undefined>(undefined);
  const [userId] = useLocalStorage('userId', `user_${new Date().getTime()}_${Math.random()}`);
  const [dismissedAnnouncements, setDismissedAnnouncements] = useLocalStorage<number[]>('dismissedAnnouncements', []);

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isOrganizerAuthenticated, setIsOrganizerAuthenticated] = useLocalStorage('isOrganizerAuthenticated', false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSurvey, setShowSurvey] = useState(false);

  // Apply theme
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync data with Firebase
  useEffect(() => {
    if (!isFirebaseReady || !database) return;

    const reportsRef = ref(database, 'reports/');
    const unsubscribeReports = onValue(reportsRef, (snapshot) => {
      const data = snapshot.val();
      const reportsArray = data ? Object.keys(data).map(key => ({ ...data[key], id: key })) : [];
      setReports(reportsArray);
    });

    const lfRef = ref(database, 'lostAndFound/');
    const unsubscribeLf = onValue(lfRef, (snapshot) => {
      const data = snapshot.val();
      const lfArray = data ? Object.keys(data).map(key => ({ ...data[key], id: key })) : [];
      setLostAndFoundItems(lfArray);
    });

    const announcementRef = ref(database, 'announcement/');
    const unsubscribeAnnouncements = onValue(announcementRef, (snapshot) => {
      const data = snapshot.val();
      if (data && !dismissedAnnouncements.includes(data.id)) {
        setAnnouncement(data);
      } else {
        setAnnouncement(undefined);
      }
    });
    
    const surveysRef = ref(database, 'surveys/');
    const unsubscribeSurveys = onValue(surveysRef, (snapshot) => {
      const data = snapshot.val();
      const surveysArray = data ? Object.values(data) : [];
      setSurveySubmissions(surveysArray as SurveySubmission[]);
    });

    return () => {
      unsubscribeReports();
      unsubscribeLf();
      unsubscribeAnnouncements();
      unsubscribeSurveys();
    };
  }, [isFirebaseReady, dismissedAnnouncements]);
  
  const handleReportSubmit = useCallback((report: Report) => {
    if (!database) return;

    // Optimistic UI Update: Add the report to local state immediately.
    setReports(prevReports => [...prevReports, report]);

    const reportRef = ref(database, `reports/${report.id}`);
    set(reportRef, report).catch(error => {
      // If the write fails, revert the optimistic update.
      console.error("Firebase write failed, reverting optimistic update:", error);
      setReports(prevReports => prevReports.filter(r => r.id !== report.id));
      // Optionally show an error message to the user here.
    });
    
    // Logic to show survey after a successful report
    const hasSubmittedBefore = localStorage.getItem('hasSubmittedReport');
    if (!hasSubmittedBefore) {
        setTimeout(() => setShowSurvey(true), 4000); // Show survey after 4 seconds
        localStorage.setItem('hasSubmittedReport', 'true');
    }
  }, []);
  
  const handleSurveySubmit = useCallback((submission: SurveySubmission) => {
      if (!database) return;
      const surveyRef = ref(database, 'surveys/');
      push(surveyRef, submission);
      setShowSurvey(false);
  }, []);

  const handleStatusChange = useCallback((reportId: string, status: ReportStatus) => {
    if (!database) return;
    const updates: { [key: string]: any } = {};
    updates[`/reports/${reportId}/status`] = status;
    if (status === ReportStatus.Resolved) {
      updates[`/reports/${reportId}/resolvedTimestamp`] = Date.now();
    }
    update(ref(database), updates);
  }, []);
  
  const handleLfStatusChange = useCallback((itemId: string, isResolved: boolean) => {
    if (!database) return;
    const updates: { [key: string]: any } = {};
    updates[`/lostAndFound/${itemId}/isResolved`] = isResolved;
    update(ref(database), updates);
  }, []);

  const handleLfSubmit = useCallback((item: LostAndFoundItem) => {
      if (!database) return;
      const itemRef = ref(database, `lostAndFound/${item.id}`);
      set(itemRef, item);
  }, []);

  const handleDismissAnnouncement = (id: number) => {
    setDismissedAnnouncements(prev => [...prev, id]);
    setAnnouncement(undefined);
  };

  const handleViewChangeRequest = (newView: 'attendee' | 'organizer') => {
    if (newView === 'organizer' && !isOrganizerAuthenticated) {
      setShowLoginModal(true);
    } else {
      setView(newView);
    }
  };

  const handleLoginSuccess = () => {
    setIsOrganizerAuthenticated(true);
    setShowLoginModal(false);
    setView('organizer');
  };

  const handleLogout = () => {
    setIsOrganizerAuthenticated(false);
    setView('attendee');
  };

  const handleReportsMerge = async (newReports: Report[]): Promise<number> => {
    if (!database) return 0;
    let importedCount = 0;
    const updates: { [key: string]: any } = {};
    const currentReportIds = new Set(reports.map(r => r.id));

    newReports.forEach(report => {
        if (!currentReportIds.has(report.id)) {
            updates[`/reports/${report.id}`] = report;
            importedCount++;
        }
    });

    if (Object.keys(updates).length > 0) {
        await update(ref(database), updates);
    }
    return importedCount;
  };

  const handleBroadcast = (message: string) => {
    if (!database) return;
    const announcementData = { id: Date.now(), message };
    set(ref(database, 'announcement/'), announcementData);
    setDismissedAnnouncements([]); // Clear dismissals so everyone sees the new one
  };
  
  const handleAddNote = (reportId: string, note: string) => {
    if (!database) return;
    const noteData = { message: note, timestamp: Date.now() };
    const notesRef = child(ref(database), `reports/${reportId}/organizerNotes`);
    push(notesRef, noteData);
  };

  if (!isFirebaseReady) {
    return <ConfigSetup onConfigured={() => {
        // This is a bit of a hack to re-initialize firebase. In a real app, you'd reload the window.
        window.location.reload();
    }} />;
  }
  
  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen font-sans text-copy-primary-light dark:text-copy-primary-dark">
      <Header
        currentView={view}
        onViewChangeRequest={handleViewChangeRequest}
        language={language}
        setLanguage={setLanguage}
        theme={theme}
        setTheme={setTheme}
        isOnline={isOnline}
        isOrganizerAuthenticated={isOrganizerAuthenticated}
        onLogout={handleLogout}
      />
      <main>
        {view === 'attendee' ? (
          <AttendeeView
            onReportSubmit={handleReportSubmit}
            language={language}
            userId={userId}
            reports={reports}
            announcement={announcement}
            onDismissAnnouncement={handleDismissAnnouncement}
            isOnline={isOnline}
            lostAndFoundItems={lostAndFoundItems}
            onLfSubmit={handleLfSubmit}
          />
        ) : (
          <OrganizerView
            reports={reports}
            onStatusChange={handleStatusChange}
            onReportsMerge={handleReportsMerge}
            onReportAdd={handleReportSubmit} // For SMS reports
            onBroadcast={handleBroadcast}
            onAddNote={handleAddNote}
            language={language}
            isOnline={isOnline}
            lostAndFoundItems={lostAndFoundItems}
            onLfStatusChange={handleLfStatusChange}
            surveySubmissions={surveySubmissions}
          />
        )}
      </main>
      {showLoginModal && (
        <OrganizerLoginModal
          onLoginSuccess={handleLoginSuccess}
          onClose={() => setShowLoginModal(false)}
          language={language}
        />
      )}
      {showSurvey && (
         <SurveyModal 
            onClose={() => setShowSurvey(false)}
            onSubmit={handleSurveySubmit}
            language={language}
         />
      )}
    </div>
  );
}

export default App;
