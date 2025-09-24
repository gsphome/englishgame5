/**
 * Development-only log viewer component
 * Shows application logs for debugging purposes
 */

import React, { useState, useEffect } from 'react';
import { X, Download, Trash2, Filter } from 'lucide-react';
import { logger } from '../../utils/logger';
import '../../styles/components/log-viewer.css';

interface LogViewerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LogViewer: React.FC<LogViewerProps> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      const currentLogs = logger.getLogs();
      setLogs(currentLogs);
    }
  }, [isOpen]);

  // Don't render in production
  if (!import.meta.env.DEV) {
    return null;
  }

  if (!isOpen) return null;

  const filteredLogs = logs.filter(log => {
    const matchesFilter = filter === 'all' || log.level === filter;
    const matchesSearch =
      searchTerm === '' ||
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.component?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const handleDownload = () => {
    const logData = JSON.stringify(filteredLogs, null, 2);
    const blob = new Blob([logData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `app-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    logger.clearLogs();
    setLogs([]);
  };



  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error':
        return '❌';
      case 'warn':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      case 'debug':
        return '🐛';
      default:
        return '📝';
    }
  };

  return (
    <div className="log-viewer">
      <div className="log-viewer__container">
        {/* Header */}
        <div className="log-viewer__header">
          <h2 className="log-viewer__title">Application Logs (Development)</h2>
          <div className="log-viewer__header-actions">
            <button
              onClick={handleDownload}
              className="log-viewer__action-btn"
              title="Download logs"
            >
              <Download className="log-viewer__icon" />
            </button>
            <button
              onClick={handleClear}
              className="log-viewer__action-btn"
              title="Clear logs"
            >
              <Trash2 className="log-viewer__icon" />
            </button>
            <button
              onClick={onClose}
              className="log-viewer__action-btn"
            >
              <X className="log-viewer__icon" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="log-viewer__filters">
          <div className="log-viewer__filter-group">
            <Filter className="log-viewer__filter-icon" />
            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="log-viewer__select"
            >
              <option value="all">All Levels</option>
              <option value="error">Errors</option>
              <option value="warn">Warnings</option>
              <option value="info">Info</option>
              <option value="debug">Debug</option>
            </select>
          </div>

          <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="log-viewer__search"
          />

          <div className="log-viewer__count">
            {filteredLogs.length} of {logs.length} logs
          </div>
        </div>

        {/* Logs */}
        <div className="log-viewer__content">
          {filteredLogs.length === 0 ? (
            <div className="log-viewer__empty">
              No logs found matching the current filters.
            </div>
          ) : (
            <div className="log-viewer__logs">
              {filteredLogs.map((log, index) => (
                <div
                  key={index}
                  className={`log-viewer__log log-viewer__log--${log.level}`}
                >
                  <div className="log-viewer__log-header">
                    <div className="log-viewer__log-meta">
                      <span className="log-viewer__log-icon">{getLevelIcon(log.level)}</span>
                      <span className="log-viewer__log-level">{log.level}</span>
                      {log.component && (
                        <span className="log-viewer__log-component">
                          {log.component}
                        </span>
                      )}
                      <span className="log-viewer__log-time">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>

                  <div className="log-viewer__log-message">{log.message}</div>

                  {log.data && (
                    <details className="log-viewer__log-data">
                      <summary>
                        Show data
                      </summary>
                      <pre>
                        {JSON.stringify(log.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="log-viewer__footer">
          <p>
            <strong>Note:</strong> This log viewer is only available in development mode. Logs are
            stored in sessionStorage and cleared when the browser session ends.
          </p>
        </div>
      </div>
    </div>
  );
};
