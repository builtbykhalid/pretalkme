import { useState } from 'react';
import { supabase } from '../lib/supabase';
// No longer needs Navigate/useNavigate here as they are commented out below
// import { useNavigate } from 'react-router-dom';
// const { useNavigate } = ReactRouterDOM;

export default function Auth() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    // const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: window.location.origin,
            },
        });

        if (error) {
            setMessage(`Error: ${error.message}`);
        } else {
            setMessage('Lien de connexion envoyé ! Vérifiez vos emails.');
        }
        setLoading(false);
    };

    // Pour le développement/test rapide, on peut aussi utiliser le mot de passe si configuré, 
    // mais le Magic Link est souvent le défaut Supabase.
    // Ajoutons une option simple pour basculer si besoin, mais restons simple pour le MVP : Magic Link.

    return (
        <div className="min-h-screen bg-neutral-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-dark">Pretalk.me</h2>
                <p className="mt-2 text-center text-sm text-neutral-600">
                    Connectez-vous à votre espace consultant
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
                                Adresse Email
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                            >
                                {loading ? 'Envoi...' : 'Envoyer le lien magique'}
                            </button>
                        </div>
                    </form>

                    {message && (
                        <div className={`mt-4 text-sm text-center ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
                            {message}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}





