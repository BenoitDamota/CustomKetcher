import { SpectrumDataPoint } from '../types/SpectrumDataType';

export interface ProjectFileMoleculesJSON {
  format: string;
  data: string;
}

export interface ProjectFileSpectrumDataPointJSON {
  ppm: number;
  intensity: number;
  atomID: number[];
}

export interface ProjectFileParsedContentJSON {
  molecules: ProjectFileMoleculesJSON;
  spectrum: ProjectFileSpectrumDataPointJSON[];
}

export interface LoadProjectFileResult {
  success: string;
  errors: string[];
  data: ProjectFileParsedContentJSON;
}

// Function to load and parse the JSON file
export function loadProjectFile(fileContent: string): LoadProjectFileResult {
  const result: LoadProjectFileResult = {
    success: '',
    errors: [],
    data: {
      molecules: { format: '', data: '' },
      spectrum: [],
    },
  };

  try {
    const parsedContent: ProjectFileParsedContentJSON = JSON.parse(fileContent);

    // Validate JSON structure
    if (
      parsedContent.molecules &&
      typeof parsedContent.molecules.format === 'string' &&
      typeof parsedContent.molecules.data === 'string' &&
      Array.isArray(parsedContent.spectrum)
    ) {
      // Ensure molecule data doesn't contain a period (multiples molecules in a single SMILES)
      if (
        parsedContent.molecules.format === 'SMILES' &&
        parsedContent.molecules.data.includes('.')
      ) {
        result.errors.push(
          'Molecule data should only contain a single molecule (no dot allowed).',
        );
      } else {
        result.success = `File loaded successfully! \n\n Molecule : ${parsedContent.molecules.data}`;
        result.data = parsedContent;
      }
    } else {
      result.errors.push('Invalid JSON structure');
    }
  } catch (error) {
    result.errors.push('Failed to parse JSON');
  }

  return result;
}

// Function to open file input and return its content
export function openFileInput(callback: (fileContent: string) => void): void {
  const inputFile = document.createElement('input');
  inputFile.type = 'file';
  inputFile.accept = '.json';

  inputFile.onchange = (e) => {
    const target = e.target as HTMLInputElement;
    const file = target?.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const fileContent = reader.result as string;
        callback(fileContent);
      };

      reader.onerror = () => {
        console.error('Failed to read the file.');
      };

      reader.readAsText(file);
    }
  };

  inputFile.click();
}

// Function to convert project content to JSON string
export function convertProjectToJSON(
  moleculesFormat: string,
  moleculesData: string,
  spectrumData: SpectrumDataPoint[],
): string {
  const parsedContent = {
    molecules: {
      format: moleculesFormat,
      data: moleculesData,
    },
    spectrum: spectrumData,
  } as ProjectFileParsedContentJSON;

  return JSON.stringify(parsedContent, null, 2);
}

// Function to download a project in JSON format
export function downloadProjectFileToJSON(
  moleculesFormat: string,
  moleculesData: string,
  spectrumData: SpectrumDataPoint[],
): void {
  const jsonContent = convertProjectToJSON(
    moleculesFormat,
    moleculesData,
    spectrumData,
  );

  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = 'project_output.json';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
