import toast, { Toaster } from 'react-hot-toast';

export interface NotificationOptions {
  message: string;
  type?: 'success' | 'error' | 'loading'; // Toast types
  duration?: number; // Duration in milliseconds (default is 4000)
}

const notify = ({ message, type, duration }: NotificationOptions) => {
  switch (type) {
    case 'success':
      toast.success(message, { duration });
      break;
    case 'error':
      toast.error(message, { duration });
      break;
    case 'loading':
      toast.loading(message, { duration });
      break;
    default:
      toast(message, { duration });
  }
};

// Individual notification functions with dynamic messages
const showSuccessNotification = (message: string, duration = 4000) => {
  notify({ message, type: 'success', duration });
};

const showErrorNotification = (message: string, duration = 4000) => {
  notify({ message, type: 'error', duration });
};


// Toaster provider
const NotificationProvider: React.FC = () => {
  return <Toaster
  toastOptions={{
    style: {
      fontFamily: 'Roboto, sans-serif',
      fontWeight: 'bold',
      fontSize: '16px',
      borderRadius: '10px',
      color: '#f0f0f0', // Global text color
    },
    success: {
      style: {
        background: 'rgba(47, 143, 3, 0.92)', // Specific background for success
      },
    },
    error: {
      style: {
        background: 'rgba(214, 2, 2, 0.92)', // Specific background for error
      },
    },
  }}
/>
;
};

// Export notification functions and provider
export {
  showSuccessNotification,
  showErrorNotification,
  NotificationProvider,
};
