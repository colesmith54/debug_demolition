import {Outlet} from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import {Toolbar, Typography} from "@mui/material";
import Box from "@mui/material/Box";
import AdbIcon from '@mui/icons-material/Adb';
import * as React from 'react';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import {AuthContext} from "../src/AuthContext";
import {useContext} from "react";
import ColorModeSelect from "../shared-theme/ColorModeSelect";
import CssBaseline from "@mui/material/CssBaseline";
import AppTheme from "../shared-theme/AppTheme";

const Layout = () => {
  const {getUsername} = useContext(AuthContext);

  return (
    <Box>
      <AppTheme>
        <CssBaseline enableColorScheme />
        <AppBar position="static">
          <Toolbar sx={{ justifyContent: 'flex-start' }}>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Coding Battles!
            </Typography>

            {
              getUsername() == null &&
              <Button color="inherit" href="/login">Login</Button>
            }
            <ColorModeSelect />

          </Toolbar>
        </AppBar>

        <Outlet />
      </AppTheme>
    </Box>
  )
};

export default Layout;
