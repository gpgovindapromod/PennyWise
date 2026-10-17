import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X, CheckCircle2 } from 'lucide-react';

export default function InstallPwaBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    return sessionStorage.getItem('pennywise_pwa_dismissed') === 'true';
  });

  useEffect(() => {
    // Check if already in standalone display mode (installed)
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e) => {
      // Prevent browser default mini-infobar
      e.preventDefault();
      // Stash event so it can be triggered later
      setDeferredPrompt(e);
      window.deferredPwaPrompt = e;
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      window.deferredPwaPrompt = null;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // If iOS or unsupported browser, show tip
      alert('To install on iOS or unsupported browser: Tap Share -> "Add to Home Screen"');
      return;
    }
    // Show the native browser install prompt
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('pennywise_pwa_dismissed', 'true');
  };

  if (isInstalled || dismissed) {
    return null;
  }

  return (
    <div 
      className="pwa-install-banner"
      style={{
        margin: '0 0 16px 0',
        padding: '12px 16px',
        backgroundColor: '#0D1117',
        borderRadius: 14,
        border: '1px solid rgba(225, 29, 72, 0.35)',
        boxShadow: '0 8px 24px rgba(13, 17, 23, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        color: '#FFFFFF',
        animation: 'fadeIn 0.3s ease'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
        <div style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          backgroundColor: 'rgba(225, 29, 72, 0.15)',
          color: '#FB7185',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <Smartphone size={20} />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: '-0.01em', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 6 }}>
            Install PennyWise App
            <span style={{ fontSize: 9, fontWeight: 800, backgroundColor: '#E11D48', color: '#FFF', padding: '1px 6px', borderRadius: 4, textTransform: 'uppercase' }}>
              Native
            </span>
          </div>
          <div style={{ fontSize: 11, color: '#8B949E', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Instant launch from home screen with full offline support
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <button
          onClick={handleInstallClick}
          style={{
            padding: '7px 14px',
            backgroundColor: '#E11D48',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            transition: 'background-color 0.15s ease'
          }}
        >
          <Download size={14} /> Install
        </button>
        <button
          onClick={handleDismiss}
          style={{
            background: 'none',
            border: 'none',
            color: '#8B949E',
            cursor: 'pointer',
            padding: 4,
            display: 'flex',
            alignItems: 'center'
          }}
          aria-label="Dismiss install prompt"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
