// src/UserLayout.jsx
import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  CssBaseline,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Divider,
  IconButton,
  Tooltip,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material';
import { styled, useTheme, createTheme, ThemeProvider } from '@mui/material/styles';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  ArrowDropDown as ArrowDropDownIcon,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';

// Define your drawer widths and theme here...
const drawerWidth = 250;
const closedDrawerWidth = 64;
// Custom theme with primary color #fe3bd4
const theme = createTheme({
  palette: {
    primary: {
      main: '#fe3bd4',
    },
  },
  typography: {
    h4: {
      fontFamily: "'Quicksand', sans-serif",
      fontWeight: 900,
      color: '#1B3B2F', // Dark greenish-black color
      fontSize: '2.2rem',
    },
    // You can customize other typography variants if needed
  },
});

// Styled components for Drawer
const openedMixin = (theme) => ({
  width: drawerWidth,
  backgroundColor: '#303030', // Dark background for Drawer
  color: '#ffffff', // White text
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
  // Override margin for small screens (<= 480px)
  [theme.breakpoints.down(480)]: {
    zIndex: 1000, // Ensure the drawer is above other elements  
  },
});

const closedMixin = (theme) => ({
  backgroundColor: '#303030', // Dark background for Drawer
  color: '#ffffff', // White text
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `${closedDrawerWidth}px`,
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  minHeight: '64px', // Match AppBar height
  padding: theme.spacing(0, 1),
  justifyContent: 'space-between',
}));

const AppBarStyled = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  backgroundColor: theme.palette.primary.main,
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
  }),
  ...(!open && {
    width: `calc(100% - ${closedDrawerWidth}px)`,
    marginLeft: `${closedDrawerWidth}px`,
  }),
}));

const DrawerStyled = styled(Drawer, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  width: open ? drawerWidth : closedDrawerWidth,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  position: 'relative',
  zIndex: 1,

  '@media (max-width: 480px)': {
    position: 'absolute',
    zIndex: 1000,
  },

  ...(open && {
    ...openedMixin(theme),
    '& .MuiDrawer-paper': openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    '& .MuiDrawer-paper': closedMixin(theme),
  }),
}));

const Main = styled('main', {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create(['margin', 'width', 'margin-left'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  width: `calc(100% - ${open ? drawerWidth : closedDrawerWidth}px)`,

  // Default margin for larger screens
  margin: '0 10px',

  // Override margin for small screens (<= 480px)
  [theme.breakpoints.down(480)]: {
    margin: '0 10px 0 64px',
  },
}));

const UserLayout = ({
  children,
  menuItems,
  userName,
  userEmail,
  userInitial,
  open,
  setOpen,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth(); // Destructure logout from useAuth

  // State for profile menu
  const [anchorEl, setAnchorEl] = React.useState(null);
  const menuOpen = Boolean(anchorEl);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  // Handle profile menu open
  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Handle profile menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Handle menu item click
  const handleMenuItemClick = async (option) => {
    handleMenuClose();
    if (option === 'logout') {
      try {
        console.log('Logging out...');
        await logout(); // Call the logout function from useAuth and wait for completion
        navigate('/'); // Redirect to login page after logout
      } catch (error) {
        console.error('Error during logout:', error);
      }
    } else if (option === 'profile') {
      // Navigate to profile info page
      navigate('/');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />

        {/* AppBar */}
        <AppBarStyled position="fixed" open={open}>
          <Toolbar sx={{ display: 'flex', justifyContent:'end' }}>
            {/* Menu Icon for toggling drawer */}
            {/* <IconButton
              color="inherit"
              aria-label="toggle drawer"
              onClick={handleDrawerToggle}
              edge="start"
              sx={{ marginRight: '16px' }}
            >
              {open ? <ChevronLeftIcon /> : <MenuIcon />}
            </IconButton> */}
            {/* <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
              Dashboard
            </Typography> */}
            {/* Profile Box */}
            <Box
              sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
              onClick={handleProfileMenuOpen}
            >
              <Avatar sx={{ marginRight: '8px', backgroundColor: '#b054ae' }}>
                {userInitial}
              </Avatar>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', marginRight: '4px' }}>
                {userName}
              </Typography>
              <ArrowDropDownIcon />
            </Box>
          </Toolbar>
        </AppBarStyled>

        {/* Profile Menu */}
        <Menu
          id="profile-menu"
          anchorEl={anchorEl}
          open={menuOpen}
          onClose={handleMenuClose}
          keepMounted
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem disabled>
            <Typography variant="subtitle1">{userName}</Typography>
          </MenuItem>
          <MenuItem disabled>
            <Typography variant="body2">{userEmail}</Typography>
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => handleMenuItemClick('profile')}>
            Profile Info
          </MenuItem>
          <MenuItem onClick={() => handleMenuItemClick('logout')} sx={{ color: 'red' }}>
            Logout
          </MenuItem>
        </Menu>

        {/* Drawer (Sidebar) */}
        <DrawerStyled variant="permanent" open={open}>
          <DrawerHeader>
            {open && (
              <Typography variant="subtitle1" sx={{ paddingLeft: '16px', color: '#fff' }}>
              {userName}
            </Typography>
              
            )}
            <IconButton onClick={handleDrawerToggle} sx={{ color: '#fff' }}>
              {open ? <ChevronLeftIcon /> : <MenuIcon />}
            </IconButton>
          </DrawerHeader>
          <Divider sx={{ backgroundColor: '#484848' }} />
          <List>
            {menuItems.map((item) => (
              <Tooltip title={open ? '' : item.text} placement="right" key={item.text}>
                <ListItemButton
                  component={Link}
                  to={item.path}
                  selected={location.pathname === item.path}
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? 'initial' : 'center',
                    px: 2.5,
                    color: '#fff',
                    '&:hover': {
                      backgroundColor: '#484848',
                    },
                    '&.Mui-selected': {
                      backgroundColor: '#616161',
                      '&:hover': {
                        backgroundColor: '#757575',
                      },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 2 : 'auto',
                      justifyContent: 'center',
                      color: '#fff',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} sx={{ opacity: open ? 1 : 0 }} />
                </ListItemButton>
              </Tooltip>
            ))}
          </List>
        </DrawerStyled>

        {/* Main Content */}
        <Main open={open}>
          <Toolbar />
          {children}
        </Main>
      </Box>
    </ThemeProvider>
  );
};

export default UserLayout;