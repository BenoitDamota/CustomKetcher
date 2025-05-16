import React, { useRef, useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { TabDataType } from '../types/TabDataType';
import { Box, IconButton, Menu, MenuItem, SxProps, Theme } from '@mui/material';

const containerBoxStyle: React.CSSProperties = {
  backgroundColor: '#FCFCFC',
  height: '40px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-end',
  gap: 1,
  marginTop: '3px',
  borderBottom: '3px solid #525252',
  overflow: 'hidden',
};

const tabsWrapperStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-end',
  gap: '8px',
};

const newTabBoxStyle: SxProps<Theme> = {
  display: 'flex',
  minWidth: '40px',
  paddingInline: 1,
  backgroundColor: '#d9d9d9',
  borderRadius: '4px',
  marginBottom: '3px',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#525252',
  cursor: 'pointer',
  userSelect: 'none',
  ':hover': { color: '#167782' },
};

const newTabButtonStyle: React.CSSProperties = {
  all: 'unset',
  color: 'inherit',
};

const tabButtonBaseStyle: React.CSSProperties = {
  all: 'unset',
  flexGrow: 1,
  textAlign: 'center',
  fontFamily: 'Inter, Roboto, sans-serif',
};

const closeButtonBaseStyle: React.CSSProperties = {
  all: 'unset',
  cursor: 'pointer',
  marginLeft: 8,
  color: 'inherit',
};

const menuIconButtonStyle: React.CSSProperties = { color: '#167782' };

const closeButtonMenuStyle: React.CSSProperties = {
  marginLeft: 'auto',
  cursor: 'pointer',
};

// Styles dynamiques selon état isActive et index
const getTabBoxStyle = (isActive: boolean, index: number): SxProps<Theme> => ({
  display: 'flex',
  minWidth: '40px',
  paddingInline: 1,
  bgcolor: isActive ? '#525252' : '#d9d9d9',
  borderRadius: '4px',
  borderTopLeftRadius: isActive && index === 0 ? '0px' : 'initial',
  borderBottomRightRadius: isActive ? '0px' : '4px',
  borderBottomLeftRadius: isActive ? '0px' : '4px',
  marginBottom: isActive ? '0px' : '3px',
  marginLeft: index === 0 && !isActive ? '8px' : '0px',
  paddingBottom: isActive ? '3px' : '0px',
  alignItems: 'center',
  color: isActive ? '#fff' : '#525252',
  cursor: 'pointer',
  userSelect: 'none',
  ':hover': {
    color: isActive ? '#fff' : '#167782',
    filter: isActive ? 'brightness(1.25)' : 'none',
  },
});

const getMenuItemStyle = (isActive: boolean): SxProps<Theme> => ({
  backgroundColor: isActive ? '#525252 ' : 'transparent',
  color: isActive ? '#fff' : 'initial',
  '&:hover': {
    backgroundColor: isActive ? '#474747' : '#f0f0f0',
    color: isActive ? '#fff' : 'inherit',
  },
});

const getCloseButtonMenuStyle = (isActive: boolean): React.CSSProperties => ({
  ...closeButtonMenuStyle,
  color: isActive ? '#fff' : 'inherit',
});

const TabBar: React.FC = () => {
  const { tabs, activeTab, changeTab, newTab, closeTab } = useAppContext();

  const containerRef = useRef<HTMLDivElement>(null);
  const [maxVisibleTabs, setMaxVisibleTabs] = useState<number>(
    tabs.current.length,
  );
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    const updateVisibleTabs = () => {
      const containerWidth = containerRef.current?.offsetWidth || 0;
      const approxTabWidth = 98;
      const reservedSpace = 50;
      const max = Math.max(
        1,
        Math.floor((containerWidth - reservedSpace) / approxTabWidth),
      );

      setMaxVisibleTabs(max);
    };

    updateVisibleTabs();
    window.addEventListener('resize', updateVisibleTabs);
    return () => window.removeEventListener('resize', updateVisibleTabs);
  }, [tabs.current.length]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  return (
    <>
      <Box ref={containerRef} sx={containerBoxStyle}>
        <div style={tabsWrapperStyle}>
          {tabs.current.map((tab: TabDataType, index: number) => {
            const isActive = tab.id === activeTab.current;

            if (index >= maxVisibleTabs) return null;

            return (
              <Box
                key={tab.id}
                sx={getTabBoxStyle(isActive, index)}
                onClick={() => changeTab(tab.id)}
              >
                <button title={`Tab ${tab.id}`} style={tabButtonBaseStyle}>
                  {`Tab ${tab.id}`}
                </button>
                <button
                  title={`Close Tab ${tab.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tab.id);
                  }}
                  style={closeButtonBaseStyle}
                  className="material-symbols-outlined hover-red"
                >
                  close
                </button>
              </Box>
            );
          })}
          <Box
            key="newTab"
            sx={newTabBoxStyle}
            onClick={() =>
              newTab({
                smiles: '',
                spectrum: [],
              })
            }
          >
            <button
              title="New Tab"
              style={newTabButtonStyle}
              className="material-symbols-outlined hover-primary"
            >
              add
            </button>
          </Box>
        </div>

        <div>
          {tabs.current.length > maxVisibleTabs && (
            <>
              <IconButton onClick={handleMenuOpen} sx={menuIconButtonStyle}>
                <span className="material-symbols-outlined">more_horiz</span>
              </IconButton>
              <Menu
                anchorEl={menuAnchorEl}
                open={Boolean(menuAnchorEl)}
                onClose={handleMenuClose}
              >
                {tabs.current.map((tab, index) => {
                  if (index < maxVisibleTabs) return null;
                  const isActive = tab.id === activeTab.current;
                  return (
                    <MenuItem
                      key={tab.id}
                      sx={getMenuItemStyle(isActive)}
                      onClick={() => {
                        changeTab(tab.id);
                        handleMenuClose();
                      }}
                    >
                      {`Tab ${tab.id}`}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          closeTab(tab.id);
                          handleMenuClose();
                        }}
                        className="material-symbols-outlined hover-red"
                        style={getCloseButtonMenuStyle(isActive)}
                      >
                        close
                      </button>
                    </MenuItem>
                  );
                })}
              </Menu>
            </>
          )}
        </div>
      </Box>
    </>
  );
};

export default TabBar;
