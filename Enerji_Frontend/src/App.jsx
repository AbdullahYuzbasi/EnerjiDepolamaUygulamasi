import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Control from './pages/Control';
import History from './pages/History';
import Layout from './components/Layout';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        
        {/* Layout ile sarmalanmış sayfalar */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/kontrol" element={<Control />} />
          <Route path="/gecmis" element={<History />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;