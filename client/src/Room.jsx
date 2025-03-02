import React, { useState, useEffect, useContext } from 'react';
import { WebSocketContext } from './WebSocketContext';
import PropTypes from 'prop-types';
import Editor from '@monaco-editor/react';
import {AuthContext} from "./AuthContext.jsx";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

function a11yProps(index) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`,
  };
}

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

const Room = () => {
  const {
    isLoading,
    setIsLoading,
    problemHtml,
    initialCode,
    sendMessage,
    roomId,
    opponent,
    alert,
    judgeResult,
    elo,
    eloOther,
  } = useContext(WebSocketContext);

  const {username} = useContext(AuthContext);
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };


  const [code, setCode] = useState(initialCode || '');
  const [timer, setTimer] = useState(300);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval); // Cleanup on unmount
    }
  }, [timer]);

  useEffect(() => {
    setCode((prev) => {
      if (prev && typeof prev === 'string' && prev.startsWith('`')) return prev.slice(10, -4);
      else return prev;
    });
  }, [initialCode]);

  const editorOptions = {
    selectOnLineNumbers: true,
    minimap: { enabled: false },
    wordWrap: 'on',
    theme: 'vs-light',
  };

  const handleRunCode = async () => {
    try {
      setIsLoading(true);
      sendMessage({ status: 'code-submission', username: username.current, roomId: roomId, code: code });
    } catch (error) {
      console.error('Error running the code:', error);
    }
  };

  return (
    <div>
      {alert && (
        <div style={styles.alertBanner}>
          {/*<p>{alert}</p>*/}
        </div>
      )}
      
      <div style={styles.header}>
        <div style={styles.roomInfo}>
          <h4 style={styles.roomId}>Room ID: {roomId || 'None'}</h4>
          <div style={styles.timer}>
            {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}
          </div>
          <div style={styles.players}>
            {/* Player 1 */}
            <div style={styles.playerContainer}>
              <h3 style={styles.playerName}>{username.current || 'Player 1'}</h3>
              <p style={styles.playerElo}>{username.current ? elo : 'Waiting...'}</p>
            </div>

            {/* VS */}
            <h3 style={styles.vs}>VS</h3>

            {/* Player 2 */}
            <div style={styles.playerContainer}>
              <h3 style={styles.playerName}>{opponent.current || 'Player 2'}</h3>
              <p style={styles.playerElo}>{opponent.current ? eloOther : 'Waiting...'}</p>
            </div>
          </div>
        </div>
      </div>


      <div style={styles.layout}>
        <div style={styles.leftPanel}>
          <div style={styles.buttonContainer}>
            <button style={styles.runButton} onClick={handleRunCode}>
              {isLoading ? 'Loading...' : 'Run'}
            </button>
          </div>
          <div
            style={styles.problemDetails}
            dangerouslySetInnerHTML={{ __html: problemHtml }}
          />
          {judgeResult.current !== null && (
            judgeResult.current === 'Time Limit Exceeded' ? 
              <h3>Time Limit Exceeded</h3> :
              <>
              <Box
                sx={{ flexGrow: 1, bgcolor: 'background.paper', display: 'flex', height: 224 }}
              >
                <Tabs
                  orientation="vertical"
                  variant="scrollable"
                  value={value}
                  onChange={handleChange}
                  aria-label="Vertical tabs example"
                  sx={{ borderRight: 1, borderColor: 'divider' }}
                >
                  {
                    judgeResult.current['passed'].map((p, i) => (
                      <Tab sx={{'color': 'green'}} key={i} label={'Test Case ' + (i + 1).toString()} {...a11yProps(i)} />
                    ))
                  }
                  {
                    judgeResult.current['failed'].map((p, i) => (
                      <Tab sx={{'color': 'red'}} key={i + judgeResult.current['passed'].length} label={'Test Case ' + (i + 1 + judgeResult.current['passed'].length).toString()} {...a11yProps(i + judgeResult.current['passed'].length)} />
                    ))
                  }
                </Tabs>
                {
                  judgeResult.current['passed'].map((p, i) => (
                    <TabPanel key={i} value={value} index={i}>
                      <div>
                        {p['input']}
                      </div>
                      <div>
                        {"Expected output: " + p['expected']}
                      </div>
                      <div>
                        {"Actual output: " + p['output']}
                      </div>
                    </TabPanel>
                  ))
                }
                {
                  judgeResult.current['failed'].map((p, i) => (
                    <TabPanel key={i + judgeResult.current['passed'].length} value={value} index={i + judgeResult.current['passed'].length}>
                      <div>
                        {p['input']}
                      </div>
                      <div>
                        {"Expected output: " + p['expected']}
                      </div>
                      <div>
                        {"Actual output: " + p['output']}
                      </div>
                    </TabPanel>
                  ))
                }
              </Box>
            </>
          )}
        </div>

        <div style={styles.rightPanel}>
          {/* Editor Container */}
          <div style={styles.editorContainer}>
            <Editor
              defaultLanguage="python"
              value={code}
              onChange={(newValue) => setCode(newValue)}
              options={editorOptions}
              height="100%"
              width="100%"
            />
          </div>

          {/* Hello Container */}
          <div style={styles.helloContainer}>
            Hello
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
    padding: '20px',
    backgroundColor: '#f4f4f4',
    borderBottom: '2px solid #ddd',
  },
  footer: {
    position: 'absolute',
    bottom: '0',
    left: '0',
    width: '100%', /* Ensure it spans the entire parent */
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    backgroundColor: '#f4f4f4',
    borderTop: '2px solid #ddd', // Adjust for visibility at the bottom
  },

  roomInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center', 
    gap: '10px',
  },
  roomId: {
    fontSize: '14px',
    color: '#666',
    fontWeight: 'bold',
  },
  players: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center', 
    gap: '40px',
    marginTop: '10px', 
  },
  playerContainer: {
    textAlign: 'center',
  },
  playerName: {
    fontSize: '18px',
    color: '#663',
    fontWeight: 'bold',
    margin: 0,
  },
  playerElo: {
    fontSize: '14px',
    color: '#555',
    margin: '5px 0 0',
  },
  vs: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#000',
  },
  layout: {
    display: 'flex',
    height: 'calc(100vh - 100px)', 
    overflow: 'hidden',
  },
  leftPanel: {
    flex: '1',
    padding: '20px',
    backgroundColor: 'white',
    overflowY: 'auto',
    borderRight: '2px solid #ddd',
    position: 'relative',
  },
  buttonContainer: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
  },
  runButton: {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
    border: 'none',
    outline: 'none',
  },
  submitButton: {
    backgroundColor: '#28a745',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
    border: 'none',
    outline: 'none',
  },
  problemDetails: {
    fontSize: '16px',
    lineHeight: '1.5',
    color: '#333',
  },
  rightPanel: {
    flex: '1',
    padding: '10px',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: '#f5f5f5',
    minHeight: '100vh',
  },
  editorContainer: {
    flex: '1', // Takes up remaining space
    position: 'relative',
  },
  helloContainer: {
    alignSelf: 'flex-end', // Aligns to the right
    backgroundColor: '#f0f0f0',
    padding: '10px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginTop: '10px', // Space between Editor and Hello
    maxWidth: '200px',
    textAlign: 'center',
  },
  timer: {
    position: 'absolute',
    top: '10px',
    right: '20px',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333',
    backgroundColor: '#f4f4f4',
    padding: '5px 10px',
    borderRadius: '5px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
};

Room.propTypes = {
  problemHtml: PropTypes.string,
};

export default Room;
