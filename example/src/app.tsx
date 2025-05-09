import { AppProvider } from './context/AppContext';
import ResizableLayout from './components/ResizableLayout';
import Toolbar from './components/TopToolBar/Toolbar';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

import './style/style.css';
import Overlays from './overlays/Overlays';
import TabBar from './components/TabBar';

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
          <Overlays />
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              width: '100%',
              backgroundColor: '#FCFCFC',
            }}
          >
            <Toolbar />
            <TabBar />
            <ResizableLayout />
          </div>
        </ThemeProvider>
      </AppProvider>
    </>
  );
}

export default App;
