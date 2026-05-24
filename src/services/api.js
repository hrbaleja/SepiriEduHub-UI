import axios from 'axios';

const API_BASE = '/api/v1';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const apiClient = axios.create({
  baseURL: API_URL,
});

class ApiService {
  // Auth
  static async login(email, password) {
    const response = await apiClient.post(`${API_BASE}/auth/login`, { email, password });
    return response.data;
  }

  static async register(name, email, password) {
    const response = await apiClient.post(`${API_BASE}/auth/register`, { name, email, password });
    return response.data;
  }

  static async getCurrentUser() {
    const response = await apiClient.get(`${API_BASE}/auth/me`);
    return response.data;
  }

  static async updateProfile(name, email) {
    const response = await apiClient.put(`${API_BASE}/auth/profile`, { name, email });
    return response.data;
  }

  static async changePassword(currentPassword, newPassword) {
    const response = await apiClient.put(`${API_BASE}/auth/change-password`, { currentPassword, newPassword });
    return response.data;
  }

  static async forgotPassword(email) {
    const response = await apiClient.post(`${API_BASE}/auth/forgot-password`, { email });
    return response.data;
  }

  static async resetPassword(token, password) {
    const response = await apiClient.post(`${API_BASE}/auth/reset-password`, { token, password });
    return response.data;
  }

  // Certificates
  static async generateCertificates(data) {
    const response = await apiClient.post(`${API_BASE}/certificates/generate`, data);
    return response.data;
  }

  static async getCertificates(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await apiClient.get(`${API_BASE}/certificates?${params}`);
    return response.data;
  }

  static async verifyCertificate(serialNumber) {
    const response = await apiClient.get(`${API_BASE}/certificates/${serialNumber}`);
    return response.data;
  }

  static getDownloadUrl(serialNumber) {
    return `${API_URL}${API_BASE}/certificates/${serialNumber}/download`;
  }

  static async getPrograms() {
    const response = await apiClient.get(`${API_BASE}/certificates/programs/list`);
    return response.data;
  }

  static async testSMTP() {
    const response = await apiClient.get(`${API_BASE}/certificates/smtp/test`);
    return response.data;
  }

  // Sent Certificates
  static async getSentCertificates(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await apiClient.get(`${API_BASE}/certificates-sent?${params}`);
    return response.data;
  }

  static async getSentCertificateBySerial(serialNumber) {
    const response = await apiClient.get(`${API_BASE}/certificates-sent/${serialNumber}`);
    return response.data;
  }

  static async seedSentCertificates() {
    const response = await apiClient.post(`${API_BASE}/certificates-sent/seed`);
    return response.data;
  }
}

export { apiClient, API_URL };
export default ApiService;

