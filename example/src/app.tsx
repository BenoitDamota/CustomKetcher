import { AppProvider } from './context/AppContext';
import ResizableLayout from './components/ResizableLayout';
import Toolbar from './components/TopToolBar/Toolbar';
import './style/style.css';

function App() {
  return (
    <>
      <AppProvider>
        <div
          style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}
        >
          <Toolbar />
          <ResizableLayout />
        </div>
      </AppProvider>
    </>
  );
}

export default App;
