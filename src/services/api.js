import axios from 'axios';

const API_BASE = '/api/v1';

// Configure axios defaults
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'https://api-sepiri.vercel.app';

class ApiService {

  // Certificates
  static async generateCertificates(data) {
    const response = await axios.post(`${API_BASE}/certificates/generate`, data);
    return response.data;
  }

  static async getCertificates(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await axios.get(`${API_BASE}/certificates?${params}`);
    console.log(response)
    return response.data;
  }

  static async verifyCertificate(serialNumber) {
    const response = await axios.get(`${API_BASE}/certificates/${serialNumber}`);
    return response.data;
  }

  static getDownloadUrl(serialNumber) {
    return `${axios.defaults.baseURL}${API_BASE}/certificates/${serialNumber}/download`;
  }

  static async getPrograms() {
    const response = await axios.get(`${API_BASE}/certificates/programs/list`);
    return response.data;
  }

  static async testSMTP() {
    const response = await axios.get(`${API_BASE}/certificates/smtp/test`);
    return response.data;
  }

  // Sent Certificates
  static async getSentCertificates(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await axios.get(`${API_BASE}/certificates-sent?${params}`);
    return response.data;
  }

  static async getSentCertificateBySerial(serialNumber) {
    const response = await axios.get(`${API_BASE}/certificates-sent/${serialNumber}`);
    return response.data;
  }

  static async seedSentCertificates() {
    const response = await axios.post(`${API_BASE}/certificates-sent/seed`);
    return response.data;
  }
}

export default ApiService;

