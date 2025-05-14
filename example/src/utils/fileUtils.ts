import axios from 'axios';
import { SpectrumDataPoint } from '../types/SpectrumDataType';

const apiUrl = process.env.REACT_APP_INTERN_API_PATH || '';

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
  errors: string;
  data: ProjectFileParsedContentJSON;
}

export async function loadProjectFile(
  file: File,
  fileContent: string,
): Promise<LoadProjectFileResult> {
  const result: LoadProjectFileResult = {
    success: '',
    errors: '',
    data: {
      molecules: { format: '', data: '' },
      spectrum: [],
    },
  };

  const filename = file.name.toLowerCase();

  // Case 1: JSON file
  if (filename.endsWith('.json')) {
    try {
      const parsedContent: ProjectFileParsedContentJSON =
        JSON.parse(fileContent);

      if (
        parsedContent.molecules &&
        typeof parsedContent.molecules.format === 'string' &&
        typeof parsedContent.molecules.data === 'string' &&
        Array.isArray(parsedContent.spectrum)
      ) {
        if (
          parsedContent.molecules.format === 'SMILES' &&
          parsedContent.molecules.data.includes('.')
        ) {
          result.errors =
            'molecule data should only contain a single molecule (no dot allowed).';
        } else {
          result.success = `File loaded successfully! \n\n Molecule : ${parsedContent.molecules.data}`;
          result.data = parsedContent;
        }
      } else {
        result.errors = 'invalid JSON structure.';
      }
    } catch (error) {
      result.errors = 'failed to parse JSON.';
    }

    return result;
  }

  // Case 2: JCAMP file
  else if (filename.endsWith('.jdx') || filename.endsWith('.jcamp')) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${apiUrl}/api/loadJCAMP`, formData);

      console.log(response);

      const spectrum = response.data as SpectrumDataPoint[];

      result.success = 'JCAMP file successfully loaded!';
      result.data = {
        molecules: { format: '', data: '' },
        spectrum,
      };

      return result;
    } catch (error) {
      console.log(error);
      result.errors = 'failed to load JCAMP from server.';
      return result;
    }
  }

  result.errors = 'unsupported file format.';
  return result;
}

// Function to open file input and return its content
export function openFileInput(
  callback: (file: File, fileContent: string) => void,
): void {
  const inputFile = document.createElement('input');
  inputFile.type = 'file';
  inputFile.accept = '.json,.jcamp,.jdx';

  inputFile.onchange = (e) => {
    const target = e.target as HTMLInputElement;
    const file = target?.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const fileContent = reader.result as string;
        callback(file, fileContent);
      };
      reader.onerror = () => {
        console.error('Failed to read the file.');
      };

      // JSON only needs fileContent, JCAMP doesn’t
      if (file.name.endsWith('.json')) {
        reader.readAsText(file);
      } else {
        callback(file, '');
      }
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
