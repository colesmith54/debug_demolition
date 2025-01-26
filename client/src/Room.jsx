import React, { useState, useEffect, useContext } from 'react';
import { WebSocketContext } from './WebSocketContext';
import PropTypes from 'prop-types';
import Editor from '@monaco-editor/react';

const Room = () => {
  const {
    problemHtml,
    initialCode,
    sendMessage,
    roomId,
    player1,
    player2,
    setHasNavigated,
    alert
  } = useContext(WebSocketContext);

  const [code, setCode] = useState(initialCode || '');

  console.log("alert: ", alert);  
  // console.log('Room:', roomId, 'Player1:', player1, 'Player2:', player2);
  // console.log('Initial Code:', initialCode);
  // console.log('Problem HTML:', problemHtml);

  useEffect(() => {
    setCode((prev) => {
      if (prev && typeof prev === 'string' && prev.startsWith('`')) return prev.slice(10, -4);
      else return prev;
    })
    setHasNavigated(false);
  }, [initialCode]);

  const editorOptions = {
    selectOnLineNumbers: true,
    minimap: { enabled: false },
    wordWrap: 'on',
    theme: 'vs-light',
  };

  const handleRunCode = async () => {
    try {
      sendMessage({ status: 'code-submission', roomId: roomId});
    } catch (error) {
      console.error('Error running the code:', error);
    }
  };

  return (
    <div>
      <div style={styles.header}>
        <h2>Room ID: {roomId || 'None'}</h2>
        <h4>Player 1: {player1 || 'Waiting...'}</h4>
        <h4>Player 2: {player2 || 'Waiting...'}</h4>
      </div>

      <div style={styles.layout}>
        <div style={styles.leftPanel}>
          <div style={styles.buttonContainer}>
            <button style={styles.runButton} onClick={handleRunCode}>
              Run
            </button>
          </div>
          <div
            style={styles.problemDetails}
            dangerouslySetInnerHTML={{ __html: problemHtml }}
          />
        </div>

        <div style={styles.rightPanel}>
          <Editor
            defaultLanguage="python"
            value={code}
            onChange={(newValue) => setCode(newValue)}
            options={editorOptions}
            height="100%"
            width="100%"
          />
        </div>
      </div>
    </div>
  );
};

const styles = {
  header: {
    padding: '20px',
    backgroundColor: '#007bff',
    color: 'white',
    textAlign: 'center',
  },
  layout: {
    display: 'flex',
    height: 'calc(100vh - 100px)', // Subtract header height
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
    backgroundColor: '#f5f5f5',
  },
};

Room.propTypes = {
  problemHtml: PropTypes.string,
};

export default Room;
