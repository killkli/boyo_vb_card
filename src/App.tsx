import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Learn } from './pages/Learn';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/learn/:level" element={<Learn />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
