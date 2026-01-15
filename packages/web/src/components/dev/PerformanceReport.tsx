import { useState, useEffect } from 'react';
import {
  getRenderStatsArray,
  clearRenderStats,
  logRenderStatsSummary,
} from '../../hooks/useRenderCount';

interface PerformanceReportProps {
  /** Whether to show the report (default: false) */
  visible?: boolean;
  /** Update interval in ms (default: 1000) */
  updateInterval?: number;
}

/**
 * Development-only component for visualizing render statistics
 * 
 * Only renders in development mode. In production, returns null.
 * 
 * @example
 * ```tsx
 * function App() {
 *   const [showPerf, setShowPerf] = useState(false);
 *   
 *   return (
 *     <>
 *       <button onClick={() => setShowPerf(!showPerf)}>
 *         Toggle Performance Monitor
 *       </button>
 *       <PerformanceReport visible={showPerf} />
 *     </>
 *   );
 * }
 * ```
 */
export function PerformanceReport({
  visible = false,
  updateInterval = 1000,
}: PerformanceReportProps) {
  // Only render in development
  if (!import.meta.env.DEV) {
    return null;
  }

  const [stats, setStats] = useState(getRenderStatsArray());
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  useEffect(() => {
    if (!visible) return;

    const interval = setInterval(() => {
      setStats(getRenderStatsArray());
      setLastUpdate(Date.now());
    }, updateInterval);

    return () => clearInterval(interval);
  }, [visible, updateInterval]);

  if (!visible) return null;

  const totalRenders = stats.reduce((sum, info) => sum + info.renderCount, 0);
  const avgRenders = stats.length > 0 ? (totalRenders / stats.length).toFixed(1) : '0';

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '400px',
        maxHeight: '600px',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        color: '#fff',
        padding: '16px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        fontFamily: 'monospace',
        fontSize: '12px',
        zIndex: 9999,
        overflow: 'auto',
      }}
    >
      <div style={{ marginBottom: '12px', borderBottom: '1px solid #444', paddingBottom: '8px' }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold' }}>
          🎯 Performance Monitor
        </h3>
        <div style={{ fontSize: '11px', color: '#aaa' }}>
          Updated: {new Date(lastUpdate).toLocaleTimeString()}
        </div>
      </div>

      <div style={{ marginBottom: '12px', padding: '8px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px' }}>
        <div style={{ marginBottom: '4px' }}>
          <strong>Components:</strong> {stats.length}
        </div>
        <div style={{ marginBottom: '4px' }}>
          <strong>Total Renders:</strong> {totalRenders}
        </div>
        <div>
          <strong>Avg Renders/Component:</strong> {avgRenders}
        </div>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: 'bold' }}>
          Component Breakdown
        </h4>
        {stats.length === 0 ? (
          <div style={{ color: '#aaa', fontStyle: 'italic' }}>
            No render data yet. Add useRenderCount() to components.
          </div>
        ) : (
          <div style={{ maxHeight: '300px', overflow: 'auto' }}>
            {stats.map((info) => {
              const color = info.renderCount > 10 ? '#ff6b6b' : '#51cf66';
              const barWidth = Math.min((info.renderCount / Math.max(...stats.map(s => s.renderCount))) * 100, 100);
              
              return (
                <div
                  key={info.component}
                  style={{
                    marginBottom: '8px',
                    padding: '6px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '4px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 'bold' }}>{info.component}</span>
                    <span style={{ color }}>{info.renderCount} renders</span>
                  </div>
                  <div style={{ height: '4px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${barWidth}%`,
                        height: '100%',
                        backgroundColor: color,
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                  {info.props && Object.keys(info.props).length > 0 && (
                    <details style={{ marginTop: '4px', fontSize: '10px', color: '#aaa' }}>
                      <summary style={{ cursor: 'pointer' }}>Props</summary>
                      <pre style={{ margin: '4px 0 0 0', padding: '4px', backgroundColor: 'rgba(0, 0, 0, 0.3)', borderRadius: '2px', overflow: 'auto' }}>
                        {JSON.stringify(info.props, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button
          onClick={() => logRenderStatsSummary()}
          style={{
            padding: '6px 12px',
            fontSize: '11px',
            backgroundColor: '#339af0',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          📊 Log to Console
        </button>
        <button
          onClick={() => {
            clearRenderStats();
            setStats([]);
          }}
          style={{
            padding: '6px 12px',
            fontSize: '11px',
            backgroundColor: '#ff6b6b',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          🗑️ Clear Stats
        </button>
      </div>
    </div>
  );
}
