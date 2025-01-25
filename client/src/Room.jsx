import React, { useState, useEffect, useContext } from 'react';
import { WebSocketContext } from './WebSocketContext';
import PropTypes from 'prop-types';
import Editor from '@monaco-editor/react';

const Room = () => {
  const { problemHtml, initialCode, sendMessage, setHasNavigated } = useContext(WebSocketContext);
  const [code, setCode] = useState(initialCode || '');

  useEffect(() => {
    setHasNavigated(false);
  }, []);

  const editorOptions = {
    selectOnLineNumbers: true,
    minimap: { enabled: false },
    wordWrap: 'on',
    theme: 'vs-light'
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.monaco) {
        window.monaco.editor.getModels().forEach((model) => model.setValue(code));
      }
    };

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [code]);

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
    <div style={styles.container}>
      {/* Left side: Problem Details */}
      <div style={styles.leftPanel}>
        <div style={styles.runButton} onClick={handleRunCode}>
          Run
        </div>
        <div
          style={styles.problemDetails}
          dangerouslySetInnerHTML={{ __html: problemHtml }}
        />
      </div>

      {/* Right side: Monaco Code Editor */}
      <div style={styles.rightPanel}>
        <Editor
          defaultLanguage={'python'}
          value={code}
          onChange={(newValue) => setCode(newValue)}
          options={editorOptions}
          height="100%"
        />
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    overflow: 'hidden',
  },
  leftPanel: {
    width: '50%',
    padding: '20px',
    backgroundColor: 'white',
    position: 'relative',
    overflowY: 'auto',
    borderRight: '2px solid #ddd',
  },
  runButton: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    backgroundColor: '#007bff',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  problemDetails: {
    marginTop: '40px',
    fontSize: '16px',
    lineHeight: '1.5',
    color: '#333',
  },
  rightPanel: {
    width: '50%',
    padding: '10px',
    backgroundColor: '#f5f5f5',
    height: '100%',
  },
};

Room.propTypes = {
  problemHtml: PropTypes.string
};

export default Room;
