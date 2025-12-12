import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:3000', // Using 127.0.0.1 to avoid IPv6 resolution issues
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
