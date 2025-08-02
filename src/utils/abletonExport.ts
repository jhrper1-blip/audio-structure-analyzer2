import JSZip from 'jszip';
import { createMidiTemplate, AnalysisResult } from './midiExport';

/**
 * Simulated instrument groups — these can be improved later using real audio analysis
 */
const INSTRUMENTS = ['Drums', 'Bass', 'Synth', 'Pads', 'FX'];

/**
 * Generates and downloads a zip file containing MIDI files for different instrument tracks
 */
export async function exportAbletonTemplateZip(result: AnalysisResult, originalFilename: string): Promise<void> {
  try {
    const zip = new JSZip();
    const baseName = originalFilename.replace(/\.[^/.]+$/, '');

    for (const instrument of INSTRUMENTS) {
      const midiBlob = createMidiTemplate(result, instrument);
      zip.file(`${instrument}.mid`, midiBlob);
    }

    // Also include the structure markers as a separate file
    const structureBlob = createMidiTemplate(result);
    zip.file(`Structure_Markers.mid`, structureBlob);

    const content = await zip.generateAsync({ type: 'blob' });

    const url = URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${baseName}_ableton_template.zip`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('❌ Failed to create Ableton template zip:', err);
    throw new Error('Failed to export Ableton template.');
  }
}