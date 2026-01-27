import axios from 'axios';

// Configuration de base
const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api', // L'adresse de votre Laravel
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Intercepteur : Avant d'envoyer une requête, on vérifie si on a un Token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('ACCESS_TOKEN');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;