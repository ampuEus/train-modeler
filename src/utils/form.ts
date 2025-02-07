interface FormData {
  [key: string]: string | number | boolean | null;
}

export function getFormDataAsObject(form: HTMLFormElement): FormData {
  const formData = new FormData(form);
  const data: FormData = {};
  formData.forEach((value, key) => {
    if (value === 'on') {
      data[key] = true;
    } else if (!isNaN(Number(value))) {
      data[key] = Number(value);
    } else {
      data[key] = String(value);
    }
  });
  return data;
}

export function exportData(): boolean{
  const form = document.getElementById('trainData') as HTMLFormElement | null;
  if (!form) {
    console.error('Form with id "trainData" not found.');
    return false;
  }
  try {
    const data = getFormDataAsObject(form);
    if (!data || Object.keys(data).length === 0) {
      console.warn('No data to export.');
      return false;
    }
    const csvData = convertToCSV(data);
    if (!csvData) {
      console.error('Failed to convert data to CSV.');
      return false;
    }
    downloadCSVFile(csvData);
  } catch (error) {
    console.error('An error occurred during the export process:', error);
  }
  return true
}

function convertToCSV(data: FormData): string {
  const keys = Object.keys(data);
  let csvContent = '';
  keys.forEach(key => {
    csvContent += key + ',' + data[key] + '\n';
  });
  return csvContent;
}

function downloadCSVFile(csv_data: string): boolean {
  if (!csv_data) {
    console.error('No CSV data provided.');
    return false;
  }
  const CSVFile = new Blob([csv_data], { type: "text/csv" });
  const tempLink = document.createElement('a');
  tempLink.download = "formData.csv";
  const url = URL.createObjectURL(CSVFile);
  tempLink.href = url;
  tempLink.style.display = 'none';
  document.body.appendChild(tempLink);
  tempLink.click();
  document.body.removeChild(tempLink);
  URL.revokeObjectURL(url);
  return true
}

export function importData(file: File): boolean{
  const reader = new FileReader();
  reader.onload = function(e) {
    if (!e.target || typeof e.target.result !== 'string') {
      console.error("Invalid file content or file type.");
      return false;
    }
    const csvContent = e.target.result;
    const data = parseCSV(csvContent)
    fillInputs(data)
  };
  reader.readAsText(file)
  return true
}

function parseCSV(csvContent: string): FormData {
  const lines = csvContent
    .split('\n')
    .map(line => line.trim())  // Trim leading/trailing spaces
    .filter(line => line.length > 0);  // Remove empty lines
  const data: FormData = {};
  lines.forEach(line => {
      const [key, value] = line.split(',');
      if (key && value) {
          data[key.trim()] = value.trim();
      }
  });
  return data
}

function fillInputs(data: FormData): void {
  Object.keys(data).forEach(key => {
    const inputElement = document.getElementsByName(key)[0] as HTMLInputElement;
    if (inputElement) {
      inputElement.value = String(data[key])
    } else {
      console.warn(`Input field with name "${key}" not found.`);
    }
  });
}
