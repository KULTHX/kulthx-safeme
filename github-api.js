import crypto from "crypto";

class GitHubAPI {
  constructor(token, owner, repo) {
    this.token = token;
    this.owner = owner;
    this.repo = repo;
    this.baseUrl = "https://api.github.com";
    this.scriptsPath = "scripts"; // مجلد السكريبتات في المستودع
  }

  // إنشاء headers للطلبات
  getHeaders() {
    return {
      "Authorization": `Bearer ${this.token}`,
      "Accept": "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json"
    };
  }

  // تحويل النص إلى Base64
  encodeBase64(content) {
    return Buffer.from(content, 'utf8').toString('base64');
  }

  // تحويل من Base64 إلى نص
  decodeBase64(content) {
    return Buffer.from(content, 'base64').toString('utf8');
  }

  // الحصول على محتوى ملف
  async getFileContent(path) {
    try {
      const url = `${this.baseUrl}/repos/${this.owner}/${this.repo}/contents/${path}`;
      const response = await fetch(url, {
        method: "GET",
        headers: this.getHeaders()
      });

      if (response.status === 404) {
        return null; // الملف غير موجود
      }

      if (!response.ok) {
        throw new Error(`GitHub API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return {
        content: this.decodeBase64(data.content),
        sha: data.sha
      };
    } catch (error) {
      console.error("Error getting file content:", error);
      throw error;
    }
  }

  // إنشاء أو تحديث ملف
  async createOrUpdateFile(path, content, message, sha = null) {
    try {
      const url = `${this.baseUrl}/repos/${this.owner}/${this.repo}/contents/${path}`;
      const body = {
        message,
        content: this.encodeBase64(content)
      };

      if (sha) {
        body.sha = sha; // مطلوب للتحديث
      }

      const response = await fetch(url, {
        method: "PUT",
        headers: this.getHeaders(),
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`GitHub API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating/updating file:", error);
      throw error;
    }
  }

  // حذف ملف
  async deleteFile(path, message, sha) {
    try {
      const url = `${this.baseUrl}/repos/${this.owner}/${this.repo}/contents/${path}`;
      const body = {
        message,
        sha
      };

      const response = await fetch(url, {
        method: "DELETE",
        headers: this.getHeaders(),
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`GitHub API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error deleting file:", error);
      throw error;
    }
  }

  // الحصول على قائمة الملفات في مجلد
  async getDirectoryContents(path) {
    try {
      const url = `${this.baseUrl}/repos/${this.owner}/${this.repo}/contents/${path}`;
      const response = await fetch(url, {
        method: "GET",
        headers: this.getHeaders()
      });

      if (response.status === 404) {
        return []; // المجلد غير موجود
      }

      if (!response.ok) {
        throw new Error(`GitHub API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Error getting directory contents:", error);
      throw error;
    }
  }

  // حفظ سكريبت جديد
  async saveScript(scriptId, scriptData) {
    try {
      const filePath = `${this.scriptsPath}/${scriptId}.json`;
      const content = JSON.stringify(scriptData, null, 2);
      const message = `Add script ${scriptId}`;
      
      return await this.createOrUpdateFile(filePath, content, message);
    } catch (error) {
      console.error("Error saving script:", error);
      throw error;
    }
  }

  // الحصول على سكريبت
  async getScript(scriptId) {
    try {
      const filePath = `${this.scriptsPath}/${scriptId}.json`;
      const fileData = await this.getFileContent(filePath);
      
      if (!fileData) {
        return null; // السكريبت غير موجود
      }

      return {
        ...JSON.parse(fileData.content),
        _sha: fileData.sha // نحتفظ بـ SHA للتحديث لاحقاً
      };
    } catch (error) {
      console.error("Error getting script:", error);
      throw error;
    }
  }

  // تحديث سكريبت
  async updateScript(scriptId, scriptData) {
    try {
      const filePath = `${this.scriptsPath}/${scriptId}.json`;
      
      // الحصول على SHA الحالي
      const currentFile = await this.getFileContent(filePath);
      if (!currentFile) {
        throw new Error("Script not found");
      }

      const content = JSON.stringify(scriptData, null, 2);
      const message = `Update script ${scriptId}`;
      
      return await this.createOrUpdateFile(filePath, content, message, currentFile.sha);
    } catch (error) {
      console.error("Error updating script:", error);
      throw error;
    }
  }

  // حذف سكريبت
  async deleteScript(scriptId) {
    try {
      const filePath = `${this.scriptsPath}/${scriptId}.json`;
      
      // الحصول على SHA الحالي
      const currentFile = await this.getFileContent(filePath);
      if (!currentFile) {
        throw new Error("Script not found");
      }

      const message = `Delete script ${scriptId}`;
      
      return await this.deleteFile(filePath, message, currentFile.sha);
    } catch (error) {
      console.error("Error deleting script:", error);
      throw error;
    }
  }

  // الحصول على جميع السكريبتات لمستخدم معين
  async getUserScripts(userId) {
    try {
      const files = await this.getDirectoryContents(this.scriptsPath);
      const scripts = [];

      for (const file of files) {
        if (file.type === "file" && file.name.endsWith(".json")) {
          try {
            const scriptId = file.name.replace(".json", "");
            const script = await this.getScript(scriptId);
            
            if (script && script.userId === userId) {
              scripts.push({
                id: scriptId,
                ...script
              });
            }
          } catch (error) {
            console.error(`Error loading script ${file.name}:`, error);
            // نتجاهل الأخطاء في ملفات فردية ونكمل
          }
        }
      }

      return scripts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
      console.error("Error getting user scripts:", error);
      throw error;
    }
  }

  // البحث عن سكريبت مكرر لنفس المستخدم
  async findDuplicateScript(userId, normalizedScript, excludeId = null) {
    try {
      const userScripts = await this.getUserScripts(userId);
      
      return userScripts.find(script => {
        if (excludeId && script.id === excludeId) {
          return false; // نتجاهل السكريبت المستثنى
        }
        
        const scriptNormalized = script.script.trim().replace(/\s+/g, " ");
        return scriptNormalized === normalizedScript;
      });
    } catch (error) {
      console.error("Error finding duplicate script:", error);
      throw error;
    }
  }

  // إنشاء مجلد السكريبتات إذا لم يكن موجوداً
  async ensureScriptsDirectory() {
    try {
      const readmePath = `${this.scriptsPath}/README.md`;
      const readmeContent = "# Scripts Directory\n\nThis directory contains protected Roblox scripts.";
      
      // محاولة إنشاء ملف README في مجلد السكريبتات
      // إذا كان المجلد موجوداً، ستفشل العملية وهذا طبيعي
      try {
        await this.createOrUpdateFile(readmePath, readmeContent, "Initialize scripts directory");
      } catch (error) {
        // نتجاهل الخطأ إذا كان المجلد موجوداً بالفعل
        if (!error.message.includes("422")) {
          throw error;
        }
      }
    } catch (error) {
      console.error("Error ensuring scripts directory:", error);
      // لا نرمي الخطأ هنا لأن المجلد قد يكون موجوداً بالفعل
    }
  }
}

export default GitHubAPI;

