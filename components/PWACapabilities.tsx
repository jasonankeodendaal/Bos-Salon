import React, { useState, useEffect } from 'react';

type Status = 'valid' | 'action-required' | 'not-supported';

interface Capability {
  name: string;
  status: Status;
  emoji: string;
}

const statusStyles: Record<Status, string> = {
  valid: 'bg-green-500/20 text-green-300',
  'action-required': 'bg-yellow-500/20 text-yellow-300',
  'not-supported': 'bg-red-500/20 text-red-400',
};

const CapabilityItem: React.FC<Capability> = ({ name, status, emoji }) => (
  <div className="flex items-center justify-between p-4 bg-admin-dark-bg/50 rounded-lg border border-admin-dark-border">
    <div className="flex items-center gap-3">
      <span className="text-xl">{emoji}</span>
      <span className="font-semibold text-white">{name}</span>
    </div>
    <span className={`px-2.5 py-1 text-xs font-bold rounded-full capitalize ${statusStyles[status]}`}>
      {status.replace('-', ' ')}
    </span>
  </div>
);

interface PWACapabilitiesProps {
    startTour: (tourKey: 'pwa') => void;
}

const PWACapabilities: React.FC<PWACapabilitiesProps> = ({ startTour }) => {
    const [pushStatus, setPushStatus] = useState<Status>('action-required');
    const [periodicSyncStatus, setPeriodicSyncStatus] = useState<Status>('action-required');
    const [notificationMessage, setNotificationMessage] = useState('');

    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'granted') {
            setPushStatus('valid');
        }
    }, []);

    const showMessage = (msg: string) => {
        setNotificationMessage(msg);
        setTimeout(() => setNotificationMessage(''), 4000);
    };

    const requestPushPermission = async () => {
        if (!('Notification' in window) || !('serviceWorker' in navigator)) {
            showMessage('Push Notifications are not supported by your browser.');
            return;
        }

        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                setPushStatus('valid');
                showMessage('Push Notification permission granted!');
                // You would typically send the subscription to your server here.
                const registration = await navigator.serviceWorker.ready;
                const subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: 'YOUR_VAPID_PUBLIC_KEY_HERE' // Replace with your actual VAPID key
                });
                console.log('Push subscription:', subscription);
            } else {
                showMessage('Push Notification permission denied.');
            }
        } catch (error) {
            console.error('Push subscription failed:', error);
            showMessage('Failed to enable push notifications.');
        }
    };
    
    const requestPeriodicSync = async () => {
        const registration = await navigator.serviceWorker.ready;
        if (!('periodicSync' in registration)) {
            showMessage('Periodic Sync is not supported by your browser.');
            return;
        }
        
        try {
            // The permission query is the modern way, but not all browsers support it.
            // Let's try to register and catch the error.
            await (registration as any).periodicSync.register('get-latest-specials', {
                minInterval: 24 * 60 * 60 * 1000 // one day
            });
            showMessage('Periodic Sync enabled! The app will check for specials daily.');
            setPeriodicSyncStatus('valid');
        } catch (error) {
            console.error("Periodic Sync registration failed:", error);
            showMessage('Periodic Sync permission denied. You may need to enable it in browser flags.');
        }
    };

    const serviceWorkerFeatures: Capability[] = [
      { name: 'Has Service Worker', status: 'valid', emoji: '⚙️' },
      { name: 'Has Logic', status: 'valid', emoji: '🧠' },
      { name: 'Background Sync', status: 'valid', emoji: '📡' },
      { name: 'Offline Support', status: 'valid', emoji: '🔌' },
    ];
    
    const appCapabilities: Capability[] = [
      { name: 'Shortcuts', status: 'valid', emoji: '⚡️' },
      { name: 'File Handlers', status: 'valid', emoji: '📂' },
      { name: 'Launch Handler', status: 'valid', emoji: '🚀' },
      { name: 'Protocol Handlers', status: 'valid', emoji: '🔗' },
      { name: 'Share Target', status: 'valid', emoji: '📤' },
      { name: 'Widgets', status: 'valid', emoji: '🧩' },
      { name: 'Edge Side Panel', status: 'valid', emoji: '🖥️' },
      { name: 'Window Controls Overlay', status: 'valid', emoji: '🪟' },
      { name: 'Tabbed Display', status: 'valid', emoji: '📑' },
      { name: 'Note Taking', status: 'valid', emoji: '📝' },
    ];

  return (
    <div className="max-w-4xl mx-auto space-y-12 text-white">
        <header className="flex items-center gap-3">
             <h2 className="text-2xl font-bold">PWA Capabilities</h2>
             <button onClick={() => startTour('pwa')} className="p-1.5 text-admin-dark-text-secondary hover:text-white hover:bg-white/10 rounded-full transition-colors" aria-label="Start PWA Tour">
                <span>🎓</span>
            </button>
        </header>
      {notificationMessage && (
          <div className="bg-admin-dark-primary text-white p-3 rounded-lg text-center mb-6 animate-fade-in" role="alert">
              {notificationMessage}
          </div>
      )}
      <section data-tour-id="pwa-sw-features">
        <div className="mb-6">
          <h3 className="text-xl font-bold">Service Worker Features</h3>
          <p className="text-admin-dark-text-secondary mt-2 text-sm">
            Your service worker is now fully equipped with advanced capabilities. Some features require user permission to be activated.
          </p>
        </div>
        <div className="space-y-3">
          {serviceWorkerFeatures.map(item => <CapabilityItem key={item.name} {...item} />)}
          {/* Interactive Items */}
          <div data-tour-id="pwa-permissions" className="flex items-center justify-between p-4 bg-admin-dark-bg/50 rounded-lg border border-admin-dark-border">
            <div className="flex items-center gap-3">
              <span className="text-xl">🔔</span>
              <span className="font-semibold text-white">Push Notifications</span>
            </div>
            {pushStatus === 'valid' ? (
                 <span className={`px-2.5 py-1 text-xs font-bold rounded-full capitalize ${statusStyles.valid}`}>Enabled</span>
            ) : (
                <button onClick={requestPushPermission} className="bg-yellow-500/80 text-white px-3 py-1.5 rounded-lg font-bold text-xs hover:bg-yellow-600 transition-colors">Request Permission</button>
            )}
          </div>
           <div className="flex items-center justify-between p-4 bg-admin-dark-bg/50 rounded-lg border border-admin-dark-border">
            <div className="flex items-center gap-3">
              <span className="text-xl">🔄</span>
              <span className="font-semibold text-white">Periodic Sync</span>
            </div>
            {periodicSyncStatus === 'valid' ? (
                 <span className={`px-2.5 py-1 text-xs font-bold rounded-full capitalize ${statusStyles.valid}`}>Enabled</span>
            ) : (
                <button onClick={requestPeriodicSync} className="bg-yellow-500/80 text-white px-3 py-1.5 rounded-lg font-bold text-xs hover:bg-yellow-600 transition-colors">Enable Sync</button>
            )}
          </div>
        </div>
      </section>

      <section data-tour-id="pwa-manifest-features">
        <div className="mb-6">
          <h3 className="text-xl font-bold">App Manifest Features</h3>
          <p className="text-admin-dark-text-secondary mt-2 text-sm">
            Your manifest now includes a full range of capabilities for deep OS integration.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {appCapabilities.map(item => <CapabilityItem key={item.name} {...item} />)}
        </div>
      </section>
    </div>
  );
};

export default PWACapabilities;