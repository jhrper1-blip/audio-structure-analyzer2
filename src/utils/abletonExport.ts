import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { createMidiTemplate } from './midiExport';
import type { AnalysisResult } from './midiExport';

/**
 * Generate multiple instrument MIDI blobs based on the song structure
 */
function generateInstrumentTracks(result: AnalysisResult): Record<string, Blob> {
  const instruments = ['Drums', 'Bass', 'Keys', 'Synth', 'FX'];

  const blobs: Record<string, Blob> = {};

  instruments.forEach((instrument) => {
    const midiBlob = createMidiTemplate(result, instrument);
    blobs[`${instrument}_Markers.mid`] = midiBlob;
  });

  return blobs;
}

/**
 * Export a structured Ableton-style project template ZIP
 */
export async function exportAbletonTemplateZip(result: AnalysisResult, originalFilename: string): Promise<void> {
  try {
    const zip = new JSZip();

    // Add instrument marker MIDI files
    const midiFiles = generateInstrumentTracks(result);
    Object.entries(midiFiles).forEach(([filename, blob]) => {
      zip.file(`midi/${filename}`, blob);
    });

    // Add a readme or project info
    const baseName = originalFilename.replace(/\.[^/.]+$/, '');
    zip.file('README.txt', `Ableton Template for: ${baseName}\n\nIncludes tempo and section markers for each instrument track.\nTempo: ${result.tempo} BPM\nSections:\n${result.structure.map(s => `- ${s.label} (${s.start_time}s to ${s.end_time}s)`).join('\n')}`);

    // Generate ZIP
    const zipBlob = await zip.generateAsync({ type: 'blob' });

    // Trigger download
    const filename = `${baseName}_Ableton_Template.zip`;
    saveAs(zipBlob, filename);
  } catch (error) {
    console.error('❌ Failed to export Ableton template:', error);
    throw new Error('Failed to export Ableton template.');
  }
}