import React, { useRef, useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { TabDataType } from '../types/TabDataType';
import { Box, IconButton, Menu, MenuItem } from '@mui/material';

const TabBar: React.FC = () => {
  const { tabs, activeTab, changeTab, closeTab, generalSettings } =
    useAppContext();

  const containerRef = useRef<HTMLDivElement>(null);
  const [maxVisibleTabs, setMaxVisibleTabs] = useState<number>(
    tabs.current.length,
  );
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);

  const generalCategory = generalSettings.find(
    (cat) => cat.settingsCategoryName === 'General',
  );
  const hideTabBarWhenSingleTab = Boolean(
    generalCategory?.settings.find(
      (setting) => setting.key === 'hideTabBarWhenSingleTab',
    )?.value,
  );

  useEffect(() => {
    const updateVisibleTabs = () => {
      const containerWidth = containerRef.current?.offsetWidth || 0;
      const approxTabWidth = 108;
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
      {(!hideTabBarWhenSingleTab || tabs.current.length > 1) && (
        <Box
          ref={containerRef}
          sx={{
            backgroundColor: '#FCFCFC',
            height: '40px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            gap: 1,
            marginTop: '3px',
            borderBottom: '3px solid #525252',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: '8px',
            }}
          >
            {tabs.current.map((tab: TabDataType, index: number) => {
              const isActive = tab.id === activeTab;

              if (index >= maxVisibleTabs) return null;

              return (
                <Box
                  key={tab.id}
                  sx={{
                    display: 'flex',
                    minWidth: '100px',
                    paddingInline: 1,
                    bgcolor: isActive ? '#525252' : '#d9d9d9',
                    borderRadius: '4px',
                    borderTopLeftRadius:
                      isActive && index === 0 ? '0px' : 'auto',
                    borderBottomRightRadius: isActive ? '0px' : '4px',
                    borderBottomLeftRadius: isActive ? '0px' : '4px',
                    marginBottom: isActive ? '0px' : '3px',
                    marginLeft: index === 0 && !isActive ? '8px' : '0px',
                    paddingBottom: isActive ? '3px' : '0px',
                    alignItems: 'center',
                    color: isActive ? '#fff' : '#666',
                  }}
                >
                  <button
                    onClick={() => changeTab(tab.id)}
                    style={{
                      all: 'unset',
                      flexGrow: 1,
                      textAlign: 'center',
                      cursor: 'pointer',
                      fontFamily: 'Inter, Roboto, sans-serif',
                    }}
                  >
                    {`Tab ${tab.id}`}
                  </button>
                  <button
                    onClick={() => closeTab(tab.id)}
                    style={{
                      all: 'unset',
                      cursor: 'pointer',
                      marginLeft: 8,
                      color: isActive ? '#fff' : '#757575',
                    }}
                    className="material-symbols-outlined hover-red"
                  >
                    close
                  </button>
                </Box>
              );
            })}
          </div>

          <div>
            {tabs.current.length > maxVisibleTabs && (
              <>
                <IconButton onClick={handleMenuOpen} sx={{ color: '#167782' }}>
                  <span className="material-symbols-outlined">more_horiz</span>
                </IconButton>
                <Menu
                  anchorEl={menuAnchorEl}
                  open={Boolean(menuAnchorEl)}
                  onClose={handleMenuClose}
                >
                  {tabs.current.map((tab, index) => {
                    if (index < maxVisibleTabs) return null;
                    return (
                      <MenuItem
                        key={tab.id}
                        sx={{
                          backgroundColor:
                            tab.id === activeTab ? '#525252 ' : 'transparent',
                          color: tab.id === activeTab ? '#fff' : 'initial',
                          '&:hover': {
                            backgroundColor:
                              tab.id === activeTab ? '#474747' : '#f0f0f0',
                            color: tab.id === activeTab ? '#fff' : 'inherit',
                          },
                        }}
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
                          style={{
                            marginLeft: 'auto',
                            cursor: 'pointer',
                            color: tab.id === activeTab ? '#fff' : 'inherit',
                          }}
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
      )}
    </>
  );
};

export default TabBar;
