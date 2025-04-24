import { AppProvider } from './context/AppContext';
import ResizableLayout from './components/ResizableLayout';
import Toolbar from './components/TopToolBar/Toolbar';
import ModalRenderer from './modals/ModalRenderer';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

import './style/style.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#167782',
    },
    secondary: {
      main: '#525252',
    },
  },
});

function App() {
  return (
    <>
      <AppProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <ModalRenderer />
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              height: '100vh',
            }}
          >
            <Toolbar />
            <ResizableLayout />
          </div>
        </ThemeProvider>
      </AppProvider>
    </>
  );
}

export default App;
