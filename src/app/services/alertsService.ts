const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:8080";

function getAuthHeaders() {

  const token =
    localStorage.getItem("token");

  return {
    "Content-Type":"application/json",
    Authorization:`Bearer ${token}`,
  };
}

/* ========= INTERFACES ========= */

export interface AlertSettings {

  expenseLimit:number;

  budgetThreshold:number;

}

export interface AlertPreference {

  alertType:string;

  enabled:boolean;

}

/* ========= ALERT SETTINGS ========= */

export async function getAlertSettingsRequest(
  userId:string
){

  const response =
    await fetch(
      `${API_URL}/api/alert-settings/${userId}`,
      {
        headers:getAuthHeaders(),
      }
    );

  if(!response.ok){

    throw new Error(
      "Error cargando configuración"
    );

  }

  return response.json();
}

export async function updateAlertSettingsRequest(
  userId:string,
  data:AlertSettings
){

  const response =
    await fetch(
      `${API_URL}/api/alert-settings/${userId}`,
      {
        method:"PUT",
        headers:getAuthHeaders(),
        body:JSON.stringify(data),
      }
    );

  if(!response.ok){

    throw new Error(
      "Error actualizando configuración"
    );

  }

  return response.json();
}

/* ========= ALERT PREFERENCES ========= */

export async function getAlertPreferencesRequest(
  userId:string
){

  const response =
    await fetch(
      `${API_URL}/api/alert-preferences/${userId}`,
      {
        headers:getAuthHeaders(),
      }
    );

  if(!response.ok){

    throw new Error(
      "Error cargando preferencias"
    );

  }

  return response.json();
}

export async function updateAlertPreferenceRequest(
  userId:string,
  alertType:string,
  enabled:boolean
){

  const response =
    await fetch(
      `${API_URL}/api/alert-preferences/${userId}/${alertType}`,
      {
        method:"PUT",
        headers:getAuthHeaders(),
        body:JSON.stringify({
          enabled
        }),
      }
    );

  if(!response.ok){

    throw new Error(
      "Error actualizando preferencia"
    );

  }

  return response.json();
}