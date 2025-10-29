import React, { useState, useMemo, useEffect } from 'react';
import { Report, IssueType } from '../types';
import { useTranslations } from '../hooks/useTranslations';
import { ISSUE_TYPE_DETAILS, PRIORITY_DETAILS } from '../constants';

interface MapViewProps {
  reports: Report[];
  language: string;
  onViewReport: (reportId: string) => void;
  mode: 'pins' | 'density';
}

// Advanced color interpolation for the heatmap.
const getColorForDensity = (density: number): string => { // density 0 to 1
    const BLUE_RGB = [79, 70, 229];    // indigo-600
    const GREEN_RGB = [34, 197, 94];   // green-500
    const YELLOW_RGB = [234, 179, 8];  // yellow-500
    const RED_RGB = [239, 68, 68];     // red-500

    let r, g, b;
    let localValue;

    if (density < 0.33) {
        localValue = density / 0.33;
        r = Math.round(BLUE_RGB[0] * (1 - localValue) + GREEN_RGB[0] * localValue);
        g = Math.round(BLUE_RGB[1] * (1 - localValue) + GREEN_RGB[1] * localValue);
        b = Math.round(BLUE_RGB[2] * (1 - localValue) + GREEN_RGB[2] * localValue);
    } else if (density < 0.66) {
        localValue = (density - 0.33) / 0.33;
        r = Math.round(GREEN_RGB[0] * (1 - localValue) + YELLOW_RGB[0] * localValue);
        g = Math.round(GREEN_RGB[1] * (1 - localValue) + YELLOW_RGB[1] * localValue);
        b = Math.round(GREEN_RGB[2] * (1 - localValue) + YELLOW_RGB[2] * localValue);
    } else {
        localValue = (density - 0.66) / 0.34;
        r = Math.round(YELLOW_RGB[0] * (1 - localValue) + RED_RGB[0] * localValue);
        g = Math.round(YELLOW_RGB[1] * (1 - localValue) + RED_RGB[1] * localValue);
        b = Math.round(YELLOW_RGB[2] * (1 - localValue) + RED_RGB[2] * localValue);
    }
    
    // Return an opaque color. The blending is handled by the gradient and filters.
    return `rgb(${r}, ${g}, ${b})`;
}


const MapView: React.FC<MapViewProps> = ({ reports, language, onViewReport, mode }) => {
  const { t } = useTranslations(language);
  const [activePin, setActivePin] = useState<Report | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Reset and trigger animation when mode changes or component mounts
    setIsMounted(false);
    const timer = setTimeout(() => setIsMounted(true), 10);
    return () => clearTimeout(timer);
  }, [mode]);


  const reportsWithLocation = useMemo(() => reports.filter(r => r.location), [reports]);

  const mapBounds = useMemo(() => {
    if (reportsWithLocation.length === 0) return null;

    const lats = reportsWithLocation.map(r => r.location!.latitude);
    const lons = reportsWithLocation.map(r => r.location!.longitude);

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);

    return { minLat, maxLat, minLon, maxLon };
  }, [reportsWithLocation]);

  if (!mapBounds) {
    return (
      <div className="flex items-center justify-center h-96 bg-surface-light dark:bg-surface-dark rounded-lg border-2 border-dashed border-border-light dark:border-border-dark">
        <p className="text-copy-secondary-light dark:text-copy-secondary-dark">{t('noLocationDataForMap')}</p>
      </div>
    );
  }

  const getPosition = (report: Report) => {
    const latRange = mapBounds.maxLat - mapBounds.minLat || 1;
    const lonRange = mapBounds.maxLon - mapBounds.minLon || 1;
    
    // Add 10% padding to avoid pins on the edges
    const paddedLatRange = latRange * 1.2;
    const paddedLonRange = lonRange * 1.2;
    const paddedMinLat = mapBounds.minLat - (latRange * 0.1);
    const paddedMinLon = mapBounds.minLon - (lonRange * 0.1);

    const topPercent = ((report.location!.latitude - paddedMinLat) / paddedLatRange) * 100;
    const leftPercent = ((report.location!.longitude - paddedMinLon) / paddedLonRange) * 100;
    
    return { top: `${100 - topPercent}%`, left: `${leftPercent}%` };
  };

  const renderPins = () => (
    reportsWithLocation.map((report, index) => {
        const priority = report.aiPriority || 'Medium';
        const position = getPosition(report);
        const issueDetails = ISSUE_TYPE_DETAILS[report.type] || ISSUE_TYPE_DETAILS[IssueType.Other];
        const Icon = issueDetails.icon;

        const priorityClass = {
          'High': 'high-priority',
          'Medium': 'medium-priority',
          'Low': 'low-priority'
        }[priority];

        return (
          <div
            key={report.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer map-pin-wrapper"
            style={{ 
              top: position.top, 
              left: position.left,
              animationDelay: `${index * 50}ms`
            }}
            onClick={(e) => { e.stopPropagation(); setActivePin(report); }}
          >
            <div className={`relative w-8 h-8 rounded-full flex items-center justify-center text-white ${PRIORITY_DETAILS[priority].color} shadow-lg ring-4 ring-white dark:ring-surface-dark map-pin ${priorityClass}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-3 transition-all duration-300 ${activePin?.id === report.id ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}>
              <div className="bg-surface-light dark:bg-surface-dark rounded-lg shadow-xl p-3 w-48 text-left border border-border-light dark:border-border-dark">
                  <p className="font-bold text-sm text-copy-primary-light dark:text-copy-primary-dark truncate">{t(issueDetails.key)}</p>
                  <p className="text-xs text-copy-secondary-light dark:text-copy-secondary-dark mb-2">Priority: <span className="font-semibold">{t(PRIORITY_DETAILS[priority].key)}</span></p>
                  <button onClick={() => onViewReport(report.id)} className="w-full text-center text-xs font-bold text-primary hover:underline">{t('viewReport')}</button>
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-surface-light dark:border-t-surface-dark -mb-2"></div>
            </div>
          </div>
        );
      })
  );

  const renderDensity = () => {
    const GRID_SIZE = 12;
    const zones = Array(GRID_SIZE * GRID_SIZE).fill(0);
    const priorityWeights = { High: 3, Medium: 2, Low: 1 };

    reportsWithLocation.forEach(report => {
        const position = getPosition(report);
        const leftPercent = parseFloat(position.left);
        const topPercent = parseFloat(position.top);
        
        if (!isNaN(leftPercent) && !isNaN(topPercent)) {
            const x = Math.floor(leftPercent / (100 / GRID_SIZE));
            const y = Math.floor(topPercent / (100 / GRID_SIZE));
            const index = y * GRID_SIZE + x;
            if (index >= 0 && index < zones.length) {
                const priority = report.aiPriority || 'Medium';
                zones[index] += priorityWeights[priority];
            }
        }
    });

    const maxCount = Math.max(...zones, 1);

    return zones.map((count, index) => {
        if (count === 0) return null;
        
        const x = index % GRID_SIZE;
        const y = Math.floor(index / GRID_SIZE);
        const relativeDensity = count / maxCount;
        const color = getColorForDensity(relativeDensity);
        
        // Blob size is relative to grid cell size and density
        const blobSizePercent = (100 / GRID_SIZE) * (1.5 + (relativeDensity * 2.5));

        return (
            <div
                key={index}
                className="absolute rounded-full transition-all duration-700 ease-out pointer-events-none"
                style={{
                    width: `${blobSizePercent}%`,
                    paddingBottom: `${blobSizePercent}%`, // Maintain aspect ratio
                    left: `${(x + 0.5) * (100 / GRID_SIZE)}%`,
                    top: `${(y + 0.5) * (100 / GRID_SIZE)}%`,
                    background: color,
                    opacity: isMounted ? 1 : 0,
                    transform: isMounted ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(0)',
                    transitionDelay: `${(y * GRID_SIZE + x) * 10}ms`,
                }}
            />
        );
    });
  };

  return (
    <div
      className="relative w-full h-[70vh] rounded-lg border border-border-light dark:border-border-dark overflow-hidden map-container"
      onClick={() => setActivePin(null)} // Click on map background to close popover
    >
      {mode === 'pins' ? (
        renderPins()
      ) : (
        // This wrapper structure creates a "gooey" effect by blurring the blobs and then using contrast to sharpen the merged edges.
        <div className="absolute inset-0" style={{ filter: 'contrast(30)' }}>
            <div className="absolute inset-0" style={{ filter: 'blur(25px)' }}>
                {renderDensity()}
            </div>
        </div>
      )}

      {mode === 'density' && (
        <div className="absolute bottom-2 right-2 bg-surface-light/90 dark:bg-surface-dark/90 p-3 rounded-lg text-xs shadow-lg border border-border-light dark:border-border-dark text-copy-primary-light dark:text-copy-primary-dark backdrop-blur-sm">
            <h4 className="font-bold mb-2">{t('crowdDensityView')}</h4>
            <div className="flex items-center gap-2">
                <span className="font-medium">{t('densityLow')}</span>
                <div className="w-24 h-4 rounded-full" style={{ background: 'linear-gradient(to right, rgb(79, 70, 229), rgb(34, 197, 94), rgb(234, 179, 8), rgb(239, 68, 68))' }}></div>
                <span className="font-medium">{t('densityHigh')}</span>
            </div>
        </div>
      )}
    </div>
  );
};

export default MapView;