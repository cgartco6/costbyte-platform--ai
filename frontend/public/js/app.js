// Shared utilities for CostByte frontend
const API_BASE = '/api';

function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
}

async function apiCall(endpoint, options = {}) {
    const res = await fetch(API_BASE + endpoint, {
        ...options,
        headers: { ...getAuthHeaders(), ...options.headers }
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}
