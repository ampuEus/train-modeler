// Check if all required fields are filled
function isFormValid(form: HTMLFormElement) {
  const requiredInputs = form.querySelectorAll('[required]');

  // Check if any required field is empty
  for (let input of requiredInputs) {
    if (!input.value.trim()) {
      return false;
    }
  }
  return true;
}

export function getFormDataAsObject(form: HTMLFormElement) {
  const formData = new FormData(form);
  const data = {};
  formData.forEach((value, key) => {
      data[key] = parseFloat(value as string);
  });
  return data;
}

export function exportData(){
  const form = document.getElementById('trainData') as HTMLFormElement;

  if (isFormValid(form)) {
    const data = getFormDataAsObject(form);
    const csvData = convertToCSV(data);
    downloadCSVFile(csvData);
  } else {
    alert("Please fill in all required fields.");
  }
}

function convertToCSV(data: object) {
  const keys = Object.keys(data);
  let csvContent = '';
  keys.forEach(key => {
    csvContent += key + ',' + data[key] + '\n';
  });
  return csvContent;
}

function downloadCSVFile(csv_data: string) {
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
}

export function importData(file: File){
  const reader = new FileReader();
  reader.onload = function(e) {
      const content = e.target.result;
      // Parse the CSV content
      const lines = content.split('\n');
      const data = {};

      lines.forEach(line => {
          const [key, value] = line.split(',');
          if (key && value) {
              data[key.trim()] = value.trim();
          }
      });

      // Map the CSV data to the input fields by matching the keys
      Object.keys(data).forEach(key => {
        const inputElement = document.getElementsByName(key)[0];
        if (inputElement) {
          inputElement.value = data[key];
        } else {
          console.warn(`Input field with name "${key}" not found.`);
        }
      });
  };
  reader.readAsText(file);
}
