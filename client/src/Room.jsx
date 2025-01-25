import React, { useState, useEffect, useContext } from 'react';
import { WebSocketContext } from './WebSocketContext';
import PropTypes from 'prop-types';
import Editor from '@monaco-editor/react';
import Split from 'react-split';

const Room = () => {
  const { problemHtml, initialCode, sendMessage, roomId, player1, player2 } = useContext(WebSocketContext);
  const [code, setCode] = useState(initialCode || '');

  useEffect(() => {
    setCode((prevCode) => {
      if (!prevCode) return initialCode;
      while (prevCode && prevCode.endsWith('`')) prevCode = prevCode.slice(0, -1);
      while (prevCode && prevCode.startsWith('`')) prevCode = prevCode.slice(1);
      while (prevCode && prevCode.startsWith('python')) prevCode = prevCode.slice(6);
      return prevCode;
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
      sendMessage(JSON.stringify({ status: 'code-submission', code }));
      alert('Code executed successfully');
    } catch (error) {
      console.error('Error running the code', error);
      alert('Error executing code');
    }
  };

  return (
    <div>
      {/* Header Section */}
      <div style={styles.header}>
        <h2>Room ID: {roomId}</h2>
        <h4>Player 1: {player1 || 'Waiting...'}</h4>
        <h4>Player 2: {player2 || 'Waiting for player...'}</h4>
      </div>

      {/* Draggable Split Panels */}
      <Split
        sizes={[50, 50]}
        minSize={100}
        gutterSize={10}
        direction="horizontal"
        style={{ height: 'calc(100vh - 100px)' }} // Adjust to fit below the header
      >
        {/* Left Panel */}
        <div style={styles.leftPanel}>
        <button onClick={handleRunCode}>
          Run
        </button>
          <div
            style={styles.problemDetails}
            dangerouslySetInnerHTML={{ __html: problemHtml }}
          />
        </div>

        {/* Right Panel */}
        <div style={styles.rightPanel}>
          <Editor
            defaultLanguage={'python'}
            value={code}
            onChange={(newValue) => setCode(newValue)}
            options={editorOptions}
            height="100%"
          />
        </div>
      </Split>
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
  leftPanel: {
    padding: '20px',
    backgroundColor: 'white',
    overflowY: 'auto',
    borderRight: '2px solid #ddd',
  },
  problemDetails: {
    fontSize: '16px',
    lineHeight: '1.5',
    color: '#333',
  },
  rightPanel: {
    padding: '10px',
    backgroundColor: '#f5f5f5',
    height: '100%',
  },
};

Room.propTypes = {
  problemHtml: PropTypes.string,
};

export default Room;
