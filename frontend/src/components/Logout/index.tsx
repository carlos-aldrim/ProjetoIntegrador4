import React from 'react';
import { useUser } from '../../hooks/UseUser';

const Logout: React.FC = () => {
    const { logout } = useUser();

    return (
        <div>
            <button
                onClick={logout}
                className="px-8 py-3 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75 transition-colors duration-200"
            >
                Sair da Conta
            </button>
        </div>
    );
};

export default Logout;
