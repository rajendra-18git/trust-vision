import React from 'react';
import AIInvestigatorButton from './AIInvestigatorButton';
import AIInvestigatorPanel from './AIInvestigatorPanel';
import './AIInvestigator.css';

/**
 * Trust Vision AI Investigator Global Root Component
 * 
 * CRITICAL ARCHITECTURE RULE (Requirement #17):
 * The AIInvestigatorButton MUST REMAIN MOUNTED AT ALL TIMES regardless of isOpen state.
 * Opening the panel MUST NOT unmount or conditionally remove the button.
 */
export default function AIInvestigator({ isOpen, onToggle, onClose, currentRecord }) {
  return (
    <div className="ai-investigator-root">
      {/* Floating Action Button (FAB) - Fixed to Viewport, Always Mounted */}
      <AIInvestigatorButton 
        isOpen={isOpen}
        onClick={onToggle}
      />

      {/* Floating Assistant Panel - Fixed to Viewport, Rendered when open */}
      {isOpen && (
        <AIInvestigatorPanel 
          onClose={onClose}
          currentRecord={currentRecord}
        />
      )}
    </div>
  );
}
