// Switch to use CSV files (true) or Google Sheets (false)
const USE_CSV = true;

const SPREADSHEET_ID = "1vC8cACWd835LnOV2V3iAZPslUorL_6UVl8sB4jXLIl4";
const API_KEY = "AIzaSyD_naEjuX7kE2MyHCaj45i_7UQkx9nQHms";

// Map numeric chance values to category names
const chanceMap: Record<number, string> = {
  5: "Big Favourite",
  4: "Favourite",
  3: "Challenger",
  2: "Outsider",
  1: "Wildcard",
};

// CSV loading functions
async function fetchCSVData(fileName: string): Promise<string[][]> {
  try {
    const Papa = (await import("papaparse")).default;
    const fs = await import("fs");
    const path = await import("path");
    
    // Read file from public/data directory
    const filePath = path.join(process.cwd(), "public", "data", `${fileName}.csv`);
    const fileContents = fs.readFileSync(filePath, "utf-8");
    
    return new Promise((resolve, reject) => {
      Papa.parse(fileContents, {
        header: false,
        skipEmptyLines: true,
        complete: (results) => {
          resolve(results.data as string[][]);
        },
        error: (error: Error) => {
          console.error(`Error parsing ${fileName}.csv:`, error);
          reject(error);
        },
      });
    });
  } catch (error) {
    console.error(`Error fetching ${fileName}.csv:`, error);
    return [];
  }
}

// Google Sheets loading function (kept for fallback)
async function fetchSheetData(sheetName: string): Promise<string[][]> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${sheetName}?key=${API_KEY}&majorDimension=ROWS&valueRenderOption=UNFORMATTED_VALUE`;
  
  try {
    // No caching - fetch fresh data every time
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Failed to fetch ${sheetName}: ${response.statusText}`);
    }
    const data = await response.json();
    return data.values || [];
  } catch (error) {
    console.error(`Error fetching ${sheetName}:`, error);
    return [];
  }
}

// Unified data fetching function
async function fetchData(sheetName: string): Promise<string[][]> {
  if (USE_CSV) {
    return fetchCSVData(sheetName);
  } else {
    return fetchSheetData(sheetName);
  }
}

export async function getAthletes(): Promise<any[]> {
  const rows = await fetchData("athletes");
  if (rows.length === 0) return [];
  
  const headers = rows[0];
  const dataRows = rows.slice(1);
  
  // Normalize header names to match expected format
  const normalizeKey = (header: string): string => {
    const normalized = header.toLowerCase().trim().replace(/\s+/g, "_");
    // Handle common variations
    if (normalized === "discipline_id" || normalized === "disciplin_id") return "disciplin_id";
    if (normalized === "first_name" || normalized === "firstname") return "firstname";
    if (normalized === "last_name" || normalized === "lastname") return "lastname";
    return normalized;
  };
  
  return dataRows.map((row) => {
    const athlete: any = {};
    headers.forEach((header: string, index: number) => {
      const key = normalizeKey(header);
      let value: any = row[index] || "";
      
      // Convert numeric chance to category name
      if (key === "chance" && typeof value === "number") {
        value = chanceMap[value] || String(value);
      } else if (key === "chance" && typeof value === "string" && /^\d+$/.test(value.trim())) {
        const numValue = parseInt(value.trim(), 10);
        value = chanceMap[numValue] || value;
      }
      
      athlete[key] = value;
    });
    return athlete;
  });
}

export async function getDisciplins(): Promise<any[]> {
  const rows = await fetchData("disciplins");
  if (rows.length === 0) return [];
  
  const headers = rows[0];
  const dataRows = rows.slice(1);
  
  // Normalize header names to match expected format
  const normalizeKey = (header: string): string => {
    const normalized = header.toLowerCase().trim().replace(/\s+/g, "_");
    // Handle common variations
    if (normalized === "discipline_id" || normalized === "disciplin_id") return "disciplin_id";
    // Map "label" to "name" for discipline names
    if (normalized === "label") return "name";
    return normalized;
  };
  
  return dataRows.map((row) => {
    const disciplin: any = {};
    headers.forEach((header: string, index: number) => {
      const key = normalizeKey(header);
      disciplin[key] = row[index] || "";
    });
    return disciplin;
  });
}

export async function getCalendar(): Promise<any[]> {
  const rows = await fetchData("calendar");
  if (rows.length === 0) return [];
  
  const headers = rows[0];
  const dataRows = rows.slice(1);
  
  // Normalize header names to match expected format
  const normalizeKey = (header: string): string => {
    const normalized = header.toLowerCase().trim().replace(/\s+/g, "_");
    // Handle common variations
    if (normalized === "discipline_id" || normalized === "disciplin_id") return "disciplin_id";
    return normalized;
  };
  
  return dataRows.map((row) => {
    const calendar: any = {};
    headers.forEach((header: string, index: number) => {
      const key = normalizeKey(header);
      calendar[key] = row[index] || "";
    });
    return calendar;
  });
}
