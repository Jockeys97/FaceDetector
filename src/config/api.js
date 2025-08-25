// Configurazione API Clarifai (fixed)
export const CLARIFAI_CONFIG = {
  PAT: process.env.REACT_APP_CLARIFAI_PAT || 'YOUR_PAT_HERE',
  USER_ID: process.env.REACT_APP_CLARIFAI_USER_ID || 'clarifai',
  APP_ID: process.env.REACT_APP_CLARIFAI_APP_ID || 'main',
  MODELS: {
    FACE_DETECTION: {
      ID: 'face-detection',
      VERSION_ID: '6dc7e46bc9124c5c8824be4822abe105',
      NAME: 'Face Detection'
    },
    COLOR_RECOGNITION: {
      ID: 'color-recognition',
      VERSION_ID: 'dd9458324b4b45c2be1a7ba84d27cd04',
      NAME: 'Color Recognition'
    },
    GENERAL_IMAGE: {
      ID: 'general-image-recognition',
      VERSION_ID: 'aa7f35c01e0642fda5cf400f543e7c40',
      NAME: 'General Image Recognition'
    }
  }
};

export const API_BASE_URL = process.env.NODE_ENV === 'development'
  ? '/api/clarifai/v2'
  : 'https://api.clarifai.com/v2';

// Backend locale (Express) — usa REACT_APP_BACKEND_BASE per override
export const BACKEND_BASE_URL = process.env.REACT_APP_BACKEND_BASE || 'http://localhost:3000';

export const buildApiUrl = (modelId, versionId) => {
  return `${API_BASE_URL}/models/${modelId}/versions/${versionId}/outputs`;
};

// Helper HTTP con timeout e messaggi chiari
export async function httpJson(url, init = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    const text = await res.text().catch(() => '');
    if (!res.ok) {
      let extra = '';
      try { extra = text ? ` — ${JSON.parse(text)?.status?.description || text}` : ''; } catch(_) { extra = text ? ` — ${text}` : ''; }
      throw new Error(`HTTP ${res.status} ${res.statusText}${extra}`);
    }
    return text ? JSON.parse(text) : {};
  } finally {
    clearTimeout(timer);
  }
}

// Risoluzione automatica della versione modello (memoizzata)
const versionCache = new Map();
export async function resolveModelVersion(modelId, suggestedVersionId) {
  if (suggestedVersionId) return suggestedVersionId;
  if (versionCache.has(modelId)) return versionCache.get(modelId);

  const url = `${API_BASE_URL}/models/${modelId}/versions`;
  const data = await httpJson(url, {
    headers: {
      'Accept': 'application/json',
      'Authorization': `Key ${CLARIFAI_CONFIG.PAT}`
    }
  });

  const versions = data?.model_versions || [];
  const latest = versions
    .slice()
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))?.[0]?.id;
  if (!latest) throw new Error('Impossibile risolvere la versione del modello');
  versionCache.set(modelId, latest);
  return latest;
}

export const validateCredentials = () => {
  const { PAT, USER_ID, APP_ID } = CLARIFAI_CONFIG;
  if (!PAT || PAT === 'YOUR_PAT_HERE' || PAT.length < 30) {
    console.error('❌ PAT (Personal Access Token) non valido o mancante');
    return false;
  }
  if (!USER_ID || !APP_ID) {
    console.error('❌ USER_ID o APP_ID mancanti');
    return false;
  }
  return true;
};

export const testApiConnection = async () => {
  if (!validateCredentials()) {
    return { success: false, error: 'Credenziali non valide' };
  }

  try {
    const modelId = CLARIFAI_CONFIG.MODELS.FACE_DETECTION.ID;
    const versionId = await resolveModelVersion(modelId, CLARIFAI_CONFIG.MODELS.FACE_DETECTION.VERSION_ID);
    const testUrl = buildApiUrl(modelId, versionId);

    const payload = {
      user_app_id: {
        user_id: CLARIFAI_CONFIG.USER_ID,
        app_id: CLARIFAI_CONFIG.APP_ID
      },
      inputs: [{ data: { image: { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d' } } }]
    };

    await httpJson(testUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Key ${CLARIFAI_CONFIG.PAT}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    return { success: true, message: 'Connessione API testata con successo' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getModelInfo = (modelType) => {
  const model = CLARIFAI_CONFIG.MODELS[modelType];
  if (!model) {
    throw new Error(`Modello ${modelType} non trovato`);
  }
  return {
    id: model.ID,
    version: model.VERSION_ID,
    name: model.NAME,
    url: buildApiUrl(model.ID, model.VERSION_ID)
  };
};
