import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Posts from './pages/Posts';
import Players from './pages/Players';
import Matches from './pages/Matches';
import Admission from './pages/Admission';
import Admin from './pages/Admin';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Analytics from './components/Analytics';
import { PostsProvider } from './context/PostsContext';
import { PlayersProvider } from './context/PlayersContext';
import { StaffProvider } from './context/StaffContext';
import { MatchesProvider } from './context/MatchesContext';
import { OpponentPlayersProvider } from './context/OpponentPlayersContext';
import { TeamsProvider } from './context/TeamsContext';

function HomePage() {
  return (
    <PostsProvider>
      <Home />
    </PostsProvider>
  );
}

function PostsPage() {
  return (
    <PostsProvider>
      <Posts />
    </PostsProvider>
  );
}

function PlayersPage() {
  return (
    <PlayersProvider>
      <StaffProvider>
        <Players />
      </StaffProvider>
    </PlayersProvider>
  );
}

function AdminPage() {
  return (
    <PostsProvider>
      <PlayersProvider>
        <StaffProvider>
          <TeamsProvider>
            <OpponentPlayersProvider>
              <Admin />
            </OpponentPlayersProvider>
          </TeamsProvider>
        </StaffProvider>
      </PlayersProvider>
    </PostsProvider>
  );
}

function App() {
  return (
    <Router>
      <Analytics />
      <Routes>
        <Route
          path="/"
          element={(
            <MatchesProvider>
              <Layout />
            </MatchesProvider>
          )}
        >
          <Route index element={<HomePage />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="posts" element={<PostsPage />} />
          <Route path="players" element={<PlayersPage />} />
          <Route path="matches" element={<Matches />} />
          <Route path="admission" element={<Admission />} />
          <Route path="admin" element={<AdminPage />} />
          <Route path="terms" element={<Terms />} />
          <Route path="privacy" element={<Privacy />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
