import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { AnalysisResult } from './midiExport'; // or './types' if you have it separated

export async function exportAbletonTemplateZip(result: AnalysisResult, filename: string) {
  const zip = new JSZip();

  // Simulated audio folder with placeholder tracks
  const tracks = ['Drums', 'Bass', 'Synth', 'Vocals'];

  tracks.forEach((trackName) => {
    zip.file(`AbletonProject/${trackName}.txt`, `This is a placeholder for the ${trackName} track.`);
  });

  // Create a structure markers file
  const markers = result.structure.map(
    (s, i) =>
      `${i + 1}. ${s.label}: ${s.start_time.toFixed(1)}s → ${s.end_time.toFixed(1)}s`
  );
  zip.file(`AbletonProject/structure_markers.txt`, markers.join('\n'));

  // Create ZIP and trigger download
  const blob = await zip.generateAsync({ type: 'blob' });
  const baseName = filename.replace(/\.[^/.]+$/, '');
  saveAs(blob, `${baseName}_ableton_template.zip`);
}