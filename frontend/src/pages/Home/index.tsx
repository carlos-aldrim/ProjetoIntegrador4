import React from 'react';
import Logout from '../../components/Logout';

export const HomePage: React.FC = () => {
    
    return (
        <div>
            <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="p-8 md:p-12 text-center">
                    <div className="mb-8">
                        <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Bem-vindo!</h1>
                        <p className="text-lg text-gray-600">
                            Seu login foi realizado com sucesso e seu token foi validado.
                        </p>
                    </div>
                    <Logout/>
                </div>
            </div>
        </div>
    );
};
