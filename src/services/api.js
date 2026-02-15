import axios from 'axios';

const API_BASE = '/api/v1';

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:5000';

class ApiService {
  // Institutes
  static async getInstitutes() {
    const response = await axios.get(`${API_BASE}/institutes`);
    return response.data;
  }

  static async createInstitute(collegeName) {
    const response = await axios.post(`${API_BASE}/institutes`, { collegeName });
    return response.data;
  }

  static async updateInstitute(id, collegeName) {
    const response = await axios.put(`${API_BASE}/institutes/${id}`, { collegeName });
    return response.data;
  }

  static async deleteInstitute(id) {
    const response = await axios.delete(`${API_BASE}/institutes/${id}`);
    return response.data;
  }

  // Certificates
  static async generateCertificates(data) {
    const response = await axios.post(`${API_BASE}/certificates/generate`, data);
    return response.data;
  }

  static async getCertificates(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await axios.get(`${API_BASE}/certificates?${params}`);
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
}

export default ApiService;
