import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import TextField from '@mui/material/TextField';


const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const { showNotification } = useNotification();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const success = await login(email, password);
            if (success) {
                // Ahora la notificación de éxito se muestra desde el componente rhAdmin
                navigate('/admin');
            } else {
                setError('Credenciales incorrectas. Inténtalo de nuevo.');
                showNotification('error', 'Credenciales incorrectas. Inténtalo de nuevo.');
            }
        } catch (err) {
            setError('Error al iniciar sesión. Por favor, inténtalo más tarde.');
            showNotification('error', 'Error al iniciar sesión. Por favor, inténtalo más tarde.');
            console.error('Error de inicio de sesión:', err);
        }
    };

    return (
        <div className="flex min-h-screen">
            {/* Left side with background image and logo */}
            <div className="hidden lg:block lg:w-2/3 relative">
                <div className="absolute inset-0 bg-purple-/50 z-10"></div>
                <img
                    src="/img/iconautotest.png"
                    alt="Background"
                    className="object-cover w-full h-full"
                />
            </div>

            {/* Right side with login form */}
            <div className="w-full lg:w-1/3 bg-gray-900 p-8 flex items-center justify-center">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-white">Iniciar sesión</h2>
                        <p className="mt-2 text-gray-400">Inicia sesión para acceder a tu cuenta</p>
                    </div>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                        <TextField
                            id="email"
                            label="Correo"
                            variant="outlined"
                            fullWidth
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="correo@ejemplo.com"
                            margin="normal"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: '#4B5563',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: '#6B7280',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#493F91',
                                    },
                                    backgroundColor: email ? '#E0F7FF' : '#1F2937',
                                    transition: 'background-color 0.3s ease',
                                },
                                '& .MuiInputLabel-root': {
                                    color: '#E5E7EB',
                                },
                                '& .MuiInputBase-input': {
                                    color: email ? '#000000' : '#FFFFFF',
                                    transition: 'color 0.3s ease',
                                },
                                '& .MuiInputLabel-shrink': {
                                    color: '#FFFFFF',
                                    backgroundColor: '#1F2937',
                                    padding: '0 5px',
                                    borderRadius: '3px',
                                    fontWeight: 'bold',
                                    transform: 'translate(14px, -9px) scale(0.75)',
                                },
                            }}
                        />

                        <TextField
                            id="password"
                            label="Contraseña"
                            type="password"
                            variant="outlined"
                            fullWidth
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••••"
                            margin="normal"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: '#4B5563',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: '#6B7280',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#493F91',
                                    },
                                    backgroundColor: password ? '#E0F7FF' : '#1F2937',
                                    transition: 'background-color 0.3s ease',
                                },
                                '& .MuiInputLabel-root': {
                                    color: '#E5E7EB',
                                },
                                '& .MuiInputBase-input': {
                                    color: password ? '#000000' : '#FFFFFF',
                                    transition: 'color 0.3s ease',
                                },
                                '& .MuiInputLabel-shrink': {
                                    color: '#FFFFFF',
                                    backgroundColor: '#1F2937',
                                    padding: '0 5px',
                                    borderRadius: '3px',
                                    fontWeight: 'bold',
                                    transform: 'translate(14px, -9px) scale(0.75)',
                                },
                            }}
                        />

                        <div>
                            <button
                                type="submit"
                                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#493F91] hover:bg-[#3E367F] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#493F91]"
                            >
                                <img
                                    src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAEhUlEQVR4nNVZz28bRRTeC1ScOQAqEkJCgKB/BRJXRIUEKicOjp3gpMhxkzYOJRC1SdPEnjFw4V+AEwevf8RO4jaxPdOkcOBE4B+gohL+sfPGRR701k7qxHbwzo4dGOmTVt6dt9/beTPve8+WZWB8y+ovUiY/plwmCZdZyuQh4fCYMGi64PC4/ZvMus9U5BWcY53n+Iap5wmDq5TDA8ql0gFhwJNMzKCtsRFPVhovEyYpYdDQJd4DBnXKJImXGhdHRvy7ffUM5fAZYVAzRpz3rEiDMPll8ld1wSh5wuENwuHnURGnPYCfNhi8boQ85fDBKL86HexElTK47O/LM/kJ5fBk/ORlO6Q4/E1Zc1KP/INm6LyI01PAk8p72KD3/wHytLMSpALvD0U+fiBeIxz+Om/S9LQTDGpf78ObZ5Jf+kU9a+q0STCp1kpSrZXb14aceIjH+eDQYXDDzws2KqBi20KFM0IFUs4JTGeFiu0IFa+ALyeSHK71D51S46KbETUN3yyCCtonSfdDyHbUF0XhK5QS+/WXehxAeaBlkEs1vwX/Svw05gvgztV0JN5PmGlpm9i2d/JHWNzRDCcG9RMCsK0qvRu6UwYVGCJsBsJ21J2SnhMJLsJPN6+mJI5s9m5Wr5jNa+4HBswljxuCMGh5NRBn+qHTjYmU49rS2MwtWq69YHUqKc8Glu+bcSCQctTyrl4YES4/srDE05n8+Y45B24WdTezJFanTvU8OWbQgZj2aSRtDKHfdSZjMjLlwNI93Y0sD/EE+lNn8sqeuRVY2dPOB49Q/0jNDaRCaf+rELId7YxMGIC2A4iFbf8OxHZ86SLQDiFEnEk1mdYnP5l2/EltDCHC5G/aBrhUqyVQExpyIphy1Kpu7B87IA+1j9Fu3NqTKmQPH06TaeHOoT7f2z5GNRPZaaxXpIrmhSsNBhHHe/jMetkAeX6UyCryihFjHdwtS7VYBDW7KdRMrg28xsyN90y+K8nkhxYKIh0xd94gR2KuUw/w/50DHMrH9QA2js6bEPWM5qcnSko/Bf0gYAfCbxeCDlNStlsqkmgTZaC+ug9ucX81J/pKDDxm8R4+g8/6cYxwueG7rYL65daudEtC3Uw8mxfq9m7b1vAOQHXg31OEwfVhjKyU2l/alBqdyQp1e9iszCBqDRrYtsP23aDJqFvmCuZkdOAUMLzO1EYMDs5sLZ7V3MUkFM6MhnigC/iOfgkPO3L4T9GZ5J9uaLjc3V5H0WVC+3vRSqtdIeW21zm8Z3kZSd4M4uS18njJB45PLcdVuphxE0wGLJ1xl8mJKR963y+m0o5arzSnLT/jxhYshWynNW7ywVSjNbclli0TYyEv3g1nnPq4yIczjfr1onjHMjlmbHUhmnd+DNmNka1GMOW05vKQjZTUc9aoxsJ27VIkJw6CBh0J2Y1WZFPsL92rvmWNaywWxavXCuKH6axT1Wqx2+6ZX40WnO+jBfXK2Ij3G9Fs7dJcQZBIznk4kxWPpjKOxBXCEhKB11PphpzOiT9mN8XB/JaTmE/X3jbx8n8A0x2IRmBkF3AAAAAASUVORK5CYII="
                                    alt="user icon"
                                    className="w-5 h-5"
                                />
                                Iniciar sesión
                            </button>

                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;