import { useImpersonation } from '../context/ImpersonationContext';
import { FaExclamationTriangle, FaSignOutAlt } from 'react-icons/fa';

export const ImpersonationBanner = () => {
  const { impersonation, exitImpersonation } = useImpersonation();

  if (!impersonation.isImpersonating) {
    return null;
  }

  return (
    <div className="bg-yellow-900/50 border-b-2 border-yellow-600 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <FaExclamationTriangle className="text-yellow-400 text-xl" />
        <div>
          <p className="text-yellow-400 font-semibold">
            Admin Mode: Viewing as {impersonation.impersonatedUserEmail}
          </p>
          <p className="text-yellow-300 text-sm">
            You are {impersonation.adminEmail} viewing the application as another user. Your actions will appear as theirs. Be careful!
          </p>
        </div>
      </div>
      <button
        onClick={exitImpersonation}
        className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
      >
        <FaSignOutAlt /> Exit Impersonation
      </button>
    </div>
  );
};





